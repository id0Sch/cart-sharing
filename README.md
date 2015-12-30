
<content>
# Cart sharing
Allows you to simply share your 10bis orders with others nearby
## Installation
requires extension + express server
extension can be found here: https://chrome.google.com/webstore/detail/10bis-cart-sharing/bhiegjkgahobnemndmeenikhbkibjnij?hl=en-US&gl=IL&authuser=1
## Usage
server:

install the package `npm install -g 10cartsharing`

run server: `cart-server`

extension:

configure the server using the options page, should have url to your server, i.e : http://localhost:3000

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Todo
* remove traces
* handle order confirmation - should notify all and remove user from list
* ga
* server-less (?)
* localization
## License
MIT
</content>