import _ from 'lodash';
import React from 'react';
import moment from 'moment';
import InputField from './InputField';
import '../../css/components/UserForm.less';

class UserForm extends React.Component {
  render() {
    const {
      editing,
      branchOptions,
      discordRoleOptions,
      isAdmin,
    } = this.props;

    const {
      id,
      name,
      nickname,
      discordRoles,
      branchId,
      description,
      discordId,
      permissions,
      createdAt,
      // updatedAt,
      state,
    } = this.props.user;

    const roles = undefined;
    const rank = undefined;
    const merit = undefined;

    const stateOptions = [
      {
        value: 'active',
        title: 'Active',
      },
      {
        value: 'inactive',
        title: 'Inactive',
      },
    ];

    const permissionOptions = [
      {
        value: 'member',
        title: 'member',
      },
      {
        value: 'management',
        title: 'management',
      },
      {
        value: 'aerospace_admin',
        title: 'aerospace admin',
      },
      {
        value: 'industry',
        title: 'industry',
      },
      {
        value: 'admin',
        title: 'admin',
      },
    ];

    return (
      <div className="UserForm">
        <div className="UserForm-header">
          <span className="flex-row">
            <h2 className="UserForm-header-text">
              <InputField
                hint="User name"
                object={this.props.user}
                path={'nickname'}
              >
                {nickname}
              </InputField>
            </h2>
            {!_.isNil(id) && (
              <span className="UserForm-header-id">ID #{id}</span>
            )}
          </span>
          <span>
            <span className="UserForm-header-created">
              <span className="dim-caption">Created:</span>
              <span className="UserForm-header-created-timestamp">
                {moment(createdAt).format('YYYY-MM-DD')}
              </span>
            </span>
            <span className="UserForm-header-status">
              <span className="dim-caption">Status:</span>
              <InputField
                editing={editing}
                type="select"
                options={stateOptions}
                defaultOption={2}
                object={this.props.user}
                path={'state'}
              >
                {state}
              </InputField>
            </span>
          </span>
        </div>
        <div className="line-horizontal"/>
        <div className="UserForm-info">
          <div className="UserForm-info-left">
            <span>
              <span className="dim-caption">Branch:</span>
              <InputField
                editing={editing}
                type="select"
                options={_.concat(
                  [{ value: null, title: 'No branch' }],
                  branchOptions,
                )}
                defaultOption={0}
                object={this.props.user}
                path={'branchId'}
              >
                {branchId}
              </InputField>
            </span>
            <span>
              <span className="dim-caption">Roles:</span>
              <InputField
                editing={editing}
              >
                {roles}
              </InputField>
            </span>
            <span>
              <span className="dim-caption">Rank:</span>
              <InputField
                editing={editing}
                object={this.props.user}
                path={'rank'}
              >
                {rank}
              </InputField>
            </span>
            <span>
              <span className="dim-caption">Merit:</span>
              <InputField
                editing={editing}
                object={this.props.user}
                path={'merit'}
              >
                {merit}
              </InputField>
            </span>
            <span>
              <span className="dim-caption">Discord handle:</span>
              <InputField
                editing={editing && isAdmin}
                object={this.props.user}
                path={'name'}
              >
                {name}
              </InputField>
            </span>
            <span>
              <span className="dim-caption">Discord id:</span>
              <InputField
                object={this.props.user}
                path={'discordId'}
              >
                {discordId}
              </InputField>
            </span>
          </div>
          <div className="line-vertical"/>
          <div className="UserForm-info-right">
            <div className="dim-caption">Description</div>
            <InputField
              editing={editing}
              object={this.props.user}
              autoSize={{ minRows: 3 }}
              path={'description'}
            >
              {description}
            </InputField>
            <div className="dim-caption">Permissions</div>
            <InputField
              type="tag"
              editing={editing && isAdmin}
              object={this.props.user}
              options={permissionOptions}
              path={'permissions'}
            >
              {permissions}
            </InputField>
            <div className="dim-caption">Discord roles</div>
            <InputField
              type="tag"
              object={this.props.user}
              options={discordRoleOptions}
              path={'discordRoles'}
            >
              {discordRoles}
            </InputField>
          </div>
        </div>
      </div>
    );
  }
}

export default UserForm;
