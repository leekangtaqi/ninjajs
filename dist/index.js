'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.onUse = exports.Form = exports.View = exports.Connect = exports.provider = exports.Ninjia = exports.router = exports.Component = undefined;

var _router = require('./riot-router/router');

var _router2 = _interopRequireDefault(_router);

var _riotTag = require('./riot-tag');

var _riotTag2 = _interopRequireDefault(_riotTag);

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

var _riotRedux = require('./riot-redux');

var _riotRouterRedux = require('./riot-router-redux');

var _riotReduxForm = require('./riot-redux-form');

var _riotReduxForm2 = _interopRequireDefault(_riotReduxForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hub = _router2.default.hub;


hub.subscribe('history-pending', function (from, to, location, ctx, next) {
	if (from && from.tag) {
		from.tag.trigger('before-leave');
	}
	next();
});

hub.subscribe('history-resolve', function (from, to, ctx, hints, index, next) {
	next();
});

hub.on('history-success', function (from, to) {
	// to && to.tag && to.tag.trigger('entered');
});

hub.setHandler(function handler(direction, tag) {
	if (!_router2.default.app) {
		console.warn('\n\t\t\trouter hub expected a handler.\n\t\t\tplz invoke [app.router] to set the handler to hub.\n\t\t');
		return;
	}
	var actionType = direction === 'enter' ? '$enter' : '$leave';
	_router2.default.app.store.dispatch({ type: actionType, payload: tag });
});

exports.Component = _riotTag2.default;
exports.router = _router2.default;
exports.Ninjia = _application2.default;
exports.provider = _riotRedux.provider;
exports.Connect = _riotRedux.Connect;
exports.View = _riotRouterRedux.View;
exports.Form = _riotReduxForm2.default;
exports.onUse = _router.onUse;