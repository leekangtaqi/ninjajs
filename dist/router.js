"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _riot = require('riot');

var _riot2 = _interopRequireDefault(_riot);

var _view = require('./view');

var _view2 = _interopRequireDefault(_view);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * riot router version 3.
 * updates v2:
 *  1. change route rule, delete underline when path is param.
 *  2. routes change data structure from map to array. 
 *  3. order of routes definition will become important.
 * update v3:
 *  1. add matches interface for server side rendering.
 * update v4:
 * 	1. define router in central
 *  2. remove all router-mixin expect use method
 */
var Hub = function () {
    function Hub(emitter) {
        _classCallCheck(this, Hub);

        this._root = null;
        this._view = null;
        this._busy = false;
        this._routes = [];
        this._routesMap = {};
        this._defaultRoute = null;
        this._location = null;
        this._prev = null;
        this._title = null;
        this._emitter = emitter;
    }

    _createClass(Hub, [{
        key: 'startup',
        value: function startup() {
            this._parseRoute();
            _riot2.default.route.base('/');
            _riot2.default.route(this.doRoute.bind(this));
            Util.nextTick(function () {
                _riot2.default.route.start();
                _riot2.default.route.exec();
            });
            return this;
        }

        /**
         * @param routes { Array }
         * @param location { String }
         * @returns cb
         *  query, params, components, history
         */

    }, {
        key: 'matches',
        value: function matches(_ref) {
            var routes = _ref.routes,
                location = _ref.location;

            var req = this.parse(location);
            return this.doRoute(req, routes);
        }

        /**
         * route parser
         * @param path (String)
         * @return req | null (Object | null)
         */

    }, {
        key: 'parse',
        value: function parse(path) {
            var req = {};

            var _path$split = path.split('?'),
                _path$split2 = _slicedToArray(_path$split, 2),
                uri = _path$split2[0],
                queryString = _path$split2[1];

            var prefix = null;
            if (this.location) {
                prefix = Util.compareUrl(this.location, uri);
            }
            var uriParts = uri === '' || uri === '/' ? ['/'] : uri.split('/');
            req.query = {};
            if (queryString) {
                queryString.split('&').map(function (i) {
                    return req.query[i.split('=')[0]] = i.split('=')[1];
                });
            }

            if (this.location) {
                //check state changed or not
                if (this.location === '/' + uri) {
                    //sync state
                    this.trigger('sync-state-query', req.query);
                    return null;
                }
            }

            req.hints = [];
            if (uriParts.length) {
                for (var i = 0, len = uriParts.length; i < len; i++) {
                    var part = uriParts[i];
                    if (i === 0) {
                        req.hints.push(Util.completePart(part));
                    } else {
                        if (req.hints.indexOf(part) < 0) {
                            req.hints.push(Util.combineUriParts(uriParts, i, part));
                        }
                    }
                }
            }
            if (prefix) {
                req.hints = req.hints.filter(function (hint) {
                    return hint.length > prefix.length;
                });
                if (!req.hints.length) {
                    return null;
                }
            }
            return req;
        }
    }, {
        key: '_parseRoute',
        value: function _parseRoute() {
            _riot2.default.route.parser(this.parse.bind(this));
            return this;
        }

        /**
         * route to the tag view with current context
         * @param route (Object)
         * @param ctx (Object)
         * @param redirect (Boolean)
         */

    }, {
        key: 'routeTo',
        value: function routeTo(route, ctx, hint) {
            var _this = this;

            var redirect = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
            var cb = arguments[4];

            this.busy = false;
            this.trigger('busy-resolve');
            if (redirect) {
                return _riot2.default.route(route.path);
            }

            if (!route.tag.opts['show'] && !route.tag.opts['$show'] && Util.completePart(route.path) === this.location) {
                return;
            }
            var $state = route.path;
            var $location = hint;
            this.trigger('state-change', { $state: $state, $location: $location, ctx: ctx });
            if (route.redirectTo) {
                _riot2.default.route(route.redirectTo);
                return true;
            }
            var addons = {
                hints: ctx.req.hints,
                req: ctx.req,
                route: route,
                tag: route.tag,
                $state: $state,
                $location: $location
            };
            if (route.resolve) {
                return route.resolve.apply(route.tag, [function (data) {
                    _this.routeToDone(data, ctx, addons, cb);
                }, ctx]);
            }
            this.routeToDone(null, ctx, addons, cb);
        }

        /**
         * match route rule with current uri
         * @param rule
         * @param uri
         * @return lean req (Request | Boolean)
         */

    }, {
        key: 'match',
        value: function match(rule, uri) {
            var parts = Util.distinct(rule.split('/').map(function (r) {
                return Util.completePart(r);
            }));
            var fragments = Util.distinct(uri.split('/').map(function (r) {
                return Util.completePart(r);
            }));
            if (!rule || !uri || !parts || !parts.length || !fragments || !fragments.length || fragments.length != parts.length) {
                return false;
            }

            var params = {};
            var res = parts.map(function (part, i) {
                //param placeholder
                if (part.startsWith('/:')) {
                    return { key: part.slice(1), index: i };
                }
                if (part === fragments[i]) {
                    return true;
                }
                return null;
            }).filter(function (p) {
                return p;
            });
            if (res.length != parts.length) {
                return null;
            }
            return res.filter(function (r) {
                return (typeof r === 'undefined' ? 'undefined' : _typeof(r)) === 'object';
            }).reduce(function (acc, curr) {
                acc[curr.key.slice(1)] = fragments[curr.index].slice(1);
                return acc;
            }, {});
        }

        /**
         * recursive resovle route hints
         * @param context (Object)
         * @param node (Object) riot tag
         * @param recursive level
         */

    }, {
        key: 'recurMatch',
        value: function recurMatch(ctx) {
            var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var level = arguments[2];

            var _this2 = this;

            var routes = arguments[3];
            var components = arguments[4];
            var req = ctx.req;
            var hints = req.hints;

            var hint = hints[level];
            if (!node || !hint) {
                return { ctx: ctx, components: components };
            }
            var target = null;
            var targetRoutes = routes ? routes : this.routes;

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = targetRoutes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var route = _step.value;

                    var matchRes = this.match(Util.completePart(route.path), Util.completePart(hint));
                    if (matchRes) {
                        //assign object to context
                        if (!ctx.req.params) {
                            ctx.req.params = {};
                        }
                        Object.assign(ctx.req.params, matchRes);
                        !ctx.req.body && (ctx.req.body = {});
                        Object.assign(ctx.req.body, Util.omit(route, "resolve", "redirectTo", "tag", "path", "name") || {});
                        target = route;
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            if (!target && level === hints.length) {
                if (node.defaultRoute) {
                    this.routeTo(node.defaultRoute, ctx, hint, true);
                    return { ctx: ctx, components: components.concat(target) };
                }
                console.info('404');
                this.busy = false;
                this.trigger('busy-resolve');
                return { ctx: ctx, components: components };
            }
            if (!target) {
                console.info('404');
                return this.recurMatch(ctx, node, level + 1, routes, components);
            } else {
                (function () {
                    var done = function done() {
                        var _this3 = this;

                        var outletEl = outlet.root.querySelector('div[data-tag-name="' + target.component + '"]');
                        if (!target.tag) {
                            var tag = _riot2.default.mount(outletEl, '' + target.component)[0];
                            if (tag) {
                                outlet.parent.tags[tag.opts.riotTag] = tag;
                                tag.parent = outlet.parent;
                                target.tag = tag;
                            }
                        }
                        if (target.tag) {
                            return this.routeTo(target, ctx, hint, false, function () {
                                if (hints[level + 1]) {
                                    return _this3.recurMatch(ctx, target.tag, level + 1, routes, components.concat(target));
                                }
                            });
                        }
                        return this.recurMatch(ctx, target, level + 1, routes, components.concat(target));
                    };

                    /**
                     * mounted 
                     */
                    var outlet = (node || _this2.root).tags['router-outlet'];
                    if (!outlet.root.querySelector('div')) {
                        outlet.one('$mounted', done.bind(_this2));
                    } else {
                        done.apply(_this2);
                    }
                })();
            }
        }
    }, {
        key: 'doRoute',
        value: function doRoute(req, routes) {
            var me = this;
            if (!req) {
                return;
            }
            var addons = {
                isFounded: false,
                isBreak: false
            };
            this.busy = true;
            this.trigger('busy-pending');
            var context = { req: req };
            var refinedRoutes = Util.mapToArray(this.routesMap);
            return this.recurMatch(context, this.root || {}, 0, refinedRoutes, []);
        }

        /**
         * route done callback trigger a history-pending event
         * @param data (Any)
         * @param ctx (Object)
         * @param addons (Object)
         * @param cb (Function)
         */

    }, {
        key: 'routeToDone',
        value: function routeToDone(data, ctx, _ref2, cb) {
            var hints = _ref2.hints,
                req = _ref2.req,
                route = _ref2.route,
                tag = _ref2.tag,
                $state = _ref2.$state,
                $location = _ref2.$location;

            var me = this;
            if (ctx && data) {
                !ctx.body && (ctx.body = {});
                Object.assign(ctx.body, data);
            }
            var RAFId = requestAnimationFrame(function () {
                cancelAnimationFrame(RAFId);
                RAFId = undefined;
                me.trigger('history-pending', me.prev, $state, $location, ctx, me.executeMiddlewares(tag, tag.$mws, ctx, function () {
                    me.routeSuccess(data, ctx, { hints: hints, req: req, route: route, tag: tag, $state: $state, $location: $location }, cb);
                }));
            });
        }
    }, {
        key: 'routeSuccess',
        value: function routeSuccess(data, ctx, _ref3, cb) {
            var hints = _ref3.hints,
                req = _ref3.req,
                route = _ref3.route,
                tag = _ref3.tag,
                $state = _ref3.$state,
                $location = _ref3.$location;

            var me = this;
            var from = me.getMetaDataFromRouteMap(me.location).route;
            var to = route;
            var RAFId = requestAnimationFrame(function () {
                cancelAnimationFrame(RAFId);
                RAFId = undefined;
                me.trigger('history-resolve', me.prev, to, ctx, hints, function () {
                    me.trigger('history-success', from, to);
                    me.location = $location;
                    me.prev = route;
                    cb();
                });
            });
        }

        /**
         * Exchange control flow to hub from riot router
         * @params url (String)
         * @return this
         */

    }, {
        key: 'go',
        value: function go(url) {
            var title = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            var replace = arguments[2];

            if (!title && this.title) {
                title = this.title();
            }
            _riot2.default.route(url, title, replace);
            return this;
        }
    }, {
        key: 'setTitle',
        value: function setTitle(fn) {
            this.title = fn;
        }

        /**
         * @params routeKey (String)
         */

    }, {
        key: 'getMetaDataFromRouteMap',
        value: function getMetaDataFromRouteMap(routeKey) {
            routeKey = routeKey && routeKey.startsWith('/') ? routeKey : '/' + routeKey;
            var keys = Object.keys(this.routes);
            for (var i = 0, len = keys.length; i < len; i++) {
                var k = keys[i];
                var route = this.routes[k];
                if (Util.toPattern(k) === Util.toPattern(routeKey)) {
                    var paramKeys = (Util.extractParams(k) || []).map(function (i) {
                        return i.slice(2);
                    });
                    var paramValues = (Util.extractParams(routeKey) || []).map(function (i) {
                        return i.slice(1);
                    });
                    return {
                        route: route,
                        $state: k,
                        $location: routeKey,
                        params: Util.composeObject(paramKeys, paramValues)
                    };
                }
            }
            return {
                tag: null,
                params: null
            };
        }

        /**
         * recursive execute middlewares defined in tag
         * @params component (Object) tag
         * @params mws (Array)
         * @params ctx (Object)
         * @params done (Function)
         */

    }, {
        key: 'executeMiddlewares',
        value: function executeMiddlewares(component, mws, ctx, done) {
            var me = this;
            return function nextFn() {
                if (!mws || !mws.length) {
                    return done();
                }
                mws[0].call(component, function () {
                    return me.executeMiddlewares(component, mws.slice(1), ctx, done)();
                }, ctx);
            };
        }
    }, {
        key: 'search',
        value: function search(param, value) {
            this.trigger('state-search', { param: param, value: value });
            return this;
        }

        /**
         * getters and setters
         */

    }, {
        key: 'trigger',
        value: function trigger() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return this._emitter.trigger.apply(this._emitter, args);
        }
    }, {
        key: 'on',
        value: function on() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return this._emitter.on.apply(this._emitter, args);
        }
    }, {
        key: 'off',
        value: function off() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return this._emitter.off.apply(this._emitter, args);
        }
    }, {
        key: 'one',
        value: function one() {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            return this._emitter.one.apply(this._emitter, args);
        }
    }, {
        key: 'view',
        get: function get() {
            return this._view;
        },
        set: function set(val) {
            this._view = val;
        }
    }, {
        key: 'root',
        get: function get() {
            return this._root;
        },
        set: function set(v) {
            this._root = v;
        }
    }, {
        key: 'prev',
        get: function get() {
            return this._prev;
        },
        set: function set(v) {
            this._prev = v;
        }
    }, {
        key: 'busy',
        get: function get() {
            return this._busy;
        },
        set: function set(val) {
            this._busy = val;
        }
    }, {
        key: 'title',
        get: function get() {
            return this._title;
        },
        set: function set(val) {
            this._title = val;
        }
    }, {
        key: 'routes',
        get: function get() {
            return this._routes;
        },
        set: function set(val) {
            this._routes = val;
            var routesMap = {};
            Util.flatRoutes(val, routesMap);
            Util.composePrefix(routesMap);
            this.routesMap = routesMap;
        }
    }, {
        key: 'routesMap',
        get: function get() {
            return this._routesMap;
        },
        set: function set(val) {
            this._routesMap = val;
        }
    }, {
        key: 'defaultRoute',
        get: function get() {
            return this._defaultRoute;
        },
        set: function set(val) {
            this._defaultRoute = val;
        }
    }, {
        key: 'location',
        get: function get() {
            return this._location;
        },
        set: function set(val) {
            this._location = val;
        }
    }]);

    return Hub;
}();

