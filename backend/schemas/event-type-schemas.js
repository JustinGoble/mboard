const Joi = require('joi');
const common = require('./common-schemas');

const eventTypePushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  name: Joi.string(),
  gameId: common.incremental.optional().allow(null),
  branchId: common.incremental.optional().allow(null),
  divisionId: common.incremental.optional().allow(null),
});

const eventTypeSchema = eventTypePushSchema.keys({
  id: common.incremental,
  createdAt: common.createdAt,
  updatedAt: common.updatedAt,
});

module.exports = {
  eventTypePushSchema,
  eventTypeSchema,
};
