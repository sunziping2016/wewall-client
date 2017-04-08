import React from 'react';
import ReactDOM from 'react-dom';

import './danmu.css';

const row_height = 50,
    moving_speed = 160,
    extra_space = 50,
    message_margin = 10;

class Danmu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages_active: {}
        };
        this.messages_pending = [];
        this.rows_state = [];
        this.message_ids = {};
        if (props.messages) {
            props.messages.forEach(msg => {
                if (!this.message_ids[msg.msgid]) {
                    this.message_ids[msg.msgid] = true;
                    this.messages_pending.push(msg);
                }
            });
        }
    }
    add_pending_messages(messages) {
        messages.forEach(msg => {
            if (!this.message_ids[msg.msgid]) {
                this.message_ids[msg.msgid] = true;
                this.messages_pending.push(msg);
            }
        });
        this.check_update();
    }
    check_update() {
        if (!this.width || !this.height || !this.messages_pending.length)
            return;
        let empty = this.rows_state.filter(x=>!x).length;
        if (!empty)
            return;
        let messages_active = Object.assign({}, this.state.messages_active);
        for (let i = 0; empty && i < this.messages_pending.length; ++i) {
            let msg = this.messages_pending[i], row;
            //noinspection StatementWithEmptyBodyJS
            while (this.rows_state[row = Math.floor(Math.random() * this.rows_state.length)]);
            msg.row = row;
            msg.init = true;
            messages_active[msg.msgid] = msg;
            this.rows_state[row] = true;
        }
        this.messages_pending = [];
        this.setState({
            messages_active: messages_active,
        });
    }
    componentWillReceiveProps(props) {
        if (props.messages)
            this.add_pending_messages(props.messages);
    }
    componentDidMount() {
        let dom = ReactDOM.findDOMNode(this);
        if (dom) {
            this.width = dom.clientWidth;
            this.height = dom.clientHeight;
            this.rows_state = new Array(Math.floor(this.height / row_height)).fill(false);
            this.check_update();
        }
    }
    componentDidUpdate() {
        let dom = ReactDOM.findDOMNode(this);
        if (!dom) return;
        let items = dom.getElementsByClassName('initial-danmu-item');
        if (!items.length) return;
        let messages_active = Object.assign({}, this.state.messages_active);
        Array.prototype.forEach.call(items, (element => {
            let msg = Object.assign({}, messages_active[element.dataset.key]);
            msg.width = element.clientWidth;
            if (!Array.prototype.every.call(element.getElementsByTagName('img'), x=>x.naturalWidth&& x.naturalHeight)) return;
            msg.init = false;
            element.classList.remove('initial-danmu-item');
            msg.entered_time = (msg.width + extra_space + message_margin) / moving_speed;
            msg.left_time = (msg.width + this.width + 2 * extra_space) / moving_speed;
            setTimeout(() => {
                this.rows_state[msg.row] = false;
                this.check_update();
            }, msg.entered_time * 1000);
            setTimeout(() => {
                let temp = Object.assign({}, this.state.messages_active);
                delete temp[msg.msgid];
                this.setState({messages_active: temp});
            }, msg.left_time * 1000);
            messages_active[msg.msgid] = msg;
        }));
        setTimeout(()=>this.setState({messages_active: messages_active}));
    }
    render() {
        if (!this.width || !this.height)
            return <div id="danmu-container"></div>;
        else {
            let get_style = msg => {
                if (msg.init)
                    return {transform: `translate(${this.width + extra_space}px,${row_height*msg.row}px)`};
                return {transform: `translate(${-msg.width - extra_space}px,${row_height*msg.row}px)`, transition: `transform ${msg.left_time}s linear`};
            };
            return (
                <div id="danmu-container">
                    {Object.keys(this.state.messages_active).map(msgid => {
                        let msg = this.state.messages_active[msgid];
                        return (
                            <div className={msg.initial ?'danmu-item':'danmu-item initial-danmu-item'} data-key={msgid} key={msgid} style={get_style(msg)}>
                                {this.props.children(msg)}
                            </div>
                        );
                    })}
                </div>
            );
        }
    }
}

export {Danmu};
