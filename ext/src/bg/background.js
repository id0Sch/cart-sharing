'use strict';
// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });


console.log('connecting to ', config.server);
var socket = io(config.server);
var users = {};

var port = chrome.runtime.connect({name: "back-inject"});

function sendToContentPage(data) { //todo: change to long-connection
    chrome.tabs.query({active: true}, function (tabs) {
        // send the message to the content script
        _.each(tabs, function (tab) {
            chrome.tabs.sendMessage(tab.id, data);
        });
    });
}
socket.on('users', function (data) {
    console.log('got msg from backend');
    users = data;
    sendToContentPage({fn: 'updateUsers', users: users});
});

socket.on('update-peers', function (data) {
    switch (data.event) {
        case 'update':
            console.log('got update for cart ', data.cart);
            sendToContentPage({fn: 'updateDish', cart: data.cart});
            break;
        case 'order':
            sendToContentPage({fn: 'orderConfirmed', event: data});
            break;
        default:
            console.log('wrong event called');
    }
});

function getCart(callback) {
    chrome.cookies.get({
        url: "https://www.10bis.co.il/",
        name: "WebApplication.Context"
    }, function (a) {
        if (a && a.hasOwnProperty('value')) {
            callback(null, a.value.match(/ShoppingCartGuid=([^&]*)/)[1]);
        } else {
            console.error('could not retrieve cookie', a);
            callback(null, null);
        }
    });
}
/**
 * actions exposed to content-script
 */
var cart = {
    refreshUsers: function (data, callback) {
        console.log('fetching users', _.size(users));
        callback(null, {users: users});
    },
    getCartId: function (data, callback) {
        getCart(callback);
    },
    updatePeers: function (data, callback) {
        console.log('updating everyone about change in cart', data.cart);
        socket.emit('update-peers', data);
    },
    login: function (data, callback) {
        getCart(function (err, cart) {
            if (err) {
                return callback(err, null);
            }
            data.user.cart = cart;
            socket.user = data.user;
            socket.emit('peer-joined', data.user);
            callback(null, socket.user);
        });
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


function messageHandler(request, sender, sendResponse) {
    if (request && request.fn && cart && cart[request.fn]) {
        cart[request.fn](request, function (err, data) {
            return sendResponse(data);
        });
    }
    return true;
}

/*
 * relays messages from web page to content-script
 */
chrome.runtime.onMessageExternal.addListener(messageHandler); // messages from page
/**
 * responds to messages send from content-page
 */
chrome.extension.onMessage.addListener(messageHandler);