var cart;
function getCartId(callback) {
    chrome.extension.sendMessage({fn: 'get'}, callback);
}
function setCartId(cart, callback) {
    chrome.extension.sendMessage({fn: 'join', guid: cart}, callback);
}
function getFriendsList() {
    return $.map($('select[data-mealdeal-assigned-users-select="true"].MealDealAssignedUser')[0].options, function (option) {
        return {name: $(option).text(), id: $(option).val()};
    });
}

function getConnections(me, friends) {
    chrome.extension.sendMessage({fn: 'conn', me: me, friends: friends}, function (response) {
        console.log(response);
    });
}
function initSocket(user, callback) {
    chrome.extension.sendMessage({fn: 'login', user: user}, callback);
}

function refreshUsers(callback) {
    chrome.extension.sendMessage({fn: 'refreshUsers'}, callback);
}
//function getActiveFriends(friends, callback) {
//
//}
var users, me;
// updates cart
var actions = {
    updateUsers: function (data) {
        console.log(data);
        if (_.get(data, 'users')) {
            users = data.users;
            console.log(data.users);
        }
    }
};

function add(type, text, location, click) {
    //Create an input type dynamically.
    var element = document.createElement("input");
    //Assign different attributes to the element.
    element.type = 'button';
    element.value = text;
    element.name = type;
    element.onclick = click;
    element.style = {
        width: '100%'
    };

    var foo = document.getElementById(location);
    //Append the element in page (in span).
    foo.appendChild(element);
}

function main() {
    var rawData = $('.HeaderTexture[data-login-user-email]').data();
    if (rawData) {
        me = {
            name: rawData.loginUserName,
            mail: rawData.loginUserEmail
        };
        initSocket(me, function (user) { //optional callback
            me = user;
        });
    } else {
        console.log('no user');
    }

    refreshUsers(actions.updateUsers);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('got msg', request.fn);
    actions[request.fn](request);
});

var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        main();
    }
});