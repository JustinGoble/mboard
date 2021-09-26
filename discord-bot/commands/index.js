const addAction = require('./add');
const quoteAction = require('./destrin-quote');
const etaAction = require('./eta');
const nonqAction = require('./nonq');
const nqAction = require('./nq');
const rndAction = require('./rnd');
const schedAction = require('./sched');
const usersAction = require('./users');
const dashboardAction = require('./dashboard');

module.exports = [
  addAction,
  quoteAction,
  etaAction,
  nonqAction,
  nqAction,
  rndAction,
  schedAction,
  usersAction,
  dashboardAction,
];
