import React from 'react';
import { Spin, Alert } from 'antd';
import EventWidgetItem from '../components/EventWidgetItem';
import * as request from '../utils/request';
import '../../css/containers/EventWidget.less';

class EventWidget extends React.Component {
  state = {
    events: [],
    error: null,
    loading: false,
  };

  async componentDidMount() {
    await this.fetch();
  }

  async fetch() {
    this.setState({
      error: null,
      loading: true,
    });

    try {
      const events = await request.get({
        path: `/api/v1/events/upcoming/${this.props.calendarName}`,
      });

      this.setState({
        loading: false,
        events,
      });
    } catch (err) {
      this.setState({
        loading: false,
        events: [],
        error: err.message,
      });
    }
  }

  onEventClicked() {
    // Nothing
  }

  render() {
    return (
      <div className="EventWidget">
        <h2>{this.props.title}</h2>
        <div className="line-horizontal"/>
        {this.state.error ? (
          <Alert
            message="Error"
            description={this.state.error}
            type="error"
            showIcon
          />
        ) : this.state.loading ? (
          <Spin
            className="EventWidget-spin"
            tip="Loading event list" />
        ) : this.state.events.length === 0 ? (
          <p>No events</p>
        ) : (
          <div className="EventWidget-list">
            {this.state.events.map((event, i) => (
              <EventWidgetItem
                key={i}
                summary={event.gEvent.summary}
                startTime={event.gEvent.start.dateTime}
                description={event.gEvent.description}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default EventWidget;
