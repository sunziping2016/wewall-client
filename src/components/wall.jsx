import React from 'react';
import ReactDOM from 'react-dom';

import './wall.css';

class Wall extends React.Component {
    constructor(props) {
        // props.maxMessages
        super(props);
        this.state = {
            messages_active: [],
            busy: false,
            initial: false,
            width: 0,
            height: 0
        };
        this.messages_pending = [];
        this.message_ids = {};
        if (props.messages) {
            props.messages.forEach(msg => {
                if (!this.message_ids[msg.msgid]) {
                    this.message_ids[msg.msgid] = true;
                    this.messages_pending.push(msg);
                }
            });
        }
        // Debug
        //window.add_pending_messages = messages => this.add_pending_messages(messages);
    }
    add_pending_messages(messages) {
        let origin_length = this.messages_pending.length;
        messages.forEach(msg => {
            if (!this.message_ids[msg.msgid]) {
                this.message_ids[msg.msgid] = true;
                this.messages_pending.push(msg);
            }
        });
        if (!origin_length)
            this.check_update();
    }
    check_update() {
        if (this.messages_pending.length && !this.state.busy && this.props.maxMessages) {
            let new_message = this.messages_pending.splice(0,1)[0],
                messages_active = this.state.messages_active.slice().map(v=>Object.assign({}, v));
            if (messages_active.length == this.props.maxMessages)
                messages_active[messages_active.length - 1].leaving = true;
            if (messages_active.length)
                messages_active[0].entering = false;
            new_message.entering = true;
            messages_active.splice(0,0,new_message);
            if (this.props.onNewMessage)
                this.props.onNewMessage();
            this.setState({
                messages_active: messages_active,
                busy: true,
                initial: true
            },() => setTimeout(() => this.setState({initial: false})));

            setTimeout(() => {
                let length = this.state.messages_active.length;
                if (length && this.state.messages_active[length - 1].leaving)
                    this.setState({
                        messages_active: this.state.messages_active.slice(0, -1),
                        busy: false
                    }, () => this.check_update());
                else
                    this.setState({
                        busy: false
                    }, () => this.check_update());
            }, 1000);
        }
    }
    componentWillReceiveProps(props) {
        if (props.messages)
            this.add_pending_messages(props.messages);
    }
    componentDidMount() {
        let dom = ReactDOM.findDOMNode(this);
        if (dom) {
            this.setState({width: dom.clientWidth, height: dom.clientHeight});
            window.addEventListener('resize', () =>
                this.setState({width: dom.clientWidth, height: dom.clientHeight}));
        }
        this.check_update();
    }
    componentDidUpdate() {
        let dom = ReactDOM.findDOMNode(this);
        if (dom && (this.state.width != dom.clientWidth || this.state.height != dom.clientHeight))
            setTimeout(() => this.setState({width: dom.clientWidth, height: dom.clientHeight}));
    }
    render() {
        if (!this.state.width || !this.state.height)
            return <div id="wall-container"></div>;
        else {
            const msg_spaceing = 15, msg_width = this.state.width - 150,
                msg_height = (this.state.height - msg_spaceing * (this.props.maxMessages - 1)) / this.props.maxMessages,
                msg_horizontal_delta = (this.state.width - msg_width) / (this.props.maxMessages - 1),
                msg_vertical_delta = msg_height + msg_spaceing,
                initial_position = {x:-msg_width - msg_spaceing - 100,y:0},
                leaving_position = {x:this.state.width + msg_spaceing + 20,y:this.state.height + msg_spaceing + 50};

            const initial = this.state.initial;

            let get_style = (msg, index) => {
                if (msg.entering && initial)
                    return {transform: `translate(${initial_position.x}px,${initial_position.y}px)`, transition: 'none'};
                if (msg.entering)
                    return {transform: `translate(0,0)`, transition: `transform 0.2s ease 0.2s`};
                if (msg.leaving)
                    return {transform: `translate(${leaving_position.x}px,${leaving_position.y}px)`, transition: `transform 0.4s ease`};
                return {transform: `translate(${index*msg_horizontal_delta}px,${index*msg_vertical_delta}px)`, transition: `transform 0.4s ease`};
            };
            return (
                <div id="wall-container">
                    {this.state.messages_active.map((msg,index) => (
                        <div className="wall-container-item" key={msg.msgid}
                             style={Object.assign({width: msg_width, height: msg_height}, get_style(msg, index))}>
                            {this.props.children(msg, index)}
                        </div>
                    ))}
                </div>
            );
        }
    }
}

export { Wall };
