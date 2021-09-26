const moment = require('moment');
const _ = require('lodash');
const redis = require('./../../backend/redis');
const { SECURE_CHANNELS } = require('../constants');

//eslint-disable-next-line no-unused-vars
async function action(message, command, args) {
  if (command !== 'nq') return false;

  if (!_.includes(SECURE_CHANNELS, message.channel.parentID)) {
    throw new Error('Insufficient channel security level!');
  }

  await redis.setAsync('last-featured', moment().toISOString());
  message.channel.send('', {
    files: [
      './discord-bot/images/ody-featured.png',
    ],
  });
  return true;
}

module.exports = {
  name: 'nq',
  description: 'Resets the NQ featured timer to 0 and posts the feature image',
  action,
};
