const express = require('express');
const app = express();
const server = require('http').createServer(app);
const configureAPI = require('./configure');
const debug = require('debug')('superlocust:index');

const { PORT = 8080 } = process.env;

// API
configureAPI.before(app);
configureAPI.after(app, server);

server.listen(PORT, () => console.log(`Super locust running on port ${PORT}`));