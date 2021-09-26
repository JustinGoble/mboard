const _ = require('lodash');
const BPromise = require('bluebird');
const { expect } = require('chai');
const App = require('../backend/app');
const { createToolkit } = require('./utils/toolkit');
const mocks = require('./utils/mocks');
const database = require('./utils/database');

describe('/api/v1/branches', () => {
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

  it('should create and return one branch', async () => {
    const branch = mocks.generateBranch();
    const createdBranch = await toolkit.upsertBranchProc(branch);
    const retrievedBranch = await toolkit.getBranchProc(createdBranch.id);

    expect(createdBranch).to.deep.include(branch);
    expect(retrievedBranch).to.deep.include(createdBranch);
  });

  it('should return multiple branches', async () => {
    const branches = _.range(3).map(() => mocks.generateBranch());

    const createdBranches = await BPromise.map(branches, branch =>
      toolkit.upsertBranchProc(branch),
    );

    const retrievedBranches = await toolkit.getBranchesProc();

    _.forEach(createdBranches, createdBranch => {
      expect(retrievedBranches).to.deep.include(createdBranch);
    });
  });

  it('should return branch list', async () => {
    const branches = _.range(3).map(() => mocks.generateBranch());

    const createdBranches = await BPromise.map(branches, branch =>
      toolkit.upsertBranchProc(branch),
    );

    const branchList = await toolkit.getBranchListProc();
    expect(createdBranches.map(d => _.pick(d, ['id', 'name'])))
      .to.deep.have.members(branchList);
  });

  it('should update whole branch', async () => {
    const branch = mocks.generateBranch();
    const createdBranch = await toolkit.upsertBranchProc(branch);

    const newBranch = mocks.generateBranch();

    _.forEach(newBranch, (value, key) => {
      expect(value).to.not.deep.equal(createdBranch[key]);
    });

    newBranch.id = createdBranch.id;
    await toolkit.upsertBranchProc(newBranch);
    const retrievedBranch = await toolkit.getBranchProc(createdBranch.id);

    expect(retrievedBranch).to.deep.include(newBranch);
  });

  it('should update branch partially', async () => {
    const newName = 'New name';

    const branch = mocks.generateBranch();
    const createdBranch = await toolkit.upsertBranchProc(branch);

    expect(createdBranch.name).to.not.equal(newName);

    createdBranch.name = newName;
    await toolkit.upsertBranchProc(createdBranch);
    const retrievedBranch = await toolkit.getBranchProc(createdBranch.id);

    expect(retrievedBranch.name).to.equal(newName);
  });

  it('should delete branch', async () => {
    const branch = mocks.generateBranch();
    const createdBranch = await toolkit.upsertBranchProc(branch);
    await toolkit.deleteBranchProc(createdBranch.id);
    await toolkit.getBranchProc(createdBranch.id, 404);
  });
});
