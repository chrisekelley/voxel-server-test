
var io = require('socket.io-client');
var elstreamo = require('el-streamo')
var elstream = elstreamo.writable('#messages')
var socket = io.connect('ws://localhost:8080');
socket.on('id', function (data) {
    console.log("id" + data);
    elstream.write("Received id:" + data)
    socket.emit('test', { my: 'data' });
});

