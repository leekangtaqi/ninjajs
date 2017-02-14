import router from './router';
import Application from './application';
import { provide, connect } from './riot-redux';
import viewCreator from './view';

hub.view = viewCreator(router.hub);

router.hub.on('history-pending', (from, to) => {
		if(from && from.tag){
				from.tag.trigger('before-leave');
		}
});

router.hub.on('history-resolve', (from, to, ctx, hints, next) => {
		let fromTag = from && from.tag || null;
		let toTag = to && to.tag || null;
		hub.view.enter(toTag, fromTag);
		hub.view.leaveUpstream(toTag)
		next();
});

router.on('history-success', function (from, to) {
		// to && to.tag && to.tag.trigger('entered');
});

export { router, Application as Ninjia, provide, connect }