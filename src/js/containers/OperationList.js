import _ from 'lodash';
import React from 'react';
import { withRouter } from "react-router";
import { Subscribe } from 'unstated';
import { List, Button, Select } from 'antd';
import TopBar from './TopBar';
import operationController from '../controllers/OperationController';
import userController from '../controllers/UserController';
import branchController from '../controllers/BranchController';
import divisionController from '../controllers/DivisionController';
import OperationListObject from '../components/OperationListObject';
import '../../css/containers/OperationList.less';

const { Option } = Select;

class OperationList extends React.Component {
  async componentDidMount() {
    const asyncTasks = [];

    if (userController.state.userOptions.length > 0) {
      userController.loadUserOptions();
    } else {
      asyncTasks.push(userController.loadUserOptions());
    }

    if (branchController.state.branchOptions.length > 0) {
      branchController.loadBranchOptions();
    } else {
      asyncTasks.push(branchController.loadBranchOptions());
    }

    if (divisionController.state.divisionOptions.length > 0) {
      divisionController.loadDivisionOptions();
    } else {
      asyncTasks.push(divisionController.loadDivisionOptions());
    }

    await Promise.all(asyncTasks);

    await operationController.loadOperations(['in_progress', 'draft', 'unapproved']);
  }

  onOperationSelected(operationId) {
    this.props.history.push(`/operations/${operationId}`);
  }

  async onActiveStateChanged(states) {
    await operationController.loadOperations(states);
  }

  render() {
    const canEdit = _.intersection(
      _.get(userController, 'state.currentUser.permissions', []),
      ['management', 'admin'],
    ).length > 0;

    return (
      <div>
        <TopBar
          title={<b>OPERATIONS</b>}
          subContent={!canEdit ? undefined : (
            <div className="OperationList-actions">
              <Button
                className="tool-button"
                type="primary"
                onClick={() => this.props.history.push('/operations/new')}
              >
                New
              </Button>
              <Select
                mode="multiple"
                placeholder="Filter Operations"
                style={{ minWidth: '12em', maxWidth: '50em', scrollPaddingRight: "20em" }}
                onChange={this.onActiveStateChanged.bind(this)}
                defaultValue={['in_progress', 'draft', 'unapproved']}
              >
                <Option value="in_progress">In Progress</Option>
                <Option value="archived">Archived</Option>
                <Option value="unapproved">Unapproved</Option>
                <Option value="draft" >Draft</Option>
              </Select>
            </div>
          )}
        />
        <div className="OperationList">
          <Subscribe to={[
            operationController,
            userController,
            branchController,
            divisionController,
          ]}>
            {(
              operationController,
              userController,
              branchController,
              divisionController,
            ) => (
              <List
                className="OperationList-table"
                itemLayout="vertical"
                size="small"
                dataSource={operationController.state.operations}
                renderItem={operation => (
                  <OperationListObject
                    operation={operation}
                    userOptions={userController.state.userOptions}
                    branchOptions={branchController.state.branchOptions}
                    divisionOptions={divisionController.state.divisionOptions}
                    onOperationSelected={this.onOperationSelected.bind(this)}
                  />
                )}
              />
            )}
          </Subscribe>
        </div>
      </div>
    );
  }
}

export default withRouter(OperationList);
