# voxel-server-test

Test HTML5 [websockets](https://developer.mozilla.org/en-US/docs/WebSockets) used in voxel-server. 
This test does not have any of the webgl code in it so you can test voxel-server in browsers that do not support webgl.
Voxel-server is part of the http://voxeljs.com/, an open source voxel game building toolkit for modern web browsers

# setup

    npm install
    npm start

Go to: http://localhost:8080

If successful, the browser js console will display:

    Sending test
    Finished sending test
    id 1a3f1f361dc0b44d98c3f5e5798b470e

The npm console will display:

    started stream
    received foo: hola

The browser will provide additional confirmation.

Much of the code from this demo is extracted from [maxogden](https://github.com/maxogden)'s [websocket-stream](https://github.com/maxogden/websocket-stream) example. 

BSD LICENSE