const _ = require('lodash');
const BPromise = require('bluebird');
const { expect } = require('chai');
const App = require('../backend/app');
const { createToolkit } = require('./utils/toolkit');
const mocks = require('./utils/mocks');
const database = require('./utils/database');

describe('/api/v1/event-types', () => {
  let app;
  let toolkit;

  let createdGame;
  let createdBranch;
  let createdDivision;

  beforeEach(async () => {
    await database.resetDatabase();

    app = new App();
    toolkit = createToolkit(app);
    await app.startAsync();

    const branch = mocks.generateBranch();
    createdBranch = await toolkit.upsertBranchProc(branch);

    const division = mocks.generateDivision(createdBranch.id);
    createdDivision = await toolkit.upsertDivisionProc(division);

    const game = mocks.generateGame();
    createdGame = await toolkit.upsertGameProc(game);
  });

  afterEach(() => {
    app.close();
  });

  it('should create and return one event type with various attachments', async () => {
    const eventTypes = [
      mocks.generateEventType(null, null, null),
      mocks.generateEventType(createdGame.id, null, null),
      mocks.generateEventType(null, createdBranch.id, null),
      mocks.generateEventType(null, null, createdDivision.id),
      mocks.generateEventType(createdGame.id, createdBranch.id, createdDivision.id),
    ];

    for (const eventType of eventTypes) {
      const createdEventType = await toolkit.upsertEventTypeProc(eventType);
      const retreivedEventType = await toolkit.getEventTypeProc(createdEventType.id);

      expect(createdEventType).to.deep.include(eventType);
      expect(retreivedEventType).to.deep.include(createdEventType);
    }
  });

  it('should return multiple event types', async () => {
    const eventTypes = [
      mocks.generateEventType(null, null, null),
      mocks.generateEventType(createdGame.id, null, null),
      mocks.generateEventType(createdGame.id, createdBranch.id, createdDivision.id),
    ];

    const createdEventTypes = await BPromise.map(eventTypes, eventType =>
      toolkit.upsertEventTypeProc(eventType),
    );

    const retrievedEventTypes = await toolkit.getEventTypesProc();

    _.forEach(createdEventTypes, createdEventType => {
      expect(retrievedEventTypes).to.deep.include(createdEventType);
    });
  });

  it('should return event type list', async () => {
    const eventTypes = [
      mocks.generateEventType(null, null, null),
      mocks.generateEventType(createdGame.id, null, null),
      mocks.generateEventType(createdGame.id, createdBranch.id, createdDivision.id),
    ];

    const createdEventTypes = await BPromise.map(eventTypes, eventType =>
      toolkit.upsertEventTypeProc(eventType),
    );

    const eventTypeList = await toolkit.getEventTypeListProc();
    expect(createdEventTypes.map(d => _.pick(d, ['id', 'name'])))
      .to.deep.have.members(eventTypeList);
  });

  it('should update whole event type', async () => {
    const eventType = mocks.generateEventType(null, null, null);
    const createdEventType = await toolkit.upsertEventTypeProc(eventType);

    const newEventType = mocks.generateEventType(
      createdGame.id, createdBranch.id, createdDivision.id,
    );

    _.forEach(newEventType, (value, key) => {
      expect(value).to.not.deep.equal(createdEventType[key]);
    });

    newEventType.id = createdEventType.id;
    await toolkit.upsertEventTypeProc(newEventType);
    const retrievedEventType = await toolkit.getEventTypeProc(createdEventType.id);

    expect(retrievedEventType).to.deep.include(newEventType);
  });

  it('should update event type partially', async () => {
    const newName = 'New name';

    const eventType = mocks.generateEventType(
      createdGame.id, createdBranch.id, createdDivision.id,
    );
    const createdEventType = await toolkit.upsertEventTypeProc(eventType);

    expect(createdEventType.name).to.not.equal(newName);

    createdEventType.name = newName;
    await toolkit.upsertEventTypeProc(createdEventType);
    const retrievedEventType = await toolkit.getEventTypeProc(createdEventType.id);

    expect(retrievedEventType.name).to.equal(newName);
  });

  it('should delete event type', async () => {
    const eventType = mocks.generateEventType();
    const createdEventType = await toolkit.upsertEventTypeProc(eventType);
    await toolkit.deleteEventTypeProc(createdEventType.id);
    await toolkit.getEventTypeProc(createdEventType.id, 404);
  });
});
