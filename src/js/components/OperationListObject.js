import React from 'react';
import _ from 'lodash';
import { withRouter } from "react-router";
import InfoHeader from './InfoHeader';
import InputField from './InputField';
import '../../css/components/OperationListObject.less';

class OperationListObject extends React.Component {
  render() {
    const {
      branchId,
      divisionIds,
      leaderId,
      location,
      assignments,
    } = this.props.operation;

    const {
      userOptions,
      branchOptions,
      divisionOptions,
    } = this.props;

    const { onOperationSelected } = this.props;

    const openAssignmentCount = _.filter(
      assignments,
      a => _.isNil(a.userId),
    ).length;

    const fullAssignmentCount = (assignments || []).length;

    return (
      <div
        onClick={() => onOperationSelected(this.props.operation.id)}
        className="OperationListObject">
        <div className="OperationListObject-infoheader">
          <InfoHeader operation= {this.props.operation}/>
        </div>
        <div className="line-horizontal"/>
        <div className="OperationListObject-info">
          <div className="OperationListObject-info-left">
            <span>
              <span className="dim-caption">Branch:</span>
              <InputField
                editing={false}
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
                editing={false}
                object={this.props.operation}
                options={divisionOptions}
                path={'divisionIds'}
              >
                {divisionIds}
              </InputField>
            </span>
          </div>
          <div className="line-vertical"/>
          <div className="OperationListObject-info-right">
            <span>
              <span className="dim-caption">Leader:</span>
              <InputField
                editing={false}
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
            <span>
              <span className="dim-caption">Location:</span>
              <InputField
                editing={false}
                object={this.props.operation}
                path={'location'}
              >
                {location}
              </InputField>
            </span>
          </div>
        </div>
        <span className="OperationListObject-open-assignments">
          {`Open Assignments: ${openAssignmentCount}/${fullAssignmentCount}`}
        </span>
      </div>
    );
  }
}

export default withRouter(OperationListObject);
