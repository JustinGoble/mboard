const messageProcesser = require('./message-processer');
const odyBot = require('./ody-bot.js');


odyBot.client.on('message', messageProcesser);
