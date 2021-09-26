import React from 'react';
import { withRouter } from "react-router";
import branchController from '../controllers/BranchController';
import { Spin, Alert } from 'antd';
import { Subscribe } from 'unstated';
import _ from 'lodash';
import * as request from '../utils/request';

import '../../css/containers/UserOperationList.less';

class UserOperationList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      operations: [],
      err: null,
    };
  }

  onOperationSelected(operationId) {
    this.props.history.push(`/operations/${operationId}`);
  }

  async componentDidMount() {
    this.setState({
      loading: true,
    });
    try {
      const res = await request.get({
        path: `/api/v1/operations?leaderId=${this.props.leaderId}`,
      });
      this.setState({
        loading: false,
        operations: res,
      });
    } catch (err) {
      this.setState({
        loading: false,
        err: err,
      });
    }
  }

  render() {
    const {
      err,
      operations,
    } = this.state;

    if (err) {
      return <Alert
        message="Error"
        description={this.state.error}
        type="error"
        showIcon/>;
    }

    if (this.state.loading) {
      return (
        <div className="full flex-centering">
          <Spin className="App-user-load-spin"
            tip="Loading User Information" />
        </div>
      );
    }

    if (operations.length === 0) {
      return (
        <div className="UserOperationList-container">
          <div className="UserOperationList-empty">
            USER IS NOT LEADING ANY OPERATIONS
          </div>
        </div>
      );
    }

    return (
      <div className="UserOperationList-container">
        <h3 className="UserOperationList-main-header">
          CURRENTLY LEADING THESE OPERATIONS
        </h3>
        {operations.map((operation) => {
          return (
            <div
              className="UserOperationList-row"
              key={operation.id}
              onClick={() => this.onOperationSelected(operation.id)}
            >
              <div className="UserOperationList-op-header">
                <div className="UserOperationList-op-name">
                  {operation.name}
                </div>
                <span className="UserOperationList-op-id">
                    ID #{operation.id}
                </span>
              </div>
              <hr></hr>
              <div className="UserOperationList-op-style">
                <span className="UserOperationList-op-category">
                  Branch:
                </span>
                <Subscribe to={[branchController]}>
                  {(branchController) => (
                    <span className="UserOperationList-op-value">
                      {_.get(
                        _.find(
                          branchController.state.branchOptions,
                          b => `${b.value}` === `${operation.branchId}`,
                        ),
                        'title',
                        '<No value>',
                      )}
                    </span>
                  )}
                </Subscribe>
              </div>
              <div className="UserOperationList-op-style">
                <span className="UserOperationList-op-category">
                  Location:
                </span>
                <span className="UserOperationList-op-value">
                  {operation.location}
                </span>
              </div>
              <div className="UserOperationList-op-description">
                <div className="UserOperationList-desc-category">
                  Description:
                </div>
                <div className="UserOperationList-desc-value">
                  {operation.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default withRouter(UserOperationList);
