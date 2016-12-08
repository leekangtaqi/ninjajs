function hoistStatics(targetComponent, sourceComponent) {
    const RIOT_STATICS = {
        displayName: true,
        mixins: true,
        type: true
    };

    const KNOWN_STATICS = {
        name: true,
        length: true,
        prototype: true,
        caller: true,
        arguments: true,
        arity: true
    };

    var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';

    if (typeof sourceComponent !== 'string') { // don't hoist over string (html) components
        var keys = Object.getOwnPropertyNames(sourceComponent);

        /* istanbul ignore else */
        if (isGetOwnPropertySymbolsAvailable) {
            keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
        }

        for (var i = 0; i < keys.length; ++i) {
            console.warn(keys[i]);
            
            if (!RIOT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]]) {
                try {
                    console.warn("!!!");
                    targetComponent[keys[i]] = sourceComponent[keys[i]];
                } catch (error) {
                    console.warn("hoistStatics failed.");
                }
            }
        }
    }

    return targetComponent;
}

class C1 {
  test1() {

  }
  test2() {

  }
}

class C2 {
  test3() {

  }
}

let c = hoistStatics(C1, C2)