'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerValidators = undefined;

var _hoc = require('./hoc');

var _hoc2 = _interopRequireDefault(_hoc);

var _validator = require('./validator');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = _hoc2.default;
exports.registerValidators = _validator.registerValidators;