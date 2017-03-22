import riot from 'riot'
import { configureStore } from './store'
import riotRouterRedux from './riot-router-redux'
import router from './riot-router/router'
import { provider, connect } from './riot-redux'
import formReducer from './riot-redux-form/reducer'
import _ from './util'

class Ninjia {
	/**
	 * @param container {Object} window in browser, or global in server.
	 */
	constructor({ container, reducer = {}, middlewares = {}, state = {} }){
		if(!container){
			throw new Error(`a container expected.`);
		}
		this.framework = riot;
		this.container = container;
		let finalReducer = { ...reducer, ...formReducer };
		this.reducer = finalReducer;
		this.middlewares = middlewares;
		this.buildInProps = ['env', 'entry', 'context', 'mode', 'routes'];
		this._mode = 'hash';
		this._store = configureStore(state, this.reducer, middlewares, this._mode);
		this.router(router);
		this._context = {
				store: this._store,
				hub: router.hub,
				tags: {}
		};
		riot.util.tmpl.errorHandler = e => {}
		this.emitter = riot.observable({});
		container.widgets = this._widgets = {};
	}

	set(prop, val){
		switch(this.accseptSet(prop)){

			case 'mode':
				this[`_${prop}`] = val;
				var initialState = {};
				if(this.store){
					initialState = this.store.getState();
				}
				this._store = configureStore(initialState, this.reducer, this.middlewares, this._mode);
				if(this._router){
					riotRouterRedux.syncHistoryWithStore(this._router.hub, this._store);
					this.mixin('router', this._router); 
				}
				break;

			case 'context':
				_.mixin(this._context, val)
				break;

			case 'routes':
				if (!this._router || !this._router.hub) {
					throw new Error(`ninjia compose routes expected a router hub.`)
				}
				this._router.hub.routes = val
				this.router(this._router)
				break;

			case 'entry':
				this[`_${prop}`] = val;
				this.hub.root = val
				// set provider for redux.
				provider(this.store)(val)
				break;

			default:
				this[`_${prop}`] = val;
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
		if (!bootstrap || typeof bootstrap != 'function') {
			throw new Error(`application start expected a callback`);
		}
		if (!this._router) {
			throw new Error(`application start expected routes`);
		}
		await bootstrap();
		if (!this.entry) {
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

	trigger(...args) {
		return this.emitter.trigger.apply(this.emitter, args)
	}

	get container() {
		return this._container;
	}

	set container(val) {
		this._container = val;
	}

	get hub() {
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

const appCreator = params => new Ninjia(params)
const uiLib = riot

appCreator.Component = riot.Tag

export default appCreator
export { connect, provider, uiLib }