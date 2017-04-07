import React from 'react';
import ReactDOM from 'react-dom';

import { wechat_emoji } from './wechat-emoji';
import { wechat_emoji_extra } from './wechat-emoji-extra';
import { apple_emoji } from './apple-emoji';
import twemoji from 'twemoji';

class EmojiParser extends React.Component {
    render() {
        let { children, ...other } = this.props;
        return <span {...other}>{wechat_emoji_extra(children)}</span>;
    }
    componentDidUpdate(prevProps) {
        twemoji.parse(apple_emoji(wechat_emoji(ReactDOM.findDOMNode(this))));
    }
    componentDidMount() {
        twemoji.parse(apple_emoji(wechat_emoji(ReactDOM.findDOMNode(this))));
    }
}

export { EmojiParser };
