/**
 *  Entry of application.
 */
let provider = null;
let debug = false;

/**
 *  Set polyfill.
 */
class TagContainerProxy {
    constructor(){
        this.container = [];
        this.modern = false;
    }
    del(tag){
        if(this.modern === true){
            return this.container.delete.apply(this.container, [tag]);
        }
        if(!tag['_riot_redux_id']){
            throw new Error(`delete tag from container expected a identity`);
        }
        this.container = this.container.filter(t => t['_riot_redux_id'] != tag['_riot_redux_id']);
        return this;
    }
    add(tag){
        if(this.modern === true){
            return this.container.add.apply(this.container, [tag]);
        }
        if(tag['_riot_redux_id'] && this.container.indexOf(tag) >= 0){
            return;
        }
        tag['_riot_redux_id'] = this.genIdentity(16);
        this.container.push(tag);
        return this;
    }
    genIdentity(n){
        let chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        let res = '';
        for(let i = 0; i < n ; i ++) {
            let id = Math.ceil(Math.random()*35);
            res += chars[id];
        }
        return res;
    }
    loop(fn){
        if(this.modern === true){
            for(let i=0, len=this.container.length; i<len; i++){
                let c = this.container[i]
                fn(c);
            }
            return;
        }
        this.container.forEach(fn);
        return this;
    }
    get(tag){
        if(this.modern === true){
            return this.container.get(tag);
        }
        return Object.keys(this.container).filter(k => this.container[k] === tag)[0];
    }
}

/**
 *  Array.from polyfill
 */
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    return function from(arrayLike/*, mapFn, thisArg */) {
      var C = this;
      var items = Object(arrayLike);
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }
      var len = toLength(items.length);
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);
      var k = 0;
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      A.length = len;
      return A;
    };
  }());
}

/**
 *  Contain all containers of tag.
 *  when state is changed, mapStateToOpts will be recompute.
 *  tag will be update, when current result of recompute modified.
 */
let containers = new TagContainerProxy();

/**
 *  A mixin for connect the tag to redux store.(react-redux like)
 */
export const connect = (mapStateToOpts, mapDispatchToOpts) => tag => {
    if(!tag){
        throw new Error(`riot redux connector expected a tag instance.`);
    }
    tag.on('unmount', () => {
        containers.del(tag);
    })
    //collect tag to set.
    tag.opts.mapStateToOpts = mapStateToOpts;
    tag.opts.mapDispatchToOpts = mapDispatchToOpts;
    containers.add(tag);

    //find entry.
    let pv = provider || recurFindProvider(tag);
    mapStateToOpts && Object.assign(tag.opts, mapStateToOpts(pv.opts.store.getState(), tag.opts));
    mapDispatchToOpts && Object.assign(tag.opts, mapDispatchToOpts(pv.opts.store.dispatch, tag.opts));
};

/**
 *   Bind application entry for the redux.
 *   @param store Object
 *   @return Function
 */
export const provide = store => {
    var oldState = store.getState();
    return entry => {
        provider = entry;
        let distinctMap = {};
        store.subscribe(action => {
            let currState = store.getState();
            let callback = null;
            let toUpateSet = new TagContainerProxy();
            toUpateSet.state = currState;
            containers.loop(c => {
                let mapStateToOpts = c.opts.mapStateToOpts;
                if(!mapStateToOpts){
                    return;
                }
                let prevSnapShot = mapStateToOpts(oldState, c.opts);
                let currSnapShot = mapStateToOpts(currState, c.opts);
                let distincts = recompute(prevSnapShot, currSnapShot);
                let isEqual = !distincts || !distincts.length;
                if(!isEqual){
                    distincts.forEach(k => {
                        if(debug){
                            if(!distinctMap[getTagName(c)]){
                                distinctMap[getTagName(c)] = new TagContainerProxy();
                            }
                            distinctMap[c.opts && c.opts.riotTag || c.root.localName].add(k);
                        }
                        c.opts[k] = currSnapShot[k];
                    });
                    // if the tag is on show or the tag to be show --> update it.
                    if(isShow(c, currState) || isPresent(c, currState)){
                        if (isPresent(c, currState) && currState.lastAction.payload === c) {
                            c.ensureToUpdate = currState.lastAction.type;
                        }
                        toUpateSet.add(c);
                    }
                }
            });
            if(debug){
                console.warn(distinctMap);   
            }

            let arr = [];
            toUpateSet.loop(s => {
                arr.push(s);
            })
            enqueue(arr);
            oldState = currState;
        })
    }
};

const isShow = (c, state) => c.opts.show || c.opts.$show;
const isPresent = (c, state) => (state.lastAction.type === '$enter' || state.lastAction.type === '$leave');
// const isPresent = (c, state) => (state.lastAction.type === '$enter' || state.lastAction.type === '$leave') && (state.lastAction.payload === c);
const getTagName = c => c.opts && c.opts.riotTag || c.root.localName; 

let busy = false;
let queue = [];
/**
 * @param snapshot { Array }
 * @param gap { Number }
 * @returns null
 */
const enqueue = (snapshot, during = 0) => {
    if(!snapshot){
        return;
    }
    queue.push(snapshot);
    if(busy){
        return;
    }
    busy = true;
    iterator(0, during);
}

const iterator = (index, during) => {
    let i = queue[index];
    setTimeout(() => {
        if(queue[index + 1]){
            return iterator(index + 1);
        }else{
            compareAndUpate(queue.splice(0, index + 1));
            busy = !busy;
        }
    }, during)
}

const compareAndUpate = arr => {
    let refinedComponents = distinct(Array.from(flat(arr)), c => (c.$routePath || getTagName(c)));
    refinedComponents.map(c => {
        (isShow(c) || c.ensureToUpdate) && setTimeout(() => {
            if(c.ensureToUpdate){
                if(c.ensureToUpdate === '$enter'){
                    c.trigger('entered');
                }else{
                    c.trigger('leaved');
                }
                delete c['ensureToUpdate'];
            }
            c.update();
        }, 0);
    })
}

/**
 *  Helpers
 */
const flat = arr => arr.reduce((acc, curr) => acc.concat(curr), []);

const distinct = (arr, fn, res = []) => {              
    if(!arr.length){
        return res;
    }
    let i = arr[0];
    if(res.map(r => fn(r)).indexOf(fn(i)) < 0){
            res.push(i);
            return distinct(arr.slice(1), fn, res);
    }
    return distinct(arr.slice(1), fn, res);
}

const recurFindProvider = tag => {
    if(!tag.parent) return tag;
    return recurFindProvider(tag.parent);
};

const recompute = (prev, curr) => 
    Object.keys(curr).filter(k => {
        if(!prev.hasOwnProperty(k)){
            return true;
        }
        if(Array.isArray(prev[k]) && 
        Array.isArray(curr[k]) &&
        prev[k].length === 0 &&
        curr[k].length === 0
        ){
            return false;
        }
        if(prev[k] != curr[k]){
            return true;
        }
        return false;
    });
