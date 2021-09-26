const gameController = require('../../../../controllers/game-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/list',
    authController.createVerifier('all'),
    wrapController(gameController.getGameList),
  );

  router.get(
    '/:gameId',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(gameController.getGame),
  );

  router.get(
    '/',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(gameController.getGames),
  );

  router.post(
    '/',
    authController.createVerifier('admin'),
    wrapController(gameController.upsertGame),
  );

  router.delete(
    '/:gameId',
    authController.createVerifier('admin'),
    wrapController(gameController.deleteGame),
  );

  return router;
};
