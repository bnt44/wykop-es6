# wykop-es6
## Sample usage

```javascript
var wykop = new Wykop('appkey', 'secretkey');
var user;

wykop.login('accountkey')
	.then(function(newUser) {
		user = newUser;
		return user.get('Entries', 'Add', {post: {body: "test"}}); // dodanie wpisu 
	})
	.then(function(res) {
		console.log(res);
		return user.get('Entries', 'Index', {params:[123456789]}); // pobranie wpisu
	})
	.then(function(res) {
		console.log(res);
	})
	.catch(function(err) {
		console.log(err);
});
```