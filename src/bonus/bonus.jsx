import React from 'react';
import ReactDOM from 'react-dom';

import io from 'socket.io-client';

import config from '../config.json';
import { LoginPanel } from '../components/index';
import './bonus.css';

import unknown_user from '../components/unknown-user.png';

const fetch_database_delay = 7;

let timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));


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

            data_fetched: false,
            data_fetched_data: false,

            prev_user: null,
            cur_user: null,
            next_user: null,

            running: false,
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
    get_random_user() {
        return this.users_bonus[Math.floor(Math.random() * this.users_bonus_num)];
    }
    handle_authorized(data) {
        if (data.error) {
            this.socket.close();
            delete this.socket;
            this.setState({login:Object.assign({}, this.state.login, {state:false,error:data.error})});
        } else {
            this.setState({logined: true});
            Promise.all([
                new Promise((resolve, reject) => {
                    this.socket.emit('query user', {
                        sort: {last_time: -1},
                        project: {_id:0, messages: 0}
                    });
                    this.socket.once('query user', data => this.handle_query(data, resolve));
                }),
                timeout(fetch_database_delay * 1000)
            ]).then(() => {
                this.setState({
                    data_fetched: true,
                    prev_user: this.get_random_user(),
                    cur_user: this.get_random_user(),
                    next_user: this.get_random_user(),
                    running: true
                });
            })
        }
    }
    handle_query(data, resolve) {
        this.users = data.result;
        this.users_bonus = this.users.filter(x => x.detailed);
        this.users_bonus_num = this.users_bonus.length;
        this.users_bonus.forEach(x => {
            if (x.avatar)
                (new Image).src = x.avatar;
        });
        resolve();
        this.setState({data_fetched_data: true});
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
        if (!this.state.data_fetched)
            return (
                    <div className="bonus fetching-database">
                        <h1>获取数据库中</h1>
                        <h2>共有 <span className="stat">{this.state.data_fetched_data ? this.users_bonus_num : null}</span> 位观众将参与抽奖活动</h2>
                    </div>
                );
        return (
            <div className={'bonus started'+(this.state.running?' running':'')}>
                <h3 className="title">{this.state.running?'抽奖中':'幸运儿是：'}</h3>
                <h4 className="nickname">{this.state.cur_user.nickname || ''}</h4>
                <div className="selection">
                    <div className="leftarrow">{'>>>'}</div>
                    <div className="avatar">
                        <img className="next" src={this.state.next_user.avatar || unknown_user} />
                        <img className="cur" src={this.state.cur_user.avatar || unknown_user} />
                        <img className="prev" src={this.state.prev_user.avatar || unknown_user} />
                    </div>
                    <div className="rightarrow">{'<<<'}</div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
