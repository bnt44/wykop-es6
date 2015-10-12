'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _ = require('lodash');
var assert = require('assert');
var md5 = require('crypto-js/md5');
var request = require('request');

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

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
		var useragent = _ref$useragent === undefined ? 'WypokAgent' : _ref$useragent;
		var userkey = _ref.userkey;
		var info = _ref.info;

		_classCallCheck(this, Wykop);

		assert(appkey && secretkey, 'appkey and secretkey cannot be null');
		_.assign(this, { appkey: appkey, secretkey: secretkey, output: output, format: format, timeout: timeout, useragent: useragent, userkey: userkey, info: info });
	}

	/**
 * exportujemy klasę Wykop
 */

	/**
 * Zmiana parametrów API w string
 * @param {Object} base 
 * @param {Object} api parametry API
 */

	_createClass(Wykop, [{
		key: 'get',

		/**
  * Tworzenie requestu do API
  * @param {string}   rtype        Nazwa zasobu np. 'Link'
  * @param {string}   rmethod      Nazwa metody np. 'Index'
  * @param {string[]} params Parametry metody np. ['14278527']
  * @param {Object}   api    Parametry api np. {page: 1}
  * @param {Object}   post   Parametry POST np. {body: 'string'}
  */
		value: function get(rtype, rmethod) {
			var _ref2 = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

			var params = _ref2.params;
			var api = _ref2.api;
			var post = _ref2.post;
			var callback = arguments.length <= 3 || arguments[3] === undefined ? Function.prototype : arguments[3];

			assert(rtype && rmethod, 'rtype and rmethod must be String and cannot be null');

			var appkey = this.appkey;
			var secretkey = this.secretkey;
			var userkey = this.userkey;
			var output = this.output;
			var format = this.format;
			var timeout = this.timeout;
			var useragent = this.useragent;

			var _params = !_(params).isEmpty() ? params.join('/') + '/' : ''; // zmiana tablicy z parametrami metody w string
			var _api = Wykop.parseApi({ appkey: appkey, userkey: userkey, output: output, format: format }, api); // zmiana obiektu z parametrami api w string

			var _Wykop$parsePostParams = Wykop.parsePostParams(post);

			var form = _Wykop$parsePostParams.form;
			var formData = _Wykop$parsePostParams.formData;
			var sortedPost = _Wykop$parsePostParams.sortedPost;
			// parsowanie parametrów POST

			// tworzymy url zapytania
			var url = 'http://a.wykop.pl/' + rtype + '/' + rmethod + '/' + _params + _api;

			var options = {
				url: url,
				method: !_(post).isEmpty() ? 'POST' : 'GET',
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
			return new _Promise(function (resolve, reject) {
				request(options, function (error, response, body) {

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
	}, {
		key: 'login',
		value: function login(accountkey) {
			var callback = arguments.length <= 1 || arguments[1] === undefined ? f : arguments[1];

			assert(accountkey, 'accountkey cannot be null');
			var appkey = this.appkey;
			var secretkey = this.secretkey;
			var output = this.output;
			var format = this.format;
			var timeout = this.timeout;
			var useragent = this.useragent;

			return this.get('User', 'Login', { post: { accountkey: accountkey } }).then(function (res) {
				var userkey = res.userkey;
				var user = new Wykop(appkey, secretkey, { output: output, format: format, timeout: timeout, useragent: useragent, userkey: userkey, info: res });
				callback(null, user);
				return _Promise.resolve(user);
			});
		}
	}], [{
		key: 'parseApi',
		value: function parseApi(base, api) {
			_.assign(base, api);
			var keys = _(base).omit(_.isUndefined).omit(_.isNull).keys();
			return _(keys).reduce(function (memo, key, index) {
				return memo + key + ',' + base[key] + (index === keys.length - 1 ? '' : ',');
			}, '');
		}
	}, {
		key: 'parsePostParams',
		value: function parsePostParams() {
			var post = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			var form = undefined,
			    formData = undefined,
			    sortedPost = undefined;

			if (post.embed && typeof post.embed !== 'string') {
				formData = post;
				sortedPost = (function () {
					var _post = _.omit(post, 'embed');
					return _(_post).omit(_.isUndefined).omit(_.isNull).sortBy(function (val, key) {
						return key;
					}).toString();
				})();
			} else if (!_(post).isEmpty()) {
				form = post;
				sortedPost = _(post).omit(_.isUndefined).omit(_.isNull).sortBy(function (val, key) {
					return key;
				}).toString();
			} else {
				sortedPost = '';
			}
			return { form: form, formData: formData, sortedPost: sortedPost };
		}
	}]);

	return Wykop;
})();

module.exports = Wykop;