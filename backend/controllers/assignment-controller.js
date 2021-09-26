const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const assignmentService = require('../services/assignment-service');
const commonSchemas = require('../schemas/common-schemas');
const assignmentSchemas = require('../schemas/assignment-schemas');

const LOGGING_TYPE = 'assignment';

const assignmentMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  archived: Joi.boolean().optional(),
});

const assignmentIdPathSchema = Joi.object().keys({
  assignmentId: commonSchemas.incremental,
});
const operationIdPathSchema = Joi.object().keys({
  operationId: commonSchemas.incremental,
});

async function getAssignments(req) {
  logger.silly('assignmentController.getAssignments');

  const options = controllerUtils.validate(
    req.query,
    assignmentMultiQuerySchema,
  );

  return await assignmentService.getAssignments(options);
}

async function getAssignment(req) {
  logger.silly('assignmentController.getAssignment');

  const { assignmentId } = controllerUtils.validate(
    req.params,
    assignmentIdPathSchema,
  );

  return await assignmentService.getAssignment(assignmentId);
}

async function upsertAssignment(req) {
  logger.silly('assignmentController.upsertAssignment');

  const assignment = controllerUtils.validate(
    req.body,
    assignmentSchemas.assignmentPushSchema,
  );
  const { operationId } = controllerUtils.validate(
    req.params,
    operationIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await assignmentService.upsertAssignment(assignment, operationId);
}

async function deleteAssignment(req) {
  logger.silly('assignmentController.deleteAssignment');

  const { assignmentId } = controllerUtils.validate(
    req.params,
    assignmentIdPathSchema,
  );
  const { operationId } = controllerUtils.validate(
    req.params,
    operationIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await assignmentService.deleteAssignment(assignmentId, operationId);
}

module.exports = {
  getAssignments,
  getAssignment,
  upsertAssignment,
  deleteAssignment,
};
