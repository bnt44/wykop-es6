"use strict";
import _       from "lodash";
import assert  from "assert";
import md5     from "crypto-js/md5";
import request from "request";

const u = undefined;
const f = function() {};

export default class Wykop {

	constructor(appkey, secretkey, {output, format, timeout=30000, useragent="WypokAgent"}={}) {
		assert(appkey && secretkey, "Podaj appkey i secretkey");
		Object.assign(this, {appkey, secretkey, output, format, timeout, useragent});
	}

	/**
	* Zmiana parametrów API w string
	* @param {Object} params    
	* @param {Object} apiParams parametry api
	*/
	static parseApiParams(params, apiParams) {
		Object.assign(params, apiParams);
		let keys = _(params).omit(_.isUndefined).omit(_.isNull).keys();
		return _(keys).reduce((memo, key, index) => {
	        return memo + key + ',' + params[key] + (index === keys.length - 1 ? '' : ',');
	    }, '');
	}

	/**
	* Tworzenie requestu do API
	* @param {string}   rtype        Nazwa zasobu np. 'Link'
	* @param {string}   rmethod      Nazwa metody np. 'Index'
	* @param {String[]} methodParams Parametry metody np. ["14278527"]
	* @param {Object}   apiParams    Parametry api np. {page: 1}
	* @param {Object}   postParams   Parametry POST np. {body: "string"}
	*/
	get(rtype, rmethod, methodParams=[], apiParams={}, postParams={}, callback=f) {
		assert(rtype && rmethod, "rtype and rmethod must be String and cannot be null");
		
		let {appkey, secretkey, userkey, output, format, timeout, useragent} = this;

		let _methodParams = (!_(methodParams).isEmpty() ? methodParams.join("/") + "/" : "");
		let _apiParams    = Wykop.parseApiParams({appkey, userkey, output, format}, apiParams);
		let sortedPost    = _(postParams).sortBy((val, key) => key).toString();

		let url = `http://a.wykop.pl/${rtype}/${rmethod}/${_methodParams}${_apiParams}`;
		
		let options = {
			url: url,
			method: (!_(postParams).isEmpty() ? 'POST' : 'GET'),
			json: true,
			timeout: timeout,
			headers: {
				"User-Agent": useragent,
				"apisign": md5(secretkey + url + sortedPost).toString()
			},
			form: postParams
			//formData: postParams
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

				callback(error, response, body);
			})
		});
	};
	
	/*
	* @param {String} accountkey
	*/
	login(accountkey) {
		assert(accountkey, "accountkey cannot be null");
		return this.get("User", "Login", u, u, {accountkey}).then((res) => {
			return Promise.resolve(new User(this, res.userkey, res));
		});
	}

}


class User extends Wykop {

	constructor(self, userkey, info) {
		let {appkey, secretkey, output, format, timeout, useragent} =  self;

		super(appkey, secretkey, {output, format, timeout, useragent});

		this.userkey = userkey;
		this.info = info;
	}

	login() {
		return; // todo
	}

}