var Util = function () {
    function Util() {
        _classCallCheck(this, Util);
    }

    _createClass(Util, null, [{
        key: 'distinct',
        value: function distinct(arr) {
            var res = [];
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = arr[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var o = _step2.value;

                    if (res.indexOf(o) < 0) {
                        res.push(o);
                    }
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2.return) {
                        _iterator2.return();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            return res;
        }
    }, {
        key: 'mapToArray',
        value: function mapToArray(o) {
            var arr = [];
            for (var p in o) {
                arr.push(o[p]);
            }
            return arr;
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

            for (var _len5 = arguments.length, params = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
                params[_key5 - 1] = arguments[_key5];
            }

            for (var p in o) {
                if (params.indexOf(p) < 0) {
                    res[p] = o[p];
                }
            }
            return res;
        }
    }, {
        key: 'flatRoutes',
        value: function flatRoutes(route, routesMap) {
            var i = 0,
                len = route.children.length;
            for (; i < len; i++) {
                var r = route.children[i];
                r.parent = route.component;
                routesMap[r.component] = r;
                if (r.children) {
                    Util.flatRoutes(r, routesMap);
                }
            }
        }
    }, {
        key: 'composePrefix',
        value: function composePrefix(routesMap) {
            Object.keys(routesMap).map(function (routeName) {
                var route = routesMap[routeName];
                var recurPrefix = function recurPrefix(n) {
                    if (!n) {
                        return '';
                    }
                    if (n.parent) {
                        var parentRoute = routesMap[n.parent];
                        if (parentRoute && !parentRoute.pathDone) {
                            n.path = recurPrefix(parentRoute) + n.path;
                            n.pathDone = true;
                        } else {
                            n.path = parentRoute && parentRoute.path || '' + n.path;
                        }
                        return n.path;
                    }
                    return n.path;
                };
                return recurPrefix(route);
            });
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

var hub = new Hub(_riot2.default.observable());

hub.view = (0, _view2.default)(hub);

exports.default = {
    hub: hub,
    $use: function $use(fn) {
        !this.$mws && (this.$mws = []);
        this.$mws.push(fn);
    }
};