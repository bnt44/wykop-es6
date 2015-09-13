# wykop-es6
## Sample usage

```javascript
var wykop = new Wykop('appkey', 'secretkey');
var user;

wykop.login('accountkey')
	.then(function(newUser) {
		user = newUser;
		return user.get('Entries', 'Add', {post: {body: "test", embed: "http://plik.jpg"}}); // dodanie wpisu 
	})
	.then(function(res) {
		console.log(res);
		return user.addEntry({post: {body: "test", embed: "http://plik.jpg"}}); // dodanie wpisu metoda uproszczona
	})
	.then(function(res) {
		console.log(res);
	})
	.catch(function(err) {
		console.log(err);
});
```