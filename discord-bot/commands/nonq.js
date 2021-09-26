const moment = require('moment');
const redis = require('./../../backend/redis');

//eslint-disable-next-line no-unused-vars
async function action(message, command, args) {
  if (command !== 'nonq') return false;

  const lastFeaturedTimestamp = await redis.getAsync('last-featured');
  if (!lastFeaturedTimestamp) {
    message.channel.send('No NQ feature in memory, get going guys! xP');
    return true;
  }
  message.channel.send(
    `No NQ feature for ${moment(lastFeaturedTimestamp).fromNow(true)}, get going guys! :P`,
  );
  return true;
}

module.exports = {
  name: 'nonq',
  description: 'Returns time sice last NQ featured ODY construct',
  action,
};
