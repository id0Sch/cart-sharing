/**
 * Created by idoschachter on 27/12/2015.
 */
var fs = require('fs');
var express = require('express');
var util = require('util');
var app = express();
var server = require('http').Server(app);
var _ = require('lodash');

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

    socket.on('peer-shared', function (data) {
        users[data.mail] = data;
        console.log(util.format('%s - %s', data.mail, data.cart));
        updateUsers();
    });

    socket.on('peer-joined', function (data) {
        console.log(util.format('%s - %s', data.host.mail, data.user.mail));
        var host = users[data.host.mail];
        if (host) {
            if (!host.peers) {
                host.peers = [];

            }
            host.peers.push(data.user);
        }
        updateUsers();
    });
    socket.on('peer-reset', function (data) {
        var user = users[data.user.mail];
        if (user) {
            delete users[data.user.mail];
        } else {
            var host = _.find(users, {cart: data.user.cart});
            if (host && host.peers) {
                var me = _.findIndex(host.peers, {mail: data.user.mail});
                host.peers.splice(me, 1);
                console.log(host.peers);
            }
        }
        updateUsers();
    });

    socket.on('update-peers', function (data) {
        var user = _.find(users, {cart: data.cart});
        if (data.resName && user && !user.rest) {
            user.rest = data.resName;
            updateUsers();
        }
        socket.broadcast.emit('update-peers', data);
    });
    socket.on('peer-joined-order', function (data) {
        socket.broadcast.emit('peer-joined-order', data);
    });

    socket.on('peer-shared', function (data) {
        socket.broadcast.emit('peer-shared', data);
    });
});