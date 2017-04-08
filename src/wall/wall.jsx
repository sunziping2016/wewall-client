import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';

import config from '../config.json';
import { LoginPanel, Wall, WallMessage, EmojiParser, OverflowAutoscroll } from '../components/index';
import './wall.css';

import bgimg from './wallbg.jpg';
import qrimg from './qrcode.jpg';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            login: {
                server: config.default_server || '',
                username: config.wall.username || '',
                password: config.wall.password || '',
                error: '',
                state: false
            },
            logined: false,

            counter: 0
        };
        this.messages = [];
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
                    nickname: user && user.nickname,
                    avatar: user.detailed && user && user.avatar
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
        let wall = (
            <div id="wall">
                <img src={bgimg} id="wall-background" />
                <div id="main-content">
                    <div id="wall-info">
                        <h1>码上期中</h1>
                        <img src={qrimg} id="wall-qrcode" />
                    </div>
                    <div id="wall-msgs">
                        <div id="wall-counter">{this.state.counter}</div>
                        <Wall maxMessages={3} messages={this.messages} onNewMessage={()=>this.setState({counter: this.state.counter+1})}>
                            {msg =>
                                <WallMessage message={msg}>
                                    {content =>
                                        <OverflowAutoscroll>
                                            <EmojiParser>
                                                {content}
                                            </EmojiParser>
                                        </OverflowAutoscroll>
                                    }
                                </WallMessage>
                            }
                        </Wall>
                    </div>
                </div>
            </div>
        );
        this.messages = [];
        return wall;
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
