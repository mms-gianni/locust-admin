const debug = require('debug')('action-dashboard:socket');

let _client = null;

module.exports.init = function init(server) {
    debug('initializing');
    const io = require('socket.io')(server);
    console.log('socket.io started')
    io.on('connection', client => {
        console.log('socket.io connected')
        _client = client;
    });
}


module.exports.updatedStatus = function updatedStatus(status) {
    if (_client) {
        debug(`emitting updatedStatus: `, status);
        _client.emit('updatedStatus', status);
    }
};
