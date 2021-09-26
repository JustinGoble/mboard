const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

const throwNotFound = (assignmentId, operationId) => {
  const error = new Error(
    operationId
      ? `Assignment with ID ${assignmentId} not found for operation with ID ${operationId}!`
      : `Assignment with ID ${assignmentId} not found!`,
  );
  error.status = 404;
  throw error;
};

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function getAssignments(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
    archived: false,
  });

  let query = knex('assignments')
    .select('*')
    .orderBy('name', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  if (opts.archived) {
    query = query.where('state', 'archived');
  } else {
    query = query.whereNot('state', 'archived');
  }

  const rows = await query;
  return rows.map(mapItem);
}

async function getAssignment(assignmentId) {
  const [assignment] = await knex('assignments')
    .select('*')
    .where('id', assignmentId);

  if (!assignment) {
    throwNotFound(assignmentId);
  }

  return mapItem(assignment);
}

async function replaceAssignments(assignments, operationId, opts = {}) {
  const ids = _.compact(_.map(assignments, a => a.id));
  const results = [];

  await opts.trx
    .from('op_assignments')
    .whereNotIn('id', ids)
    .andWhere({ operation_id: operationId })
    .del();

  for (const assignment of assignments) {
    results.push(await upsertAssignment(assignment, operationId, opts));
  }

  return results;
}

async function upsertAssignment(assignment, operationId, opts) {
  _.defaults(opts, { trx: knex });

  logger.debug(`Upserting op assignment to operation ${operationId}`);
  if (_.isNil(assignment.id)) {
    return await addAssignment(assignment, operationId, opts);
  }
  return await updateAssignment(assignment, operationId, opts);
}

async function addAssignment(assignment, operationId, opts = {}) {
  _.defaults(opts, { trx: knex });

  logger.debug(`Adding new op assignment to operation ${operationId}`);
  const dbAssignment = serviceUtils.toSnakeCase(assignment);

  const rows = await opts.trx('op_assignments')
    .insert({
      ...dbAssignment,
      operation_id: operationId,
    })
    .returning('*');

  return mapItem(rows[0]);
}

async function updateAssignment(assignment, operationId, opts = {}) {
  _.defaults(opts, { trx: knex });

  logger.debug(`Updating op assignment with ID ${assignment.id}`);

  const { id } = assignment;
  delete assignment.id;
  delete assignment.operationId;
  const dbAssignment = serviceUtils.toSnakeCase(assignment);

  const [updatedAssignment] = await opts.trx('op_assignments')
    .where({
      'id': id,
      'operation_id': operationId,
    })
    .update(dbAssignment)
    .returning('*');

  if (!updatedAssignment) {
    throwNotFound(id, operationId);
  }

  return mapItem(updatedAssignment);
}

async function deleteAssignment(assignmentId, operationId) {
  const [assignment] = await knex('op_assignments')
    .where({
      'id': assignmentId,
      'operation_id': operationId,
    })
    .del()
    .returning('*');

  if (!assignment) {
    throwNotFound(assignmentId, operationId);
  }
}

module.exports = {
  getAssignments,
  getAssignment,
  replaceAssignments,
  upsertAssignment,
  addAssignment,
  updateAssignment,
  deleteAssignment,
};
