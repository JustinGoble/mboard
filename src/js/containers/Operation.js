import _ from 'lodash';
import React from 'react';
import { Popconfirm, Button, Spin, Alert } from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { Subscribe } from 'unstated';
import OperationForm from '../components/OperationForm';
import operationController from '../controllers/OperationController';
import userController from '../controllers/UserController';
import branchController from '../controllers/BranchController';
import divisionController from '../controllers/DivisionController';
import TopBar from './TopBar';
import '../../css/containers/Operation.less';

class Operation extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.match.params.id,
      editing: false,
      selectedOperation: null,
      editedOperation: null,
      error: null,
    };

    if (this.state.id === 'new') {
      this.state.id = undefined;
      this.state.editing = true;
      this.state.selectedOperation = {};
      this.state.editedOperation = {};
    }
  }

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

    if (!_.isNil(this.state.id)) {
      try {
        const op = await operationController.loadOperation(this.state.id);
        this.setState({ selectedOperation: op });
      } catch (e) {
        this.setState({ error: e.message });
      }
    }
  }

  getActiveOperation() {
    return this.state.editing
      ? this.state.editedOperation
      : this.state.selectedOperation;
  }

  startEditing() {
    const editedOperation = _.cloneDeep(this.state.selectedOperation);
    this.setState({
      editing: true,
      editedOperation,
    });
  }

  async saveChanges() {
    if (this.operationSaveRequestOngoing) return;
    this.operationSaveRequestOngoing = true;

    const newOperation = _.cloneDeep(this.state.editedOperation);

    this.setState({
      editing: false,
      selectedOperation: newOperation,
      error: null,
    });

    try {
      const res = await operationController.saveChanges(newOperation);
      this.setState({
        id: res.id,
        selectedOperation: res,
      });
    } catch (e) {
      this.setState({ error: e.message });
    }

    this.operationSaveRequestOngoing = false;
  }

  cancelChanges() {
    if (_.isNil(this.state.id)) {
      this.props.history.goBack();
    } else {
      this.setState({
        editing: false,
        editedOperation: null,
      });
    }
  }

  async delete() {
    this.setState({
      error: null,
    });

    if (!_.isNil(this.state.id)) {
      try {
        await operationController.deleteOperation(this.state.id);
        this.props.history.goBack();
      } catch (e) {
        this.setState({ error: e.message });
      }
    } else {
      this.props.history.goBack();
    }
  }

  createNewAssignment() {
    const editedOperation = _.cloneDeep(this.state.editedOperation);
    if (!editedOperation.assignments) {
      editedOperation.assignments = [];
    }
    editedOperation.assignments.push({});
    this.setState({
      editedOperation,
    });
  }

  deleteAssignment(index, e) {
    const editedOperation = _.cloneDeep(this.state.editedOperation);
    if (!editedOperation.assignments) {
      editedOperation.assignments = [];
    }
    if (index >= editedOperation.assignments.length) return;
    editedOperation.assignments.splice(index, 1);
    this.setState({
      editedOperation,
    });

    // Prevent the assignment from getting selected
    e.preventDefault();
    e.stopPropagation();
  }

  render() {
    const canEdit = _.intersection(
      _.get(userController, 'state.currentUser.permissions', []),
      ['management', 'admin'],
    ).length > 0;

    return (<>
      <TopBar
        title={<b>OPERATION</b>}
        backButton={true}
        subContent={!canEdit ? undefined : (
          <div className="Operation-actions">
            {this.state.editing ?
              (<>
                <Button
                  type="primary"
                  icon={<SaveOutlined/>}
                  className="tool-button"
                  onClick={() => this.saveChanges()}
                >
                  Save
                </Button>
                <Button
                  type="secondary"
                  icon={<CloseOutlined/>}
                  className="tool-button"
                  onClick={() => this.cancelChanges()}
                >
                  Cancel
                </Button>
              </>) :
              (<Button
                type="primary"
                icon={<EditOutlined/>}
                className="tool-button"
                onClick={() => this.startEditing()}
              >
                Edit
              </Button>)
            }
            <Popconfirm
              placement="bottomLeft"
              title="Are you sure you want to delete this operation?"
              onConfirm={() => this.delete()}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="danger"
                icon={<DeleteOutlined/>}
                className="tool-button"
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        )}
      />
      <div className="Operation">
        {this.state.error && (
          <Alert
            style={{ 'marginBottom': '0.5em' }}
            message="Error"
            description={this.state.error}
            type="error"
            showIcon
          />
        )}
        {this.getActiveOperation() === null ? (
          <Spin
            className="Operation-spin"
            size="large"
            tip="Loading operation..."
          />
        ) : (
          <Subscribe to={[userController, branchController, divisionController]}>
            {(userController, branchController, divisionController) => (
              <OperationForm
                editing={this.state.editing}
                operation={this.getActiveOperation()}
                userOptions={userController.state.userOptions}
                branchOptions={branchController.state.branchOptions}
                divisionOptions={divisionController.state.divisionOptions}
                createNewAssignment={this.createNewAssignment.bind(this)}
                deleteAssignment={this.deleteAssignment.bind(this)}
              />
            )}
          </Subscribe>
        )}
      </div>
    </>);
  }
}

export default Operation;
