import React from 'react';

import unknown_user from './unknown-user.png';

import './wall-message.css';

function WallMessage(props) {
    return (
        <div className="wall-message">
            <img src={props.message.avatar || unknown_user} className="wall-message-avatar"/>
            <div className="wall-message-main">
                <p className="wall-message-sender">{props.message.nickname || ''}</p>
                <div className="wall-message-content">{props.children ? props.children(props.message.content) : props.message.content || ''}</div>
            </div>
        </div>
    );
}

export { WallMessage };
