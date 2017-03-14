import riot from 'riot';

function extractPrototypes(s) {
	let o = {};
	let excludes = ['tmpl', 'css', 'attrs'];
	for (let p in s) {
		if (excludes.indexOf(s[p]) < 0) {
			o[p] = s[p]
		}
	}
	return o;
}

export default function Component(WrappedComponent) {
	if (!WrappedComponent.originName) {
		throw new Error(`register decorator expected a origin name.`)
	}

	if (!WrappedComponent.prototype.tmpl) {
		throw new Error(`register decorator expected a template.`)
	}
	riot.tag(
		WrappedComponent.originName,
		WrappedComponent.prototype.tmpl,
		WrappedComponent.prototype.css || '',
		WrappedComponent.prototype.attrs || '',
		function componentConstructor(opts) {
			this.mixin(extractPrototypes(WrappedComponent.prototype))
			this.onCreate.apply(this, [opts]);
		}
	)
	
	return WrappedComponent;
}