'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Util = function () {
    function Util() {
        _classCallCheck(this, Util);
    }

    _createClass(Util, null, [{
        key: 'distinct',
        value: function distinct(arr) {
            var res = [];
            for (var i = 0, len = arr.length; i < len; i++) {
                var o = arr[i];
                if (res.indexOf(o) < 0) {
                    res.push(o);
                }
            }
            return res;
        }
    }, {
        key: 'genId',
        value: function genId(n) {
            var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
            var res = "";
            for (var i = 0; i < n; i++) {
                var id = Math.ceil(Math.random() * 35);
                res += chars[id];
            }
            return res;
        }
    }, {
        key: 'completePart',
        value: function completePart(uri) {
            return uri.startsWith('/') ? uri : '/' + uri;
        }
    }, {
        key: 'assert',
        value: function assert(val, msg) {
            if (!val) {
                throw new Error(msg);
            }
        }
    }, {
        key: 'omit',
        value: function omit(o) {
            var res = {};

            for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                params[_key - 1] = arguments[_key];
            }

            for (var p in o) {
                if (params.indexOf(p) < 0) {
                    res[p] = o[p];
                }
            }
            return res;
        }
    }, {
        key: 'compareUrl',
        value: function compareUrl(u1, u2) {
            var r = [];
            var arr1 = u1.split('/');
            var arr2 = u2.split('/');
            for (var i = 0, len = arr1.length; i < len; i++) {
                if (arr1[i] === arr2[i]) {
                    r.push(arr1[i]);
                } else {
                    break;
                }
            }
            return r.join('/');
        }
    }, {
        key: 'isEqual',
        value: function isEqual(o1, o2) {
            var len = Object.keys(o1).length;
            var res = 0;
            if (len != Object.keys(o2).length) {
                return false;
            }
            for (var prop in o1) {
                if (o1[prop] === o2[prop]) {
                    res++;
                }
            }
            return res === len;
        }
    }, {
        key: 'combineUriParts',
        value: function combineUriParts(parts, i, combined) {
            if (!parts.length || i <= 0) {
                return combined;
            }
            var uri = parts[i - 1] + '/' + combined;
            return Util.combineUriParts(parts, --i, uri);
        }
    }, {
        key: 'composeObject',
        value: function composeObject(ks, vs) {
            var o = {};
            if (!Array.isArray(ks) || !Array.isArray(vs) || ks.length != vs.length) {
                return o;
            }
            ks.forEach(function (k, index) {
                o[k] = vs[index];
            });
            return o;
        }
    }, {
        key: 'getParams',
        value: function getParams(fn) {
            if (typeof fn != 'function') throw new Error('Failed to get Param on ' + (typeof fn === 'undefined' ? 'undefined' : _typeof(fn)));
            var argO = fn.toString().match(/\(.*\)/).toString();
            if (argO.length <= 2) return null;
            var argArr = argO.substr(1, argO.length - 2).split(',');
            return argArr.map(function (a) {
                return a.trim();
            });
        }
    }, {
        key: 'extractParams',
        value: function extractParams(path) {
            return path.match(/_[a-zA-Z0-9:]+/g);
        }
    }, {
        key: 'toPattern',
        value: function toPattern(route) {
            return route.replace(/_[a-zA-Z0-9:]+/g, "*");
        }
    }, {
        key: 'nextTick',
        value: function nextTick(fn) {
            return setTimeout(fn, 0);
        }
    }]);

    return Util;
}();

Util.flatAndComposePrefix = function (node, res) {
    var arr = node.children;
    if (!arr) {
        return;
    }
    for (var i = 0, len = arr.length; i < len; i++) {
        var route = arr[i];
        route.path = (node.path || '') + route.path;
        route.parent = node.id || '';
        route.id = Util.genId(8);
        res.push(route);
        Util.flatAndComposePrefix(route, res);
    }
};

exports.default = Util;