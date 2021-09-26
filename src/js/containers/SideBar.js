import React from 'react';
import { withRouter } from "react-router";
import * as _ from 'lodash';
import { Menu } from 'antd';
import {
  AreaChartOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { setCookie } from '../utils/cookie';
import * as request from '../utils/request';
import Logo from '../../images/ody_logo.png';
import BgImage from '../../images/du_space_coolblue.jpg';
import '../../css/containers/SideBar.less';

const { SubMenu } = Menu;

class SideBar extends React.Component {
  async handleClick(e) {
    if (e.key === 'logout') {
      try {
        await request.get({
          path: `/api/v1/discord/logout`,
        });

        setCookie('token', '');
        window.location.reload();
      } catch (e) {
        alert("Error during logout! " + e.message);
      }
    } else {
      this.props.history.push(`/${e.key}`);
    }
  }

  render() {
    const [, path] = this.props.history.location.pathname.split('/');

    const { user } = this.props;
    const name = user.nickname || _.split(user.name, '#')[0];

    return (
      <div className="SideBar">
        <div className="SideBar-header">
          <img className="SideBar-header-img" src={BgImage} alt="Header background"/>
          <div className="SideBar-header-overlay">
            <img className="SideBar-logo" src={Logo} alt="ODY logo"/>
            <h1 className="SideBar-title">ODY Management Platform</h1>
          </div>
        </div>

        <Menu
          className="SideBar-menu"
          theme="dark"
          defaultSelectedKeys={['dashboard']}
          selectedKeys={[path]}
          mode="inline"
          onClick={this.handleClick.bind(this)}
        >
          <Menu.Item key="dashboard">
            <AreaChartOutlined />
            <span>Dashboard</span>
          </Menu.Item>

          <SubMenu
            key="personal"
            title={<span><UserOutlined /><span>Personal</span></span>}
          >
            <Menu.Item key="profile">Profile</Menu.Item>
          </SubMenu>
          <SubMenu
            key="management"
            title={<span><TeamOutlined /><span>Management</span></span>}
          >
            <Menu.Item key="users">Users</Menu.Item>
            <Menu.Item key="eventlogs">Event Logs</Menu.Item>
          </SubMenu>
          <SubMenu
            key="industry"
            title={<span><BankOutlined /><span>Industry</span></span>}
          >
            <Menu.Item key="ship-categories">Ship Categories</Menu.Item>
            <Menu.Item key="ships">Ships</Menu.Item>
            <Menu.Item key="requests">Requests</Menu.Item>
          </SubMenu>
          <Menu.Item key="logout">
            <LogoutOutlined />
            <span>Log out</span>
          </Menu.Item>
        </Menu>

        <div className="SideBar-info">
          <p>Current user:<br/></p>
          { name || "Loading..." }
        </div>
      </div>
    );
  }
}

export default withRouter(SideBar);
