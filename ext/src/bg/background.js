'use strict';
// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });
var socket = io('https://localhost:3001/', {secure: true});
var users = {};

socket.on('users', function (data) {
    users = data;
    console.log(users);
    chrome.runtime.sendMessage({fn: 'updateUsers', users: users});
});

var cart = {
    refreshUsers: function (data, callback) {
        callback({users: users});
    },
    login: function (data, callback) {
        chrome.cookies.get({
            url: "https://www.10bis.co.il/",
            name: "WebApplication.Context"
        }, function (a) {
            if (a && a.hasOwnProperty('value')) {
                data.user.cart = a.value.match(/ShoppingCartGuid=([^&]*)/)[1];
                socket.user = data.user;
                socket.emit('peer-joined', data.user);
                callback(null, data.user);
            } else {
                console.error('could not retrieve cookie', a);
                callback(null, null);
            }
        });
        callback();
    },
    join: function joinCart(body, callback) {
        var guid = body.guid;
        chrome.cookies.get({
            url: "https://www.10bis.co.il/*",
            name: "WebApplication.Context"
        }, function (a) {
            var value = a.value.replace(/ShoppingCartGuid=([^&]*)/, 'ShoppingCartGuid=' + guid);
            chrome.cookies.set({
                url: 'https://www.10bis.co.il',
                name: "WebApplication.Context",
                value: value
            }, callback);
        });
    }
};
//example of using a message handler from the inject scripts
//joinCart('d37dfc49-205d-4bb4-b83d-0af2f6b3c47f')

chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request && request.fn && cart && cart[request.fn]) {
            cart[request.fn](request, function (err, data) {
                return sendResponse(data);
            });
        }
        return true;
    });