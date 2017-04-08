import React from 'react';
import {Icon} from 'react-fa';

import './login.css';
import querystring from 'query-string';

class LoginPanel extends React.PureComponent {
    render() {
        let submit = (e) => {
            if (e.which == 10 || e.which == 13)
                this.props.onSubmit();
        };
        return (
            <div id="login-panel">
                <h1>登录</h1>
                <label htmlFor="server"><Icon name="server" /> 服务器</label>
                <input type="url" id="server" value={this.props.server} onKeyPress={submit} onChange={e=>this.props.onChange({server: e.target.value})} />
                <label htmlFor="username"><Icon name="user" /> 用户名</label>
                <input type="text" id="username" value={this.props.username} onKeyPress={submit} onChange={e=>this.props.onChange({username: e.target.value})} />
                <label htmlFor="password"><Icon name="key" /> 密码</label>
                <input type="password" id="password" value={this.props.password} onKeyPress={submit} onChange={e=>this.props.onChange({password: e.target.value})} />
                {this.props.error?(<p className="error">错误：{this.props.error}</p>):undefined}
                <button id="connect" disabled={!!this.props.state} onClick={this.props.onSubmit}>{this.props.state?'连接中':'连接到服务器'}</button>
                {this.props.state ? (<button id="cancel" onClick={this.props.onCancel}>取消</button>):undefined}
            </div>
        );
    }
    componentDidMount() {
        let query = querystring.parse(location.search);
        if (query.autologin)
            this.props.onSubmit();
    }
}

export { LoginPanel };
