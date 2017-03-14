import riot from 'riot'; 
import { configureStore } from './store';
import riotRouterRedux from './riot-router-redux';
import router from './riot-router/router';
import { provide, connect } from './riot-redux';
import formReducer from './riot-redux-form/reducer';

class Ninjia {
	/**
	 * @param container {Object} window in browser, or global in server.
	 */
	constructor({ container, reducer, middlewares, state = {} }){
		if(!container){
			throw new Error(`a container expected.`);
		}
		this.framework = riot;
		this.container = container;
		let finalReducer = { ...reducer, ...formReducer };
		this.reducer = finalReducer;
		this.middlewares = middlewares;
		this.buildInProps = ['env', 'entry', 'context', 'mode'];
		this._mode = 'hash';
		this._store = configureStore(state, this.reducer, middlewares, this._mode);
		this.router(router);
		this._context = {
				store: this._store,
				hub: {},
				tags: {}
		};
		riot.util.tmpl.errorHandler = e => {}
		this.emitter = riot.observable({});
		container.widgets = this._widgets = {};
	}

	set(prop, val){
		this[`_${prop}`] = val;
		switch(this.accseptSet(prop)){
			case 'mode':
				var initialState = {};
				if(this.store){
					initialState = this.store.getState();
				}
				this._store = configureStore(initialState, this.reducer, this.middlewares, this._mode);
				if(this._router){
					riotRouterRedux.syncHistoryWithStore(this._router.hub, this._store);
					this.mixin('router', this._router); 
				}
			case 'context':
				this.container = this._context;
				break;
		}
	}

	accseptSet(val){
		if(this.buildInProps.indexOf(val) >= 0){
			return val;
		}
		return null;
	}

	router(router){
		this._router = router;
		router.app = this;
		riotRouterRedux.syncHistoryWithStore(this._router.hub, this._store);
		return this;
	}

	registerWidget({name, methods}){
		let components = riot.mount(name);
		let component = components[0]
		this._context.tags[name] = component;
		let upperName = name.replace(/(\w)/, v => v.toUpperCase());
		this._widgets[upperName] = {};
		methods.forEach( method => {
			this._widgets[upperName][method] = (...args) => {
				component[method].apply(component, args)
			}
		})
	}

	async start(bootstrap){
		await bootstrap();
		if(!this.entry){
			throw new Error(`application expected a entry component`);
		}
		this._router.hub.startup();
	}

	mixin(...args){
		return this.framework.mixin.apply(this.framework, args);
	}

	on(...args){
		return this.emitter.on.apply(this.emitter, args)
	}

	one(...args){
		return this.emitter.one.apply(this.emitter, args)
	}

	off(...args){
		return this.emitter.off.apply(this.emitter, args)
	}

	trigger(...args){
		return this.emitter.trigger.apply(this.emitter, args)
	}

	get container(){
		return this._container;
	}
	set container(val){
		this._container = val;
	}
	get hub(){
		return this._router.hub;
	}
	get context(){
		return this._context;
	}
	get store(){
		return this._store;
	}
	set store(val){
		this._store = val;
	}
	get mode(){
		return this._mode;
	}
	get entry(){
		return this._entry;
	}
	get env(){
		return this._env;
	}
}

const appCreator = params => new Ninjia(params);

export default appCreator;
export { connect, provide }; 