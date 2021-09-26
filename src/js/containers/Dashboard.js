import React from 'react';
import '../../css/containers/Dashboard.less';
import TopBar from './TopBar';
import EventWidget from './EventWidget';

class Dashboard extends React.Component {
  render() {
    return (
      <div>
        <TopBar title={<b>DASHBOARD</b>}/>
        <div className="Dashboard">
          <EventWidget
            title="Upcoming game events"
            calendarName="game-events"
          />
          <EventWidget
            title="Upcoming internal events"
            calendarName="internal-events"
          />
        </div>
      </div>
    );
  }
}

export default Dashboard;
