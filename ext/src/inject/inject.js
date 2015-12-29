var users, me;

function sendMsg(msg, callback) {
    chrome.extension.sendMessage(msg, callback);
}
function getCartId(callback) {
    sendMsg({fn: 'getCartId'}, callback);
}
function joinToCart(cart) {
    sendMsg({fn: 'join', guid: cart}, function () {
        console.log('got new cart', cart);
        me.cart = cart;
        callPageFunction('_ShoppingCart.ReloadShoppingCart');
    });
}
function initSocket(user, callback) {
    sendMsg({fn: 'login', user: user}, callback);
}

function refreshUsers(callback) {
    sendMsg({fn: 'refreshUsers'}, callback);
}

function shareCart(callback) {
        initSocket(me, function (user) {
            me = user;
        callback(null, 'success');
        });
    }


// updates cart
var actions = {
    updatePeers: function (event) {
        event.cart = me.cart;
        sendMsg(event);
    },
    updateUsers: function (data) {
        console.log("updateUsers",data);
        if (_.get(data, 'users')) {
            console.log("data.users",data.users);
            users = data.users;
            renderUsers(users);
        }
    },
    updateDish: function (data) {
        console.log(data.cart, me.cart);
        if (data.cart == me.cart) {
            console.log('disturbance in the force felt');
            callPageFunction('_ShoppingCart.ReloadShoppingCart');
    }
    }
};

function renderUsers(users) {
    var index = 0;
    createElement('div', '', document.getElementsByClassName('menu')[0], null, 'users');
    for (var key in users) {
        index++;
        createElement('div', '', document.getElementsByClassName('users')[0], null, 'user' + index + ' user');
        createElement('div', users[key].name, document.getElementsByClassName('user' + index)[0], null, 'username');
        createElement('span', 'join', document.getElementsByClassName('user' + index)[0], function(){
            join(users[key]);
        }, 'join');
    }
}

function listenOnChanges(fn) {
    var scriptContent = 'var extId="' + chrome.runtime.id + '";$(document).bind("MenuDishesChanged QuantityChanged MealDealRemoved", ' + fn + ')';
    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
    $("#tmpScript").remove();
}
function listenOnOrderConfirm(fn) {
    var scriptContent = '$(document).bind("MOrderConfirmed", ' + fn + ')';
    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
    $("#tmpScript").remove();
}
function onChange() {
    chrome.runtime.sendMessage(extId, {fn: 'updatePeers', event: 'update'});
}

//function onConfirm() {
//    chrome.runtime.sendMessage({fn: 'updatePeers', event: 'order'});
//}
function callPageFunction(name) {
    var scriptContent = name + "();";
    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
    $("#tmpScript").remove();
}

function main() {
    var rawData = $('.HeaderTexture[data-login-user-email]').data();
    if (rawData) {
        me = {
            name: rawData.loginUserName,
            mail: rawData.loginUserEmail
        };
        getCartId(function (cart) {
            me.cart = cart;
    injectMenu();
    refreshUsers(actions.updateUsers);
            listenOnChanges(onChange);
            //listenOnOrderConfirm(onConfirm);
        });
    } else {
        callback('no user');
}

}

function injectMenu() {
    createElement('div', '', document.body, null, 'content');
    createElement('div', '', document.getElementsByClassName('content')[0], null, 'menu');
    createElement('div', 'x', document.getElementsByClassName('menu')[0], closeMenu, 'close');
    createElement('button', 'share', document.getElementsByClassName('menu')[0], share, 'share');
    createElement('div', 'Cart sharing menu', document.getElementsByClassName('content')[0], openMenu, 'handle');


}

function createElement(type, html, locationElement, click, className) {
    //Create an input type dynamically.
    var element = document.createElement(type);
    //Assign different attributes to the element.
    element.type = 'button';
    element.innerHTML = html;
    element.onclick = click;
    element.className = className;
    element.style = {
        width: '100%'
    };

    //Append the element in page (in span).
    locationElement.appendChild(element);
}

function share() {
    shareCart(function (err, data) {
        console.log(err || data);
    });
}

function join(user) {
    //to do - validate uuid
    if (user.cart) {
        joinToCart(user.cart);
        //refresh the delivery ui
        if (location.pathname.indexOf("/Restaurants/Menu/Delivery/") === -1) {
            //not restaurant page
            location.reload();
        } else {
            $("div[data-shoppingCart-main-div='true']").show();
            callPageFunction('_ShoppingCart.ReloadShoppingCart');
        }
    }
}

function openMenu() {
    $(".content .handle").css('left', $(".content .handle").width() * -1 + 'px');
    $(".content .menu").css('left', 0);
}

function closeMenu() {
    $(".content .menu").css('left', 220 * -1 + 'px');
    setTimeout(function () {
        $(".content .handle").css('left', 0);
    }, 200);
}

function messageHandler(request, sender, sendResponse) {
    console.log('got msg', request.fn);
    actions[request.fn](request);
}

chrome.runtime.onMessage.addListener(messageHandler); // messages from background script

var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
        clearInterval(readyStateCheckInterval);
        main();
    }
});