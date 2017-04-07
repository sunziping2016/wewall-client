import React from 'react';
import ReactDOM from 'react-dom';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';

import './admin.css';
import twemoji from 'twemoji';

import {Icon} from 'react-fa';
import * as mdl from 'react-mdl';

import config from '../config.json';
import io from 'socket.io-client';



class Message extends React.PureComponent {
    componentDidUpdate(prevProps) {
        twemoji.parse(ReactDOM.findDOMNode(this));
    }
    componentDidMount() {
        twemoji.parse(ReactDOM.findDOMNode(this));
    }
    render() {
        const { children, ...other } = this.props;
        return <span {...other}>{children}</span>;
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            socket_url: config.default_server || '',
            username: config.default_username || '',
            password: config.default_password || '',

            connected: null,
            authorized: null,
            login_error: null,

            nickname: '',
            message_index: {},
            user_index: {},
            msg_user_panel_tab: 0,

            responsive: App.get_media()
        };
        window.addEventListener('resize', () => this.setState({responsive: App.get_media()}));
    }
    reset() {
        this.setState({
            nickname: '',
            message_index: {},
            user_index: {}
        });
    }
    static get_media() {
        if (window.innerWidth >= 840)
            return 2;
        else if (window.innerWidth >= 480)
            return 1;
        else
            return 0;
    }
    connect() {
        if (!this.state.socket_url) {
            this.setState({login_error: '服务器不能为空'});
            return;
        }
        if (!this.state.username) {
            this.setState({login_error: '用户名不能为空'});
            return;
        }
        if (this.socket) this.socket.close();
        this.socket = io(this.state.socket_url);
        this.setState({connected: false, login_error: null});
        this.socket.on('connect', () => {
            this.setState({
                connected: true,
                authorized: false,
                login_error: null,
            });
            this.socket.emit('authorize', {
                username: this.state.username,
                password: this.state.password
            });
        });
        this.socket.on('disconnect', () => {
            this.setState({
                connected: this.socket.subs ? false : null,
                authorized: null
            });
            this.reset();
        });
        this.socket.on('connect_error', err => this.setState({login_error: '连接出错'}));
        this.socket.on('authorized', data => this.handle_authorized(data));
        this.socket.on('messages', data => {
            data = data.messages;
            let new_index = Object.assign({}, this.state.message_index);
            console.log(data);
            data.forEach(msg => {
                msg.time = new Date(msg.time);
                new_index[msg.msgid] = msg;
            });
            this.setState({message_index: new_index});
        });
        this.socket.on('users', data => {
            data = data.users;
            let new_index = Object.assign({}, this.state.user_index);
            console.log(data);
            data.forEach(user => {
                user.last_time = new Date(user.last_time);
                new_index[user.openid] = user;
            });
            this.setState({user_index: new_index});
        });
    }
    handle_authorized(data) {
        console.log(data);
        if (data.error) {
            this.socket.close();
            delete this.socket;
            this.setState({authorized:null,login_error: data.error});
        } else {
            this.setState({
                authorized: true,
                nickname: data.nickname || '',
            });
        }
    }
    connect_cancel() {
        if (this.socket) {
            this.socket.close();
            delete this.socket;
        }
        this.setState({
            connected: null,
            authorized: null,
            error: null
        });
    }
    render_navigation() {
        if (this.state.connected && this.state.authorized)
            return (
                <mdl.Navigation>
                    {this.state.nickname?(<span><Icon name="user" /> {this.state.nickname}</span>):undefined}
                    <a href="" onClick={(e) => {
                        e.preventDefault();
                        if (this.socket) {
                            this.socket.close();
                            delete this.socket;
                        }
                    }}><Icon name="sign-out" /> 退出</a>
                </mdl.Navigation>
            );
    }
    render_message_panel() {
        let content = undefined;
        if (this.state.msg_user_panel_tab == 0) {
            const content_max_length = [10, 16, 20][this.state.responsive],
                id_max_length = 10;

            let messages = Object.values(this.state.message_index).sort((a, b) => b.time - a.time).filter(() => true).map(item => {
                let user = this.state.user_index[item.openid];
                return {
                    id: item.msgid,
                    content: (
                        <div className="message_content">
                            <mdl.Tooltip label={<Message>{(<div>
                                内容：{item.content}<br />
                                状态：{['待审核','通过','拒绝'][item.state]}
                            </div>)}</Message>} large>
                            <span>{item.content.length > content_max_length ? item.content.slice(0, content_max_length) + '...' : item.content}</span>
                        </mdl.Tooltip>
                        <span className={'action ' + ['pending', 'accepted', 'rejected'][item.state]}>
                            <mdl.Button className="accept" onClick={()=>this.socket.emit('message accept', [item.msgid])} disabled={item.state == 1}><Icon name="check" /></mdl.Button>
                            <mdl.Button className="reject" onClick={()=>this.socket.emit('message reject', [item.msgid])} disabled={item.state == 2}><Icon name="times" /></mdl.Button>
                        </span>
                        </div>
                    ),
                    sender: (user && user.nickname ? (
                        <mdl.Tooltip label={(<div>
                            {user.avatar ? <img src={user.avatar} className="center"/> : undefined}
                            ID：{user.openid}<br />
                            昵称：{user.nickname}<br />
                            最近活跃：{user.last_time.toLocaleString('zh-CN',{hour12:false})}<br />
                            爬虫：{user.detailed ? '已爬取' : '未爬取'}<br />
                        </div>)} large>
                            <span>{user.nickname}</span>
                        </mdl.Tooltip>
                    ) : item.openid.slice(-id_max_length)),
                    time: item.time.toLocaleTimeString('zh-CN', {hour12:false})
                };
            });
            content = (
                <mdl.CardText><mdl.DataTable
                    rowKeyColumn="id"
                    rows={messages}
                >
                    <mdl.TableHeader name="content">内容</mdl.TableHeader>
                    <mdl.TableHeader name="sender">发送者</mdl.TableHeader>
                    <mdl.TableHeader name="time">时间</mdl.TableHeader>

                </mdl.DataTable><br /><br /><br /><br /><br /></mdl.CardText>
            );
        }

        return (
            <mdl.Card shadow={2}>
                <mdl.CardTitle>
                    <mdl.Tabs activeTab={this.state.msg_user_panel_tab} onChange={id => this.setState({msg_user_panel_tab: id})} ripple>
                        <mdl.Tab><Icon name="comment" /> 消息</mdl.Tab>
                        <mdl.Tab><Icon name="users" /> 用户</mdl.Tab>
                    </mdl.Tabs>
                </mdl.CardTitle>
                {content}
            </mdl.Card>
        );
    }
    render_log_panel() {
        return (
            <mdl.Card shadow={2} id="log-panel">
                <mdl.CardTitle>
                    <span><Icon name="info-circle" /> 日志</span>
                </mdl.CardTitle>
            </mdl.Card>
        );
    }
    render_content() {
        if (this.state.connected && this.state.authorized) {
            return (
                <mdl.Content className="mdl-color--grey-100" id="content">
                    <mdl.Grid noSpacing>
                        <mdl.Cell col={8} tablet={8} phone={4} id="main-panel">
                            <mdl.Grid>
                                <mdl.Cell col={12} id="message-panel">{this.render_message_panel()}</mdl.Cell>
                                <mdl.Cell col={12} id="log-panel">{this.render_log_panel()}</mdl.Cell>
                            </mdl.Grid>
                        </mdl.Cell>
                        <mdl.Cell col={4} tablet={8} phone={4} id="side-panel">
                            <mdl.Grid>
                                <mdl.Cell col={12} tablet={4} phone={4}><mdl.Card shadow={2} id="info-panel">
                                    <mdl.CardTitle><span><Icon name="cog" /> 设置</span></mdl.CardTitle>
                                </mdl.Card></mdl.Cell>
                            </mdl.Grid>
                        </mdl.Cell>
                    </mdl.Grid>
                </mdl.Content>
            );
        } else {
            let submit = (e) => {
                if (e.which == 10 || e.which == 13)
                    this.connect();
            };
            // Login panel
            return (
                <mdl.Content className="mdl-color--grey-100" id="content" component="main">
                    <mdl.Card shadow={2} id="login-panel">
                        <mdl.CardTitle>登录</mdl.CardTitle>
                        <mdl.CardText>
                            <mdl.Textfield onChange={(e) => this.setState({socket_url: e.target.value})} onKeyPress={submit} label="服务器"
                                           value={this.state.socket_url} required type="url"/>
                            <mdl.Textfield onChange={(e) => this.setState({username: e.target.value})} onKeyPress={submit} label="用户名"
                                           value={this.state.username} type="text"/>
                            <mdl.Textfield onChange={(e) => this.setState({password: e.target.value})} onKeyPress={submit} label="密码"
                                           value={this.state.password} type="password"/>
                            {this.state.login_error ? (
                                    <p className="error-message">错误：{this.state.login_error}</p>) : undefined}
                        </mdl.CardText>
                        <mdl.CardActions border>
                            <mdl.Button onClick={(e) => this.connect()}
                                        disabled={this.state.connected === false || this.state.authorized === false}
                                        colored>{
                                this.state.connected === false ?
                                    '连接中 ...' : (this.state.authorized === false ?
                                        '登录中 ...' : '连接至服务器')
                            }
                            </mdl.Button>
                            {this.state.connected === false || this.state.authorized === false ?
                                <mdl.Button onClick={(e) => {
                                    this.connect_cancel();
                                }} colored>取消</mdl.Button> : undefined}
                        </mdl.CardActions>
                    </mdl.Card>
                </mdl.Content>
            );
        }
    }
    render() {
        return (
            <mdl.Layout fixedHeader>
                <mdl.Header title="微信墙管理" className="mdl-layout--no-drawer-button">
                    {this.render_navigation()}
                </mdl.Header>
                {this.render_content()}
            </mdl.Layout>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
