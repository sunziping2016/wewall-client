import React from 'react';

import unknown_user from './unknown-user.png';

import './wall-message.css';

function WallMessage(props) {
    return (
        <div className="wall-message">
            <img src={props.message.avatar || unknown_user} className="wall-message-avatar"/>
            <div className="wall-message-main">
                <p className="wall-message-sender">{props.message.nickname || ''}</p>
                <p className="wall-message-content">{props.message.content || ''}</p>
            </div>
        </div>
    );
}

export { WallMessage };
