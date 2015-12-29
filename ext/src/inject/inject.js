var users, me;

function sendMsg(msg, callback) {
    chrome.extension.sendMessage(msg, callback);
}
function getCartId(callback) {
    sendMsg({fn: 'getCartId'}, callback);
}
function joinToCart(user) {
    sendMsg({fn: 'join', me: me, user: user}, function () {
        console.log('got new cart', user.cart);
        me.cart = user.cart;
        callPageFunction('_ShoppingCart.ReloadShoppingCart');
    });
}

function refreshUsers(callback) {
    sendMsg({fn: 'refreshUsers'}, callback);
}

function shareCart(callback) {
    sendMsg({fn: 'share', user: me}, function (user) {
        me = user;
        callback(null, 'success');
    });
}
function reset(callback) {
    sendMsg({fn: 'reset', user: me});
}

// updates cart
var actions = {
    updateUsers: function (data) {
        console.log("updateUsers", data);
        if (_.get(data, 'users')) {
            console.log("data.users", data.users);
            users = data.users;
            console.log(users);
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
    //empty users
    var elem = document.getElementsByClassName("users")[0];
    elem.innerHTML = '';

    for (var key in users) {
        index++;
        createElement('div', '', document.getElementsByClassName('users')[0], null, ' user ' + users[key].cart);
        if (users[key].mail !== me.mail) {
            createElement('div', users[key].name, document.getElementsByClassName(users[key].cart)[0], null, 'username');
            createElement('span', 'join', document.getElementsByClassName(users[key].cart)[0], function () {
                join(users[key]);
            }, 'join');
        } else {
            //me
            if (_.size(_.result(users[key], 'peers'))) {
                createElement('div', users[key].name + " (+"+ users[key].peers.length+ ")", document.getElementsByClassName(users[key].cart)[0], togglePeers, 'username me');
                //people joined my cart
                createElement('ul', '', document.getElementsByClassName('users')[0], null, 'peers-list');
                users[key].peers.forEach(function (peer) {
                    createElement('li', peer.name, document.getElementsByClassName('peers-list')[0], null, 'peer');
                });
            }
        }
    }

    function togglePeers() {
        $(".peers-list").toggle();
    }

    //if my user is in users list -  means i'm in share mode
    if (_.size(users[me.mail])) {
        disableForm();
    }

    else {
        var host = _.find(users, {cart: me.cart});
        //if my cart id is the same as other user's cart id it means i have joined this user- in this case disable share button
        if (host) {
            disableForm();
            //mark joint user
            markUser(host);
        }
    }

}

function markUser(user) {
    $("." + user.cart).removeClass('host').addClass('host');
}


/**
 * ------------ start of web-page context run --------------------
 * runs in scope of web-page , sends message to background.js
 */
function listenOnChanges(fn) {
    var scriptContent = 'var cartId="' + me.cart + '";var extId="' + chrome.runtime.id + '";$(document).bind("MenuDishesChanged QuantityChanged MealDealRemoved DishRemoved TipUpdated DiscounCouponAdded AddressSelected DeliveryMethodChanged", ' + fn + ')';
    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
    $("#tmpScript").remove();
}

function listenOnOrderConfirm(fn) {
    var scriptContent = 'var cartId="' + me.cart + '";var extId="' + chrome.runtime.id + '";$(document).bind("MOrderConfirmed", ' + fn + ')';
    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
    $("#tmpScript").remove();
}

function onChange() {
    chrome.runtime.sendMessage(extId, {fn: 'updatePeers', event: 'update', cart: cartId});
}

function onConfirm() {
    chrome.runtime.sendMessage(extId, {fn: 'updatePeers', event: 'order', cart: cartId});
}

function callPageFunction(name) {
    var scriptContent = name + "();";
    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
    $("#tmpScript").remove();
}

// ----------- end of web-page context run -----------------------


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
            listenOnOrderConfirm(onConfirm);
        });
    } else {
        callback('no user');
    }

}

function injectMenu() {
    createElement('div', '', document.body, null, 'content');
    createElement('div', '', document.getElementsByClassName('content')[0], null, 'menu');
    createElement('div', 'x', document.getElementsByClassName('menu')[0], closeMenu, 'close');
    createElement('div', '', document.getElementsByClassName('menu')[0], null, 'users');
    createElement('button', 'share', document.getElementsByClassName('menu')[0], share, 'share');
    createElement('span', 'reset', document.getElementsByClassName('menu')[0], reset, 'reset');
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
        disableForm();
    });
}

function disableForm() {
    //disable join users
    $(".users").removeClass('disabled').addClass('disabled');
    //disable share button
    $(".share").removeClass('disabled').addClass('disabled');
}

function join(user) {
    //to do - validate uuid
    if (user.cart) {
        joinToCart(user);
        disableForm();
        markUser(user);
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