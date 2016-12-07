'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var View = function () {
    function View() {
        _classCallCheck(this, View);
    }

    _createClass(View, [{
        key: 'setHandler',
        value: function setHandler(callback) {
            this.handler = cb;
        }
    }, {
        key: 'enter',
        value: function enter(tag, from, callback) {
            if (!tag) {
                return;
            }
            tag.trigger('enter', from);
            tag.opts.show = true;
            tag.opts.hidden = false;
            if (this.handler) {
                return this.handler('enter', tag);
            }
            tag.update();
        }
    }, {
        key: 'leaveUpstream',
        value: function leaveUpstream(tag) {
            var _this = this;

            if (!tag || !tag.parent || !tag.parent.tags || !tag.parent.tags['router-outlet']) {
                return;
            }
            var routes = tag.parent.tags['router-outlet'].routes;
            var siblings = tag.parent.tags['router-outlet'].routes.filter(function (r) {
                return r.tag && r.tag != tag;
            });
            if (!siblings || !siblings.length) {
                return false;
            }
            siblings.map(function (t) {
                return t.tag;
            }).forEach(function (t) {
                if (t && (t.opts.show || t.opts.$show)) {
                    _this.leaveDownstream(t, tag);
                }
            });
            return this.leaveUpstream(tag.parent);
        }
    }, {
        key: 'leaveDownstream',
        value: function leaveDownstream(tag, parent) {
            var _this2 = this;

            if (!tag) {
                return;
            }
            this.leave(tag, parent);
            var outlet = tag.tags['router-outlet'];
            if (!outlet) {
                return;
            }
            var routes = outlet.routes;
            if (!routes) {
                return;
            }
            routes.map(function (r) {
                return r.tag;
            }).forEach(function (t) {
                if (t && t.opts.$show && !t.cache) {
                    _this2.leave(t, tag);
                    return _this2.leaveDownstream(t, tag);
                }
            });
        }
    }, {
        key: 'leave',
        value: function leave(tag, to, callback) {
            if (!tag) {
                return;
            }
            tag.trigger('leave', to);
            if (tag.opts.show || tag.opts.$show) {
                tag.opts.show = false;
                tag.opts.hidden = true;
                if (renderer.handler) {
                    return renderer.handler('leave', tag);
                }
                tag.update();
            }
        }
    }, {
        key: 'init',
        value: function init(tag, name) {
            tag.opts.hidden = true;
            tag.opts.show = false;
        }
    }]);

    return View;
}();

var rendererCreator = function rendererCreator(router) {
    return new View(router);
};

exports.default = rendererCreator;