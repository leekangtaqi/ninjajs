"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var validators = {};

var buildinValidators = [{
	name: "required",
	fn: function fn(val) {
		return val.trim() === "";
	}
}, {
	name: 'max',
	fn: function fn(val, expected) {
		return parseInt(val.trim(), 10) > expected;
	}
}, {
	name: 'min',
	fn: function fn(val, expected) {
		return parseInt(val.trim(), 10) < expected;
	}
}, {
	name: 'maxlength',
	fn: function fn(val, expected) {
		return val.length > expected;
	}
}, {
	name: 'minlength',
	fn: function fn(val, expected) {
		return val.length < expected;
	}
}, {
	name: 'pattern',
	fn: function fn(val, expected) {
		return !new RegExp(expected).test(val.trim());
	}
}];

/**
 * register build-in validators
 */
buildinValidators.map(function (validator) {
	registerValidators(validator.name, validator.fn);
});

function registerValidators(name, fn) {

	if (!name || typeof name != 'string') {
		throw new Error("invalid validator name [name]=" + name);
	}

	if (!fn || typeof fn != 'function') {
		throw new Error("invalid validator name [fn]=" + fn);
	}

	validators[name] = fn;
}

exports.validators = validators;
exports.registerValidators = registerValidators;