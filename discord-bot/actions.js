const _ = require('lodash');
const Discord = require('discord.js');
const odyBot = require('./ody-bot.js');
const userService = require('./../backend/services/user-service');
const redis = require('../backend/redis');
const config = require('../backend/config');
const logger = require('../backend/logger')(__filename);
const { stripIndents } = require('common-tags');
const ODY_SERVER_ID = config.ODY_DISCORD_SERVER_ID;

async function messageUser(request) {
  const guild = await odyBot.client.guilds.fetch(ODY_SERVER_ID, null, true);
  const userObj = await userService.getUser(request.createdBy);
  const user = await guild.members.fetch(userObj.discordId);
  user.send(stripIndents`
    Please pickup request https://mboard.objectivedriveyards.com/requests/${request.id}.
    ${request.reply}
  `);
}

async function updateDashboard() {
  if (!config.DISCORD_DASHBOARD_CHANNEL_ID) {
    logger.debug('Dashboard channel ID not set, unable to update request dashboard');
    return;
  }

  const StaticChannel = odyBot.client.channels.cache.get(
    config.DISCORD_DASHBOARD_CHANNEL_ID,
  );
  const msgId = await redis.getAsync('bot:dashboard:1');
  if (!msgId) {
    logger.debug('Dashboard message ID not set, unable to update request dashboard');
    return;
  }
  let pinnedMessage;
  try {
    pinnedMessage = await StaticChannel.messages.fetch(msgId);
  } catch (error) {
    logger.debug('Unknown error, unable to update request dashboard');
  }


  const embed = new Discord.MessageEmbed()
    // Set the title of the field
    .setTitle('ODY-Industy Requests');

  const requests = await require('../backend/services/request-service')
    .getRequests({ limit: 20 });

  for (const request of requests.results) {
    if (!(request.pickedUpAt || !request.approved) || !request.validatedAt) {
      const userObj = await userService.getUser(request.createdBy);

      let stateString;
      if (!request.validatedAt) stateString = 'created';
      else if (!request.approved) stateString = 'rejected';
      else if (!request.completedAt) stateString = '__*approved*__';
      else if (!request.pickedUpAt) stateString = '__*completed*__';
      else stateString = 'picked_up';

      const nickname = userObj.nickname || userObj.name;
      const details = _.truncate(request.details, { length: 40 });

      embed.addField(nickname, `${stateString} \n${details}`, true);
    }
  }

  if (_.isEmpty(requests.results)) {
    embed.addField('No requests found', true);
  }

  pinnedMessage.edit(embed);
}

module.exports = {
  updateDashboard,
  messageUser,
};
