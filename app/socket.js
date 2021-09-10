const debug = require('debug')('action-dashboard:socket');

let _client = null;
let _io = null

module.exports.init = function init(server) {
    debug('initializing');
    const io = require('socket.io')(server);
    console.log('socket.io started')
    io.on('connection', client => {
        console.log('socket.io connected')
        _client = client;
        _io = io;
    });
}


module.exports.updatedStatus = function updatedStatus(status) {
    if (_client) {
        debug(`emitting updatedStatus: `, status);
        _io.emit('updatedStatus', status);
    }
};
