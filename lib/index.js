'use strict';
const _       = require('lodash');
const assert  = require('assert');
const md5     = require('crypto-js/md5');
const request = require('request');


class Wykop {

	/**
	* @param {string} appkey    Klucz API
	* @param {string} secretkey Sekret aplikacji
	* // todo reszta
	*/
	constructor(appkey, secretkey, {output, format, timeout=30000, useragent='WypokAgent', userkey, info}={}) {
		assert(appkey && secretkey, 'appkey and secretkey cannot be null');
		_.assign(this, {appkey, secretkey, output, format, timeout, useragent, userkey, info});
	}


	/**
	* Zmiana parametrów API w string
	* @param {Object} base 
	* @param {Object} api parametry API
	*/
	static parseApi(base, api) {
		_.assign(base, api);
		let keys = _(base).omit(_.isUndefined).omit(_.isNull).keys();
		return _(keys).reduce((memo, key, index) => {
			return memo + key + ',' + base[key] + (index === keys.length - 1 ? '' : ',');
		}, '');
	}

	static parsePostParams(post={}) {
		let form, formData, sortedPost;
		
		if (post.embed && typeof post.embed !== 'string') {
			formData = post;
			sortedPost = (function() {
				let _post = _.omit(post,'embed');
				return  _(_post).omit(_.isUndefined).omit(_.isNull).sortBy((val, key) => key).toString();
			}());
		} else if (!_(post).isEmpty()) {
			form = post;
			sortedPost = _(post).omit(_.isUndefined).omit(_.isNull).sortBy((val, key) => key).toString();
		} else {
			sortedPost = '';
		}
		return {form, formData, sortedPost};
	}


	/**
	* Tworzenie requestu do API
	* @param {string}   rtype        Nazwa zasobu np. 'Link'
	* @param {string}   rmethod      Nazwa metody np. 'Index'
	* @param {string[]} params Parametry metody np. ['14278527']
	* @param {Object}   api    Parametry api np. {page: 1}
	* @param {Object}   post   Parametry POST np. {body: 'string'}
	*/
	get(rtype, rmethod, {params, api, post}={}, callback=Function.prototype) {
		assert(rtype && rmethod, 'rtype and rmethod must be String and cannot be null');
		
		let {appkey, secretkey, userkey, output, format, timeout, useragent} = this;

		let _params = (!_(params).isEmpty() ? params.join('/') + '/' : ''); // zmiana tablicy z parametrami metody w string
		let _api    = Wykop.parseApi({appkey, userkey, output, format}, api); // zmiana obiektu z parametrami api w string
		let {form, formData, sortedPost} = Wykop.parsePostParams(post); // parsowanie parametrów POST

		// tworzymy url zapytania
		let url = `http://a.wykop.pl/${rtype}/${rmethod}/${_params}${_api}`;
		
		let options = {
			url: url,
			method: (!_(post).isEmpty() ? 'POST' : 'GET'),
			json: true,
			timeout: timeout,
			headers: {
				'User-Agent': useragent,
				'apisign': md5(secretkey + url + sortedPost).toString()
			},
			form: form,
			formData: formData
		};


		/*
		* Wykonujemy request, metoda get zwraca promise
		*/
		return new Promise((resolve, reject) => {
			request(options, (error, response, body) => {

				if (error) {
					reject(error);
					callback(error);
				} else if (!(response.statusCode >= 200 && response.statusCode < 300)) {
					reject(response);
					callback(response);
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
	* @param {String} accountkey Klucz połączenia konta z aplikacją, zwraca nowy obiekt User
	*/
	login(accountkey, callback=f) {
		assert(accountkey, 'accountkey cannot be null');
		let {appkey, secretkey, output, format, timeout, useragent} = this;
		return this.get('User', 'Login', {post: {accountkey}}).then((res) => {
			let userkey = res.userkey;
			let user = new Wykop(appkey, secretkey, {output, format, timeout, useragent, userkey, info:res});
			callback(null, user);
			return Promise.resolve(user);
		});
	}

}


/**
* exportujemy klasę Wykop
*/
module.exports = Wykop;