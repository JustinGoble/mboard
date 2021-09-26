const _ = require('lodash');
const logger = require('../logger')(__filename);
const config = require('../config');
const memberInfoUpdate = require('./member-info-update');

const tasks = [
  memberInfoUpdate,
];

let queue = [];
let running = false;

async function run() {
  if (running) return;
  running = true;

  while (queue.length > 0) {
    const task = _.head(queue);
    queue = _.tail(queue);

    try {
      logger.debug(`Running worker task "${task.name}"`);
      await task.main();
      logger.info(`Task "${task.name}" completed successfully`);
    } catch (e) {
      logger.error(`Task "${task.name}" failed: ${e.stack || e}`);
    }
  }

  running = false;
}

function addMemberInfoUpdateToQueue() {
  addToQueue(memberInfoUpdate);
}

function addToQueue(task) {
  if (config.DISABLE_WORKERS) {
    logger.warn(`Did not run task "${task.name}", workers disabled using DISABLE_WORKERS`);
    return;
  }

  logger.info(`Adding task "${task.name}" to the worker queue`);
  queue.push(task);
  run();
}

function startWorkers() {
  for (const task of tasks) {
    addToQueue(task);
    setInterval(() => {
      addToQueue(task);
    }, task.intervalMs);
  }
}

module.exports = {
  addMemberInfoUpdateToQueue,
  startWorkers,
};
