import _ from 'lodash';
import React from 'react';
import classNames from 'classnames';
import {
  PlusOutlined,
  UserOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import InputField from './InputField';
import '../../css/components/AssignmentsForm.less';

class AssignmentsForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedAssignment: 0,
    };
  }

  selectAssignment(index) {
    this.setState({
      selectedAssignment: index,
    });
    this.forceUpdate();
  }

  render() {
    const {
      editing,
      operation,
      userOptions,

      createNewAssignment,
      deleteAssignment,
    } = this.props;

    const assignments = _.get(operation, 'assignments') || [];

    const { selectedAssignment } = this.state;

    const {
      name,
      description,
      userId,
      preferredRole,
      minRank,
      reward,
      requirements,
    } = assignments[selectedAssignment] || {};

    return (
      <div className="AssignmentsForm">
        <h2 className="AssignmentsForm-header">
          Assignments
        </h2>

        <div className="AssignmentsForm-content">
          {(assignments.length > 0 || editing) && (
            <div className="AssignmentsForm-content-left">
              {assignments.map((assignment, index) => (
                <div
                  className={classNames(
                    'AssignmentsForm-list-name',
                    { 'AssignmentsForm-list-name-selected': index === selectedAssignment },
                  )}
                  key={index}
                  onClick={() => this.selectAssignment(index)}
                >
                  {editing && <DeleteOutlined
                    className="AssignmentsForm-list-name-delete"
                    onClick={e => deleteAssignment(index, e)}
                  />}

                  <p className="AssignmentsForm-list-name-text">
                    {assignment.name || '<No name>'}
                  </p>

                  {!_.isNil(assignment.userId) && <UserOutlined />}
                </div>
              ))}
              {editing && (
                <div className='AssignmentsForm-list-name' onClick={createNewAssignment}>
                  <PlusOutlined /> Add a new assignment
                </div>
              )}
            </div>
          )}
          <div className="AssignmentsForm-content-right">
            {assignments.length > 0 ? (<>
              <div className="AssignmentsForm-item-header">
                <span className="flex-row">
                  <h2 className="AssignmentsForm-item-header-text">
                    <InputField
                      hint="Assignment name"
                      editing={editing}
                      object={this.props.operation}
                      path={['assignments', selectedAssignment, 'name']}
                    >
                      {name}
                    </InputField>
                  </h2>
                </span>
                <span>
                  <span className="AssignmentsForm-item-status">
                    {!editing && _.isNil(userId) ? (
                      <span className="dim-caption">Unassigned</span>
                    ) : (<>
                      <span className="dim-caption">Assigned Member:</span>
                      <InputField
                        editing={editing}
                        type="select"
                        options={_.concat(
                          [{ value: null, title: 'Nobody assigned' }],
                          userOptions,
                        )}
                        defaultOption={0}
                        object={this.props.operation}
                        path={['assignments', selectedAssignment, 'userId']}
                      >
                        {userId}
                      </InputField>
                    </>)}
                  </span>
                </span>
              </div>
              <div className="line-horizontal"/>
              <div className="AssignmentsForm-info">
                <div className="AssignmentsForm-info-left">
                  <InputField
                    hint="Assignment description"
                    editing={editing}
                    object={this.props.operation}
                    path={['assignments', selectedAssignment, 'description']}
                  >
                    {description}
                  </InputField>
                </div>
                <div className="AssignmentsForm-info-right">
                  <span>
                    <span className="dim-caption">Preferred role:</span>
                    <InputField
                      editing={editing}
                    >
                      {preferredRole}
                    </InputField>
                  </span>
                  <span>
                    <span className="dim-caption">Minimum rank:</span>
                    <InputField
                      editing={editing}
                    >
                      {minRank}
                    </InputField>
                  </span>
                  <span>
                    <span className="dim-caption">Reward:</span>
                    <InputField
                      editing={editing}
                    >
                      {reward}
                    </InputField>
                  </span>
                  <span>
                    <span className="dim-caption">Requirements:</span>
                    <InputField
                      editing={editing}
                    >
                      {requirements}
                    </InputField>
                  </span>
                </div>
              </div>
            </>) : (<p>No assignments added</p>)}
          </div>
        </div>
      </div>
    );
  }
}

export default AssignmentsForm;
