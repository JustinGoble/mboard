const _ = require('lodash');
const Joi = require('joi');
const moment = require('moment');
const Discord = require('discord.js');
const eventService = require('./../../backend/services/event-service');
const operationService = require('./../../backend/services/operation-service');
const config = require('./../../backend/config');
const { SECURE_CHANNELS } = require('../constants');

const argsSchema = Joi.array().ordered(
  Joi.any().valid('e', 'o'),
);

const ROOT_URL = 'https://mboard.objectivedriveyards.com';
const FORMAT = 'YYYY-MM-DD HH:mm';

//eslint-disable-next-line no-unused-vars
async function action(message, command, args) {
  if (command !== 'sched') return false;

  const validationResult = argsSchema.validate(args);
  if (validationResult.error) throw new Error(validationResult.error);
  const [type] = validationResult.value;

  if (!_.includes(SECURE_CHANNELS, message.channel.parentID)) {
    throw new Error('Insufficient channel security level!');
  }

  const events = await eventService.getUpcomingEvents(config.CALENDARS.GAME_EVENTS);
  const operations = await operationService.getUpcomingOperations();

  const embed = new Discord.MessageEmbed()
    // Set the title of the field
    .setTitle('ODY-Events-Scheduled');

  if (type === 'e') {
    _.take(events, 9).forEach(event => {
      const formatted = moment(event.gEvent.start.dateTime).format(FORMAT);
      embed.addField(event.gEvent.summary, formatted, true);
    });
  } else if (type === 'o') {
    _.take(operations, 9).map(operation => {
      const formatted = moment(operation.targetDate).format(FORMAT);
      const url = `<${ROOT_URL}/operations/${operation.id}>`;
      embed.addField(operation.name, `${formatted}\n${url}`, true);
    });
  } else {
    let opsStrings = _.take(operations, 3).map(operation => {
      const formatted = moment(operation.targetDate).format(FORMAT);
      const url = `<${ROOT_URL}/operations/${operation.id}>`;
      return `${operation.name} at ${formatted}\n${url}`;
    }).join('\n');

    let evtsStrings = _.take(events, 3).map(event => {
      const formatted = moment(event.gEvent.start.dateTime).format(FORMAT);
      return `${event.gEvent.summary} at ${formatted}`;
    }).join('\n');

    if (_.isEmpty(opsStrings)) {
      opsStrings = 'No operations found with upcoming times';
    }
    if (_.isEmpty(evtsStrings)) {
      evtsStrings = 'No events found with upcoming times';
    }

    embed.addField('DU Operations', opsStrings, true);
    embed.addField('Other Game Events', evtsStrings, true);
  }

  message.channel.send(embed);
  return true;
}

module.exports = {
  name: 'sched [e or o]',
  description: 'Posts the ODY schedule for events or operations',
  action,
};
