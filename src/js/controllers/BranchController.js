import _ from 'lodash';
import { Container } from 'unstated';
import * as request from '../utils/request';

export class BranchController extends Container {
  state = {
    branchOptions: [],
  };

  async loadBranchOptions() {
    const res = await request.get({
      path: '/api/v1/branches/list',
    });
    this.setState({
      branchOptions: _.map(res, branch => ({
        value: branch.id,
        title: branch.name,
      })),
    });
  }
}

const branchController = new BranchController();

export default branchController;
