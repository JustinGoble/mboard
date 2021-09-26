import React from 'react';
import moment from 'moment';
import InputField from './InputField';
import '../../css/components/InfoHeader.less';


class InfoHeader extends React.Component {
  render() {
    const editing = this.props.editing || false;

    const {
      id,
      name,
      createdAt,
      state,
    } = this.props.operation;

    const stateOptions = [
      {
        value: 'draft',
        title: 'Draft',
      },
      {
        value: 'unapproved',
        title: 'Unapproved',
      },
      {
        value: 'in_progress',
        title: 'In Progress',
      },
      {
        value: 'archived',
        title: 'Archived',
      },
    ];

    return (
      <div className="InfoHeader-header">
        <span className="flex-row">
          <h2 className="InfoHeader-header-text">
            <InputField id="op-name"
              hint="Operation name"
              editing={editing}
              object={this.props.operation}
              path={'name'}>{name}
            </InputField>
          </h2>
          <span className="InfoHeader-header-id">ID #{id}</span>
        </span>
        <span>
          <span className="InfoHeader-header-created">
            <span className="dim-caption">Created:</span>
            <span className="InfoHeader-header-created-timestamp">
              {moment(createdAt).format('YYYY-MM-DD')}
            </span>
          </span>
          <span className="InfoHeader-header-status">
            <span className="dim-caption">Status:</span>
            <InputField
              editing={editing}
              type="select"
              options={stateOptions}
              defaultOption={2}
              object={this.props.operation}
              path={'state'}
            >
              {state}
            </InputField>
          </span>
        </span>
      </div>
    );
  }
}

export default InfoHeader;
