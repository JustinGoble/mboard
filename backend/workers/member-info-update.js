const _ = require('lodash');
const BPromise = require('bluebird');
const discordRoleService = require('../services/discord-role-service');
const userService = require('../services/user-service');
const logger = require('../logger')(__filename);
const config = require('../config');
const { client } = require('../../discord-bot/ody-bot');

const ODY_SERVER_ID = config.ODY_DISCORD_SERVER_ID;

async function main() {
  if (!ODY_SERVER_ID) {
    logger.warn('No ODY Discord server ID given, unable to update member info');
    return;
  }

  let attempts = 3;
  while (!client.readyAt && attempts > 0) {
    logger.warn('Discord client not ready, delaying member info update by 5s');
    await BPromise.delay(5 * 1000);
    attempts--;
  }

  // Fetch the guild without the cache
  const guild = await client.guilds.fetch(ODY_SERVER_ID, null, true);
  const roles = await guild.roles.fetch(null, null, true);

  const dbRoles = [];

  for (const roleId of roles.cache.keys()) {
    const role = roles.cache.get(roleId);
    dbRoles.push({
      id: role.id,
      name: role.name,
      color: role.color,
    });
  }

  const users = await userService.getDiscordIds();

  const discordIds = _.filter(
    _.map(users, u => u.discordId),
    i => parseInt(i), // All Discord IDs are numbers
  );
  const members = await guild.members.fetch({
    user: discordIds,
    force: true,
  });

  const dbUsers = [];

  for (const user of users) {
    const member = members.get(user.discordId);

    if (!member) {
      dbUsers.push({
        discordId: user.discordId,
        nickname: user.name,
        server: 'Not recognized',
        discordRoles: [],
      });
    } else {
      dbUsers.push({
        discordId: user.discordId,
        nickname: member.displayName || user.name,
        server: member.guild.name,
        discordRoles: member._roles,
      });
    }
  }

  await discordRoleService.upsertBulkDiscordRoles(dbRoles);
  await userService.setServerInfo(dbUsers);
}

module.exports = {
  name: 'Member info update',
  main,
  intervalMs: 24 * 60 * 60 * 1000,
};
