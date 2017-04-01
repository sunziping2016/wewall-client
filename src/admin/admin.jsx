import React from 'react';
import ReactDOM from 'react-dom';

import 'react-mdl/extra/material.css';
import 'react-mdl/extra/material.js';

import { Layout, Header, Navigation, Drawer, Content } from 'react-mdl';

ReactDOM.render(
    <Layout fixedHeader>
        <Header title={<span><span style={{ color: '#ddd' }}>Area / </span><strong>The Title</strong></span>}>
            <Navigation>
                <a href="">Link</a>
            </Navigation>
        </Header>
        <Drawer title="Title">
            <Navigation>
                <a href="">Link</a>
            </Navigation>
        </Drawer>
        <Content />
    </Layout>,
    document.getElementById('root')
);
