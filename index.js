var websocket = require('websocket-stream')
var elstreamo = require('el-streamo')
var MuxDemux = require('mux-demux')
var duplexEmitter = require('duplex-emitter')

var emitter
var connected = false
var elstream = elstreamo.writable('#messages')
ws = websocket('ws://localhost:8080')

var mdm = MuxDemux()
mdm.on('connection', function (stream) {
    window.emitter = emitter = duplexEmitter(stream)
    connected = true
    emitter.on('id', function(id) {
      console.log('id', id)
  	  elstream.write("Received id:" + id)
    })
	console.log("Sending test")
	emitter.emit('test', 'hola')
	console.log("Finished sending test")
	elstream.write("Sent test.")
})

ws.pipe(elstream)

ws.pipe(mdm).pipe(ws)
ws.on('end', function() { connected = false })

