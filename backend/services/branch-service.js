const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

const throwNotFound = (branchId) => {
  const error = new Error(`Branch ${branchId} not found!`);
  error.status = 404;
  throw error;
};

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function getBranchList() {
  return await knex('branches')
    .select('id', 'name')
    .orderBy('name', 'asc');
}

async function getBranches(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
  });

  const query = knex('branches')
    .groupBy('id')
    .orderBy('name', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  const rows = await query;
  return rows.map(mapItem);
}

async function getBranch(branchId) {
  const [branch] = await knex('branches')
    .select('*')
    .where('id', branchId);

  if (!branch) {
    throwNotFound(branchId);
  }

  return mapItem(branch);
}

async function upsertBranch(branch) {
  if (_.isNil(branch.id)) {
    return addBranch(branch);
  }
  return updateBranch(branch);
}

async function addBranch(branch) {
  logger.debug('Adding new branch');
  const dbBranch = serviceUtils.toSnakeCase(branch);

  const rows = await knex('branches')
    .insert(dbBranch)
    .returning('*');

  return mapItem(rows[0]);
}

async function updateBranch(branch) {
  logger.debug(`Updating branch with ID ${branch.id}`);
  const dbBranch = serviceUtils.toSnakeCase(branch);

  const [updatedBranch] = await knex('branches')
    .where('id', branch.id)
    .update(dbBranch)
    .returning('*');

  if (!updatedBranch) {
    throwNotFound(branch.id);
  }

  return mapItem(updatedBranch);
}

async function deleteBranch(branchId) {
  const [branch] = await knex('branches')
    .where('id', branchId)
    .del()
    .returning('*');

  if (!branch) {
    throwNotFound(branchId);
  }
}

module.exports = {
  getBranchList,
  getBranches,
  getBranch,
  upsertBranch,
  addBranch,
  updateBranch,
  deleteBranch,
};
