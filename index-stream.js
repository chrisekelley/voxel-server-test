var websocket = require('websocket-stream')
var elstreamo = require('el-streamo')
//var MuxDemux = require('mux-demux')
var duplexEmitter = require('duplex-emitter')

var emitter
var connected = false
var elstream = elstreamo.writable('#messages')
// 192.168.0.56
//ws = websocket('ws://localhost:8080')
var socket = websocket('ws://localhost:8080')
socket.on('end', function() { connected = false })
console.log("websocket opened.")
//var mdm = MuxDemux()
//mdm.on('connection', function (stream) {
//ws.on('connection', function (stream) {
//window.emitter = emitter = duplexEmitter(stream)
//console.log("connected.")
//emitter = duplexEmitter(stream)
//emitter = duplexEmitter(ws)
emitter = duplexEmitter(socket)
connected = true
emitter.on('id', function(id) {
    console.log('id', id)
    elstream.write("Received id:" + id)
})

//console.log("Sending test")
//emitter.emit('test', 'hola')
//console.log("Finished sending test")

//elstream.write("Sent test.")
//})

//ws.pipe(elstream)

//ws.pipe(mdm).pipe(ws)
//ws.on('end', function() { connected = false })

