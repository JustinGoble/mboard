import _ from 'lodash';
import { Container } from 'unstated';
import * as request from '../utils/request';

export class DivisionController extends Container {
  state = {
    divisionOptions: [],
  };

  async loadDivisionOptions() {
    const res = await request.get({
      path: '/api/v1/divisions/list',
    });
    this.setState({
      divisionOptions: _.map(res, division => ({
        value: division.id,
        title: division.name,
      })),
    });
  }
}

const divisionController = new DivisionController();

export default divisionController;
