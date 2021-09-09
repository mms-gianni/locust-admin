const path = require('path');
const debug = require('debug')('superlocust:configure');
const socket = require('./socket');
const locust = require('./locust');


// Handle when server is started from vue-cli vs root
if (path.basename(process.cwd()) === 'client') {
    require('dotenv').config({ path: path.resolve(process.cwd(), '../.env') });
}
else {
    require('dotenv').config()
}

const bodyParser = require('body-parser')
const routes = require('./routes')

module.exports = {
    before: (app) => {
        app.use(bodyParser.json());
        app.use('/api', routes);
        locust.init();
    },
    after: (app, server) => {
        // Attach socket.io to server
        socket.init(server);
    }
}