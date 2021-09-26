// @ts-check

const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

const throwNotFound = (eventTypeId) => {
  const error = new Error(`Event type ${eventTypeId} not found!`);
  // @ts-ignore
  error.status = 404;
  throw error;
};

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function getEventTypeList() {
  return await knex('event_types')
    .select('id', 'name')
    .orderBy('name', 'asc');
}

async function getEventTypes(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
  });

  const query = knex('event_types')
    .groupBy('id')
    .orderBy('name', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  const rows = await query;
  return rows.map(mapItem);
}

async function getEventType(eventTypeId) {
  const [eventType] = await knex('event_types')
    .select('*')
    .where('event_types.id', eventTypeId);

  if (!eventType) {
    throwNotFound(eventTypeId);
  }

  return mapItem(eventType);
}

async function upsertEventType(eventType) {
  if (_.isNil(eventType.id)) {
    return addEventType(eventType);
  }
  return updateEventType(eventType);
}

async function addEventType(eventType) {
  logger.debug('Adding new event type');
  const dbEventType = serviceUtils.toSnakeCase(eventType);

  const rows = await knex('event_types')
    .insert(dbEventType)
    .returning('*');

  return mapItem(rows[0]);
}

async function updateEventType(eventType) {
  logger.debug(`Updating event type with ID ${eventType.id}`);
  const dbEventType = serviceUtils.toSnakeCase(eventType);

  const [updatedEventType] = await knex('event_types')
    .where('id', eventType.id)
    .update(dbEventType)
    .returning('*');

  if (!updatedEventType) {
    throwNotFound(eventType.id);
  }

  return mapItem(updatedEventType);
}

async function deleteEventType(eventTypeId) {
  const [eventType] = await knex('event_types')
    .where('id', eventTypeId)
    .del()
    .returning('*');

  if (!eventType) {
    throwNotFound(eventTypeId);
  }
}

/**
 * Returns an event ID for bot generated events.
 * If no such event type exists, it will be created.
 * @returns {Promise<number>}
 */
async function getBotEventTypeId() {
  const [eventType] = await knex('event_types')
    .select('id')
    .where('name', 'ODY Bot')
    .andWhere('game_id', null)
    .andWhere('branch_id', null)
    .andWhere('division_id', null);

  if (!eventType) {
    logger.info('No bot event type, creating it...');

    const [newEventTypeId] = await knex('event_types')
      .insert({ name: 'ODY Bot' })
      .returning('id');

    return newEventTypeId;
  }

  return eventType.id;
}

module.exports = {
  getEventTypeList,
  getEventType,
  getEventTypes,
  upsertEventType,
  addEventType,
  updateEventType,
  deleteEventType,
  getBotEventTypeId,
};
