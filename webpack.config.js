const path = require('path');
const webpack = require('webpack');
const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const src = path.resolve(__dirname, 'src');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const production = process.env.NODE_ENV == 'production';
const extract_css = new ExtractTextPlugin('assets/stylesheet/[name]-[hash].css');

module.exports = {
    context: src,
    entry: {
        'admin': [
            path.resolve(src, 'admin/admin.jsx')
        ],
        'wall': [
            path.resolve(src, 'wall/wall.jsx')
        ],
        'danmu': [
            path.resolve(src, 'danmu/danmu.jsx')
        ]
    },
    output: {
        filename: 'assets/javascript/[name]-[hash].js',
        path: path.resolve(__dirname, 'dist'),
    },
    devtool: 'inline-source-map',
    module: {
        noParse: [/electron/],
        loaders: [ {
                test: /\.(css)$/,
                loader: production ? extract_css.extract({
                    fallback: 'style-loader',
                    use: 'css-loader!postcss-loader',
                    publicPath: '../../'
                }) : 'style-loader!css-loader!postcss-loader',
            }, {
                test: /\.(js|jsx|es6)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }, {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&mimetype=applicatzion/font-woff&name=assets/fonts/[name]-[hash].[ext]'
            }, {
                test: /\.(eot|svg|ttf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?name=assets/fonts/[name]-[hash].[ext]'
            }, {
                test: /\.(jpg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader?publicPath=../&name=assets/images/[name]-[hash].[ext]'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(src, 'admin/index.html'),
            chunks: ['admin'],
            filename: 'admin/index.html',
            minify: production ? {
                    collapseWhitespace: true,
                    removeComments: true
                } : false
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(src, 'wall/index.html'),
            chunks: ['wall'],
            filename: 'wall/index.html',
            minify: production ? {
                    collapseWhitespace: true,
                    removeComments: true
                } : false
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(src, 'danmu/index.html'),
            chunks: ['danmu'],
            filename: 'danmu/index.html',
            minify: production ? {
                    collapseWhitespace: true,
                    removeComments: true
                } : false
        }),        new CopyWebpackPlugin([{ from: 'static' }]),
        ...(production ? [
                extract_css,
                new UglifyJSPlugin({
                    extractComments: true
                })
            ] : [
                //new WriteFilePlugin()
            ])
    ],
    resolve: {
        extensions: ['.js', '.jsx', 'ex6'],
    },
    devServer: {inline: true},
};
