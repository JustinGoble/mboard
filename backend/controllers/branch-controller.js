const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const branchService = require('../services/branch-service');
const commonSchemas = require('../schemas/common-schemas');
const branchSchemas = require('../schemas/branch-schemas');

const LOGGING_TYPE = 'branch';

const branchMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const branchIdPathSchema = Joi.object().keys({
  branchId: commonSchemas.incremental,
});

async function getBranchList() {
  logger.silly('branchController.getBranchList');

  return await branchService.getBranchList();
}

async function getBranches(req) {
  logger.silly('branchController.getBranches');

  const options = controllerUtils.validate(
    req.query,
    branchMultiQuerySchema,
  );

  return await branchService.getBranches(options);
}

async function getBranch(req) {
  logger.silly('branchController.getBranch');

  const { branchId } = controllerUtils.validate(
    req.params,
    branchIdPathSchema,
  );

  return await branchService.getBranch(branchId);
}

async function upsertBranch(req) {
  logger.silly('branchController.upsertBranch');

  const branch = controllerUtils.validate(
    req.body,
    branchSchemas.branchPushSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await branchService.upsertBranch(branch);
}

async function deleteBranch(req) {
  logger.silly('branchController.deleteBranch');

  const { branchId } = controllerUtils.validate(
    req.params,
    branchIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await branchService.deleteBranch(branchId);
}

module.exports = {
  getBranchList,
  getBranches,
  getBranch,
  upsertBranch,
  deleteBranch,
};
