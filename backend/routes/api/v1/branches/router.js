const branchController = require('../../../../controllers/branch-controller');
const authController = require('../../../../controllers/auth-controller');
const { wrapController } = require('../../../../controllers/controller-utils');

module.exports = function buildRouter(router) {
  router.get(
    '/list',
    authController.createVerifier('all'),
    wrapController(branchController.getBranchList),
  );

  router.get(
    '/:branchId',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(branchController.getBranch),
  );

  router.get(
    '/',
    authController.createVerifier('member', 'management', 'admin'),
    wrapController(branchController.getBranches),
  );

  router.post(
    '/',
    authController.createVerifier('admin'),
    wrapController(branchController.upsertBranch),
  );

  router.delete(
    '/:branchId',
    authController.createVerifier('admin'),
    wrapController(branchController.deleteBranch),
  );

  return router;
};
