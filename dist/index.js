'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = exports.provide = exports.Ninjia = exports.router = undefined;

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _application = require('./application');

var _application2 = _interopRequireDefault(_application);

var _riotRedux = require('./riot-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.router = _router2.default;
exports.Ninjia = _application2.default;
exports.provide = _riotRedux.provide;
exports.connect = _riotRedux.connect;