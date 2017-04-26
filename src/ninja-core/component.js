import { enqueueRender } from './render-queue';

export default class Component {
	constructor(props, context) {
		this.context = context
		this.props = props
		if (!this.state) this.state = {}
	}

	linkState(key, eventPath) {
		let c = this._linkedStates || (this._linkedStates = {});
		return c[key+eventPath] || (c[key+eventPath] = createLinkedState(this, key, eventPath));
	}

	setState(state, callback) {
		let s = this.state
		if (!this.prevState) this.prevState = Object.assign({}, s)
		if (callback) (this._renderCallbacks = (this._renderCallbacks || []))
		enqueueRender(this)
	}

	forceUpdate() {
		renderComponent(this, FORCE_RENDER)
	}

	render() {
		throw new Error(`this component expected a render function.`)
	}
}