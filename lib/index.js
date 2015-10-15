'use strict';
const _          = require('lodash');
const assert     = require('assert');
const crypto     = require('crypto');
const request    = require('request');
const es6Promise = require('es6-promise');

let _Promise = (typeof Promise === 'undefined' ? es6Promise.Promise : Promise);

// create md5 hash
function md5(string='') {
	return crypto.createHash('md5').update(new Buffer(string, 'utf-8')).digest("hex");
}


class Wykop {

	/**
	* @param {string} appkey    Klucz API
	* @param {string} secretkey Sekret aplikacji
	* @param {string} output    W przypadku, gdy aplikacja docelowa nie potrafi obsłużyć pól zawierających kod HTML należy użyć parametru API output o wartości "clear"
	* @param {string} format    domyślnie "JSON", dostępne opcje: "JSONP" lub "XML"
	* @param {number} timeout   czas (w ms) oczekiwania na odpowiedź serwera wykopu, domyślnie 30000ms (30 sekund)
	* @param {string} useragent Useragent pod jakim przedstawiamy się serwerowi
	*/
	constructor(appkey, secretkey, {output, format, timeout=30000, useragent='WypokAgent'}={}) {
		assert(appkey && secretkey, 'appkey and secretkey cannot be null');
		_.assign(this, {appkey, secretkey, output, format, timeout, useragent});
	}


	/**
	* Zmiana parametrów API w string
	* @param {Object} base 
	* @param {Object} api parametry API
	*/
	static parseApi(base, api) {
		let keys;
		_.assign(base, api);
		keys = _(base).omit(_.isUndefined).omit(_.isNull).keys();
		return _(keys).reduce((memo, key, index) => {
			return memo + key + ',' + base[key] + (index === keys.length - 1 ? '' : ',');
		}, '');
	}

	static parsePostParams(post={}) {
		let form, formData, sortedPost;
		if (post.embed && typeof post.embed !== 'string') {
			formData = post;
			post = _.omit(post,'embed');
		} else if (!_(post).isEmpty()) {
			form = post;
		}
		sortedPost = _(post).omit(_.isUndefined).omit(_.isNull).sortBy((val, key) => key).toString();
		return {form, formData, sortedPost};
	}


	/**
	* Tworzenie requestu do API
	* @param {string}   rtype        Nazwa zasobu np. 'Link'
	* @param {string}   rmethod      Nazwa metody np. 'Index'
	* @param {string[]} params       Parametry metody np. ['14278527']
	* @param {Object}   api          Parametry api np. {page: 1}
	* @param {Object}   post         Parametry POST np. {body: 'string'}
	*/
	request(rtype, rmethod, {params, api, post}={}, callback=Function.prototype) {
		assert(rtype && rmethod, 'rtype and rmethod must be String and cannot be null');
		
		let {appkey, secretkey, userkey, output, format, timeout, useragent} = this;

		let _params = (!_(params).isEmpty() ? params.join('/') + '/' : ''); // zmiana tablicy z parametrami metody w string
		let _api    = Wykop.parseApi({appkey, userkey, output, format}, api); // zmiana obiektu z parametrami api w string
		let {form, formData, sortedPost} = Wykop.parsePostParams(post); // parsowanie parametrów POST

		// tworzymy url zapytania
		let url = `http://a.wykop.pl/${rtype}/${rmethod}/${_params}${_api}`;
		let method = (!_(post).isEmpty() ? 'POST' : 'GET');
		let apisign = md5(secretkey + url + sortedPost);

		let options = {
			url: url,
			method: method,
			json: true,
			timeout: +timeout,
			headers: {
				'User-Agent': useragent,
				'apisign': apisign
			},
			form: form,
			formData: formData
		};


		/*
		* Wykonujemy request, metoda request zwraca promise
		*/
		return new _Promise((resolve, reject) => {
			request(options, (error, response, body) => {

				if (error) {
					callback(error);
					reject(error);
				} else if (!(response.statusCode >= 200 && response.statusCode < 300)) {
					callback(response);
					reject(response);
				} else if (body.error) {
					callback(body.error);
					reject(body.error);
				} else {
					callback(null, body);
					resolve(body);
				}
			});
		});
	}
	

	/*
	* @param {String} accountkey Klucz połączenia konta z aplikacją, loguje instancję klasy Wykop nadając jej userkey
	*/
	login(accountkey=this.accountkey, callback=Function.prototype) {
		assert(accountkey, 'accountkey cannot be null');
		return this.request('User', 'Login', {post: {accountkey}}).then((res) => {
			// po zalogowaniu zapisujemy w instancji klasy Wykop parametry accountkey, userkey i info
			this.accountkey = accountkey;
			this.userkey = res.userkey;
			this.info = res; // obiekt, informaje o userze
			callback(null, res);
			return _Promise.resolve(res);
		});
	}

}


/**
* exportujemy klasę Wykop
*/
module.exports = Wykop;