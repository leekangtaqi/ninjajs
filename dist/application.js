'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.provider = exports.connect = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _riot = require('riot');

var _riot2 = _interopRequireDefault(_riot);

var _store = require('./store');

var _riotRouterRedux = require('./riot-router-redux');

var _riotRouterRedux2 = _interopRequireDefault(_riotRouterRedux);

var _router2 = require('./riot-router/router');

var _router3 = _interopRequireDefault(_router2);

var _riotRedux = require('./riot-redux');

var _reducer = require('./riot-redux-form/reducer');

var _reducer2 = _interopRequireDefault(_reducer);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Ninjia = function () {
	/**
  * @param container {Object} window in browser, or global in server.
  */
	function Ninjia(_ref) {
		var container = _ref.container,
		    reducer = _ref.reducer,
		    middlewares = _ref.middlewares,
		    _ref$state = _ref.state,
		    state = _ref$state === undefined ? {} : _ref$state;

		_classCallCheck(this, Ninjia);

		if (!container) {
			throw new Error('a container expected.');
		}
		this.framework = _riot2.default;
		this.container = container;
		var finalReducer = _extends({}, reducer, _reducer2.default);
		this.reducer = finalReducer;
		this.middlewares = middlewares;
		this.buildInProps = ['env', 'entry', 'context', 'mode', 'routes'];
		this._mode = 'hash';
		this._store = (0, _store.configureStore)(state, this.reducer, middlewares, this._mode);
		this.router(_router3.default);
		this._context = {
			store: this._store,
			hub: _router3.default.hub,
			tags: {}
		};
		_riot2.default.util.tmpl.errorHandler = function (e) {};
		this.emitter = _riot2.default.observable({});
		container.widgets = this._widgets = {};
	}

	_createClass(Ninjia, [{
		key: 'set',
		value: function set(prop, val) {
			switch (this.accseptSet(prop)) {

				case 'mode':
					this['_' + prop] = val;
					var initialState = {};
					if (this.store) {
						initialState = this.store.getState();
					}
					this._store = (0, _store.configureStore)(initialState, this.reducer, this.middlewares, this._mode);
					if (this._router) {
						_riotRouterRedux2.default.syncHistoryWithStore(this._router.hub, this._store);
						this.mixin('router', this._router);
					}
					break;

				case 'context':
					_util2.default.mixin(this._context, val);
					break;

				case 'routes':
					if (!this._router || !this._router.hub) {
						throw new Error('ninjia compose routes expected a router hub.');
					}
					this._router.hub.routes = val;
					this.router(this._router);
					break;

				case 'entry':
					this['_' + prop] = val;
					this.hub.root = val;
					// set provider for redux.
					(0, _riotRedux.provider)(this.store)(val);
					break;

				default:
					this['_' + prop] = val;
			}
		}
	}, {
		key: 'accseptSet',
		value: function accseptSet(val) {
			if (this.buildInProps.indexOf(val) >= 0) {
				return val;
			}
			return null;
		}
	}, {
		key: 'router',
		value: function router(_router) {
			this._router = _router;
			_router.app = this;
			_riotRouterRedux2.default.syncHistoryWithStore(this._router.hub, this._store);
			return this;
		}
	}, {
		key: 'registerWidget',
		value: function registerWidget(_ref2) {
			var _this = this;

			var name = _ref2.name,
			    methods = _ref2.methods;

			var components = _riot2.default.mount(name);
			var component = components[0];
			this._context.tags[name] = component;
			var upperName = name.replace(/(\w)/, function (v) {
				return v.toUpperCase();
			});
			this._widgets[upperName] = {};
			methods.forEach(function (method) {
				_this._widgets[upperName][method] = function () {
					for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					component[method].apply(component, args);
				};
			});
		}
	}, {
		key: 'start',
		value: function () {
			var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(bootstrap) {
				return regeneratorRuntime.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
								_context.next = 2;
								return bootstrap();

							case 2:
								if (this.entry) {
									_context.next = 4;
									break;
								}

								throw new Error('application expected a entry component');

							case 4:
								this._router.hub.startup();

							case 5:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this);
			}));

			function start(_x) {
				return _ref3.apply(this, arguments);
			}

			return start;
		}()
	}, {
		key: 'mixin',
		value: function mixin() {
			for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
				args[_key2] = arguments[_key2];
			}

			return this.framework.mixin.apply(this.framework, args);
		}
	}, {
		key: 'on',
		value: function on() {
			for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
				args[_key3] = arguments[_key3];
			}

			return this.emitter.on.apply(this.emitter, args);
		}
	}, {
		key: 'one',
		value: function one() {
			for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
				args[_key4] = arguments[_key4];
			}

			return this.emitter.one.apply(this.emitter, args);
		}
	}, {
		key: 'off',
		value: function off() {
			for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
				args[_key5] = arguments[_key5];
			}

			return this.emitter.off.apply(this.emitter, args);
		}
	}, {
		key: 'trigger',
		value: function trigger() {
			for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
				args[_key6] = arguments[_key6];
			}

			return this.emitter.trigger.apply(this.emitter, args);
		}
	}, {
		key: 'container',
		get: function get() {
			return this._container;
		},
		set: function set(val) {
			this._container = val;
		}
	}, {
		key: 'hub',
		get: function get() {
			return this._router.hub;
		}
	}, {
		key: 'context',
		get: function get() {
			return this._context;
		}
	}, {
		key: 'store',
		get: function get() {
			return this._store;
		},
		set: function set(val) {
			this._store = val;
		}
	}, {
		key: 'mode',
		get: function get() {
			return this._mode;
		}
	}, {
		key: 'entry',
		get: function get() {
			return this._entry;
		}
	}, {
		key: 'env',
		get: function get() {
			return this._env;
		}
	}]);

	return Ninjia;
}();

var appCreator = function appCreator(params) {
	return new Ninjia(params);
};

exports.default = appCreator;
exports.connect = _riotRedux.connect;
exports.provider = _riotRedux.provider;