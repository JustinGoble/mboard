const _ = require('lodash');
const Joi = require('joi');
const moment = require('moment');
const { stripIndent } = require('common-tags');
const operationService = require('./../../backend/services/operation-service');
const { SECURE_CHANNELS } = require('../constants');

const argsSchema = Joi.array().ordered(
  Joi.string().min(1).max(1000).required(),
  Joi.number().min(0),
);

async function action(message, command, args, sender) {
  if (command !== 'add') return false;

  const validationResult = argsSchema.validate(args);
  if (validationResult.error) throw new Error(validationResult.error);
  const [opName, etaHours] = validationResult.value;

  if (_.intersection(sender.permissions, ['admin', 'management']).length === 0) {
    throw new Error('Insufficient permissions!');
  }

  if (!_.includes(SECURE_CHANNELS, message.channel.parentID)) {
    throw new Error('Insufficient channel security level!');
  }

  const timeOp = etaHours && moment().add(etaHours, 'hours');
  const createdOp = await operationService.addOperation({
    name: opName.split('_').join(' '),
    creatorId: sender.id,
    state: 'in_progress',
    targetDate: timeOp,
  });
  message.channel.send(stripIndent`
    New operation at https://mboard.objectivedriveyards.com/operations/${createdOp.id}
    starts in ${etaHours} hours.
  `);
  return true;
}

module.exports = {
  name: 'add <operation_name> [hours]',
  description: 'Adds operation with a target in X hours, use underscores in the name',
  action,
};
