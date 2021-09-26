const _ = require('lodash');
const BPromise = require('bluebird');
const request = require('supertest');
const { expect } = require('chai');
const { TEST_TOKEN_MEMBER } = require('./utils/database');
const App = require('../backend/app');
const { createToolkit } = require('./utils/toolkit');
const mocks = require('./utils/mocks');
const database = require('./utils/database');

describe('/api/v1/operations', () => {
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

  it('should create and return one operation', async () => {
    const operation = mocks.generateOperation();
    const createdOperation = await toolkit.upsertOperationProc(operation);
    const retrievedOperation = await toolkit.getOperationProc(createdOperation.id);

    delete createdOperation.createdAt;
    delete createdOperation.updatedAt;

    expect(createdOperation).to.deep.include(operation);
    expect(retrievedOperation).to.deep.include(createdOperation);
  });

  it('should return multiple operations', async () => {
    const operations = _.range(3).map(() => mocks.generateOperation());

    const createdOperations = await BPromise.map(operations, operation =>
      toolkit.upsertOperationProc(operation),
    );

    const retrievedOperations = await toolkit.getOperationsProc();

    _.forEach(createdOperations, op => {
      delete op.createdAt;
      delete op.updatedAt;
    });
    _.forEach(retrievedOperations, op => {
      delete op.createdAt;
      delete op.updatedAt;
    });

    //expect(retrievedOperations).to.deep.include.members(createdOperations);

    _.forEach(createdOperations, createdOperation => {
      expect(retrievedOperations).to.deep.include(createdOperation);
    });
  });


  it('should update whole operation', async () => {
    const operation = mocks.generateOperation();

    const branch = mocks.generateBranch();
    const createdBranch = await toolkit.upsertBranchProc(branch);
    const newOperation = mocks.generateOperation({ branchId: createdBranch.id });

    const createdOperation = await toolkit.upsertOperationProc(operation);

    _.forEach(newOperation, (value, key) => {
      expect(value).to.not.deep.equal(createdOperation[key]);
    });

    newOperation.id = createdOperation.id;
    await toolkit.upsertOperationProc(newOperation);
    const retrievedOperation = await toolkit.getOperationProc(createdOperation.id);

    expect(retrievedOperation).to.deep.include(newOperation);
  });

  it('should update operation partially', async () => {
    const newName = 'New name';

    const operation = mocks.generateOperation();
    const createdOperation = await toolkit.upsertOperationProc(operation);

    expect(createdOperation.name).to.not.equal(newName);

    createdOperation.name = newName;

    await toolkit.upsertOperationProc(createdOperation);
    const retrievedOperation = await toolkit.getOperationProc(createdOperation.id);

    expect(retrievedOperation.name).to.equal(newName);
  });

  it('should delete operation', async () => {
    const operation = mocks.generateOperation();
    const createdOperation = await toolkit.upsertOperationProc(operation);
    await toolkit.deleteOperationProc(createdOperation.id);
    await toolkit.getOperationProc(createdOperation.id, 404);
  });

  it('should not be able to get draft or archived operations as a regular member', async () => {
    const draftOp = mocks.generateOperation({ state: 'draft' });
    const unapprovedOp = mocks.generateOperation({ state: 'unapproved' });
    const archivedOp = mocks.generateOperation({ state: 'archived' });
    const inProgressOp = mocks.generateOperation({ state: 'in_progress' });

    const createdDraftOp = await toolkit.upsertOperationProc(draftOp);
    await toolkit.upsertOperationProc(unapprovedOp);
    await toolkit.upsertOperationProc(archivedOp);
    await toolkit.upsertOperationProc(inProgressOp);

    // Request the draft operation as a member
    await request(app.expressApp)
      .get(`/api/v1/operations/${createdDraftOp.id}`)
      .set('x-token', TEST_TOKEN_MEMBER)
      .expect(404);

    // Request all operations as a member
    const { body: retrievedOperations } = await request(app.expressApp)
      .get('/api/v1/operations')
      .set('x-token', TEST_TOKEN_MEMBER)
      .expect(200);

    const idList = _.map(retrievedOperations, o => o.id);
    expect(idList.length).to.equal(2);
    expect(idList).to.not.include(archivedOp.id);
    expect(idList).to.not.include(createdDraftOp.id);
  });

  describe('assignments', () => {
    it('should create and return one op assignment', async () => {
      const operation = mocks.generateOperation();
      const createdOperation = await toolkit.upsertOperationProc(operation);
      const opAssignment = mocks.generateOpAssignment();
      const createdAssignment = await toolkit.upsertOpAssignmentProc(
        createdOperation.id,
        opAssignment,
      );

      const retrievedOperation = await toolkit.getOperationProc(createdOperation.id);
      const [retrievedAssignment] = retrievedOperation.assignments;
      delete retrievedAssignment.createdAt;
      delete retrievedAssignment.updatedAt;

      expect(createdAssignment).to.deep.include(opAssignment);
      expect(createdAssignment).to.deep.include(retrievedAssignment);
    });

    it('should return multiple op assignments', async () => {
      const operation = mocks.generateOperation();
      const createdOperation = await toolkit.upsertOperationProc(operation);

      const opAssignments = _.range(3).map(() => mocks.generateOpAssignment());

      const createdOpAssignments = await BPromise.map(opAssignments, opAssignment =>
        toolkit.upsertOpAssignmentProc(createdOperation.id, opAssignment),
      );
      const retrievedOperation = await toolkit.getOperationProc(createdOperation.id);

      //expect(createdOpAssignments).to.deep.include.members(retrievedOperation.assignments);

      // Database time conversions lead to createdAt and updatedAt
      // times usually being a millisecond off
      _.forEach(createdOpAssignments, assignment => {
        delete assignment.createdAt;
        delete assignment.updatedAt;
      });
      _.forEach(retrievedOperation.assignments, assignment => {
        delete assignment.createdAt;
        delete assignment.updatedAt;
      });

      _.forEach(createdOpAssignments, assignment => {
        expect(retrievedOperation.assignments).to.deep.include(assignment);
      });
    });


    it('should update whole op assignment', async () => {
      const operation = mocks.generateOperation();
      const createdOperation = await toolkit.upsertOperationProc(operation);

      const opAssignment = mocks.generateOpAssignment();
      const createdOpAssignment = await toolkit.upsertOpAssignmentProc(
        createdOperation.id,
        opAssignment,
      );
      const newOpAssignment = mocks.generateOpAssignment();

      _.forEach(newOpAssignment, (value, key) => {
        expect(value).to.not.deep.equal(createdOpAssignment[key]);
      });

      newOpAssignment.id = createdOpAssignment.id;

      await toolkit.upsertOpAssignmentProc(createdOperation.id, newOpAssignment);
      const [retrievedOpAssignment] =
        (await toolkit.getOperationProc(createdOperation.id)).assignments;

      expect(retrievedOpAssignment).to.deep.include(newOpAssignment);
    });

    it('should update op assignment partially', async () => {
      const newName = 'New name';

      const operation = mocks.generateOperation();
      const createdOperation = await toolkit.upsertOperationProc(operation);

      const opAssignment = mocks.generateOpAssignment();
      const createdOpAssignment = await toolkit.upsertOpAssignmentProc(
        createdOperation.id,
        opAssignment,
      );

      expect(createdOpAssignment.name).to.not.equal(newName);

      createdOpAssignment.name = newName;

      await toolkit.upsertOpAssignmentProc(createdOpAssignment.id, createdOpAssignment);
      const [retrievedOpAssignment] =
        (await toolkit.getOperationProc(createdOperation.id)).assignments;

      expect(retrievedOpAssignment.name).to.deep.include(newName);
    });

    it('should delete op assignment', async () => {
      const operation = mocks.generateOperation();
      const createdOperation = await toolkit.upsertOperationProc(operation);
      const opAssignment = mocks.generateOpAssignment();
      const createdOpAssignment = await toolkit.upsertOpAssignmentProc(
        createdOperation.id,
        opAssignment,
      );

      await toolkit.deleteOpAssignmentProc(
        createdOperation.id,
        createdOpAssignment.id,
      );
      const [retrievedOpAssignment] =
      (await toolkit.getOperationProc(createdOperation.id)).assignments;
      expect(retrievedOpAssignment).to.equal(undefined);
    });
  });

  describe('bundled', () => {
    describe('assignments', () => {
      let opAssignment1, opAssignment2, opAssignment3;

      beforeEach(async () => {
        opAssignment1 = mocks.generateOpAssignment();
        opAssignment2 = mocks.generateOpAssignment();
        opAssignment3 = mocks.generateOpAssignment();
      });

      it('should create and return one operation with assignments', async () => {
        const operation = mocks.generateOperation();
        operation.assignments = [opAssignment1];

        const createdOperation = await toolkit.upsertOperationProc(operation);
        const retrievedOperation = await toolkit.getOperationProc(createdOperation.id);

        expect(createdOperation).to.deep.equal(retrievedOperation);
        expect(createdOperation.assignments.length).to.equal(1);
        expect(createdOperation.assignments[0]).to.deep.include(opAssignment1);
      });

      it('should create and return one operation with three assignments', async () => {
        const operation = mocks.generateOperation();
        operation.assignments = [
          opAssignment1,
          opAssignment2,
          opAssignment3,
        ];

        const createdOperation = await toolkit.upsertOperationProc(operation);
        const retrievedOperation = await toolkit.getOperationProc(createdOperation.id);

        expect(createdOperation).to.deep.equal(retrievedOperation);
        expect(createdOperation.assignments.length).to.equal(3);
        expect(createdOperation.assignments[0]).to.deep.include(opAssignment1);
        expect(createdOperation.assignments[1]).to.deep.include(opAssignment2);
        expect(createdOperation.assignments[2]).to.deep.include(opAssignment3);
      });

      it('should update one assignment inside an operation with another one intact', async () => {
        const operation = mocks.generateOperation();
        operation.assignments = [opAssignment1, opAssignment2];

        const createdOperation = await toolkit.upsertOperationProc(operation);
        opAssignment3.id = createdOperation.assignments[0].id;
        createdOperation.assignments[0] = opAssignment3;

        const updatedOperation = await toolkit.upsertOperationProc(createdOperation);

        expect(updatedOperation.assignments.length).to.equal(2);
        expect(updatedOperation.assignments[0]).to.deep.include(opAssignment3);
        expect(updatedOperation.assignments[1]).to.deep.include(opAssignment2);

        // Make sure that the second assignment was not touched
        expect(updatedOperation.assignments[1].createdAt)
          .to.equal(createdOperation.assignments[1].createdAt);
      });

      it('should remove one assignment inside an operation with another one intact', async () => {
        const operation = mocks.generateOperation();
        operation.assignments = [opAssignment1, opAssignment2];

        const createdOperation = await toolkit.upsertOperationProc(operation);

        // Remove the first operation assignment
        createdOperation.assignments = _.tail(createdOperation.assignments);

        const updatedOperation = await toolkit.upsertOperationProc(createdOperation);

        expect(updatedOperation.assignments.length).to.equal(1);
        expect(updatedOperation.assignments[0]).to.deep.include(opAssignment2);

        // Make sure that the assignment was not touched
        expect(updatedOperation.assignments[0].createdAt)
          .to.equal(createdOperation.assignments[0].createdAt);
      });

      it('should add one assignment inside an operation with another one intact', async () => {
        const operation = mocks.generateOperation();
        operation.assignments = [opAssignment1];

        const createdOperation = await toolkit.upsertOperationProc(operation);
        createdOperation.assignments.push(opAssignment2);

        const updatedOperation = await toolkit.upsertOperationProc(createdOperation);

        expect(updatedOperation.assignments.length).to.equal(2);
        expect(updatedOperation.assignments[0]).to.deep.include(opAssignment1);
        expect(updatedOperation.assignments[1]).to.deep.include(opAssignment2);

        // Make sure that the first assignment was not touched
        expect(updatedOperation.assignments[0].createdAt)
          .to.equal(createdOperation.assignments[0].createdAt);
      });
    });

    describe('divisions and branches', () => {
      let branch, createdBranch;
      let division1, division2, division3;
      let createdDivision1, createdDivision2, createdDivision3;

      beforeEach(async () => {
        branch = mocks.generateBranch();
        createdBranch = await toolkit.upsertBranchProc(branch);

        division1 = mocks.generateDivision(createdBranch.id);
        division2 = mocks.generateDivision(createdBranch.id);
        division3 = mocks.generateDivision(createdBranch.id);
        createdDivision1 = await toolkit.upsertDivisionProc(division1);
        createdDivision2 = await toolkit.upsertDivisionProc(division2);
        createdDivision3 = await toolkit.upsertDivisionProc(division3);
      });

      it('should create and return one operation with a division and a branch', async () => {
        const operation = mocks.generateOperation({ branchId: createdBranch.id });
        operation.divisionIds = [createdDivision1.id];

        const createdOperation = await toolkit.upsertOperationProc(operation);
        const retrievedOperation = await toolkit.getOperationProc(createdOperation.id);

        expect(createdOperation).to.deep.equal(retrievedOperation);
        expect(createdOperation.divisionIds).to.deep.equal([createdDivision1.id]);
      });

      it('should create and return one operation with three divisions', async () => {
        const operation = mocks.generateOperation({ branchId: createdBranch.id });
        operation.divisionIds = [
          createdDivision1.id,
          createdDivision2.id,
          createdDivision3.id,
        ];

        const createdOperation = await toolkit.upsertOperationProc(operation);
        const retrievedOperation = await toolkit.getOperationProc(createdOperation.id);

        expect(createdOperation).to.deep.equal(retrievedOperation);
        expect(createdOperation.divisionIds).to.deep.equal([
          createdDivision1.id,
          createdDivision2.id,
          createdDivision3.id,
        ]);
      });

      it('should update one division inside an operation with another one intact', async () => {
        const operation = mocks.generateOperation();
        operation.divisionIds = [
          createdDivision1.id,
          createdDivision2.id,
        ];

        const createdOperation = await toolkit.upsertOperationProc(operation);
        createdOperation.divisionIds[0] = createdDivision3.id;

        const updatedOperation = await toolkit.upsertOperationProc(createdOperation);

        expect(updatedOperation.divisionIds).to.deep.equal([
          createdDivision3.id,
          createdDivision2.id,
        ]);
      });

      it('should remove one division inside an operation with another one intact', async () => {
        const operation = mocks.generateOperation();
        operation.divisionIds = [
          createdDivision1.id,
          createdDivision2.id,
        ];

        const createdOperation = await toolkit.upsertOperationProc(operation);

        // Remove the first operation assignment
        createdOperation.divisionIds = _.tail(createdOperation.divisionIds);

        const updatedOperation = await toolkit.upsertOperationProc(createdOperation);

        expect(updatedOperation.divisionIds).to.deep.equal([createdDivision2.id]);
      });

      it('should add one division inside an operation with another one intact', async () => {
        const operation = mocks.generateOperation();
        operation.divisionIds = [createdDivision1.id];

        const createdOperation = await toolkit.upsertOperationProc(operation);

        createdOperation.divisionIds.push(createdDivision2.id);

        const updatedOperation = await toolkit.upsertOperationProc(createdOperation);

        expect(updatedOperation.divisionIds).to.deep.equal([
          createdDivision1.id,
          createdDivision2.id,
        ]);
      });
    });
  });
});
