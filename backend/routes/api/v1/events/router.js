const eventController = require('../../../../controllers/event-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/upcoming/:calendarName',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(eventController.getUpcomingEvents),
  );

  router.get(
    '/:eventId',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(eventController.getEvent),
  );

  router.get(
    '/',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(eventController.getEvents),
  );

  router.post(
    '/:calendarName',
    authController.createVerifier('admin'),
    wrapController(eventController.upsertEvent),
  );

  router.delete(
    '/:eventId',
    authController.createVerifier('admin'),
    wrapController(eventController.deleteEvent),
  );

  return router;
};
