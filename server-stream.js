var WebSocketServer = require('ws').Server
var http = require('http')
var ecstatic = require('ecstatic')(__dirname)
var server = http.createServer(ecstatic)
var websocketStream = require('websocket-stream')
//var MuxDemux = require('mux-demux')
var duplexEmitter = require('duplex-emitter')
var uuid = require('hat')
//server.listen(8080)

var wss = new WebSocketServer({server: server})
wss.on('connection', function(ws) {
    var stream = websocketStream(ws)
    //var mdm = MuxDemux()
    //stream.pipe(mdm).pipe(stream)
    //var emitterStream = mdm.createStream('emitter')
    //var emitter = duplexEmitter(emitterStream)
    var emitter = duplexEmitter(stream)
    var id = uuid()
    console.log('emitted id')
    emitter.emit('id', id)
    emitter.on('test', function(foo) {
        console.log("received foo: " + foo)
    })
    console.log('started stream')
    stream.on('end', function() {
        console.log('stream ended')
    })
})

var port = process.argv[2] || 8080
server.listen(port)
console.log('Listening on ', port, ' open http://localhost:',port)