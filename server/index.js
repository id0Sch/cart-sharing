/**
 * Created by idoschachter on 27/12/2015.
 */
var fs = require('fs');
var express = require('express');
var util = require('util');
var app = express();
var server = require('http').Server(app);

server.listen(3001, function () {
    console.log('server up and running');
});

app.get('/', function (req, res) {
    res.header('Content-type', 'text/html');
    return res.end('<h1>Hello, Secure World!</h1>');
});

var users = {};

var io = require('socket.io')(server);

io.on('connection', function (socket) {
    function updateUsers() {
        socket.broadcast.emit('users', users);
        socket.emit('users', users);
    }

    updateUsers();

    socket.on('peer-joined', function (data) {
        users[data.mail] = data;
        console.log(util.format('%s - %s', data.mail, data.cart));
        updateUsers();
    });

    socket.on('peer-reset', function (data) {
        var user = users[data.user.mail];
        if (user) {
            delete users[data.user.mail];
        }
        updateUsers();
    });

    socket.on('update-peers', function (data) {
        socket.broadcast.emit('update-peers', data);
    });
    socket.on('peer-joined-order', function (data) {
        socket.broadcast.emit('peer-joined-order', data);
    });

    socket.on('peer-shared', function (data) {
        socket.broadcast.emit('peer-shared', data);
    });
});