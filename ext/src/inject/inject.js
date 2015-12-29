var cart, users, me;

function getCartId(callback) {
    chrome.extension.sendMessage({fn: 'getCartId'}, callback);
}
function joinToCart(cart) {
    chrome.extension.sendMessage({fn: 'join', guid: cart}, function () {
        console.log('got new cart', cart);
        callPageFunction('_ShoppingCart.ReloadShoppingCart');
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

// updates cart
var actions = {
    updateUsers: function (data) {
        if (_.get(data, 'users')) {
            users = data.users;
            renderUsers(users);
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


function callPageFunction(name) {
    var scriptContent = name + "();";
    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
    $("#tmpScript").remove();
}

function main() {
    injectMenu();
    refreshUsers(actions.updateUsers);
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

function copyToClipboard(text) {
    const input = document.createElement('input');
    input.style.position = 'fixed';
    input.style.opacity = 0;
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('Copy');
}

function share() {
    getCartId(function (cartId) {
        copyToClipboard(cartId);
        alert("cart id was copied to clipboard");
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