"use strict";
import _       from "lodash";
import assert  from "assert";
import md5     from "crypto-js/md5";
import request from "request";

const f = function() {};

export default class Wykop {

	/**
	* @param {string} appkey    Klucz API
	* @param {string} secretkey Sekret aplikacji
	* // todo reszta
	*/
	constructor(appkey, secretkey, {output, format, timeout=30000, useragent="WypokAgent", userkey, info}={}) {
		assert(appkey && secretkey, "Podaj appkey i secretkey");
		Object.assign(this, {appkey, secretkey, output, format, timeout, useragent, userkey, info});
	}


	/**
	* Zmiana parametrów API w string
	* @param {Object} base 
	* @param {Object} api parametry API
	*/
	static parseApi(base, api) {
		Object.assign(base, api);
		let keys = _(base).omit(_.isUndefined).omit(_.isNull).keys();
		return _(keys).reduce((memo, key, index) => {
			return memo + key + ',' + base[key] + (index === keys.length - 1 ? '' : ',');
		}, '');
	}


	/**
	* Tworzenie requestu do API
	* @param {string}   rtype        Nazwa zasobu np. 'Link'
	* @param {string}   rmethod      Nazwa metody np. 'Index'
	* @param {string[]} params Parametry metody np. ["14278527"]
	* @param {Object}   api    Parametry api np. {page: 1}
	* @param {Object}   post   Parametry POST np. {body: "string"}
	*/
	get(rtype, rmethod, {params, api, post}={}, callback=f) {
		assert(rtype && rmethod, "rtype and rmethod must be String and cannot be null");
		
		let {appkey, secretkey, userkey, output, format, timeout, useragent} = this;

		let _params = (!_(params).isEmpty() ? params.join("/") + "/" : "");
		let _api    = Wykop.parseApi({appkey, userkey, output, format}, api);
		let sortedPost    = _(post).sortBy((val, key) => key).toString();

		let url = `http://a.wykop.pl/${rtype}/${rmethod}/${_params}${_api}`;
		
		let options = {
			url: url,
			method: (!_(post).isEmpty() ? 'POST' : 'GET'),
			json: true,
			timeout: timeout,
			headers: {
				"User-Agent": useragent,
				"apisign": md5(secretkey + url + sortedPost).toString()
			},
			form: post
			//formData: post
		};


		/*
		* Wykonujemy request, metoda get zwraca promise
		*/
		return new Promise((resolve, reject) => {
			request(options, (error, response, body) => {

				if (error) {
					reject(error);
				} else if (!(response.statusCode >= 200 && response.statusCode < 300)) {
					reject(response);
				} else if (body.error) {
					reject(body.error);
				} else {
					resolve(body);
				}

				//callback(error, response, body);
			})
		});
	};
	

	/*
	* @param {String} accountkey Klucz połączenia konta z aplikacją
	*/
	login(accountkey) {
		assert(accountkey, "accountkey cannot be null");
		let {appkey, secretkey, output, format, timeout, useragent} = this;
		return this.get("User", "Login", {post: {accountkey}}).then((res) => {
			let userkey = res.userkey;
			return Promise.resolve(new Wykop(appkey, secretkey, {output, format, timeout, useragent, userkey, info:res}));
		});
	}
}