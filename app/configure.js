const path = require('path');
let cors = require('cors')
const debug = require('debug')('superlocust:configure');
const socket = require('./socket');
let locust = require('./locust');

const watcher = require('./watcher');


// Handle when server is started from vue-cli vs root
if (path.basename(process.cwd()) === 'client') {
    require('dotenv').config({ path: path.resolve(process.cwd(), '../.env') });
}
else {
    require('dotenv').config()
}

if (process.env.DOCKER_BUILD != 'true') {
    setInterval(watcher, 3000, locust.locust);
}

const bodyParser = require('body-parser')
const routes = require('./routes')

module.exports = {
    before: (app) => {
        app.use(cors())
        app.use(bodyParser.json());
        app.use('/api', routes);
        locust.init();
    },
    after: (app, server) => {
        // Attach socket.io to server
        socket.init(server);
    }
}