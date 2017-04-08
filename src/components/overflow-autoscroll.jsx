import React from 'react';
import ReactDOM from 'react-dom';

import './overflow-autoscroll.css';

const moving_speed = 160;

class OverflowAutoscroll extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            init: true
        }
    }
    render() {
        let {children, ...props} = this.props;
        console.log(this.state.init, this.scroll);
        if (this.state.init || !this.scroll)
            return (
                <div className="autoscroll" {...props}>
                    <div className="autoscroll-child">
                        {children}
                    </div>
                </div>
            );
        else {
            return (
                <div className="autoscroll" {...props} style={{width:this.child_width}}>
                    <div className="autoscroll-child" style={{
                        animation: `autoscroll ${(2*this.child_width) / moving_speed}s linear 0.8s infinite`
                    }}>
                        {children}
                    </div>
                </div>
            );
        }
    }
    componentDidUpdate() {
        if (!this.state.init) return;
        let dom = ReactDOM.findDOMNode(this);
        if (!Array.prototype.every.call(dom.getElementsByTagName('img'), x=>x.naturalWidth&&x.naturalHeight)) {
            // Still loading
            setTimeout(() => this.setState({init: true}), 10);
            return;
        }
        this.width = dom.clientWidth;
        this.child_width = dom.firstChild.firstChild.clientWidth || dom.firstChild.firstChild.offsetWidth;
        if (this.child_width > this.width)
            this.scroll = true;
        this.setState({init: false});
    }
}

export { OverflowAutoscroll };
