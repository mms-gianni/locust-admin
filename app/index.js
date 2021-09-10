const express = require('express');
const { resolve } = require('path');
const history = require('connect-history-api-fallback');
const app = express();
const server = require('http').createServer(app);
const configureAPI = require('./configure');
const debug = require('debug')('superlocust:index');

const { PORT = 8080 } = process.env;

// API
configureAPI.before(app);
configureAPI.after(app, server);

// UI
const publicPath = resolve(__dirname, '../client/dist');
const staticConf = { maxAge: '1y', etag: false };

app.use(history());
app.use(express.static(publicPath, staticConf));

app.get('/', function (req, res) {
    res.render(path.join(__dirname + '/client/dist/index.html'))
});

server.listen(PORT, () => console.log(`Super locust running on port ${PORT}`));