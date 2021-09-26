const Joi = require('joi');
const common = require('./common-schemas');

const gamePushSchema = Joi.object().keys({
  id: common.incremental.optional(),
  name: Joi.string(),
});

const gameSchema = gamePushSchema.keys({
  id: common.incremental,
  createdAt: common.createdAt,
  updatedAt: common.updatedAt,
});

module.exports = {
  gamePushSchema,
  gameSchema,
};
