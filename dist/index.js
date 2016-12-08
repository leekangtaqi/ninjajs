'use strict';

Object.defineProperty(exports, "__esModule", {
		value: true
});
exports.view = exports.connect = exports.provide = exports.Ninjia = exports.router = undefined;

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

var _riotRedux = require('./riot-redux');

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

var _riotRouterRedux = require('./riot-router-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hub = _router2.default.hub;


hub.view = (0, _view2.default)(hub);

hub.on('history-pending', function (from, to) {
		if (from && from.tag) {
				from.tag.trigger('before-leave');
		}
});

hub.on('history-resolve', function (from, to, ctx, hints, index, next) {
		var fromTag = from && from.tag || null;
		var toTag = to && to.tag || null;
		hub.view.enter(toTag, fromTag);
		hub.view.leaveUpstream(toTag);
		next();
});

hub.on('history-success', function (from, to) {
		// to && to.tag && to.tag.trigger('entered');
});

exports.router = _router2.default;
exports.Ninjia = _application2.default;
exports.provide = _riotRedux.provide;
exports.connect = _riotRedux.connect;
exports.view = _riotRouterRedux.view;