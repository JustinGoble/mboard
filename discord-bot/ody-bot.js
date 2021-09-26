const Discord = require('discord.js');
const config = require('./../backend/config');

const client = new Discord.Client({
  partials: ['REACTION', 'MESSAGE'],
  ws: { intents: ['GUILDS','GUILD_MESSAGES'] },
});

client.login(config.DISCORD_BOT_SECRET);

module.exports = {
  client,
};
