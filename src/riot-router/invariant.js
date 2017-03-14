export default function invariant (expect, message, level = 'warn') {
	if (!message) {
		message = expect
		expect = undefined
	}
	if (typeof expect != 'undefined') {
		if (!expect) {
			console.error(message)
		}
		return
	}
	console[level](message)
}