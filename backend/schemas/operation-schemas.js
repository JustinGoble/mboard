const Joi = require('joi');
const common = require('./common-schemas');
const assignmentSchemas = require('./assignment-schemas');

const operationPushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  branchId: common.incremental.optional().allow(null),
  divisionIds: Joi.array().items(common.incremental).default([]).optional(),
  leaderId: common.incremental.optional().allow(null),
  name: Joi.string(),
  description: common.stringWithEmpty.optional().allow(null),
  requirements: common.stringWithEmpty.optional().allow(null),
  location: common.stringWithEmpty.optional().allow(null),
  state: Joi.any().valid(['archived', 'in_progress', 'unapproved', 'draft']).optional(),
  targetDate: Joi.date().optional().allow(null),
  assignments: Joi.array().items(assignmentSchemas.assignmentPushSchema).default([]).optional(),
});

const operationSchema = operationPushSchema.keys({
  id: common.incremental,
  createdAt: common.createdAt,
  updatedAt: common.updatedAt,
  creatorId: common.incremental,
  assignments: Joi.array().items(assignmentSchemas.assignmentSchema).default([]).optional(),
});

module.exports = {
  operationPushSchema,
  operationSchema,
};
