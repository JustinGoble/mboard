import _ from 'lodash';
import React from 'react';
import InputField from './InputField';
import InfoHeader from './InfoHeader';
import AssignmentsForm from './AssignmentsForm';
import '../../css/components/OperationForm.less';


class OperationForm extends React.Component {
  render() {
    const {
      editing,
      userOptions,
      branchOptions,
      divisionOptions,
    } = this.props;

    const {
      branchId,
      divisionIds,
      leaderId,
      location,
      description,
      requirements,
    } = this.props.operation;
    return (
      <div className="OperationForm">
        <InfoHeader
          operation={this.props.operation}
          editing={editing}
        />
        <div className="line-horizontal"/>
        <div className="OperationForm-info">
          <div className="OperationForm-info-left">
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
                object={this.props.operation}
                path={'branchId'}
              >
                {branchId}
              </InputField>
            </span>
            <span>
              <span className="dim-caption">Divisions:</span>
              <InputField
                type="tag"
                editing={editing}
                object={this.props.operation}
                options={divisionOptions}
                path={'divisionIds'}
              >
                {divisionIds}
              </InputField>
            </span>
            <span>
              <span className="dim-caption">Location:</span>
              <InputField
                editing={editing}
                object={this.props.operation}
                path={'location'}
              >
                {location}
              </InputField>
            </span>
            <span>
              <span className="dim-caption">Leader:</span>
              <InputField
                editing={editing}
                type="select"
                options={_.concat(
                  [{ value: null, title: 'No leader' }],
                  userOptions,
                )}
                defaultOption={0}
                object={this.props.operation}
                path={'leaderId'}
              >
                {leaderId}
              </InputField>
            </span>
          </div>
          <div className="line-vertical"/>
          <div className="OperationForm-info-right">
            <div className="dim-caption">Description</div>
            <InputField
              editing={editing}
              object={this.props.operation}
              path={'description'}
            >
              {description}
            </InputField>
            <div className="dim-caption">Requirements</div>
            <InputField
              editing={editing}
              object={this.props.operation}
              path={'requirements'}
            >
              {requirements}
            </InputField>
          </div>
        </div>
        <AssignmentsForm {...this.props}/>
      </div>
    );
  }
}

export default OperationForm;
