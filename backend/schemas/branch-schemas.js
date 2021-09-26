const Joi = require('joi');
const common = require('./common-schemas');

const branchPushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  name: Joi.string(),
  description: common.stringWithEmpty.optional().allow(null),
});

const branchSchema = branchPushSchema.keys({
  id: common.incremental,
  createdAt: common.createdAt,
  updatedAt: common.updatedAt,
});

module.exports = {
  branchPushSchema,
  branchSchema,
};
