const values = (o) => {
    return Object.keys(o).map(k=>o[k])
}

const mixin = (...args) => {
    return Object.assign(...args)
}

const pick = (o, ...fs) =>
    Object.keys(o)
        .filter(f => fs.indexOf(f) >= 0)
        .map(f=>({key: f, val: o[f]}))
        .reduce((acc, pair)=>{
            acc[pair.key] = pair.val;
            return acc;
        }, {})

const omit = (o, ...fs) => 
    Object.keys(o)
        .filter(f => fs.indexOf(f) < 0)
        .map(f=>({key: f, val: o[f]}))
        .reduce((acc, pair) => {
            acc[pair.key] = pair.val;
            return acc;
        }, {})
        
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

const filter = {
    ago: d => {
        if(typeof d === 'string'){
            d = new Date(d);
        }
        let distinct = parseFloat((d.getTime() - new Date().getTime()), 10);
        let isBefore = distinct < 0;
        let absDistinct = Math.abs(distinct);
        //----ningning----
        let minutesStep = Math.ceil(absDistinct/(60*1000));
        if(minutesStep < 60){
            return (isBefore ? minutesStep + '分钟前' : minutesStep + '分钟内');
        }
        let hourStep = Math.ceil(absDistinct/(3600*1000));
        if(hourStep < 24){
            return (isBefore ? hourStep + '小时前' : hourStep + '小时内');
        }
        //--------------
        let dayStep = Math.ceil(absDistinct/(24*3600*1000));
        if(dayStep < 30){
            return (isBefore ? dayStep + '天前' : dayStep + '天内');
        }
        let monthStep = Math.ceil(dayStep / 30);
        if(monthStep < 12){
            return (isBefore ? monthStep + '个月前' : monthStep + '个月内');
        }
        let yearStep = Math.ceil(monthStep / 12);
        return (isBefore ? yearStep + '年前' : yearStep + '年内');
    },
    currency: (s, prefix = true) => {
        return (prefix ? '￥' : '') + (s.toFixed(2) || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,'); 
    },
    date: function(date, fmt){
        var o = {
            "M+" : date.getMonth()+1,
            "d+" : date.getDate(),
            "h+" : date.getHours(),
            "m+" : date.getMinutes(),
            "s+" : date.getSeconds(),
            "q+" : Math.floor((date.getMonth()+3)/3),
            "S"  : date.getMilliseconds()
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    }
}

const deepEqual = (x, y) => {
  return (x && y && typeof x === 'object' && typeof y === 'object') ?
    (Object.keys(x).length === Object.keys(y).length) &&
      Object.keys(x).reduce(function(isEqual, key) {
        return isEqual && deepEqual(x[key], y[key]);
      }, true) : (x === y);
}

export default {
    values, 
    mixin, 
    querystring, 
    throttle, 
    filter, 
    clone, 
    deepEqual,
    omit,
    pick
}