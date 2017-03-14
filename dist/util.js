"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var values = function values(o) {
    return Object.keys(o).map(function (k) {
        return o[k];
    });
};

var mixin = function mixin() {
    return Object.assign.apply(Object, arguments);
};

var intersect = function intersect(arr1, arr2) {
    var res = [];
    for (var i = 0, len = arr1.length; i < len; i++) {
        if (arr2.indexOf(arr1[i]) >= 0) {
            res.push(arr1[i]);
        }
    }
    return res;
};

var pick = function pick(o) {
    for (var _len = arguments.length, fs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        fs[_key - 1] = arguments[_key];
    }

    return Object.keys(o).filter(function (f) {
        return fs.indexOf(f) >= 0;
    }).map(function (f) {
        return { key: f, val: o[f] };
    }).reduce(function (acc, pair) {
        acc[pair.key] = pair.val;
        return acc;
    }, {});
};

var omit = function omit(o) {
    for (var _len2 = arguments.length, fs = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        fs[_key2 - 1] = arguments[_key2];
    }

    var args = fs;
    var p1 = fs[0];
    if (Array.isArray(p1)) {
        fs = p1;
    }
    return Object.keys(o).filter(function (f) {
        return fs.indexOf(f) < 0;
    }).map(function (f) {
        return { key: f, val: o[f] };
    }).reduce(function (acc, pair) {
        acc[pair.key] = pair.val;
        return acc;
    }, {});
};

var clone = function clone(item) {
    if (!item) {
        return item;
    } // null, undefined values check

    var types = [Number, String, Boolean],
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function (type) {
        if (item instanceof type) {
            result = type(item);
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call(item) === "[object Array]") {
            result = [];
            item.forEach(function (child, index, array) {
                result[index] = clone(child);
            });
        } else if ((typeof item === "undefined" ? "undefined" : _typeof(item)) == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode(true);
            } else if (!item.prototype) {
                // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = clone(item[i]);
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }
    return result;
};

var querystring = {
    stringify: function stringify(json) {
        return Object.keys(json).map(function (k) {
            return k + '=' + json[k];
        }).join('&');
    },
    parse: function parse(str) {
        return str.split('&').reduce(function (acc, curr) {
            var parts = curr.split('=');
            acc[parts[0]] = parts[1];
            return acc;
        }, {});
    }
};

var timer = null;
var throttle = function throttle(fn, wait) {
    clearTimeout(timer);
    timer = setTimeout(function () {
        fn.apply(context);
        timer = null;
    }, wait);
};

var deepEqual = function deepEqual(x, y) {
    return x && y && (typeof x === "undefined" ? "undefined" : _typeof(x)) === 'object' && (typeof y === "undefined" ? "undefined" : _typeof(y)) === 'object' ? Object.keys(x).length === Object.keys(y).length && Object.keys(x).reduce(function (isEqual, key) {
        return isEqual && deepEqual(x[key], y[key]);
    }, true) : x === y;
};

var lineToCamel = function lineToCamel(str) {
    if (!str || typeof str !== 'string') {
        throw new Error("[util-line to camel]: expected a string");
    }
    return str.split('-').reduce(function (acc, curr) {
        var first = curr.slice(0, 1);
        var last = curr.slice(1);
        return "" + acc + first.toUpperCase() + last;
    }, '');
};

var camelToLine = function camelToLine(str) {
    var res = "";
    for (var i = 0, len = str.length; i < len; i++) {
        var c = str.charAt(i);
        if (/^[A-Z]+$/.test(c)) {
            if (i === 0) {
                res += "" + c.toLowerCase();
            } else {
                res += "-" + c.toLowerCase();
            }
        } else {
            res += c;
        }
    }
    return res;
};

function extractField(o) {
    return exclude(o, "$name", "$dirty", "$pristine", "$valid", "$invalid", "$submitted", "$error", "$ok", "$allPristine", "$allDirty", "$validate", "$meta");
}

function exclude() {
    var args = [].slice.apply(arguments);
    var o = args[0];
    var props = args.slice(1);
    var res = {};
    for (var p in o) {
        if (props.indexOf(p) < 0) {
            res[p] = o[p];
        }
    }
    return res;
}

function hasClass(el, className) {
    if (el.classList) return el.classList.contains(className);else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function addClass(el, className) {
    if (el.classList) el.classList.add(className);else if (!hasClass(el, className)) el.className += " " + className;
}

function removeClass(el, className) {
    if (el.classList) el.classList.remove(className);else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className = el.className.replace(reg, ' ');
    }
}

exports.default = {
    values: values,
    mixin: mixin,
    querystring: querystring,
    throttle: throttle,
    clone: clone,
    deepEqual: deepEqual,
    omit: omit,
    pick: pick,
    camelToLine: camelToLine,
    lineToCamel: lineToCamel,
    exclude: exclude,
    extractField: extractField,
    hasClass: hasClass,
    addClass: addClass,
    removeClass: removeClass,
    intersect: intersect
};