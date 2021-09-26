const App = require('../backend/app');
const { createToolkit } = require('./utils/toolkit');

describe('/api/health', () => {
  let app;
  let toolkit;

  beforeEach(async () => {
    app = new App();
    toolkit = createToolkit(app);
    await app.startAsync();
  });

  afterEach(() => {
    app.close();
  });

  it('should return 200 OK', async () => {
    await toolkit.getHealthProc();
  });
});
