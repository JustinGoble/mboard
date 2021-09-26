const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

const throwNotFound = (divisionId) => {
  const error = new Error(`Division ${divisionId} not found!`);
  error.status = 404;
  throw error;
};

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function getDivisionList() {
  return await knex('divisions')
    .select('id', 'name')
    .orderBy('name', 'asc');
}

async function getDivisions(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
  });

  const query = knex('divisions')
    .groupBy('id')
    .orderBy('name', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  const rows = await query;
  return rows.map(mapItem);
}

async function getDivision(divisionId) {
  const [division] = await knex('divisions')
    .select('*')
    .where('divisions.id', divisionId);

  if (!division) {
    throwNotFound(divisionId);
  }

  return mapItem(division);
}

async function upsertDivision(division) {
  if (_.isNil(division.id)) {
    return addDivision(division);
  }
  return updateDivision(division);
}

async function addDivision(division) {
  logger.debug('Adding new division');
  const dbDivision = serviceUtils.toSnakeCase(division);

  const rows = await knex('divisions')
    .insert(dbDivision)
    .returning('*');

  return mapItem(rows[0]);
}

async function updateDivision(division) {
  logger.debug(`Updating division with ID ${division.id}`);
  const dbDivision = serviceUtils.toSnakeCase(division);

  const [updatedDivision] = await knex('divisions')
    .where('id', division.id)
    .update(dbDivision)
    .returning('*');

  if (!updatedDivision) {
    throwNotFound(division.id);
  }

  return mapItem(updatedDivision);
}

async function deleteDivision(divisionId) {
  const [division] = await knex('divisions')
    .where('id', divisionId)
    .del()
    .returning('*');

  if (!division) {
    throwNotFound(divisionId);
  }
}

module.exports = {
  getDivisionList,
  getDivisions,
  getDivision,
  upsertDivision,
  addDivision,
  updateDivision,
  deleteDivision,
};
