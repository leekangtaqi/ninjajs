import router, { onUse } from './ninja-router/router'
import Component from './ninja-tag'
import Application, { uiLib } from './application'
import { provider, Connect } from './ninja-redux'
import { View } from './ninja-router-redux'
import Form from './ninja-redux-form'
import route from 'riot-route'

let { hub } = router;

hub.subscribe('history-pending', (from, to, location, ctx, next) => {
	if(from && from.tag){
		from.tag.trigger('before-leave');
	}
	next();
});

hub.subscribe('history-resolve', (from, to, ctx, hints, index, next) => {
	next();
});

hub.on('history-success', (from, to) => {
	// to && to.tag && to.tag.trigger('entered');
});

hub.setHandler(function handler(direction, tag){
	if (!router.app) {
		console.warn(`
			router hub expected a handler.
			plz invoke [app.router] to set the handler to hub.
		`);
		return;
	}
	let actionType =  direction === 'enter' ? '$enter' : '$leave';
	router.app.store.dispatch({type: actionType, payload: tag})
})

export { 
	Component, 
	router, 
	Application as Ninja, 
	provider, 
	Connect, 
	View, 
	Form,
	onUse,
	route,
	uiLib
}