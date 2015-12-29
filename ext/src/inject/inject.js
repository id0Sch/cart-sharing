var cart, users, me;

function getCartId(callback) {
    chrome.extension.sendMessage({fn: 'get'}, callback);
}
function joinToCart(cart) {
    cart = "b5224d58-31c5-40ad-ae13-0e4d3b2da2ee";
    chrome.extension.sendMessage({fn: 'join', guid: cart}, function () {
        console.log('got new cart', cart);
        triggerEvent('MenuDishesChanged');
    });
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
function shareCart() {
    var rawData = $('.HeaderTexture[data-login-user-email]').data();
    if (rawData) {
        me = {
            name: rawData.loginUserName,
            mail: rawData.loginUserEmail
        };
        initSocket(me, function (user) {
            me = user;
        });
    } else {
        console.log('no user');
    }
    //chrome.extension.sendMessage({fn: 'shareCart', user: user});
}
//function getActiveFriends(friends, callback) {
//
//}

// updates cart
var actions = {
    updateUsers: function (data) {
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

function triggerEvent(name) {
    var scriptContent = "$(document).trigger('" + name + "');";
    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
    $("#tmpScript").remove();
}

function main() {
    add('button', 'share cart', 'AddressUpperBarTr', shareCart);
    add('button', 'join cart', 'AddressUpperBarTr', joinToCart);
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