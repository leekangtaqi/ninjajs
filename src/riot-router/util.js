export default class Util {
    static distinct(arr){
        let res = [];
        for(let i=0, len=arr.length; i<len; i++){
            let o = arr[i];
            if(res.indexOf(o) < 0){
                res.push(o);
            }
        }
        return res;
    }

    static flatAndComposePrefix = (node, res) => {
        var arr = node.children;
        if(!arr){
            return;
        }
        for (var i=0, len=arr.length; i<len; i++) {
            let route = arr[i];
            route.path = (node.path || '') + route.path;
            route.parent = node.id || '';
            route.id = Util.genId(8);
            res.push(route);
            Util.flatAndComposePrefix(route, res)
        }
    }

    static genId(n){
        let chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
        let res = "";
        for(let i = 0; i < n ; i ++) {
                let id = Math.ceil(Math.random()*35);
                res += chars[id];
        }
        return res;
    }

    static completePart(uri){
        return uri.startsWith('/') ? uri : ('/' + uri);
    }

    static assert(val, msg){
        if(!val){
            throw new Error(msg);
        }
    }
    
    static omit(o, ...params){
        var res = {};
        for(var p in o){
            if(params.indexOf(p) < 0){
                res[p] = o[p]
            }
        }
        return res;
    }

    static compareUrl(u1, u2){
        var r = [];
        var arr1 = u1.split('/');
        var arr2 = u2.split('/');
        for(var i = 0, len = arr1.length; i<len; i++){
            if(arr1[i] === arr2[i]){
                r.push(arr1[i]);
            }else{
                break;
            }
        }
        return r.join('/')
    }

    static isEqual(o1, o2){
        let len = Object.keys(o1).length;
        let res = 0;
        if (len != Object.keys(o2).length) {
            return false;
        }
        for (let prop in o1) {
            if (o1[prop] === o2[prop]) {
                res++;
            }
        }
        return res === len;
    }

    static combineUriParts(parts, i, combined){
        if(!parts.length || i<=0){
            return combined;
        }
        let uri = parts[i-1] + '/' + combined;
        return Util.combineUriParts(parts, --i, uri);
    }

    static composeObject(ks, vs){
        var o = {};
        if(!Array.isArray(ks) || !Array.isArray(vs) || ks.length != vs.length){
            return o;
        }
        ks.forEach((k, index) => {
            o[k] = vs[index]
        });
        return o;
    }

    static getParams(fn){
        if(typeof fn != 'function') throw new Error('Failed to get Param on ' + typeof fn);
        var argO = fn.toString().match(/\(.*\)/).toString();
        if(argO.length<=2) return null;
        var argArr = argO.substr(1, argO.length-2).split(',');
        return argArr.map(function(a){
            return a.trim();
        });
    };

    static extractParams(path){ 
        return path.match(/_[a-zA-Z0-9:]+/g)
    }

    static toPattern(route){
        return route.replace(/_[a-zA-Z0-9:]+/g, "*");   
    }

    static nextTick(fn){
        return setTimeout(fn, 0);
    }

}