import { provider } from '../riot-redux';

export const view = mapStateToOpts => {

	return function wrapWithView(WrappedComponent) {

		class View extends WrappedComponent{
			onCreate(opts) {
				this.on('update', this.onUpate);
				super.onCreate(opts);
			}

			onUpate() {
				if(this.enterOrLeaveState === '$enter'){
						this.trigger('entered');
				}else{
						this.trigger('leaved');
				}
				delete this['enterOrLeaveState'];
			}

			shouldUpdate() {
				let state = provider.opts.store.getState();
				if (this.isShow() || isPresent(state)) {
					if (isPresent(state) && state.lastAction.payload === this) {
								c.enterOrLeaveState = state.lastAction.type;
								super.shouldUpdate();
						}
				}
				return false;
			}

			getTagName() {
				return this.opts && this.opts.riotTag || this.root.localName; 
			}

			isShow() {
				return this.opts.show || this.opts.$show;
			}

			isPresent(state) {
				return (state.lastAction.type === '$enter' || state.lastAction.type === '$leave');
			}
		}

		return View;
	} 
} 