const shipCategoryController = require('../../../../controllers/ship-category-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/list',
    authController.createVerifier('all'),
    wrapController(shipCategoryController.getShipCategoryList),
  );

  router.get(
    '/:shipCategoryId',
    authController.createVerifier('member', 'management', 'aerospace_admin', 'admin'),
    wrapController(shipCategoryController.getShipCategory),
  );

  router.get(
    '/',
    authController.createVerifier('member', 'management', 'aerospace_admin', 'admin'),
    wrapController(shipCategoryController.getShipCategories),
  );

  router.post(
    '/',
    authController.createVerifier('industry', 'admin'),
    wrapController(shipCategoryController.upsertShipCategory),
  );

  router.delete(
    '/:shipCategoryId',
    authController.createVerifier('industry', 'admin'),
    wrapController(shipCategoryController.deleteShipCategory),
  );

  return router;
};
