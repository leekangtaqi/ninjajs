class View {
    setHandler(callback){
        this.handler = callback;
    }

    enter(tag, from , callback){
        if(!tag){
            return;
        }
        tag.trigger('enter', from);
        tag.opts.show = true;
        tag.opts.hidden = false;
        if(this.handler){
            return this.handler('enter', tag);    
        }
        tag.update();
    }

    leaveUpstream(tag){
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
                this.leaveDownstream(t, tag);
            }
        })
        return this.leaveUpstream(tag.parent);
    }

    leaveDownstream(tag, parent){
        if (!tag) {
            return;
        }
        this.leave(tag, parent);
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
                this.leave(t, tag);
                return this.leaveDownstream(t, tag);
            }
        })
    }
    
    leave(tag, to, callback){
        if(!tag){
            return;
        }
        tag.trigger('leave', to); 
        if(tag.opts.show || tag.opts.$show){
            tag.opts.show = false;
            tag.opts.hidden = true;
            if(this.handler){
                return this.handler('leave', tag);    
            }
            tag.update();
        }
    }

    init(tag, name){
        tag.opts.hidden = true;
        tag.opts.show = false;
    }
}

const rendererCreator = router => new View(router);

export default rendererCreator;

