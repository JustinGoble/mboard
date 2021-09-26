const operationController = require('../../../../controllers/operation-controller');
const assignmentController = require('../../../../controllers/assignment-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/:operationId',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(operationController.getOperation),
  );
  router.get(
    '/',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(operationController.getOperations),
  );

  router.post(
    '/',
    authController.createVerifier('management', 'admin'),
    wrapController(operationController.upsertOperation),
  );

  router.delete(
    '/:operationId',
    authController.createVerifier('management', 'admin'),
    wrapController(operationController.deleteOperation),
  );

  router.post(
    '/:operationId/assignments',
    authController.createVerifier('management', 'admin'),
    wrapController(assignmentController.upsertAssignment),
  );

  router.delete(
    '/:operationId/assignments/:assignmentId',
    authController.createVerifier('management', 'admin'),
    wrapController(assignmentController.deleteAssignment),
  );

  return router;
};
