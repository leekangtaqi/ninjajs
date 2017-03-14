'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = invariant;
function invariant(expect, message) {
	var level = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'warn';

	if (!message) {
		message = expect;
		expect = undefined;
	}
	if (typeof expect != 'undefined') {
		if (!expect) {
			console.error(message);
		}
		return;
	}
	console[level](message);
}