# wykop-es6
[![david-dm](https://david-dm.org/bnt44/wykop-es6.svg)](https://david-dm.org/bnt44/wykop-es6)
[![Code Climate](https://codeclimate.com/github/bnt44/wykop-es6/badges/gpa.svg)](https://codeclimate.com/github/bnt44/wykop-es6)
[![npm](https://img.shields.io/npm/v/wykop-es6.svg)](https://www.npmjs.com/package/wykop-es6)
[![npm](https://img.shields.io/npm/l/wykop-es6.svg)](https://www.npmjs.com/package/wykop-es6)
## Installation
```
npm install wykop-es6
```


## Sample usage

```javascript
var Wykop = require('wykop-es6'),

var wykop = new Wykop('appkey', 'secretkey');
var user;

wykop.login('accountkey')
	.then(function(newUser) {
		user = newUser;
		// dodanie wpisu
		return user.request('Entries', 'Add', {post: {body: "test", embed: "http://plik.jpg"}});
	})
	.then(function(res) {
		console.log(res);
	})
	.catch(function(err) {
		console.log(err);
});
```
