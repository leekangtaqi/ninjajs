'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = warning;
function warning(message) {
    if (typeof console !== 'undefined' && typeof console.error === 'function') {
        console.error(message);
    }
    try {
        throw new Error(message);
    } catch (e) {}
}