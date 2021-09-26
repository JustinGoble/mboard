const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const eventTypeService = require('../services/event-type-service');
const commonSchemas = require('../schemas/common-schemas');
const eventTypeSchemas = require('../schemas/event-type-schemas');

const LOGGING_TYPE = 'eventType';

const eventTypeMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const eventTypeIdPathSchema = Joi.object().keys({
  eventTypeId: commonSchemas.incremental,
});

async function getEventTypeList() {
  logger.silly('eventTypeController.getEventTypeList');

  return await eventTypeService.getEventTypeList();
}

async function getEventTypes(req) {
  logger.silly('eventTypeController.getEventTypes');

  const options = controllerUtils.validate(
    req.query,
    eventTypeMultiQuerySchema,
  );

  return await eventTypeService.getEventTypes(options);
}

async function getEventType(req) {
  logger.silly('eventTypeController.getEventType');

  const { eventTypeId } = controllerUtils.validate(
    req.params,
    eventTypeIdPathSchema,
  );

  return await eventTypeService.getEventType(eventTypeId);
}

async function upsertEventType(req) {
  logger.silly('eventTypeController.upsertEventType');

  const eventType = controllerUtils.validate(
    req.body,
    eventTypeSchemas.eventTypePushSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await eventTypeService.upsertEventType(eventType);
}

async function deleteEventType(req) {
  logger.silly('eventTypeController.deleteEventType');

  const { eventTypeId } = controllerUtils.validate(
    req.params,
    eventTypeIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await eventTypeService.deleteEventType(eventTypeId);
}

module.exports = {
  getEventTypeList,
  getEventTypes,
  getEventType,
  upsertEventType,
  deleteEventType,
};
