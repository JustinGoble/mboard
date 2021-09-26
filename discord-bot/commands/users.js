const _ = require('lodash');
const userService = require('./../../backend/services/user-service');
const { SECURE_CHANNELS } = require('../constants');

//eslint-disable-next-line no-unused-vars
async function action(message, command, args) {
  if (command !== 'users') return false;

  if (!_.includes(SECURE_CHANNELS, message.channel.parentID)) {
    throw new Error('Insufficient channel security level!');
  }

  const result = await userService.getUserList();
  message.channel.send(result.map(user => user.name).join(', '));
  return true;
}

module.exports = {
  name: 'users',
  description: 'To check which users are on the MB',
  action,
};
