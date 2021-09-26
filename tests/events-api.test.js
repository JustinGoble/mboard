const _ = require('lodash');
const BPromise = require('bluebird');
const nock = require('nock');
const { expect } = require('chai');
const App = require('../backend/app');
const { createToolkit } = require('./utils/toolkit');
const gapi = require('./utils/gapi');
const mocks = require('./utils/mocks');
const database = require('./utils/database');
const redis = require('../backend/redis');
const config = require('../backend/config');
const logger = require('../backend/logger')(__filename);

const CALENDAR = 'internal-events';
let CALENDAR_ID = 'test';
if (config.CALENDARS.INTERNAL_EVENTS) {
  CALENDAR_ID = config.CALENDARS.INTERNAL_EVENTS.replace('@', '%40');
} else {
  logger.warn('No internal events calendar defined, using a dumb value!');
}

describe('/api/v1/events', () => {
  let app;
  let toolkit;

  let createdGame;
  let createdEventType;

  function expectEventInclude(e1, e2) {
    expect(e1.gEvent).to.deep.include(e2.gEvent);
    expect(_.omit(e1, 'gEvent')).to.deep.include(_.omit(e2, 'gEvent'));
  }

  before(async () => {
    // Prevent accidental Google Calendar event creation
    nock.disableNetConnect();
    nock.enableNetConnect('127.0.0.1'); // Allow localhost connections

    gapi.nockPersistingAuth();
  });

  beforeEach(async () => {
    await database.resetDatabase();
    await redis.flushall();

    app = new App();
    toolkit = createToolkit(app);
    await app.startAsync();

    const game = mocks.generateGame();
    createdGame = await toolkit.upsertGameProc(game);

    const eventType = mocks.generateEventType(createdGame.id, null, null);
    createdEventType = await toolkit.upsertEventTypeProc(eventType);
  });

  afterEach(() => {
    app.close();

    // Make sure that these tests leave no pending nocks
    const pendingNocks = nock.pendingMocks();
    if (pendingNocks.length > 0) {
      throw new Error(`Following nocks are still pending:\n${pendingNocks}`);
    }
  });

  it('should create and return one event', async () => {
    const event = mocks.generateEvent(createdEventType.id);

    gapi.nockEventCreation(CALENDAR_ID, 'e', event);
    const createdEvent = await toolkit.upsertEventProc(CALENDAR, event);

    gapi.nockEventRetrieval(CALENDAR_ID, createdEvent.gEvent.id, event);
    const retreivedEvent = await toolkit.getEventProc(createdEvent.id);

    expectEventInclude(createdEvent, event);
    expectEventInclude(retreivedEvent, createdEvent);
  });

  it('should return multiple events', async () => {
    const events = _.range(3).map(() => mocks.generateEvent(createdEventType.id));

    const createdEvents = await BPromise.map(events, (event, i) => {
      gapi.nockEventCreation(CALENDAR_ID, `e${i}`, event);
      return toolkit.upsertEventProc(CALENDAR, event);
    }, { concurrency: 1 });

    _.forEach(createdEvents, createdEvent => {
      gapi.nockEventRetrieval(CALENDAR_ID, createdEvent.gEvent.id, createdEvent);
    });
    const retrievedEvents = await toolkit.getEventsProc();

    _.forEach(createdEvents, (createdEvent) => {
      const retrievedEvent = _.find(retrievedEvents, re => re.id === createdEvent.id);
      expectEventInclude(retrievedEvent, createdEvent);
    });
  });

  it('should return a list of upcoming events', async () => {
    const events = [
      // Two events in the future
      mocks.generateEvent(createdEventType.id),
      mocks.generateEvent(createdEventType.id),

      // And one in the past
      mocks.generateEvent(createdEventType.id, '2000-12-11T17:30:00Z', '2000-12-11T17:30:00Z'),
    ];

    const createdEvents = await BPromise.map(events, (event, i) => {
      gapi.nockEventCreation(CALENDAR_ID, `e${i}`, event);
      return toolkit.upsertEventProc(CALENDAR, event);
    }, { concurrency: 1 });

    gapi.nockUpcomingEventRetrieval(
      CALENDAR_ID,
      createdEvents,
    );
    const retrievedEvents = await toolkit.getUpcomingEventsProc(CALENDAR);

    expect(retrievedEvents.length).to.equal(2);

    _.forEach(retrievedEvents, (retrievedEvent) => {
      const createdEvent = _.find(createdEvents, e => e.id === retrievedEvent.id);
      expectEventInclude(retrievedEvent, createdEvent);
    });
  });

  it('should update event partially', async () => {
    const newSummary = 'New name';

    const event = mocks.generateEvent(createdEventType.id);

    gapi.nockEventCreation(CALENDAR_ID, 'e', event);
    const createdEvent = await toolkit.upsertEventProc(CALENDAR, event);

    expect(createdEvent.gEvent.summar).to.not.equal(newSummary);

    createdEvent.gEvent.summary = newSummary;
    gapi.nockEventRetrieval(CALENDAR_ID, 'e', createdEvent);
    gapi.nockEventUpdate(CALENDAR_ID, 'e', createdEvent);
    await toolkit.upsertEventProc(CALENDAR, createdEvent);

    gapi.nockEventRetrieval(CALENDAR_ID, 'e', createdEvent);
    const retrievedEvent = await toolkit.getEventProc(createdEventType.id);

    expect(retrievedEvent.gEvent.summary).to.equal(newSummary);
  });

  it('should delete event', async () => {
    const event = mocks.generateEvent(createdEventType.id);

    gapi.nockEventCreation(CALENDAR_ID, 'e', event);
    const createdEvent = await toolkit.upsertEventProc(CALENDAR, event);

    gapi.nockEventRemoval(CALENDAR_ID, createdEvent.gEvent.id);
    await toolkit.deleteEventProc(createdEvent.id);

    await toolkit.getEventProc(createdEvent.id, 404);
  });
});
