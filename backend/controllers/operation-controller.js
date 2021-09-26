const _ = require('lodash');
const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const operationService = require('../services/operation-service');
const commonSchemas = require('../schemas/common-schemas');
const operationSchemas = require('../schemas/operation-schemas');
const { permissions: PERM } = require('../constants');

const LOGGING_TYPE = 'operation';

const operationMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  states: Joi.array().items(Joi.string()).optional(),
  leaderId: commonSchemas.incremental.optional(),
});

const operationIdPathSchema = Joi.object().keys({
  operationId: commonSchemas.incremental,
});

async function getOperations(req) {
  logger.silly('operationController.getOperations');

  const options = controllerUtils.validate(
    req.query,
    operationMultiQuerySchema,
  );

  const { permissions } = req.authentication;

  options.withManagementPerms =
    _.includes(permissions, PERM.ADMIN)
    || _.includes(permissions, PERM.MANAGEMENT);

  return await operationService.getOperationsWithAssignments(options);
}

async function getOperation(req) {
  logger.silly('operationController.getOperation');

  const { operationId } = controllerUtils.validate(
    req.params,
    operationIdPathSchema,
  );

  const options = {};

  const { userId, permissions } = req.authentication;

  options.withManagementPerms =
    _.includes(permissions, PERM.ADMIN)
    || _.includes(permissions, PERM.MANAGEMENT);

  options.userId = userId;

  return await operationService.getOperationWithAssignments(operationId, options);
}

async function upsertOperation(req) {
  logger.silly('operationController.upsertOperation');

  const operation = controllerUtils.validate(
    req.body,
    operationSchemas.operationPushSchema,
  );

  if (!operation.id) {
    // This is a brand new operation, set the creator
    const { userId } = req.authentication;
    operation.creatorId = userId;
  } else {
    // Prevent the operation creator ID from being changed
    delete operation.creatorId;
  }

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await operationService.upsertOperation(operation);
}

async function deleteOperation(req) {
  logger.silly('operationController.deleteOperation');

  const { operationId } = controllerUtils.validate(
    req.params,
    operationIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await operationService.deleteOperation(operationId);
}

module.exports = {
  getOperations,
  getOperation,
  upsertOperation,
  deleteOperation,
};
