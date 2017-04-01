const path = require('path');
const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const src = path.resolve(__dirname, 'src');
const production = process.env.NODE_ENV == 'production';

module.exports = {
    context: src,
    entry: {
        'admin/admin': path.resolve(src, 'admin/admin.jsx')
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        loaders: [ {
                test: /\.(css)$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader!postcss-loader',
                }),
            }, {
                test: /\.(js|jsx|es6)$/,
                exclude: /node_modules/,
                loader: 'babel-loader?presets[]=react',
            }, {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url-loader?limit=10000&mimetype=application/font-woff',
            }, {
                test: /\.(jpg|png|gif|eot|svg|ttf)$/,
                loader: 'file-loader?name=[name].[ext]',
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(src, 'admin/index.html'),
            chunks: ['admin/admin'],
            filename: 'admin/index.html',
            minify: production ? {
                    collapseWhitespace: true,
                    removeComments: true
                } : false
        }),
        new ExtractTextPlugin({
            filename: '[name].css',
        }),
        ...(production ? [
            new UglifyJSPlugin({
                extractComments: true
            })
        ] : [])
    ],
    resolve: {
        extensions: ['.js', '.jsx', 'ex6'],
    },
    devServer: {inline: true},
};
