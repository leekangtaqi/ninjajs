const rendererCreator = router => {

    let renderer = {
        setHandler: cb => {
            renderer.handler = cb;
        },
        enter: (tag, from, callback) => {
            if(!tag){
                return;
            }
            tag.trigger('enter', from);
            tag.opts.show = true;
            tag.opts.hidden = false;
            if(renderer.handler){
                return renderer.handler('enter', tag);    
            }
            tag.update();
        },

        leaveUpstream: tag => {
            if (!tag || !tag.parent || !tag.parent.tags || !tag.parent.tags['router-outlet']) {
                return;
            }
            let routes = tag.parent.tags['router-outlet'].routes;
            let siblings = tag.parent.tags['router-outlet'].routes.filter(r => r.tag && r.tag != tag);
            if(!siblings || !siblings.length){
                return false;
            }
            siblings.map(t => t.tag).forEach(t => {
                if (t && (t.opts.show || t.opts.$show)) {
                    renderer.leaveDownstream(t, tag);
                }
            })
            return renderer.leaveUpstream(tag.parent);
        },

        leaveDownstream: (tag, parent) => {
            if (!tag) {
                return;
            }
            renderer.leave(tag, parent);
            let outlet = tag.tags['router-outlet'];
            if(!outlet){
                return;
            }
            let routes = outlet.routes;
            if(!routes){
                return;
            }
            routes.map(r => r.tag).forEach(t => {
                if (t && t.opts.$show && !t.cache) {
                    renderer.leave(t, tag);
                    return renderer.leaveDownstream(t, tag);
                }
            })
        },

        leave: (tag, to, callback) => {
            if(!tag){
                return;
            }
            tag.trigger('leave', to); 
            if(tag.opts.show || tag.opts.$show){
                tag.opts.show = false;
                tag.opts.hidden = true;
                if(renderer.handler){
                    return renderer.handler('leave', tag);    
                }
                tag.update();
            }
        },

        init: (tag, name) => {
            tag.opts.hidden = true;
            tag.opts.show = false;
        }
    };

    router.on('history-pending', (from, to) => {
        if(from && from.tag){
            from.tag.trigger('before-leave');
        }
    });

    router.on('history-resolve', (from, to, ctx, hints, next) => {
        let fromTag = from && from.tag || null;
        let toTag = to && to.tag || null;
        renderer.enter(toTag, fromTag);
        renderer.leaveUpstream(toTag)
        next();
    });

    router.on('history-success', (from, to) => {
        // to && to.tag && to.tag.trigger('entered');
    });

    return　renderer;
};

export default rendererCreator;

