'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = Component;

var _riot = require('riot');

var _riot2 = _interopRequireDefault(_riot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function extractPrototypes(s) {
	var o = {};
	var excludes = ['tmpl', 'css', 'attrs'];
	for (var p in s) {
		if (excludes.indexOf(s[p]) < 0) {
			o[p] = s[p];
		}
	}
	return o;
}

function Component(WrappedComponent) {
	if (!WrappedComponent.originName) {
		throw new Error('register decorator expected a origin name.');
	}

	if (!WrappedComponent.prototype.tmpl) {
		throw new Error('register decorator expected a template.');
	}
	_riot2.default.tag(WrappedComponent.originName, WrappedComponent.prototype.tmpl, WrappedComponent.prototype.css || '', WrappedComponent.prototype.attrs || '', function componentConstructor(opts) {
		this.mixin(extractPrototypes(WrappedComponent.prototype));
		this.onCreate.apply(this, [opts]);
	});

	return WrappedComponent;
}