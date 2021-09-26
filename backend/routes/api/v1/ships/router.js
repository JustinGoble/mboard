const shipController = require('../../../../controllers/ship-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/list',
    authController.createVerifier('all'),
    wrapController(shipController.getShipList),
  );

  router.get(
    '/:shipId',
    authController.createVerifier('member', 'management', 'aerospace_admin', 'admin'),
    wrapController(shipController.getShip),
  );

  router.get(
    '/',
    authController.createVerifier('member', 'management', 'aerospace_admin', 'admin'),
    wrapController(shipController.getShips),
  );

  router.post(
    '/',
    authController.createVerifier('industry', 'admin'),
    wrapController(shipController.upsertShip),
  );

  router.delete(
    '/:shipId',
    authController.createVerifier('industry', 'admin'),
    wrapController(shipController.deleteShip),
  );

  return router;
};
