const Joi = require('joi');
const common = require('./common-schemas');

const assignmentPushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  userId: common.incremental.optional().allow(null),
  name: Joi.string(),
  description: common.stringWithEmpty.optional().allow(null),
  accepted: Joi.boolean().optional(),
});

const assignmentSchema = assignmentPushSchema.keys({
  id: common.incremental,
  operationId: common.incremental,
  createdAt: common.createdAt,
  updatedAt: common.updatedAt,
});

module.exports = {
  assignmentPushSchema,
  assignmentSchema,
};
