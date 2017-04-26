import { VNode } from './vnode'
import { isBoolean, isNumber, isString } from './util'

const stack = [];
const EMPTY_CHILDREN = [];

/** @jsx h */
export function h(nodeName, attributes, ...oChildren) {
	let children = [], child = null, vnode = null, i, lastString
	!attributes && (attributes = {})
	oChildren && oChildren.length && stack.push(oChildren)
	// functional component contains children in props
	attributes.children && stack.push(attributes.children) && delete attributes['children']

	while (stack.length) {
		if (Array.isArray(child = stack.pop())) {
			for (i = child.length; i--; ) stack.push(child[i])
		}
		else if (child != null && !isBoolean(child)) {
			if (isNumber(child)) child = String(child)
			if (isString(child) && lastString) {
				children[children.length-1] += child;
			}
			else {
				children.push(child);
				lastString = isString(child)
			}
		}
	}
	
	vnode = new VNode(nodeName, attributes, children)
	return vnode
}
