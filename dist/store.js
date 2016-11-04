'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.configureStore = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

var _redux = require('redux');

var _riotRouterRedux = require('./riot-router-redux');

var _riotRouterRedux2 = _interopRequireDefault(_riotRouterRedux);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var configureStore = exports.configureStore = function configureStore() {
		var initialState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var reducers = arguments[1];
		var middlewares = arguments[2];
		var HISTORY_MODE = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'browser';

		var reducer = (0, _redux.combineReducers)(_extends({}, reducers));
		var routeMw = _riotRouterRedux2.default.routerMiddlewareCreator(HISTORY_MODE);
		return (0, _redux.compose)(_redux.applyMiddleware.apply(undefined, [routeMw].concat(_toConsumableArray(_util2.default.values(middlewares)))))(_redux.createStore)(reducer, initialState);
};