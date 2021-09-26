const Joi = require('joi');
const logger = require('../logger')(__filename);
const controllerUtils = require('./controller-utils');
const gameService = require('../services/game-service');
const commonSchemas = require('../schemas/common-schemas');
const gameSchemas = require('../schemas/game-schemas');

const LOGGING_TYPE = 'game';

const gameMultiQuerySchema = Joi.object().keys({
  page: commonSchemas.incremental.optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

const gameIdPathSchema = Joi.object().keys({
  gameId: commonSchemas.incremental,
});

async function getGameList() {
  logger.silly('gameController.getGameList');

  return await gameService.getGameList();
}

async function getGames(req) {
  logger.silly('gameController.getGames');

  const options = controllerUtils.validate(
    req.query,
    gameMultiQuerySchema,
  );

  return await gameService.getGames(options);
}

async function getGame(req) {
  logger.silly('gameController.getGame');

  const { gameId } = controllerUtils.validate(
    req.params,
    gameIdPathSchema,
  );

  return await gameService.getGame(gameId);
}

async function upsertGame(req) {
  logger.silly('gameController.upsertGame');

  const game = controllerUtils.validate(
    req.body,
    gameSchemas.gamePushSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  return await gameService.upsertGame(game);
}

async function deleteGame(req) {
  logger.silly('gameController.deleteGame');

  const { gameId } = controllerUtils.validate(
    req.params,
    gameIdPathSchema,
  );

  await controllerUtils.logRequest(req, LOGGING_TYPE);
  await gameService.deleteGame(gameId);
}

module.exports = {
  getGameList,
  getGames,
  getGame,
  upsertGame,
  deleteGame,
};
