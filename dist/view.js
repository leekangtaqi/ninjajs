'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var rendererCreator = function rendererCreator(router) {

    var renderer = {
        setHandler: function setHandler(cb) {
            renderer.handler = cb;
        },
        enter: function enter(tag, from, callback) {
            if (!tag) {
                return;
            }
            tag.trigger('enter', from);
            tag.opts.show = true;
            tag.opts.hidden = false;
            if (renderer.handler) {
                return renderer.handler('enter', tag);
            }
            tag.update();
        },

        leaveUpstream: function leaveUpstream(tag) {
            if (!tag || !tag.parent || !tag.parent.tags) {
                return;
            }
            Object.keys(tag.parent.tags).map(function (k) {
                return tag.parent.tags[k];
            }).filter(function (t) {
                return t != tag;
            }).forEach(function (t) {
                if (t && t.opts.show) {
                    renderer.leaveDownstream(t, tag);
                }
            });
            return renderer.leaveUpstream(tag.parent);
        },

        leaveDownstream: function leaveDownstream(tag, parent) {
            if (!tag) {
                return;
            }
            renderer.leave(tag, parent);
            if (tag.tags && Object.keys(tag.tags).length) {
                Object.keys(tag.tags).forEach(function (tagName) {
                    var t = tag.tags[tagName];
                    if (t && t.opts.show && !t.cache) {
                        renderer.leave(t, tag);
                        return renderer.leaveDownstream(t, tag);
                    }
                });
            }
        },

        leave: function leave(tag, to, callback) {
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
        },

        init: function init(tag, name) {
            tag.opts.hidden = true;
            tag.opts.show = false;
        }
    };

    router.on('history-pending', function (from, to) {
        if (from && from.tag) {
            from.tag.trigger('before-leave');
        }
    });

    router.on('history-resolve', function (from, to, ctx, hints, next) {
        var fromTag = from && from.tag || null;
        var toTag = to && to.tag || null;
        renderer.enter(toTag, fromTag);
        renderer.leaveUpstream(toTag);
        next();
    });

    router.on('history-success', function (from, to) {
        to && to.tag && to.tag.trigger('entered');
    });

    return renderer;
};

exports.default = rendererCreator;