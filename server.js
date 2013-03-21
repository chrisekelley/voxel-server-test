
var http = require('http')
var ecstatic = require('ecstatic')(__dirname)
var server = http.createServer(ecstatic)
var uuid = require('hat')

var io = require('socket.io').listen(server)

io.sockets.on('connection', function (socket) {
    var id = uuid()
    console.log('emitted id')
    //socket.emit('id', { hello: 'world' })
    socket.emit('id', id)
    socket.on('test', function(foo) {
        console.log("received foo: " + foo)
    })
});

var port = process.argv[2] || 8080
server.listen(port)
console.log('Listening on ', port, ' open http://localhost:',port)