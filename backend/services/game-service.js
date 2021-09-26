const _ = require('lodash');

const serviceUtils = require('./service-utils');
const { knex } = require('../database').connect();
const logger = require('../logger')(__filename);

const throwNotFound = (gameId) => {
  const error = new Error(`Game ${gameId} not found!`);
  error.status = 404;
  throw error;
};

function mapItem(row) {
  return serviceUtils.toCamelCase(row);
}

async function getGameList() {
  return await knex('games')
    .select('id', 'name')
    .orderBy('name', 'asc');
}

async function getGames(opts = {}) {
  _.defaults(opts, {
    page: 0,
    limit: 50,
  });

  const query = knex('games')
    .groupBy('id')
    .orderBy('name', 'asc')
    .limit(opts.limit)
    .offset(opts.limit * opts.page);

  const rows = await query;
  return rows.map(mapItem);
}

async function getGame(gameId) {
  const [game] = await knex('games')
    .select('*')
    .where('games.id', gameId);

  if (!game) {
    throwNotFound(gameId);
  }

  return mapItem(game);
}

async function upsertGame(game) {
  if (_.isNil(game.id)) {
    return addGame(game);
  }
  return updateGame(game);
}

async function addGame(game) {
  logger.debug('Adding new game');
  const dbGame = serviceUtils.toSnakeCase(game);

  const rows = await knex('games')
    .insert(dbGame)
    .returning('*');

  return mapItem(rows[0]);
}

async function updateGame(game) {
  logger.debug(`Updating game with ID ${game.id}`);
  const dbGame = serviceUtils.toSnakeCase(game);

  const [updatedGame] = await knex('games')
    .where('id', game.id)
    .update(dbGame)
    .returning('*');

  if (!updatedGame) {
    throwNotFound(game.id);
  }

  return mapItem(updatedGame);
}

async function deleteGame(gameId) {
  const [game] = await knex('games')
    .where('id', gameId)
    .del()
    .returning('*');

  if (!game) {
    throwNotFound(gameId);
  }
}

module.exports = {
  getGameList,
  getGames,
  getGame,
  upsertGame,
  addGame,
  updateGame,
  deleteGame,
};
