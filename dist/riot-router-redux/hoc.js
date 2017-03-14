'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

exports.default = View;

var _provider = require('../riot-redux/components/provider');

var _util = require('../util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var isShow = function isShow(views, tag) {
	if (tag.$routePath) {
		return views[tag.$routePath];
	}
	return false;
};

function hoistStatics(targetComponent, sourceComponent, customStatics) {
	var RIOT_STATICS = {
		displayName: true,
		mixins: true,
		type: true
	};

	var KNOWN_STATICS = {
		name: true,
		length: true,
		prototype: true,
		caller: true,
		arguments: true,
		arity: true
	};

	var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';

	if (typeof sourceComponent !== 'string') {
		// don't hoist over string (html) components
		var keys = Object.getOwnPropertyNames(sourceComponent);

		/* istanbul ignore else */
		if (isGetOwnPropertySymbolsAvailable) {
			keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
		}

		for (var i = 0; i < keys.length; ++i) {
			if (!RIOT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
				try {
					targetComponent[keys[i]] = sourceComponent[keys[i]];
				} catch (error) {
					console.warn("hoistStatics failed.");
				}
			}
		}
	}

	return targetComponent;
}

var getDisplayName = function getDisplayName(WrappedComponent) {
	return WrappedComponent.displayName || _util2.default.lineToCamel(WrappedComponent.originName) || 'Component';
};

function View(WrappedComponent) {
	var connectDisplayName = 'View(' + getDisplayName(WrappedComponent) + ')';

	var View = function (_WrappedComponent) {
		_inherits(View, _WrappedComponent);

		function View() {
			_classCallCheck(this, View);

			return _possibleConstructorReturn(this, (View.__proto__ || Object.getPrototypeOf(View)).apply(this, arguments));
		}

		_createClass(View, [{
			key: 'onCreate',
			value: function onCreate(opts) {
				this.displayName = connectDisplayName;
				var provider = (0, _provider.getProvider)(this);
				var state = provider.opts.store.getState();
				_get(View.prototype.__proto__ || Object.getPrototypeOf(View.prototype), 'onCreate', this).call(this, opts);
				if (this.opts.force) {
					Object.defineProperties(this.opts, {
						$show: {
							get: function get() {
								return true;
							}
						}
					});
				}
				this.onInit();
			}
		}, {
			key: 'enter',
			value: function enter(from, to) {
				this.trigger('enter', from);
				this.opts.show = true;
				this.opts.hidden = false;
			}
		}, {
			key: 'getStore',
			value: function getStore() {
				var provider = (0, _provider.getProvider)(this);
				return provider.opts.store;
			}
		}, {
			key: 'onInit',
			value: function onInit() {
				var store = this.getStore();
				var state = store.getState();
				store.subscribe(this.onSubscribe.bind(this));
			}
		}, {
			key: 'onSubscribe',
			value: function onSubscribe(s) {
				var state = this.getStore().getState();
				var action = state.lastAction;
				if (View.concerns.some(function (a) {
					return action.type === a;
				}) &&
				// todo
				// Object.keys(state.route.$views).length > 0 &&
				action.payload === this) {
					this.renderForView(state);
				}
			}
		}, {
			key: 'renderForView',
			value: function renderForView(state) {
				this.opts.$show = isShow(state.route.$views, this) || false;
				this.update();
			}
		}, {
			key: 'name',
			get: function get() {
				return _util2.default.camelToLine(_get(View.prototype.__proto__ || Object.getPrototypeOf(View.prototype), 'name', this));
			}
		}, {
			key: 'tmpl',
			get: function get() {
				return '\n\t\t\t\t\t<div if="{opts.$show}">' + _get(View.prototype.__proto__ || Object.getPrototypeOf(View.prototype), 'tmpl', this) + '</div>\n\t\t\t\t';
			}
		}]);

		return View;
	}(WrappedComponent);

	View.concerns = ['$enter', '$leave'];
	View.displayName = connectDisplayName;
	View.WrappedComponent = WrappedComponent;
	hoistStatics(View, WrappedComponent);
	return View;
}