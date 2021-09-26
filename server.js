const App = require('./backend/app');
const logger = require('./backend/logger')(__filename);
const workers = require('./backend/workers');
require('./discord-bot');

process.on('unhandledRejection', error => {
  logger.error('unhandledRejection', error);
});

const app = new App();
app.startAsync();

workers.startWorkers();
