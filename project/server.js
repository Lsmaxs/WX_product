/**
 * Created by Administrator on 2016/11/24/024.
 */
import browserSync from 'browser-sync';
import  historyApiFallback from 'connect-history-api-fallback';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './webpack-dev-config';

const bundler = webpack(config);

browserSync({
    port: 8988,
    ui: {
        port: 8989
    },
    server: {
        baseDir: 'src',
        middleware: [
            historyApiFallback(),
            webpackDevMiddleware(bundler, {
                publicPath: config.output.publicPath,
                noInfo: false,
                quiet: false,
                stats: {
                    assets: false,
                    colors: true,
                    version: false,
                    hash: true,
                    timings: false,
                    chunks: false,
                    chunkModules: false
                },
            }),

            webpackHotMiddleware(bundler)
        ]
    },
    files: [
        'src/*.html'
    ]
});

