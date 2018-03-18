# wykop-es6 (deprecated, update in progress) 
[![david-dm](https://david-dm.org/bnt44/wykop-es6.svg)](https://david-dm.org/bnt44/wykop-es6)
[![Code Climate](https://codeclimate.com/github/bnt44/wykop-es6/badges/gpa.svg)](https://codeclimate.com/github/bnt44/wykop-es6)
[![npm](https://img.shields.io/npm/v/wykop-es6.svg)](https://www.npmjs.com/package/wykop-es6)
[![npm](https://img.shields.io/npm/l/wykop-es6.svg)](https://www.npmjs.com/package/wykop-es6)

## Instalacja
```
npm install wykop-es6
```
## Dokumentacja Wykop API
##### http://www.wykop.pl/dla-programistow/dokumentacja/

## Przykładowe użycie (promises)

```javascript
var Wykop = require('wykop-es6');

var wykop = new Wykop('appkey', 'secretkey');
var user  = new Wykop('appkey', 'secretkey');

// logujemy usera
user.login('accountkey')
	.then(function(res) {
		// user zostal zalogowany
		console.log(res);
		// dodajemy wpis
		return user.request('Entries', 'Add', {post: {body: "test", embed: "http://plik.jpg"}});
	})
	.then(function(res) {
		console.log(res);
		// pobieramy stream mikrobloga jako niezalogowani
		return wykop.request('Stream', 'Index', {api: {page: 1}});
	})
	.then(function(res) {
		console.log(res);
		var firstEntryId = res[0].id; // id pierwszego wpisu ze streamu

		// plusujemy pierwszy wpis ze streamu wpisów! Używamy znów zalogowanej instancji klasy Wykop - user
		return user.request('Entries', 'Vote', { params: ['entry', firstEntryId] });
	})
	.then(function(res) {
		console.log(res);
	})
	.catch(function(err) {
		console.log(err);
});
```
## Przykładowe użycie (callback)
```javascript
user.login(accountkey, function(error, res) {
	if (error) throw error;
	console.log(res);

	user.request('Entries', 'Add', {
		post: {
			body: "test",
			embed: "http://plik.jpg"
		}
	}, function(error, res) {
		if (error) throw error;
		console.log(res);
	});
});
```

## Opcje
```javascript
var options = {
	output:  'clear', // wszystkie pola odpowiedzi zostaną wyczyszczone z kodu HTML.
	format:  'jsonp', // format odpowiedzi, domylnie json, do wyboru xml lub jsonp
	timeout: '30000', // czas (w ms) oczekiwania na odpowiedź serwera wykopu, domyślnie 30000ms (30 sekund)
	useragent: 'WypokAgent', // useragent, domyslnie WypokAgent
	ssl: false // czy wysylac requesty pod szyfrowany adres api
};
var wykop = new Wykop(<appkey>, <secretkey>, options);
```

## Parametry metody .request
```javascript
var reqOptions = {
	params: [ ], //parametry metody np. [14723797, 48940057]
	api: { }, // parametry API (poza userkey, appkey) np. {page: 3, sort: 'votes'}
	post: { } // Parametry POST np. {body: 'tekst', embed: 'link'}
};
wykop.request('rtype', 'rmethod', reqOptions);
```
TODO: napisać readme od nowa
