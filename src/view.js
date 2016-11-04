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
            if(!tag || !tag.parent || !tag.parent.tags){
                return;
            }
            Object.keys(tag.parent.tags)
            .map(k => tag.parent.tags[k])
            .filter(t => t != tag)
            .forEach(t => {
                if(t && t.opts.show){
                    renderer.leaveDownstream(t, tag)
                }
            }); 
            return renderer.leaveUpstream(tag.parent);
        },

        leaveDownstream: (tag, parent) => {
            if(!tag){
                return;
            }
            renderer.leave(tag, parent);
            if(tag.tags && Object.keys(tag.tags).length){
                Object.keys(tag.tags).forEach(tagName => {
                    let t = tag.tags[tagName];
                    if(t && t.opts.show && !t.cache){
                        renderer.leave(t, tag);
                        return renderer.leaveDownstream(t, tag)
                    }
                })
            }
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
        to && to.tag && to.tag.trigger('entered');
    });

    return　renderer;
};

export default rendererCreator;

