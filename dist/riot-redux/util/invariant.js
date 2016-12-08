'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = invariant;
function invariant(o, msg) {
    if (typeof o === 'undefined' || !o) {
        throw new Error(msg);
    }
}