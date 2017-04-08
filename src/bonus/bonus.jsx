import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';

import config from '../config.json';
import { LoginPanel } from '../components/index';
import './bonus.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: {
                server: config.default_server || '',
                username: config.bonus.username || '',
                password: config.bonus.password || '',
                error: '',
                state: false
            },
            logined: false,
        };
    }
    connect() {
        if (!this.state.login.server) {
            this.setState({login:Object.assign({}, this.state.login, {error:'服务器不能为空'})});
            return;
        }
        if (!this.state.login.username) {
            this.setState({login:Object.assign({}, this.state.login, {error:'用户名不能为空'})});
            return;
        }
        if (this.socket) this.socket.close();
        this.socket = io(this.state.login.server);
        this.setState({login:Object.assign({}, this.state.login, {error:'',state:true})});
        this.socket.on('connect', () => this.socket.emit('authorize', {username: this.state.login.username, password: this.state.login.password}));
        this.socket.on('disconnect', () => this.setState({login:Object.assign({}, this.state.login, {state:!!this.socket.subs})}));
        this.socket.on('connect_error', err => this.setState({login:Object.assign({}, this.state.login, {error:'连接出错'})}));
        this.socket.on('authorized', data => this.handle_authorized(data));
    }
    handle_authorized(data) {
        if (data.error) {
            this.socket.close();
            delete this.socket;
            this.setState({login:Object.assign({}, this.state.login, {state:false,error:data.error})});
        } else {
            this.setState({logined: true});
        }
    }
    render() {
        if (!this.state.logined)
            return (
                <LoginPanel {...this.state.login}
                            onChange={e=>this.setState({login:Object.assign({}, this.state.login, e)})}
                            onSubmit={()=>this.connect()}
                            onCancel={()=>{
                                if (this.socket) {
                                    this.socket.close();
                                    delete this.socket;
                                }
                                this.setState({login:Object.assign({}, this.state.login, {error:'',state:false})});
                            }}
                />
            );
        return <div />;
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
