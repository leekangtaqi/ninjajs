import router from './router';
import Application from './application';
import { provide, connect } from './riot-redux';
import viewCreator from './view';
import { view } from './riot-router-redux';

let { hub } = router;

hub.view = viewCreator(hub);

hub.on('history-pending', (from, to) => {
		if(from && from.tag){
				from.tag.trigger('before-leave');
		}
});

hub.on('history-resolve', (from, to, ctx, hints, index, next) => {
		let fromTag = from && from.tag || null;
		let toTag = to && to.tag || null;
		hub.view.enter(toTag, fromTag);
		hub.view.leaveUpstream(toTag)
		next();
});

hub.on('history-success', (from, to) => {
		// to && to.tag && to.tag.trigger('entered');
});

export { router, Application as Ninjia, provide, connect, view }