"use strict";
Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _cryptoJsMd5 = require("crypto-js/md5");

var _cryptoJsMd52 = _interopRequireDefault(_cryptoJsMd5);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var f = function f() {};

var Wykop = (function () {

	/**
 * @param {string} appkey    Klucz API
 * @param {string} secretkey Sekret aplikacji
 * // todo reszta
 */

	function Wykop(appkey, secretkey) {
		var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

		var output = _ref.output;
		var format = _ref.format;
		var _ref$timeout = _ref.timeout;
		var timeout = _ref$timeout === undefined ? 30000 : _ref$timeout;
		var _ref$useragent = _ref.useragent;
		var useragent = _ref$useragent === undefined ? "WypokAgent" : _ref$useragent;
		var userkey = _ref.userkey;
		var info = _ref.info;

		_classCallCheck(this, Wykop);

		(0, _assert2["default"])(appkey && secretkey, "Podaj appkey i secretkey");
		Object.assign(this, { appkey: appkey, secretkey: secretkey, output: output, format: format, timeout: timeout, useragent: useragent, userkey: userkey, info: info });
	}

	/**
 * Zmiana parametrów API w string
 * @param {Object} base 
 * @param {Object} api parametry API
 */

	_createClass(Wykop, [{
		key: "get",

		/**
  * Tworzenie requestu do API
  * @param {string}   rtype        Nazwa zasobu np. 'Link'
  * @param {string}   rmethod      Nazwa metody np. 'Index'
  * @param {string[]} params Parametry metody np. ["14278527"]
  * @param {Object}   api    Parametry api np. {page: 1}
  * @param {Object}   post   Parametry POST np. {body: "string"}
  */
		value: function get(rtype, rmethod) {
			var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var params = _ref2.params;
			var api = _ref2.api;
			var post = _ref2.post;
			var callback = arguments.length <= 3 || arguments[3] === undefined ? f : arguments[3];

			(0, _assert2["default"])(rtype && rmethod, "rtype and rmethod must be String and cannot be null");

			var appkey = this.appkey;
			var secretkey = this.secretkey;
			var userkey = this.userkey;
			var output = this.output;
			var format = this.format;
			var timeout = this.timeout;
			var useragent = this.useragent;

			var _params = !(0, _lodash2["default"])(params).isEmpty() ? params.join("/") + "/" : "";
			var _api = Wykop.parseApi({ appkey: appkey, userkey: userkey, output: output, format: format }, api);
			var sortedPost = (0, _lodash2["default"])(post).sortBy(function (val, key) {
				return key;
			}).toString();

			var url = "http://a.wykop.pl/" + rtype + "/" + rmethod + "/" + _params + _api;

			var options = {
				url: url,
				method: !(0, _lodash2["default"])(post).isEmpty() ? 'POST' : 'GET',
				json: true,
				timeout: timeout,
				headers: {
					"User-Agent": useragent,
					"apisign": (0, _cryptoJsMd52["default"])(secretkey + url + sortedPost).toString()
				},
				form: post
				//formData: post
			};

			/*
   * Wykonujemy request, metoda get zwraca promise
   */
			return new Promise(function (resolve, reject) {
				(0, _request2["default"])(options, function (error, response, body) {

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
				});
			});
		}
	}, {
		key: "login",

		/*
  * @param {String} accountkey Klucz połączenia konta z aplikacją
  */
		value: function login(accountkey) {
			(0, _assert2["default"])(accountkey, "accountkey cannot be null");
			var appkey = this.appkey;
			var secretkey = this.secretkey;
			var output = this.output;
			var format = this.format;
			var timeout = this.timeout;
			var useragent = this.useragent;

			return this.get("User", "Login", { post: { accountkey: accountkey } }).then(function (res) {
				var userkey = res.userkey;
				return Promise.resolve(new Wykop(appkey, secretkey, { output: output, format: format, timeout: timeout, useragent: useragent, userkey: userkey, info: res }));
			});
		}
	}], [{
		key: "parseApi",
		value: function parseApi(base, api) {
			Object.assign(base, api);
			var keys = (0, _lodash2["default"])(base).omit(_lodash2["default"].isUndefined).omit(_lodash2["default"].isNull).keys();
			return (0, _lodash2["default"])(keys).reduce(function (memo, key, index) {
				return memo + key + ',' + base[key] + (index === keys.length - 1 ? '' : ',');
			}, '');
		}
	}]);

	return Wykop;
})();

exports["default"] = Wykop;
module.exports = exports["default"];