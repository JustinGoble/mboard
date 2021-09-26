const _ = require('lodash');
const { oneLine } = require('common-tags');
const Discord = require('discord.js');
const userService = require('./../backend/services/user-service');
const actions = require('./commands/index');
const eventLogService = require('./../backend/services/event-log-service');
const { SECURE_CHANNELS } = require('./constants');

// Matches these: <:ODY:1234> <:odylogo:1234> ODY
const regex = /^^((<:((ODY)|(odylogo)):[0-9]*>)|(\/ODY)) /;

module.exports = async function messageProcesser (message) {
  // Null if the correct prefix was not used
  const [prefix] = message.content.match(regex) || [];

  if (!prefix || message.author.bot) {
    return;
  }
  const args = message.content.slice(prefix.length).split(/\s+/);
  const command = args.shift().toLowerCase(); // No more case sensitive!

  const firstChar = command.length > 0 ? command[0] : '';
  if (firstChar.toUpperCase() === firstChar.toLowerCase()) {
    // If the first letter in the command isn't an alphabetical character,
    // the command can't be valid. The prefix is most likely getting
    // messed up with another bot or something.
    return;
  }

  let sender;
  try {
    const senderID = (message.author.id).toString();
    sender = await userService.getUserWithDiscordId(senderID);
  } catch (e) {
    message.reply(e.message); // User not found
    return;
  }

  if (sender.state !== 'active') {
    message.reply('User is not active!');
    return;
  }

  if (command === 'help') {
    if (!_.includes(SECURE_CHANNELS, message.channel.parentID)) {
      message.channel.send('Insufficient channel security level!');
      return;
    }

    let helpEmbed = new Discord.MessageEmbed()
      .setTitle('ODY-Bot Help')
      .setColor(0x0000FF)
      // Set the main content of the embed
      .setDescription('This bot is an extension of https://mboard.objectivedriveyards.com/');

    for (const action of actions) {
      helpEmbed = helpEmbed.addField(`${prefix}${action.name}`, action.description, true);
    }
    message.channel.send(helpEmbed);
    return;
  }

  await eventLogService.addLogEntry({
    user: sender.id,
    type: 'bot',
    request_path: command,
    request_body: message.content,
  });

  try {
    for (const action of actions) {
      if (await action.action(message, command, args, sender)) return;
    }
  } catch (e) {
    message.reply(e.message);
    return;
  }

  // for testing potential future features:
  if (command === 'join_vc') {
    // Voice only works in guilds, if the message does not come from a guild,
    // we ignore it
    if (!message.guild) return;
    // Only try to join the sender's voice channel if they are in one themselves
    if (message.member.voice.channel) {
      const connection = await message.member.voice.channel.join();
      // eslint-disable-next-line max-len
      connection.play('https://media.blubrry.com/takeituneasy/s/content.blubrry.com/takeituneasy/lex_ai_elon_musk_2.mp3');
    } else {
      message.reply('You need to join a voice channel first!');
    }
    return;
  }

  message.reply(oneLine`
    Unknown command ${command}, use the command "${prefix}help"
    to list available commands.
  `);
};
