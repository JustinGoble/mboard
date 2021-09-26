const eventTypeController = require('../../../../controllers/event-type-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/list',
    authController.createVerifier('all'),
    wrapController(eventTypeController.getEventTypeList),
  );

  router.get(
    '/:eventTypeId',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(eventTypeController.getEventType),
  );

  router.get(
    '/',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(eventTypeController.getEventTypes),
  );

  router.post(
    '/',
    authController.createVerifier('admin'),
    wrapController(eventTypeController.upsertEventType),
  );

  router.delete(
    '/:eventTypeId',
    authController.createVerifier('admin'),
    wrapController(eventTypeController.deleteEventType),
  );

  return router;
};
