import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';

import config from '../config.json';
import { LoginPanel, EmojiParser, Danmu } from '../components/index';
import './danmu.css';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: {
                server: config.default_server || '',
                username: config.danmu.username || '',
                password: config.danmu.password || '',
                error: '',
                state: false
            },
            logined: false,
        };
        this.messages = [];
        if (window.require) {
            let win = window.require('electron').remote.getCurrentWindow();
            win.setIgnoreMouseEvents(false);
            win.setAlwaysOnTop(false);
        }
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
        this.socket.on('messages', data => {
            data.messages.sort((a,b)=>new Date(b)-new Date(a)).forEach(msg => {
                let user = data.users && data.users[msg.openid];
                this.messages.push({
                    msgid: msg.msgid,
                    content: msg.content,
                    color: `hsl(${360*Math.random()},100%,50%)`
                });
            });
            this.forceUpdate();
        });
    }
    handle_authorized(data) {
        if (data.error) {
            this.socket.close();
            delete this.socket;
            this.setState({login:Object.assign({}, this.state.login, {state:false,error:data.error})});
        } else {
            if (window.require) {
                let win = window.require('electron').remote.getCurrentWindow();
                win.setIgnoreMouseEvents(true);
                win.setAlwaysOnTop(true);
            }
            this.setState({
                logined: true,
                messages: []
            });
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
        let danmu = (
            <Danmu messages={this.messages}>
                {msg=>
                    <EmojiParser className="danmu-message" style={{color:msg.color}}>
                        {msg.content}
                    </EmojiParser>
                }
            </Danmu>
        );
        this.messages = [];
        return danmu;
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
