import _ from 'lodash';
import { Container } from 'unstated';
import * as request from '../utils/request';

const compStr = (a, b) => _.toString(a) === _.toString(b);

export class OperationController extends Container {
  state = {
    operations: [],
    page: 0,
  };

  async loadOperations(states) {
    const queryParams = [`page=${this.state.page}`];
    queryParams.push(...states.map(s => `states[]=${s}`));
    const path = `/api/v1/operations?${queryParams.join('&')}`;
    const res = await request.get({
      path,
    });
    this.setState({
      operations: res,
    });
  }

  async loadOperation(id) {
    return await request.get({
      path: `/api/v1/operations/${id}`,
    });
  }

  async saveChanges(newOperation) {
    this.setState({
      operations: [],
    });

    // Upsert operation
    return await request.post({
      path: '/api/v1/operations',
      data: newOperation,
    });
  }

  async deleteOperation(id) {
    this.setState({
      operations: _.filter(this.state.operations, o => !compStr(o.id, id)),
    });

    await request.del({
      path: `/api/v1/operations/${id}`,
    });
  }
}

const operationController = new OperationController();

export default operationController;
