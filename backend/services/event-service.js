const _ = require('lodash');
const { oneLine } = require('common-tags');
const BPromise = require('bluebird');

const serviceUtils = require('./service-utils');
const eventTypeService = require('./event-type-service');
const { knex } = require('../database').connect();
const redis = require('../redis');
const logger = require('../logger')(__filename);
const gapi = require('../gapi');
const config = require('../config');

const throwNotFound = (calendarId, eventId) => {
  const error = new Error(`Event ${eventId} with calendar ID ${calendarId} not found!`);
  // @ts-ignore
  error.status = 404;
  throw error;
};

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function processDbEvent(dbEvent) {
  logger.debug(oneLine`
    Processing event ${dbEvent.id}
    with gEvent ID ${dbEvent.g_event_id}
    and calendar ID ${dbEvent.g_calendar_id}
  `);

  const event = mapItem(dbEvent);

  event.gEvent = await gapi.getEvent(
    event.gCalendarId,
    event.gEventId,
  );
  delete event.gCalendarId;
  delete event.gEventId;

  return event;
}

async function getEvents(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
  });

  const rows = await knex('events')
    .orderBy('created_at', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  return await BPromise.map(
    rows,
    processDbEvent,
    { concurrency: 2 },
  );
}

async function getUpcomingEvents(calendarId, opts = {}) {
  _.defaults(opts, {
    force: false,
  });

  if (!opts.force) {
    // Check the Redis cache
    const cache = await redis.getAsync(`cache:calendar:upcoming:${calendarId}`);
    if (cache) return JSON.parse(cache);
  }

  const upcomingEvents = await gapi.getUpcomingEvents(calendarId);
  const gIdList = _.uniq(upcomingEvents.map(e => e.recurringEventId || e.id));

  logger.info(`Found ${upcomingEvents.length} upcoming Google Calendar events`);

  let dbEventList = await knex('events').whereIn('g_event_id', gIdList);

  const returnedEvents = await BPromise.map(
    upcomingEvents,
    async gEvent => {
      let sourceGEvent = gEvent;
      if (gEvent.recurringEventId && gEvent.recurringEventId !== gEvent.id) {
        // The event is recurring, fetch the original one
        sourceGEvent = await gapi.getEvent(calendarId, gEvent.recurringEventId);
      }

      const dbEvent = _.find(dbEventList, r => r.g_event_id === sourceGEvent.id);

      if (!dbEvent) {
        logger.warn(oneLine`
          Google event ${sourceGEvent.id} with summary
          "${sourceGEvent.summary}" has no database match, inserting...
        `);

        const rows = await knex('events')
          .insert({
            creator_id: config.BOT_DEFAULT_USER_ID,
            event_type_id: await eventTypeService.getBotEventTypeId(),
            g_calendar_id: calendarId,
            g_event_id: sourceGEvent.id,
          })
          .returning('*');

        // Refresh the database event list
        // eslint-disable-next-line require-atomic-updates
        dbEventList = await knex('events').whereIn('g_event_id', gIdList);

        const createdEvent = mapItem(rows[0]);

        createdEvent.gEvent = sourceGEvent;
        delete createdEvent.gCalendarId;
        delete createdEvent.gEventId;

        return createdEvent;
      }

      const outputEvent = mapItem(dbEvent);

      outputEvent.gEvent = gEvent;
      delete outputEvent.gCalendarId;
      delete outputEvent.gEventId;

      return outputEvent;
    },
    { concurrency: 1 },  // Has to be 1 or else recurring events can screw it up
  );

  // Save to the Redis cache
  await redis.setAsync(
    `cache:calendar:upcoming:${calendarId}`,
    JSON.stringify(returnedEvents),
    'EX', 60 * 60,
  );

  return returnedEvents;
}

async function getEvent(eventId) {
  const [event] = await knex('events')
    .select('*')
    .where('events.id', eventId);

  if (!event) {
    throwNotFound('all', eventId);
  }

  return await processDbEvent(event);
}

async function upsertEvent(calendarId, event) {
  if (_.isNil(event.id)) {
    return addEvent(calendarId, event);
  }
  return updateEvent(calendarId, event);
}

async function addEvent(calendarId, event) {
  logger.debug(`Adding new event to calendar ${calendarId}`);

  const createdGEvent = await gapi.insertEvent(
    calendarId,
    event.gEvent,
  );
  delete event.gEvent;

  const dbEvent = serviceUtils.toSnakeCase(event);

  dbEvent.g_calendar_id = calendarId;
  dbEvent.g_event_id = createdGEvent.id;

  const rows = await knex('events')
    .insert(dbEvent)
    .returning('*');

  const createdEvent = mapItem(rows[0]);

  createdEvent.gEvent = createdGEvent;
  delete createdEvent.gCalendarId;
  delete createdEvent.gEventId;

  return createdEvent;
}

async function updateEvent(calendarId, event) {
  logger.debug(`Updating event with ID ${event.id}`);

  const { gEvent } = event;
  delete event.gEvent;

  const dbEvent = serviceUtils.toSnakeCase(event);
  let returnEvent;

  await knex.transaction(async trx => {
    const rows = await trx('events')
      .where('id', event.id)
      .andWhere('g_calendar_id', calendarId)
      .update(dbEvent)
      .returning('*');

    if (!rows[0]) {
      throwNotFound(calendarId, event.id);
    }

    const updatedEvent = mapItem(rows[0]);

    gEvent.id = updatedEvent.gEventId;

    const updatedGEvent = await gapi.updateEvent(
      updatedEvent.gCalendarId,
      gEvent,
    );

    updatedEvent.gEvent = updatedGEvent;
    delete updatedEvent.gCalendarId;
    delete updatedEvent.gEventId;

    returnEvent = updatedEvent;
  });

  return returnEvent;
}

async function deleteEvent(eventId) {
  await knex.transaction(async trx => {
    const [event] = await trx('events')
      .where('id', eventId)
      .del()
      .returning('*');

    if (!event) {
      throwNotFound('all', eventId);
    }

    await gapi.deleteEvent(event.g_calendar_id, event.g_event_id);
  });
}

module.exports = {
  getEvents,
  getUpcomingEvents,
  getEvent,
  upsertEvent,
  addEvent,
  updateEvent,
  deleteEvent,
};
