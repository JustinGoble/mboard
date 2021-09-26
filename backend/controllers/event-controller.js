const _ = require('lodash');
const Joi = require('joi');
const { oneLine } = require('common-tags');
const logger = require('../logger')(__filename);
const config = require('../config');
const controllerUtils = require('./controller-utils');
const eventService = require('../services/event-service');
const commonSchemas = require('../schemas/common-schemas');
const eventSchemas = require('../schemas/event-schemas');
const { permissions: PERM } = require('../constants');

const LOGGING_TYPE = 'event';

const eventMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const CALENDAR_MAP = {
  'game-events': config.CALENDARS.GAME_EVENTS,
  'internal-events': config.CALENDARS.INTERNAL_EVENTS,
};

const calendarNamePathSchema = Joi.object().keys({
  calendarName: Joi.string().valid(_.keys(CALENDAR_MAP)),
});

const eventIdPathSchema = Joi.object().keys({
  eventId: commonSchemas.incremental,
});

async function getEvents(req) {
  logger.silly('eventController.getEvents');

  const options = controllerUtils.validate(
    req.query,
    eventMultiQuerySchema,
  );

  return await eventService.getEvents(options);
}

async function getUpcomingEvents(req) {
  logger.silly('eventController.getUpcomingEvents');

  const { calendarName } = controllerUtils.validate(
    req.params,
    calendarNamePathSchema,
  );
  const calendarId = CALENDAR_MAP[calendarName];

  return await eventService.getUpcomingEvents(calendarId);
}

async function getEvent(req) {
  logger.silly('eventController.getEvent');

  const { eventId } = controllerUtils.validate(
    req.params,
    eventIdPathSchema,
  );

  return await eventService.getEvent(eventId);
}

async function upsertEvent(req) {
  logger.silly('eventController.upsertEvent');

  const { userId, permissions } = req.authentication;

  const event = controllerUtils.validate(
    req.body,
    eventSchemas.eventPushSchema,
  );

  const { calendarName } = controllerUtils.validate(
    req.params,
    calendarNamePathSchema,
  );
  const calendarId = CALENDAR_MAP[calendarName];

  if (event.id) {
    // An existing event, load the event and check for permissions
    const currentEvent = await eventService.getEvent(event.id);
    encodeURIComponent.creatorId = currentEvent.creatorId;

    if (!_.includes(permissions, PERM.ADMIN)) {
      if (userId !== currentEvent.creatorId) {
        const error = new Error(oneLine`
          Logged in as user ${userId} but trying to edit
          an event created by the user ${currentEvent.creatorId} without
          sufficient permissions!
        `);
        error.status = 403;
        throw error;
      }
    }
  } else {
    // New event, set the creator of the event to the current user
    event.creatorId = userId;
  }

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await eventService.upsertEvent(calendarId, event);
}

async function deleteEvent(req) {
  logger.silly('eventController.deleteEvent');

  const { eventId } = controllerUtils.validate(
    req.params,
    eventIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await eventService.deleteEvent(eventId);
}

module.exports = {
  getEvents,
  getUpcomingEvents,
  getEvent,
  upsertEvent,
  deleteEvent,
};
