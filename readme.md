# voxel-server-test

Test HTML5 [websockets](https://developer.mozilla.org/en-US/docs/WebSockets) used in voxel-server. 
This test does not have any of the webgl code in it so you can test voxel-server in browsers that do not support webgl.
Voxel-server is part of the http://voxeljs.com/, an open source voxel game building toolkit for modern web browsers .

An earlier version of this demo used websocket-stream and duplex-emiiter, but I ran into an \u0000 error in jsonparse
when the browser was parsing the server response. I've switched this test to use socket.io for now.

# setup

    npm install
    npm start

Go to: http://localhost:8080

# Response

If successful, the browser js console will display:

    XHR finished loading: "http://localhost:8080/socket.io/1/?t=1363860581983". socket.io.js:1659
    id71190a1ec2242e764d380871e20e8efc

The node console will display:

    /usr/local/bin/node --debug-brk=63741 --debug server.js
    debugger listening on port 63741
    info: socket.io started
    Listening on  8080  open http://localhost: 8080
    debug: client authorized
    info: handshake authorized arMt13gd60tdWWlsdoVT
    debug: setting request GET /socket.io/1/websocket/arMt13gd60tdWWlsdoVT
    debug: set heartbeat interval for client arMt13gd60tdWWlsdoVT
    debug: client authorized for
    debug: websocket writing 1::
    emitted id
    debug: websocket writing 5:::{"name":"id","args":["41283563b358672ad44624d442598963"]}
    received foo: [object Object]

The browser will provide additional confirmation.

    Messages:
    "Received id:6212f94b752af7e1b0a50b585daa67fd"

There is a streams version of the demo which does not work yet (server-stream.js and index-stream.js).
Much of the code from this demo is extracted from [maxogden](https://github.com/maxogden)'s
[websocket-stream](https://github.com/maxogden/websocket-stream) example.

BSD LICENSE