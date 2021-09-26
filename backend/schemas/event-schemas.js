const Joi = require('joi');
const common = require('./common-schemas');

const eventPushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  eventTypeId: common.incremental,
  imageUrl: Joi.string().optional().allow(null),
  gEvent: Joi.object().keys({
    summary: Joi.string(),
    description: common.stringWithEmpty.optional().allow(null),
    start: Joi.object().keys({
      dateTime: Joi.date().iso(),
    }),
    end: Joi.object().keys({
      dateTime: Joi.date().iso(),
    }),
    recurrence: Joi.array().items(Joi.string()).optional().allow(null),
  }).unknown(true),
});

const eventSchema = eventPushSchema.keys({
  id: common.incremental,
  creatorId: common.incremental,
  createdAt: common.createdAt,
  updatedAt: common.updatedAt,
});

module.exports = {
  eventPushSchema,
  eventSchema,
};
