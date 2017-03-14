"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.onUse = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _riotObservable = require('riot-observable');

var _riotObservable2 = _interopRequireDefault(_riotObservable);

var _riotRoute = require('riot-route');

var _riotRoute2 = _interopRequireDefault(_riotRoute);

var _util = require('../util');

var _util2 = _interopRequireDefault(_util);

var _invariant = require('./invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _util3 = require('./util');

var _util4 = _interopRequireDefault(_util3);

var _decorators = require('./decorators');

var _decorators2 = _interopRequireDefault(_decorators);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Riot router version 4.
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

/**
 * Riot router version 5.
 * updates v5:
 *  1. deal with route mildly. save the hints previously, and then
 *    compare with current hints. no modify with no change. leave
 *    the diff old one, and enter the new come in one.
 */
var Hub = function () {
    function Hub(emitter) {
        _classCallCheck(this, Hub);

        this._root = null;
        this._busy = false;
        this._routes = [];
        this._defaultRoute = null;
        this._location = null;
        this._prev = null;
        this.state = {};
        this._title = null;
        this._emitter = emitter;
        this.refinedRoutes = [];
        this.prevHints = [];
        this.currHints = [];
        this.evtListeners = [];
    }

    _createClass(Hub, [{
        key: 'startup',
        value: function startup() {
            this._parseRoute();
            _riotRoute2.default.base('/');
            (0, _riotRoute2.default)(this.doRoute.bind(this));
            _util4.default.nextTick(function () {
                _riotRoute2.default.start();
                _riotRoute2.default.exec();
            });
            return this;
        }

        /**
         * Route parser
         * @param path {String}
         * @return req | null {Object|null}
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
                prefix = _util4.default.compareUrl(this.location, uri);
            }
            var uriParts = uri === '' || uri === '/' ? ['/'] : uri.split('/');
            req.query = {};
            if (queryString) {
                queryString.split('&').map(function (i) {
                    return req.query[i.split('=')[0]] = i.split('=')[1];
                });
            }

            // if no change, only sync state query
            // if (this.location) {
            //     //check state changed or not
            //     if (this.location === '/' + uri) {
            //         //sync state
            //         this.trigger('sync-state-query', req.query)
            //         return null;
            //     }
            // }

            req.hints = [];
            if (uriParts.length) {
                for (var i = 0, len = uriParts.length; i < len; i++) {
                    var part = uriParts[i];
                    if (i === 0) {
                        req.hints.push(_util4.default.completePart(part));
                    } else {
                        if (req.hints.indexOf(part) < 0) {
                            req.hints.push(_util4.default.combineUriParts(uriParts, i, part));
                        }
                    }
                }
            }
            return req;
        }
    }, {
        key: '_parseRoute',
        value: function _parseRoute() {
            _riotRoute2.default.parser(this.parse.bind(this));
            return this;
        }

        /**
         * @param routes {Array}
         * @param location {String}
         * @returns cb {Function}
         * query, params, components, history
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
         * Match route rule with current uri
         * @param rule {String}
         * @param uri {String}
         * @return lean req {Request|Boolean}
         */

    }, {
        key: 'match',
        value: function match(rule, uri) {
            // let parts = Util.distinct(rule.split('/').map(r => Util.completePart(r)));
            // let fragments = Util.distinct(uri.split('/').map(r => Util.completePart(r)));
            var parts = rule.split('/').map(function (r) {
                return _util4.default.completePart(r);
            });
            var fragments = uri.split('/').map(function (r) {
                return _util4.default.completePart(r);
            });
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

            var _recurMatch = this.recurMatch(context, this.root || {}, this.refinedRoutes, []),
                ctx = _recurMatch.ctx,
                components = _recurMatch.components;

            var lastComponent = components[components.length - 1];
            // route to a abstract route, redirect to default route
            if (lastComponent && lastComponent.route.abstract) {
                (0, _invariant2.default)('cannot transition to a abstract state(' + lastComponent.route.path + ')');
                return this.routeToDefault();
            }
            // set currently state
            this.currHints = components;
            this.resolveRoutes(ctx, this.currHints, this.prevHints, [], [], this.loopRouteTo.bind(this));
            // set previously state
            this.prevHints = components;
        }

        /**
         * Recursive collect route hints
         * @param context {Object}
         * @param node {Object} riot tag
         * @param routes {Object}
         * @param components {Array}
         * @param index {Number}
         */

    }, {
        key: 'recurMatch',
        value: function recurMatch(ctx) {
            var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var routes = arguments[2];
            var components = arguments[3];
            var index = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
            var req = ctx.req;
            var hints = req.hints;

            var hint = hints[index];
            var target = null;
            var targetRoutes = routes ? routes : this.routes;

            if (!hint) {
                return { components: components, ctx: ctx };
            }
            for (var i = 0, len = targetRoutes.length; i < len; i++) {
                var _route = targetRoutes[i];
                var matchRes = this.match(_util4.default.completePart(_route.path), _util4.default.completePart(hint));
                if (matchRes) {
                    if (!ctx.req.params) {
                        ctx.req.params = {};
                    }
                    Object.assign(ctx.req.params, matchRes);
                    !ctx.req.body && (ctx.req.body = {});
                    Object.assign(ctx.req.body, _util4.default.omit(_route, "resolve", "redirectTo", "tag", "path", "name") || {});
                    _route.location = _util4.default.completePart(hint);
                    components.push({
                        param: _extends({}, matchRes),
                        ctx: Object.assign({}, ctx),
                        route: _route
                    });
                    break;
                }
            }

            return this.recurMatch(ctx, node, routes, components, ++index);
        }

        /**
         * Compare previously hints and currently ones.
         * @param ctx {Object}
         * @param remainCurrHints {Array}
         * @param remainPrevHints {Array}
         * @param enters {Array}
         * @param leaves {Array}
         * @param callback {Function}
         * @param index {Number}
         */

    }, {
        key: 'resolveRoutes',
        value: function resolveRoutes(ctx, remainCurrHints, remainPrevHints, enters, leaves, callback) {
            var index = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;

            var currHint = remainCurrHints[0];
            var prevHint = remainPrevHints[0];
            // end of the curr hints ?
            if (!remainCurrHints.length) {
                if (remainPrevHints.length) {
                    leaves = leaves.concat(remainPrevHints);
                }
                return callback(enters, leaves);
            }
            if (!remainPrevHints.length) {
                // enters only
                enters = enters.concat(remainCurrHints);
                return this.resolveRoutes(ctx, [], [], enters, leaves, callback, ++index);
            } else {
                // compare
                // diff ?
                if (currHint.route.path != prevHint.route.path || !_util4.default.isEqual(currHint.param, prevHint.param)) {
                    enters.push(currHint);
                    leaves = leaves.concat(remainPrevHints);
                    return this.resolveRoutes(ctx, remainCurrHints.slice(1), [], enters, leaves, callback, ++index);
                }
                return this.resolveRoutes(ctx, remainCurrHints.slice(1), remainPrevHints.slice(1), enters, leaves, callback, ++index);
            }
        }
    }, {
        key: 'loopRouteTo',
        value: function loopRouteTo(enters, leaves) {
            var lastEnter = enters[enters.length - 1];
            var to = null;
            if (lastEnter) {
                to = lastEnter.route.tag;
            }

            if (leaves && leaves.length) {
                this.leaveTags(leaves, to);
            }

            if (!enters || !enters.length) {
                //TODO route to default
                return;
            }

            this.enterTags.apply(this, [enters, 0]);
        }
    }, {
        key: 'leaveTags',
        value: function leaveTags(leaves, to) {
            var _this = this;

            var _loop = function _loop(i, len) {
                var leave = leaves[i];
                var tag = leave.route.tag;
                if (!leave) {
                    return 'break';
                }
                if (!tag) {
                    (0, _invariant2.default)('failed to leave tag with route, [path]=' + leave.route.path);
                    return 'break';
                }
                if (!to) {
                    var toRoute = _this.refinedRoutes.filter(function (r) {
                        return r.id === leave.route.parent;
                    })[0];
                    if (toRoute) {
                        to = toRoute.tag;
                    }
                }
                tag.trigger('leave', to);
                if (leave.route.cache) {
                    if (tag.opts.show || tag.opts.$show) {
                        tag.opts.show = false;
                        tag.opts.hidden = true;
                        tag.update();
                    }
                } else {
                    tag.unmount(true);
                    tag.parent.update();
                    delete leave.route['tag'];
                }

                if (_this.handler) {
                    _this.handler('leave', tag);
                }
            };

            for (var i = leaves.length - 1, len = leaves.length; i >= 0; i--) {
                var _ret = _loop(i, len);

                if (_ret === 'break') break;
            }
        }
    }, {
        key: 'enterTags',
        value: function enterTags(enters, index) {
            var _this2 = this;

            if (!enters || !enters.length) {
                return;
            }
            var enter = enters[0];
            // for path define inline like ('/foo/bar')
            if (!enter) {
                return this.enterTags(enters.slice(1), ++index);
            }
            var route = enter.route,
                ctx = enter.ctx;
            var tag = route.tag,
                path = route.path,
                component = route.component;


            if (!enter) {
                (0, _invariant2.default)('404');
                recurEnter(enters.slice(1));
            } else {
                (function () {
                    var done = function done() {
                        var _this3 = this;

                        if (!tag || !tag.isMounted) {
                            var outletEl = null;
                            if (route.components) {
                                var componentName = ctx.req.query.component;
                                var Constr = route.components[componentName];
                                outletEl = outlet.parent.root.querySelector('div[data-tag-name="' + Constr.displayName + '"]');
                                tag = new Constr(outletEl, { parent: outlet.parent });
                                if (!Constr) {
                                    (0, _invariant2.default)('component provider expected a component.');
                                    return this.routeToDefault(true);
                                }
                            } else {
                                outletEl = outlet.parent.root.querySelector('div[data-tag-name="' + component.displayName + '"]');
                                tag = new route.component(outletEl, { parent: outlet.parent });
                            }

                            if (tag) {
                                tag.$routePath = path;
                                route.tag = tag;
                                outlet.update();
                            }
                        }

                        if (tag) {
                            return this.routeTo(route, ctx, false, index, function () {
                                _this3.enterTags.apply(_this3, [enters.slice(1), ++index]);
                            });
                        }
                    };

                    _this2.state.hint = path;
                    var outletPoint = _this2.refinedRoutes.filter(function (r) {
                        return r.id === route.parent;
                    })[0];
                    var outlet = (outletPoint && outletPoint.tag || _this2.root).tags['router-outlet'];
                    if (!outlet.$isMounted) {
                        outlet.one('$mounted', done.bind(_this2));
                    } else {
                        done.apply(_this2);
                    }
                })();
            }
        }

        /**
         * Route to the tag view with current context
         * @param route {Object}
         * @param ctx {Object}
         * @param redirect {Boolean}
         */

    }, {
        key: 'routeTo',
        value: function routeTo(route, ctx) {
            var redirect = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var _this4 = this;

            var index = arguments[3];
            var cb = arguments[4];

            this.busy = false;
            this.trigger('busy-resolve');

            if (redirect) {
                return route(route.path);
            }

            if (!route.tag.opts['show'] && !route.tag.opts['$show'] && _util4.default.completePart(route.path) === this.location) {
                return;
            }

            var $state = route.path;
            var $location = route.location;

            this.trigger('state-change', { $state: $state, $location: $location, ctx: ctx });

            if (route.redirectTo) {
                route(route.redirectTo);
                return true;
            }

            var addons = {
                hints: ctx.req.hints,
                req: ctx.req,
                route: route,
                tag: route.tag,
                $state: $state,
                $location: $location,
                index: index
            };

            if (route.resolve) {
                return route.resolve.apply(route.tag, [function (data) {
                    _this4.routeToDone(data, ctx, addons, cb);
                }, ctx]);
            }

            this.routeToDone(null, ctx, addons, cb);
        }

        /**
         * Route done callback trigger a history-pending event
         * @param data {Any}
         * @param ctx {Object}
         * @param addons {Object}
         * @param cb {Function}
         */

    }, {
        key: 'routeToDone',
        value: function routeToDone(data, ctx, _ref2, cb) {
            var _this5 = this;

            var hints = _ref2.hints,
                req = _ref2.req,
                route = _ref2.route,
                tag = _ref2.tag,
                $state = _ref2.$state,
                $location = _ref2.$location,
                index = _ref2.index;

            var me = this;
            if (ctx && data) {
                !ctx.body && (ctx.body = {});
                Object.assign(ctx.body, data);
            }

            var callbackInvokeCount = 0;
            var callback = function callback() {
                callbackInvokeCount++;
                var listeners = _this5.evtListeners.filter(function (_ref3) {
                    var evt = _ref3.evt,
                        fn = _ref3.fn;

                    if (evt === 'history-pending') {
                        return fn.toString().match(/\(.*?\)/)[0].replace('(', '').replace(')', '').split(',').length === 5;
                    }
                });
                var concernsCount = listeners.length;
                if (concernsCount === callbackInvokeCount) {
                    done();
                }
            };

            var done = function done() {
                me.executeMiddlewares(tag, tag.$mws, ctx, function () {
                    me.routeSuccess(data, ctx, { hints: hints, req: req, route: route, tag: tag, $state: $state, $location: $location, index: index }, cb);
                })();
            };

            me.trigger('history-pending', me.prev, $state, $location, ctx, callback);
        }

        /**
         * Trigger history-resolve evt to enter the tag
         * @param data {Null}
         * @param ctx {Object}
         * @param addons {Object}
         * @param callback {Function}
         */

    }, {
        key: 'routeSuccess',
        value: function routeSuccess(data, ctx, _ref4, cb) {
            var _this6 = this;

            var hints = _ref4.hints,
                req = _ref4.req,
                route = _ref4.route,
                tag = _ref4.tag,
                $state = _ref4.$state,
                $location = _ref4.$location,
                index = _ref4.index;

            var me = this;
            var callbackInvokeCount = 0;
            var callback = function callback() {
                callbackInvokeCount++;
                var listeners = _this6.evtListeners.filter(function (_ref5) {
                    var evt = _ref5.evt,
                        fn = _ref5.fn;

                    if (evt === 'history-resolve') {
                        return fn.toString().match(/\(.*?\)/)[0].replace('(', '').replace(')', '').split(',').length === 6;
                    }
                });
                var concernsCount = listeners.length;
                if (concernsCount === callbackInvokeCount) {
                    done();
                }
            };

            var done = function done() {
                tag.enter(me.prev, route, ctx);
                if (me.handler) {
                    me.handler('enter', tag);
                }
                tag.update();
                me.trigger('history-success', me.prev, route);
                me.location = $location;
                me.prev = route;
                cb();
            };
            me.trigger('history-resolve', me.prev, route, ctx, hints, index, callback);
        }
    }, {
        key: 'routeToDefault',
        value: function routeToDefault(refresh) {
            var defaultUri = this.refinedRoutes.filter(function (r) {
                return r.defaultRoute;
            })[0].path;
            if (refresh) {
                return location.href = location.origin + defaultUri;
            }
            return (0, _riotRoute2.default)(defaultUri);
        }
    }, {
        key: 'setHandler',
        value: function setHandler(callback) {
            this.handler = callback;
        }

        /**
         * Exchange control flow to hub from riot router
         * @param url (String)
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
            (0, _riotRoute2.default)(url, title, replace);
            return this;
        }
    }, {
        key: 'setTitle',
        value: function setTitle(fn) {
            this.title = fn;
        }

        /**
         * Recursive execute middlewares defined in tag
         * @param component (Object) tag
         * @param mws (Array)
         * @param ctx (Object)
         * @param done (Function)
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
        key: 'subscribe',
        value: function subscribe(evt, fn) {
            var me = this;
            this.evtListeners.push({ evt: evt, fn: fn });
            this.on(evt, fn);
            return function unSubscribe() {
                for (var i = 0, len = me.evtListeners.length; i < len; i++) {
                    var evtListener = me.evtListeners[i];
                    if (fn === evtListener.fn) {
                        me.off(evt, fn);
                        return true;
                    }
                }
                return false;
            };
        }
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
            _util4.default.flatAndComposePrefix(this.routes, this.refinedRoutes);
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

var hub = new Hub((0, _riotObservable2.default)());

exports.default = {
    hub: hub,
    $use: function $use(fn) {
        !this.$mws && (this.$mws = []);
        this.$mws.push(fn);
    }
};
var onUse = exports.onUse = _decorators2.default.onUse;