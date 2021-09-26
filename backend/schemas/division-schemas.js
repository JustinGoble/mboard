const Joi = require('joi');
const common = require('./common-schemas');

const divisionPushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  branchId: common.incremental,
  name: Joi.string(),
  description: common.stringWithEmpty.optional().allow(null),
});

const divisionSchema = divisionPushSchema.keys({
  id: common.incremental,
  createdAt: common.createdAt,
  updatedAt: common.updatedAt,
});

module.exports = {
  divisionPushSchema,
  divisionSchema,
};
