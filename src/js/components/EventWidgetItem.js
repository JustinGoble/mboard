import _ from 'lodash';
import React from 'react';
import moment from 'moment';
import { SelectOutlined } from '@ant-design/icons';
import '../../css/components/EventWidgetItem.less';

const TIME_FORMAT = 'YYYY-MM-DD HH:MM';

class EventWidgetItem extends React.Component {
  render() {
    const {
      summary,
      description,
      startTime,
      onClick,
    } = this.props;

    return (
      <div className="EventWidgetItem">
        <div className="EventWidgetItem-header">
          <p className="EventWidgetItem-summary">{summary}</p>
          <p className="EventWidgetItem-startTime">
            {moment(startTime).format(TIME_FORMAT)}
          </p>
          <span
            className="EventWidgetItem-icon"
            onClick={onClick}
            style={{ cursor: 'pointer' }}
          >
            <SelectOutlined
              style={{ marginRight: 8 }}
            />
          </span>
        </div>
        <p className="EventWidgetItem-description">
          {_.replace(description, /[\n\r]/g, '').trim()}
        </p>
      </div>
    );
  }
}

export default EventWidgetItem;
