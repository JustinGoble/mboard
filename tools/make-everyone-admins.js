const { knex } = require('../backend/database').connect();
const logger = require('../backend/logger')(__filename);


(async () => {
  logger.info('Turning all existing users into admins...');
  try {
    await knex('users').update({ permissions: 'member admin' });
    logger.info('All users are now admins!');
  } catch (e) {
    logger.error(e.stack || e);
  }
  process.exit();
})();
