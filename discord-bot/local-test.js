/* eslint-disable no-console */
/**
 * This script is used for testing the bot locally.
 * Requires Node.js version 11.7 or above.
 */

const readline = require('readline');
const colors = require('colors');
const messageProcesser = require('./message-processer');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function botReply(message, opts) {
  console.log(colors.yellow(message));
  if (opts) {
    console.log(JSON.stringify(opts, null, 2));
  }
}

async function main() {
  let userId = null;
  console.log('User ID:');
  for await (const line of rl) {
    if (userId == null) {
      if (!/^\d+$/.test(line)) {
        console.log('Invalid ID, try again:');
        continue;
      }

      userId = line;
      console.log('Start writing messages for the bot to process:');
      continue;
    }

    const message = {
      content: line,
      author: {
        id: userId,
        bot: false,
      },
      reply: botReply,
      channel: {
        send: botReply,
      },
    };
    await messageProcesser(message);
  }
}

main().catch(console.error);
