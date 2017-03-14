import { getProvider } from '../riot-redux/components/provider';
import _ from '../util';

const isShow = (views, tag) => {
	if(tag.$routePath){
		return views[tag.$routePath]
	}
	return false;
}

function hoistStatics(targetComponent, sourceComponent, customStatics) {
    const RIOT_STATICS = {
        displayName: true,
        mixins: true,
        type: true
    };

    const KNOWN_STATICS = {
        name: true,
        length: true,
        prototype: true,
        caller: true,
        arguments: true,
        arity: true
    };

    var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';

    if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
        var keys = Object.getOwnPropertyNames(sourceComponent);

        /* istanbul ignore else */
        if (isGetOwnPropertySymbolsAvailable) {
            keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
        }

        for (var i = 0; i < keys.length; ++i) {
            if (!RIOT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
                try {
                    targetComponent[keys[i]] = sourceComponent[keys[i]];
                } catch (error) {
                    console.warn("hoistStatics failed.");
                }
            }
        }
    }

    return targetComponent;
}

const getDisplayName = WrappedComponent => WrappedComponent.displayName || _.lineToCamel(WrappedComponent.originName) || 'Component';

export default function View(WrappedComponent) {
		const connectDisplayName = `View(${getDisplayName(WrappedComponent)})`;
		class View extends WrappedComponent {
			get name() {
				return _.camelToLine(super.name);
			}

			get tmpl() {
				return `
					<div if="{opts.$show}">${super.tmpl}</div>
				`
			}

			onCreate(opts) {
				this.displayName = connectDisplayName;
				let provider = getProvider(this)
				let state = provider.opts.store.getState()
				super.onCreate(opts);
				if (this.opts.force) {
					Object.defineProperties(this.opts, {
						$show: {
							get: () => {
								return true;
							}
						}
					})
				}
				this.onInit();
			}

			enter(from, to) {
				this.trigger('enter', from);
				this.opts.show = true;
				this.opts.hidden = false;
			}
			
			getStore() {
				let provider = getProvider(this)
				return provider.opts.store
			}
			onInit() {
				let store = this.getStore()
				let state = store.getState()
				store.subscribe(this.onSubscribe.bind(this))
			}
			onSubscribe(s) {
				let state = this.getStore().getState()
				let action = state.lastAction;
				if(
					View.concerns.some(a => action.type === a) && 
					// todo
					// Object.keys(state.route.$views).length > 0 &&
					action.payload === this
				){
					this.renderForView(state)
				}
				
			}

			renderForView(state){
				this.opts.$show = isShow(state.route.$views, this) || false
				this.update();
			}
		}

		View.concerns = ['$enter', '$leave'];
		View.displayName = connectDisplayName;
		View.WrappedComponent = WrappedComponent;
		hoistStatics(View, WrappedComponent)
		return View;
}