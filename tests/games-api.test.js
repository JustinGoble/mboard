const _ = require('lodash');
const BPromise = require('bluebird');
const { expect } = require('chai');
const App = require('../backend/app');
const { createToolkit } = require('./utils/toolkit');
const mocks = require('./utils/mocks');
const database = require('./utils/database');

describe('/api/v1/games', () => {
  let app;
  let toolkit;

  beforeEach(async () => {
    await database.resetDatabase();

    app = new App();
    toolkit = createToolkit(app);
    await app.startAsync();
  });

  afterEach(() => {
    app.close();
  });

  it('should create and return one game', async () => {
    const game = mocks.generateGame();
    const createdGame = await toolkit.upsertGameProc(game);
    const retrievedGame = await toolkit.getGameProc(createdGame.id);

    expect(createdGame).to.deep.include(game);
    expect(retrievedGame).to.deep.include(createdGame);
  });

  it('should return multiple games', async () => {
    const games = _.range(3).map(() => mocks.generateGame());

    const createdGames = await BPromise.map(games, game =>
      toolkit.upsertGameProc(game),
    );

    const retrievedGames = await toolkit.getGamesProc();

    _.forEach(createdGames, createdGame => {
      expect(retrievedGames).to.deep.include(createdGame);
    });
  });

  it('should return game list', async () => {
    const games = _.range(3).map(() => mocks.generateGame());

    const createdGames = await BPromise.map(games, game =>
      toolkit.upsertGameProc(game),
    );

    const gameList = await toolkit.getGameListProc();
    expect(createdGames.map(d => _.pick(d, ['id', 'name'])))
      .to.deep.have.members(gameList);
  });

  it('should update whole game', async () => {
    const game = mocks.generateGame();
    const createdGame = await toolkit.upsertGameProc(game);

    const newGame = mocks.generateGame();

    _.forEach(newGame, (value, key) => {
      expect(value).to.not.deep.equal(createdGame[key]);
    });

    newGame.id = createdGame.id;
    await toolkit.upsertGameProc(newGame);
    const retrievedGame = await toolkit.getGameProc(createdGame.id);

    expect(retrievedGame).to.deep.include(newGame);
  });

  it('should delete game', async () => {
    const game = mocks.generateGame();
    const createdGame = await toolkit.upsertGameProc(game);
    await toolkit.deleteGameProc(createdGame.id);
    await toolkit.getGameProc(createdGame.id, 404);
  });
});
