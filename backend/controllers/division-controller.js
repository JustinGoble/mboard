const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const divisionService = require('../services/division-service');
const commonSchemas = require('../schemas/common-schemas');
const divisionSchemas = require('../schemas/division-schemas');

const LOGGING_TYPE = 'division';

const divisionMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const divisionIdPathSchema = Joi.object().keys({
  divisionId: commonSchemas.incremental,
});

async function getDivisionList() {
  logger.silly('divisionController.getDivisionList');

  return await divisionService.getDivisionList();
}

async function getDivisions(req) {
  logger.silly('divisionController.getDivisions');

  const options = controllerUtils.validate(
    req.query,
    divisionMultiQuerySchema,
  );

  return await divisionService.getDivisions(options);
}

async function getDivision(req) {
  logger.silly('divisionController.getDivision');

  const { divisionId } = controllerUtils.validate(
    req.params,
    divisionIdPathSchema,
  );

  return await divisionService.getDivision(divisionId);
}

async function upsertDivision(req) {
  logger.silly('divisionController.upsertDivision');

  const division = controllerUtils.validate(
    req.body,
    divisionSchemas.divisionPushSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await divisionService.upsertDivision(division);
}

async function deleteDivision(req) {
  logger.silly('divisionController.deleteDivision');

  const { divisionId } = controllerUtils.validate(
    req.params,
    divisionIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await divisionService.deleteDivision(divisionId);
}

module.exports = {
  getDivisionList,
  getDivisions,
  getDivision,
  upsertDivision,
  deleteDivision,
};
