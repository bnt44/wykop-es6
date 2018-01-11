'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _ = require('lodash');
var assert = require('assert');
var crypto = require('crypto');
var doRequest = require('request');
var _Promise = require('bluebird');

// create md5 hash
function md5() {
	var string = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

	return crypto.createHash('md5').update(new Buffer(string, 'utf-8')).digest("hex");
}

var Wykop = function () {

	/**
 * @param {string} appkey    Klucz API
 * @param {string} secretkey Sekret aplikacji
 * @param {string} output    W przypadku, gdy aplikacja docelowa nie potrafi obsłużyć pól zawierających kod HTML należy użyć parametru API output o wartości "clear"
 * @param {string} format    domyślnie "JSON", dostępne opcje: "JSONP" lub "XML"
 * @param {number} timeout   czas (w ms) oczekiwania na odpowiedź serwera wykopu, domyślnie 30000ms (30 sekund)
 * @param {string} useragent Useragent pod jakim przedstawiamy się serwerowi
 * @param {boolean} ssl Jezeli true requesty będą wysyłane pod szyfrowany adres
 */
	function Wykop(appkey, secretkey) {
		var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
		    output = _ref.output,
		    format = _ref.format,
		    _ref$timeout = _ref.timeout,
		    timeout = _ref$timeout === undefined ? 30000 : _ref$timeout,
		    _ref$useragent = _ref.useragent,
		    useragent = _ref$useragent === undefined ? 'WypokAgent' : _ref$useragent,
		    _ref$ssl = _ref.ssl,
		    ssl = _ref$ssl === undefined ? false : _ref$ssl,
		    accountkey = _ref.accountkey,
		    userkey = _ref.userkey,
		    _ref$autologin = _ref.autologin,
		    autologin = _ref$autologin === undefined ? false : _ref$autologin,
		    _ref$retryCount = _ref.retryCount,
		    retryCount = _ref$retryCount === undefined ? 1 : _ref$retryCount;

		_classCallCheck(this, Wykop);

		assert(appkey && secretkey, 'appkey and secretkey cannot be null');
		_.assign(this, { appkey: appkey, secretkey: secretkey, output: output, format: format, timeout: timeout, useragent: useragent, ssl: ssl, accountkey: accountkey, userkey: userkey, autologin: autologin, retryCount: retryCount });

		this._errLoginCount = 0;
	}

	/**
 * Zmiana parametrów API w string
 * @param {Object} base
 * @param {Object} api parametry API
 */


	_createClass(Wykop, [{
		key: 'request',


		/**
  * Tworzenie requestu do API
  * @param {string}   rtype        Nazwa zasobu np. 'Link'
  * @param {string}   rmethod      Nazwa metody np. 'Index'
  * @param {string[]} params       Parametry metody np. ['14278527']
  * @param {Object}   api          Parametry api np. {page: 1}
  * @param {Object}   post         Parametry POST np. {body: 'string'}
  */
		value: function request(rtype, rmethod) {
			var _this = this;

			var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
			    params = _ref2.params,
			    api = _ref2.api,
			    post = _ref2.post;

			var callback = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Function.prototype;

			assert(rtype && rmethod, 'rtype and rmethod must be String and cannot be null');
			//console.log('request: ' + rtype + ' ' + rmethod);
			var appkey = this.appkey,
			    secretkey = this.secretkey,
			    userkey = this.userkey,
			    output = this.output,
			    format = this.format,
			    timeout = this.timeout,
			    useragent = this.useragent,
			    ssl = this.ssl;


			var _params = !_(params).isEmpty() ? params.join('/') + '/' : ''; // zmiana tablicy z parametrami metody w string
			var _api = Wykop.parseApi({ appkey: appkey, userkey: userkey, output: output, format: format }, api); // zmiana obiektu z parametrami api w string

			var _Wykop$parsePostParam = Wykop.parsePostParams(post),
			    form = _Wykop$parsePostParam.form,
			    formData = _Wykop$parsePostParam.formData,
			    sortedPost = _Wykop$parsePostParam.sortedPost; // parsowanie parametrów POST

			// tworzymy url zapytania


			var protocol = ssl ? 'https' : 'http';
			var url = protocol + '://a.wykop.pl/' + rtype + '/' + rmethod + '/' + _params + _api;
			var method = !_(post).isEmpty() ? 'POST' : 'GET';
			var apisign = md5(secretkey + url + sortedPost);

			var options = {
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
			return new _Promise(function (resolve, reject) {
				doRequest(options, function (error, response, body) {
					if (error) {
						callback(error);
						reject(error);
					} else if (!(response.statusCode >= 200 && response.statusCode < 300)) {
						callback(response);
						reject(response);
					} else if (body.error) {
						var code = body.error.code;
						if ((code === 11 || code === 12 || code === 13) && _this.autologin && _this._errLoginCount < _this.retryCount) {
							_this._errLoginCount++;
							_this.login(undefined, function (err, res) {
								_this.request(rtype, rmethod, { params: params, api: api, post: post }, callback).then(function (res) {
									resolve(res);
								}).catch(function (err) {
									reject(err);
								});
							});
						} else {
							callback(body);
							reject(body);
						}
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

	}, {
		key: 'login',
		value: function login() {
			var _this2 = this;

			var accountkey = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.accountkey;
			var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Function.prototype;

			assert(accountkey, 'accountkey cannot be null');
			return this.request('User', 'Login', { post: { accountkey: accountkey } }).then(function (res) {
				_this2._errLoginCount = 0;
				// po zalogowaniu zapisujemy w instancji klasy Wykop parametry accountkey, userkey i info
				_this2.accountkey = accountkey;
				_this2.userkey = res.userkey;
				_this2.info = res; // obiekt, informaje o userze
				callback(null, res);
				return _Promise.resolve(res);
			});
		}
	}], [{
		key: 'parseApi',
		value: function parseApi(base, api) {
			var keys = void 0;
			_.assign(base, api);
			keys = _(base).omit(_.isUndefined).omit(_.isNull).keys();
			return _(keys).reduce(function (memo, key, index) {
				return memo + key + ',' + base[key] + (index === keys.length - 1 ? '' : ',');
			}, '');
		}
	}, {
		key: 'parsePostParams',
		value: function parsePostParams() {
			var post = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

			var form = void 0,
			    formData = void 0,
			    sortedPost = void 0;
			if (post.embed && typeof post.embed !== 'string') {
				formData = post;
				post = _.omit(post, 'embed');
			} else if (!_(post).isEmpty()) {
				form = post;
			}
			sortedPost = _(post).omit(_.isUndefined).omit(_.isNull).sortBy(function (val, key) {
				return key;
			}).toString();
			return { form: form, formData: formData, sortedPost: sortedPost };
		}
	}]);

	return Wykop;
}();

/**
* exportujemy klasę Wykop
*/


module.exports = Wykop;