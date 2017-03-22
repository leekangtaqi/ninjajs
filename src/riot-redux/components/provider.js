import invariant from '../util/invariant'
import riot from 'riot'

let provider = null;

function recurFindProvider(tag) {
    if(!tag.parent) return tag;
    return recurFindProvider(tag.parent);
}

export default function provide(store) {

	invariant(store, `provider expect a state store`);

	return function(entry) {
		invariant((typeof entry === 'object' && entry instanceof riot.Tag), `
			provider expect a riot tag instead of ${entry}`);
		entry.opts.store = store;
		provider = entry;
		return provider;
	}
}

export function getProvider(tag) {
	return provider || recurFindProvider(tag);
}