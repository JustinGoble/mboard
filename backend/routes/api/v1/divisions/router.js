const divisionController = require('../../../../controllers/division-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/list',
    authController.createVerifier('all'),
    wrapController(divisionController.getDivisionList),
  );

  router.get(
    '/:divisionId',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(divisionController.getDivision),
  );

  router.get(
    '/',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(divisionController.getDivisions),
  );

  router.post(
    '/',
    authController.createVerifier('admin'),
    wrapController(divisionController.upsertDivision),
  );

  router.delete(
    '/:divisionId',
    authController.createVerifier('admin'),
    wrapController(divisionController.deleteDivision),
  );

  return router;
};
