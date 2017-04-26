export let isBoolean = o => o === true || o === false
export let isNumber = o => typeof o === 'number'
export let isString = o => typeof o === 'string'
export let isFunction = o => typeof o === 'function'

/** Just a memoized String#toLowerCase */
let lcCache = {};
export const toLowerCase = s => lcCache[s] || (lcCache[s] = s.toLowerCase());

export const defer = fn => setTimeout(fn, 0)