'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var initialRouteData = {
    $prev_state: '/',
    $prev_location: '/',
    $state: '/',
    $location: '/',
    $protocol: 'http://',
    $host: typeof window != 'undefined' && location && location.host || '',
    data: {},
    stack: [],
    $views: {}
};
var route = function route() {
    var route = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialRouteData;
    var action = arguments[1];

    switch (action.type) {
        case '$enter':
            var tagName = action.payload.$routePath;;
            var newOne = _defineProperty({}, tagName, true);
            return Object.assign({}, route, {
                $views: _extends({}, route.$views, newOne)
            });
        case '$leave':
            var tagName = action.payload.$routePath;;
            return Object.assign({}, route, {
                $views: Object.keys(route.$views).filter(function (v) {
                    return v != tagName;
                }).reduce(function (o, k) {
                    o[k] = true;
                    return o;
                }, {})
            });
        case '$route':
            return Object.assign({}, route, {
                $prev_state: route.$state,
                $prev_location: route.$location,
                $state: action.payload.route.$state,
                $location: action.payload.route.$location,
                $protocol: action.payload.route.$protocol || route.$protocol,
                $host: route.$host,
                data: action.payload.route.ctx
            });
        case '$query':
            return Object.assign({}, route, {
                $prev_state: route.$state,
                $prev_location: route.$location,
                $state: route.$state,
                $location: route.$location,
                $protocol: route.$protocol,
                $host: route.$host,
                data: Object.assign({}, {
                    request: {
                        body: route.data.req.body,
                        params: route.data.req.params,
                        query: action.payload
                    }
                })
            });
        case '$routeBusy':
            return Object.assign({}, route, { busy: true });
        case '$routeUnBusy':
            return Object.assign({}, route, { busy: false });
        default:
            return route;
    }
};
exports.default = { route: route };