const values = (o) => {
    return Object.keys(o).map(k=>o[k])
}

const mixin = (...args) => {
    return Object.assign(...args)
}

const intersect = (arr1, arr2) => {
    let res = [];
    for (let i=0, len=arr1.length; i<len; i++) {
        if (arr2.indexOf(arr1[i]) >= 0) {
            res.push(arr1[i])
        }
    }
    return res;
}

const pick = (o, ...fs) =>
    Object.keys(o)
        .filter(f => fs.indexOf(f) >= 0)
        .map(f=>({key: f, val: o[f]}))
        .reduce((acc, pair)=>{
            acc[pair.key] = pair.val;
            return acc;
        }, {})

const omit = (o, ...fs) => {
    let args = fs;
    let p1 = fs[0];
    if (Array.isArray(p1)) {
        fs = p1;
    }
    return Object.keys(o)
        .filter(f => fs.indexOf(f) < 0)
        .map(f=>({key: f, val: o[f]}))
        .reduce((acc, pair) => {
            acc[pair.key] = pair.val;
            return acc;
        }, {})
}
        
const clone = item => {
    if (!item) { return item; } // null, undefined values check

    var types = [ Number, String, Boolean ], 
        result;

    // normalizing primitives if someone did new String('aaa'), or new Number('444');
    types.forEach(function(type) {
        if (item instanceof type) {
            result = type( item );
        }
    });

    if (typeof result == "undefined") {
        if (Object.prototype.toString.call( item ) === "[object Array]") {
            result = [];
            item.forEach(function(child, index, array) { 
                result[index] = clone( child );
            });
        } else if (typeof item == "object") {
            // testing that this is DOM
            if (item.nodeType && typeof item.cloneNode == "function") {
                var result = item.cloneNode( true );    
            } else if (!item.prototype) { // check that this is a literal
                if (item instanceof Date) {
                    result = new Date(item);
                } else {
                    // it is an object literal
                    result = {};
                    for (var i in item) {
                        result[i] = clone( item[i] );
                    }
                }
            } else {
                // depending what you would like here,
                // just keep the reference, or create new object
                if (false && item.constructor) {
                    // would not advice to do that, reason? Read below
                    result = new item.constructor();
                } else {
                    result = item;
                }
            }
        } else {
            result = item;
        }
    }
    return result;
}

const querystring = {
    stringify: json => Object.keys(json).map(k=>k+'='+json[k]).join('&'),
    parse: str => str.split('&').reduce((acc, curr)=>{
        let parts = curr.split('=');
        acc[parts[0]] = parts[1];
        return acc;
    }, {})
}

let timer = null;
const throttle = (fn, wait) => {
    clearTimeout(timer);
    timer = setTimeout(()=>{
        fn.apply(context);
        timer = null;
    }, wait)
}

const deepEqual = (x, y) => {
  return (x && y && typeof x === 'object' && typeof y === 'object') ?
    (Object.keys(x).length === Object.keys(y).length) &&
      Object.keys(x).reduce(function(isEqual, key) {
        return isEqual && deepEqual(x[key], y[key]);
      }, true) : (x === y);
}

const lineToCamel = str => {
    if (!str || typeof str !== 'string') {
        throw new Error(`[util-line to camel]: expected a string`);
    }
    return str.split('-').reduce((acc, curr) => {
        let first = curr.slice(0, 1);
        let last = curr.slice(1);
        return `${acc}${first.toUpperCase()}${last}`
    }, '');
}

const camelToLine = str => {
    let res = "";
    for (let i=0, len=str.length; i<len; i++) {
        let c = str.charAt(i);
        if (/^[A-Z]+$/.test(c)) {
            if (i===0) {
                res += `${c.toLowerCase()}`;
            } else {
                res += `-${c.toLowerCase()}`;
            }
        } else {
            res += c;
        }
    }
    return res;
}

function extractField(o){
    return exclude(o,
        "$name",
        "$dirty",
        "$pristine",
        "$valid",
        "$invalid",
        "$submitted",
        "$error",
        "$ok",
        "$allPristine",
        "$allDirty",
        "$validate",
		"$meta"
    );
}

function exclude() {
    var args = [].slice.apply(arguments);
    var o = args[0];
    var props = args.slice(1);
    var res = {};
    for(var p in o){
        if(props.indexOf(p) < 0){
            res[p] = o[p]
        }
    }
    return res;
}

function hasClass(el, className) {
	if (el.classList)
		return el.classList.contains(className);
	else
		return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
	if (el.classList)
		el.classList.add(className);
	else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
	if (el.classList)
		el.classList.remove(className);
	else if (hasClass(el, className)) {
		var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
		el.className=el.className.replace(reg, ' ')
	}
}

export default {
    values, 
    mixin, 
    querystring, 
    throttle,
    clone, 
    deepEqual,
    omit,
    pick,
    camelToLine,
    lineToCamel,
    exclude,
    extractField,
    hasClass,
    addClass,
    removeClass,
    intersect
}