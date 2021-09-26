const _ = require('lodash');

let operationNumber = 0;
let opAssignmentNumber = 0;
let opUserNumber = 0;
let branchNumber = 0;
let divisionNumber = 0;
let gameNumber = 0;
let eventTypeNumber = 0;
let eventNumber = 0;
let requestNumber = 0;

function generateOperation(opts = {}) {
  operationNumber++;
  return _.defaults(opts, {
    branchId: null,
    name: `Test operation ${operationNumber}`,
    description: `Description for test operation ${operationNumber}`,
    requirements: `Requirements for test operation ${operationNumber}`,
    location: `Location for test operation ${operationNumber}`,
  });
}

function generateOpAssignment(opts = {}) {
  opAssignmentNumber++;
  return _.defaults(opts, {
    name: `Test assignment ${opAssignmentNumber}`,
    description: `Description for test assignment ${opAssignmentNumber}`,
  });
}

function generateUser(permissions, branchId) {
  opUserNumber++;
  return {
    name: `TestUser#${opUserNumber}`,
    nickname: `TestUser${opUserNumber} nickname`,
    branchId: branchId || null,
    discordId: `Discord ID for test user ${opUserNumber}`,
    description: `Description for test user ${opUserNumber}`,
    permissions,
  };
}

function generateBranch() {
  branchNumber++;
  return {
    name: `Test branch ${branchNumber}`,
    description: `Description for test branch ${branchNumber}`,
  };
}

function generateDivision(branchId) {
  divisionNumber++;
  return {
    branchId,
    name: `Test division ${divisionNumber}`,
    description: `Description for test division ${divisionNumber}`,
  };
}

function generateGame() {
  gameNumber++;
  return {
    name: `Test game ${gameNumber}`,
  };
}

function generateEventType(gameId, branchId, divisionId) {
  eventTypeNumber++;
  return {
    name: `Test event type ${eventTypeNumber}`,
    gameId,
    branchId,
    divisionId,
  };
}

function generateEvent(eventTypeId, startTime, endTime) {
  eventNumber++;
  return {
    eventTypeId,
    imageUrl: 'https://via.placeholder.com/500x80',
    gEvent: {
      summary: `Test event summary ${eventNumber}`,
      description: `Test event description ${eventNumber}`,
      start: {
        dateTime: startTime || '2050-12-11T17:30:00Z',
      },
      end: {
        dateTime: endTime || '2050-12-11T18:00:00Z',
      },
    },
  };
}

function generateRequest() {
  requestNumber++;
  return {
    details: `Test request ${requestNumber}`,
    type: 'personal',
    content: [
      { name: 'Item 1', quantity: 2 },
      { name: 'Item 1', quantity: 2 },
    ],
  };
}

module.exports = {
  generateOperation,
  generateOpAssignment,
  generateUser,
  generateBranch,
  generateDivision,
  generateGame,
  generateEventType,
  generateEvent,
  generateRequest,
};
