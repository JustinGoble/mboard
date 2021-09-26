const _ = require('lodash');
const BPromise = require('bluebird');
const { expect } = require('chai');
const App = require('../backend/app');
const { createToolkit } = require('./utils/toolkit');
const mocks = require('./utils/mocks');
const database = require('./utils/database');

describe('/api/v1/divisions', () => {
  let app;
  let toolkit;

  let createdBranch;

  beforeEach(async () => {
    await database.resetDatabase();

    app = new App();
    toolkit = createToolkit(app);
    await app.startAsync();

    const branch = mocks.generateBranch();
    createdBranch = await toolkit.upsertBranchProc(branch);
  });

  afterEach(() => {
    app.close();
  });

  it('should create and return one division', async () => {
    const division = mocks.generateDivision(createdBranch.id);
    const createdDivision = await toolkit.upsertDivisionProc(division);
    const retrievedDivision = await toolkit.getDivisionProc(createdDivision.id);

    expect(createdDivision).to.deep.include(division);
    expect(retrievedDivision).to.deep.include(createdDivision);
  });

  it('should return multiple divisions', async () => {
    const divisions = _.range(3).map(() => mocks.generateDivision(createdBranch.id));

    const createdDivisions = await BPromise.map(divisions, division =>
      toolkit.upsertDivisionProc(division),
    );

    const retrievedDivisions = await toolkit.getDivisionsProc();

    _.forEach(createdDivisions, createdDivision => {
      expect(retrievedDivisions).to.deep.include(createdDivision);
    });
  });

  it('should return division list', async () => {
    const divisions = _.range(3).map(() => mocks.generateDivision(createdBranch.id));

    const createdDivisions = await BPromise.map(divisions, division =>
      toolkit.upsertDivisionProc(division),
    );

    const divisionList = await toolkit.getDivisionListProc();
    expect(createdDivisions.map(d => _.pick(d, ['id', 'name'])))
      .to.deep.have.members(divisionList);
  });

  it('should update whole division', async () => {
    const division = mocks.generateDivision(createdBranch.id);
    const createdDivision = await toolkit.upsertDivisionProc(division);

    const newDivision = mocks.generateDivision(createdBranch.id);

    _.forEach(newDivision, (value, key) => {
      if (key === 'branchId') { return true; }
      expect(value).to.not.deep.equal(createdDivision[key]);
    });

    newDivision.id = createdDivision.id;
    await toolkit.upsertDivisionProc(newDivision);
    const retrievedDivision = await toolkit.getDivisionProc(createdDivision.id);

    expect(retrievedDivision).to.deep.include(newDivision);
  });

  it('should update division partially', async () => {
    const newName = 'New name';

    const division = mocks.generateDivision(createdBranch.id);
    const createdDivision = await toolkit.upsertDivisionProc(division);

    expect(createdDivision.name).to.not.equal(newName);

    createdDivision.name = newName;
    await toolkit.upsertDivisionProc(createdDivision);
    const retrievedDivision = await toolkit.getDivisionProc(createdDivision.id);

    expect(retrievedDivision.name).to.equal(newName);
  });

  it('should delete division', async () => {
    const division = mocks.generateDivision(createdBranch.id);
    const createdDivision = await toolkit.upsertDivisionProc(division);
    await toolkit.deleteDivisionProc(createdDivision.id);
    await toolkit.getDivisionProc(createdDivision.id, 404);
  });
});
