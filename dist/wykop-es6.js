"use strict";
Object.defineProperty(exports, "__esModule", {
	value: true
});

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _assert = require("assert");

var _assert2 = _interopRequireDefault(_assert);

var _cryptoJsMd5 = require("crypto-js/md5");

var _cryptoJsMd52 = _interopRequireDefault(_cryptoJsMd5);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var u = undefined;
var f = function f() {};

var Wykop = (function () {
	function Wykop(appkey, secretkey) {
		var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

		var output = _ref.output;
		var format = _ref.format;
		var _ref$timeout = _ref.timeout;
		var timeout = _ref$timeout === undefined ? 30000 : _ref$timeout;
		var _ref$useragent = _ref.useragent;
		var useragent = _ref$useragent === undefined ? "WypokAgent" : _ref$useragent;

		_classCallCheck(this, Wykop);

		(0, _assert2["default"])(appkey && secretkey, "Podaj appkey i secretkey");
		Object.assign(this, { appkey: appkey, secretkey: secretkey, output: output, format: format, timeout: timeout, useragent: useragent });
	}

	/**
 * Zmiana parametrów API w string
 * @param {Object} params    
 * @param {Object} apiParams parametry api
 */

	_createClass(Wykop, [{
		key: "get",

		/**
  * Tworzenie requestu do API
  * @param {string}   rtype        Nazwa zasobu np. 'Link'
  * @param {string}   rmethod      Nazwa metody np. 'Index'
  * @param {String[]} methodParams Parametry metody np. ["14278527"]
  * @param {Object}   apiParams    Parametry api np. {page: 1}
  * @param {Object}   postParams   Parametry POST np. {body: "string"}
  */
		value: function get(rtype, rmethod) {
			var methodParams = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];
			var apiParams = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];
			var postParams = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
			var callback = arguments.length <= 5 || arguments[5] === undefined ? f : arguments[5];

			(0, _assert2["default"])(rtype && rmethod, "rtype and rmethod must be String and cannot be null");

			var appkey = this.appkey;
			var secretkey = this.secretkey;
			var userkey = this.userkey;
			var output = this.output;
			var format = this.format;
			var timeout = this.timeout;
			var useragent = this.useragent;

			var _methodParams = !(0, _lodash2["default"])(methodParams).isEmpty() ? methodParams.join("/") + "/" : "";
			var _apiParams = Wykop.parseApiParams({ appkey: appkey, userkey: userkey, output: output, format: format }, apiParams);
			var sortedPost = (0, _lodash2["default"])(postParams).sortBy(function (val, key) {
				return key;
			}).toString();

			var url = "http://a.wykop.pl/" + rtype + "/" + rmethod + "/" + _methodParams + _apiParams;

			var options = {
				url: url,
				method: !(0, _lodash2["default"])(postParams).isEmpty() ? 'POST' : 'GET',
				json: true,
				timeout: timeout,
				headers: {
					"User-Agent": useragent,
					"apisign": (0, _cryptoJsMd52["default"])(secretkey + url + sortedPost).toString()
				},
				form: postParams
				//formData: postParams
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

					callback(error, response, body);
				});
			});
		}
	}, {
		key: "login",

		/*
  * @param {String} accountkey
  */
		value: function login(accountkey) {
			var _this = this;

			(0, _assert2["default"])(accountkey, "accountkey cannot be null");
			return this.get("User", "Login", u, u, { accountkey: accountkey }).then(function (res) {
				return Promise.resolve(new User(_this, res.userkey, res));
			});
		}
	}], [{
		key: "parseApiParams",
		value: function parseApiParams(params, apiParams) {
			Object.assign(params, apiParams);
			var keys = (0, _lodash2["default"])(params).omit(_lodash2["default"].isUndefined).omit(_lodash2["default"].isNull).keys();
			return (0, _lodash2["default"])(keys).reduce(function (memo, key, index) {
				return memo + key + ',' + params[key] + (index === keys.length - 1 ? '' : ',');
			}, '');
		}
	}]);

	return Wykop;
})();

exports["default"] = Wykop;

var User = (function (_Wykop) {
	_inherits(User, _Wykop);

	function User(self, userkey, info) {
		_classCallCheck(this, User);

		var appkey = self.appkey;
		var secretkey = self.secretkey;
		var output = self.output;
		var format = self.format;
		var timeout = self.timeout;
		var useragent = self.useragent;

		_get(Object.getPrototypeOf(User.prototype), "constructor", this).call(this, appkey, secretkey, { output: output, format: format, timeout: timeout, useragent: useragent });

		this.userkey = userkey;
		this.info = info;
	}

	_createClass(User, [{
		key: "login",
		value: function login() {
			return; // todo
		}
	}]);

	return User;
})(Wykop);

module.exports = exports["default"];