'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.view = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _riotRedux = require('../riot-redux');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var view = exports.view = function view(mapStateToOpts) {

	return function wrapWithView(WrappedComponent) {
		var View = function (_WrappedComponent) {
			_inherits(View, _WrappedComponent);

			function View() {
				_classCallCheck(this, View);

				return _possibleConstructorReturn(this, (View.__proto__ || Object.getPrototypeOf(View)).apply(this, arguments));
			}

			_createClass(View, [{
				key: 'onCreate',
				value: function onCreate(opts) {
					this.on('update', this.onUpate);
					_get(View.prototype.__proto__ || Object.getPrototypeOf(View.prototype), 'onCreate', this).call(this, opts);
				}
			}, {
				key: 'onUpate',
				value: function onUpate() {
					if (this.enterOrLeaveState === '$enter') {
						this.trigger('entered');
					} else {
						this.trigger('leaved');
					}
					delete this['enterOrLeaveState'];
				}
			}, {
				key: 'shouldUpdate',
				value: function shouldUpdate() {
					var state = _riotRedux.provider.opts.store.getState();
					if (this.isShow() || isPresent(state)) {
						if (isPresent(state) && state.lastAction.payload === this) {
							c.enterOrLeaveState = state.lastAction.type;
							_get(View.prototype.__proto__ || Object.getPrototypeOf(View.prototype), 'shouldUpdate', this).call(this);
						}
					}
					return false;
				}
			}, {
				key: 'getTagName',
				value: function getTagName() {
					return this.opts && this.opts.riotTag || this.root.localName;
				}
			}, {
				key: 'isShow',
				value: function isShow() {
					return this.opts.show || this.opts.$show;
				}
			}, {
				key: 'isPresent',
				value: function isPresent(state) {
					return state.lastAction.type === '$enter' || state.lastAction.type === '$leave';
				}
			}]);

			return View;
		}(WrappedComponent);

		return View;
	};
};