const _ = require('lodash');
const Discord = require('discord.js');
const redis = require('./../../backend/redis');
const { SECURE_CHANNELS } = require('../constants');

//eslint-disable-next-line no-unused-vars
async function action(message, command, args) {
  if (command !== 'dashboard') return false;

  if (!_.includes(SECURE_CHANNELS, message.channel.parentID)) {
    throw new Error('Insufficient channel security level!');
  }

  const embed = new Discord.MessageEmbed()
  // Set the title of the field
    .setTitle('ODY-Industy Requests Placeholder');
  const sentMessage = await message.channel.send(embed);
  await redis.setAsync('bot:dashboard:1', sentMessage.id);

  return true;
}


module.exports = {
  name: 'dashboard',
  description: 'Sets the dashboard message which will be updated by the bot.',
  action,
};
