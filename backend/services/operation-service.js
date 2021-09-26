const _ = require('lodash');
const moment = require('moment');

const serviceUtils = require('./service-utils');
const assignmentService = require('./assignment-service');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

const RESTRICTED_STATES = ['draft', 'archived'];

const throwNotFound = (operationId) => {
  const error = new Error(`Operation ${operationId} not found!`);
  error.status = 404;
  throw error;
};

function mapItem(row) {
  if (row.assignments) {
    row.assignments = _.compact(row.assignments).map(assignment => {
      assignment.created_at = moment(assignment.created_at).toISOString();
      assignment.updated_at = moment(assignment.updated_at).toISOString();
      return serviceUtils.toCamelCase(assignment);
    });
  }
  if (row.division_ids) {
    row.division_ids = _.compact(row.division_ids);
  }
  return serviceUtils.toCamelCase(row);
}

function addStateConditions(query, states, withManagementPerms) {
  if (withManagementPerms) {
    if (states.length > 0) {
      // People who are in the management can see all requested states
      return query.whereIn('state', states);
    }
    // Management person, just give them what they want
    return query;
  }

  if (states.length > 0) {
    // People who are not in management can only see drafts and
    // archived operations if they are in the management or if the
    // operation has been created by them.

    /* TODO: No creator information for the operations yet
    const restrictedStates = _.filter(
      states,
      s => _.includes(RESTRICTED_STATES, s),
    );
    */
    const unrestrictedStates = _.filter(
      states,
      s => !_.includes(RESTRICTED_STATES, s),
    );

    // Add all unrestricted states as is
    query = query.whereIn('state', unrestrictedStates);
    /* TODO: No creator information for the operations yet
    query = query.orWhere(
      builder => builder
        .whereIn('state', restrictedStates)
        .andWhere('creatorId', userId),
    );
    */
    return query;
  }

  return query
    .whereNotIn('state', RESTRICTED_STATES);
  // TODO: No creator information for the operations yet
  //  .orWhere('creatorId', userId);
}

async function getOperations(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
    states: [],
    withManagementPerms: false,
  });

  let query = knex('operations')
    .select('*')
    .orderBy('operations.name', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  query = addStateConditions(query, opts.states, opts.withManagementPerms);

  const rows = await query;
  return rows.map(mapItem);
}

async function getOperationsWithAssignments(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
    states: [],
    withManagementPerms: false,
    leaderId: null,
  });

  const assignmentsSub = knex('op_assignments')
    .select(knex.raw("coalesce(json_agg(op_assignments.*), '[]'::json)"))
    .where('op_assignments.operation_id', knex.raw('operations.id'));

  const divisionsSub = knex('operation_division')
    .select(knex.raw("coalesce(json_agg(operation_division.division_id), '[]'::json)"))
    .where('operation_division.operation_id', knex.raw('operations.id'));

  let query = knex('operations')
    .select(
      'operations.*',
      assignmentsSub.as('assignments'),
      divisionsSub.as('division_ids'),
    )
    .groupBy('operations.id')
    .orderBy('operations.name', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  query = addStateConditions(query, opts.states, opts.withManagementPerms);

  if (opts.leaderId) {
    query = query.where('leader_id', opts.leaderId);
  }
  const rows = await query;
  return rows.map(mapItem);
}

async function getUpcomingOperations() {
  const rows = await knex('operations')
    .select('id', 'name', 'target_date')
    .where('operations.target_date', '>', knex.raw('now()'))
    .andWhere('state', 'in_progress')
    .orderBy('operations.target_date', 'asc')
    .limit(10);

  return rows.map(mapItem);
}

async function getOperation(operationId, opts = {}) {
  _.defaults(opts, {
    trx: knex,
    states: [],
    withManagementPerms: false,
  });

  let query = opts.trx('operations')
    .select('*')
    .where('operations.id', operationId);

  query = addStateConditions(query, opts.states, opts.withManagementPerms);

  const [operation] = await query;

  if (!operation) {
    throwNotFound(operationId);
  }

  return mapItem(operation);
}

async function getOperationWithAssignments(operationId, opts = {}) {
  _.defaults(opts, {
    trx: knex,
    states: [],
    withManagementPerms: false,
  });

  const assignmentsSub = opts.trx('op_assignments')
    .select(knex.raw("coalesce(json_agg(op_assignments.*), '[]'::json)"))
    .where('op_assignments.operation_id', knex.raw('operations.id'));

  const divisionsSub = opts.trx('operation_division')
    .select(knex.raw("coalesce(json_agg(operation_division.division_id), '[]'::json)"))
    .where('operation_division.operation_id', knex.raw('operations.id'));

  let query = opts.trx('operations')
    .select(
      'operations.*',
      assignmentsSub.as('assignments'),
      divisionsSub.as('division_ids'),
    )
    .groupBy('operations.id')
    .where('operations.id', operationId);

  query = addStateConditions(query, opts.states, opts.withManagementPerms);

  const [operation] = await query;

  if (!operation) {
    throwNotFound(operationId);
  }

  return mapItem(operation);
}

async function upsertOperation(operation) {
  logger.debug('Upserting operation');
  const { assignments, divisionIds } = operation;
  const cleanOp = _.omit(operation, ['assignments', 'divisionIds']);

  await knex.transaction(async trx => {
    const opts = {
      trx,
      withManagementPerms: true,
    };

    if (_.isNil(operation.id)) {
      // eslint-disable-next-line require-atomic-updates
      operation = await addOperation(cleanOp, opts);
    } else {
      // eslint-disable-next-line require-atomic-updates
      operation = await updateOperation(cleanOp, opts);
    }

    await assignmentService.replaceAssignments(
      assignments,
      operation.id,
      opts,
    );

    await replaceDivisions(
      divisionIds,
      operation.id,
      trx,
    );

    // eslint-disable-next-line require-atomic-updates
    operation = await getOperationWithAssignments(operation.id, opts);
  });

  return operation;
}

async function replaceDivisions(divisionIds, operationId, trx) {
  const results = [];

  // Delete all operation-division connections for this operation
  await trx('operation_division')
    .where({ operation_id: operationId })
    .del();

  // Recreate the operation-division connections
  if (divisionIds.length > 0) {
    await trx('operation_division')
      .insert(divisionIds.map(divisionId => ({
        division_id: divisionId,
        operation_id: operationId,
      })));
  }

  return results;
}

async function addOperation(operation, opts = {}) {
  _.defaults(opts, { trx: knex });

  logger.debug('Adding new operation');
  const dbOperation = serviceUtils.toSnakeCase(operation);

  const rows = await opts.trx('operations')
    .insert(dbOperation)
    .returning('*');

  return mapItem(rows[0]);
}

async function updateOperation(operation, opts = {}) {
  _.defaults(opts, { trx: knex });

  logger.debug(`Updating operation with ID ${operation.id}`);
  const dbOperation = serviceUtils.toSnakeCase(operation);

  const [updatedOperation] = await opts.trx('operations')
    .where('id', operation.id)
    .update(dbOperation)
    .returning('*');

  if (!updatedOperation) {
    throwNotFound(operation.id);
  }

  return mapItem(updatedOperation);
}

async function deleteOperation(operationId) {
  const [operation] = await knex('operations')
    .where('id', operationId)
    .del()
    .returning('*');

  if (!operation) {
    throwNotFound(operationId);
  }
}

module.exports = {
  getOperations,
  getOperationsWithAssignments,
  getUpcomingOperations,
  getOperation,
  getOperationWithAssignments,
  upsertOperation,
  addOperation,
  updateOperation,
  deleteOperation,
};
