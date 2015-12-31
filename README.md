<content>
# Cart sharing
Allows you to simply share your 10bis orders with others nearby
requires extension + express server.

## constraints
1. this was created in a one-day hackathon and the code reflects that fact :)
2. the creator of the cart should be the one to actually order.
3. the creator of the cart should have order permissions for all peers that join the order

## Installation

server: `npm install -g 10cartsharing`

extension: https://chrome.google.com/webstore/detail/10bis-cart-sharing/bhiegjkgahobnemndmeenikhbkibjnij?hl=en-US&gl=IL&authuser=1
## Usage
run server: `cart-server`

extension: configure the server using the options page, should have url to your server, i.e : http://localhost:3000

## Todo 
* remove traces
* use chrome ports for continues messaging
* handle order confirmation - should notify all and remove user from list (clear cookies to all joined users)
* prettify code and use best practices
* chrome desktop notifications
* ga
* server-less (?)
* localization

## License
MIT
</content>
