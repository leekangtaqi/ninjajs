'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = provide;
exports.getProvider = getProvider;

var _invariant = require('../util/invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var provider = null;

function recurFindProvider(tag) {
	if (!tag.parent) return tag;
	return recurFindProvider(tag.parent);
}

function provide(store) {

	(0, _invariant2.default)(store, 'provider expect a state store');

	return function (entry) {
		(0, _invariant2.default)((typeof entry === 'undefined' ? 'undefined' : _typeof(entry)) === 'object' && entry instanceof riot.Tag, '\n\t\t\tprovider expect a riot tag instead of ' + entry);
		entry.opts.store = store;
		provider = entry;
		return provider;
	};
}

function getProvider(tag) {
	return provider || recurFindProvider(tag);
}