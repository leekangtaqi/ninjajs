import { bindActionCreators } from 'redux';
import * as riot from 'riot';
import warning from '../util/warning';
import invariant from '../util/invariant';
import isPlainObject from '../util/isPlainObject';
import shallowEqual from '../util/shallowEqual';
import { getProvider } from './provider';

const defaultMapStateToOpts = state => ({});
const defaultMapDispatchToOpts = dispatch => ({ dispatch });
const defaultMergeOpts = (stateOpts, dispatchOpts, parentOpts) => ({
    ...parentOpts,
    ...stateOpts,
    ...dispatchOpts
});

const getDisplayName = WrappedComponent => WrappedComponent.displayName || WrappedComponent.name || 'Component';

let errorObject = { value: null };
function tryCatch(fn , ctx) {
    try {
        return fn.apply(ctx);
    } catch (e) {
        errorObject.value = e;
        return errorObject;
    }
};

// Helps track hot reloading.
let nextVersion = 0;

function wrapActionCreators(actionCreators) {
    return dispatch => bindActionCreators(actionCreators, dispatch);
}

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
            if (!RIOT_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
                try {
                    targetComponent[keys[i]] = sourceComponent[keys[i]];
                } catch (error) {
                    console.warn("hoistStatics failed.");
                }
            }
        }
    }

    return targetComponent;
}

/**
 * A HOC for connect the tag to redux store. (react-redux like)
 */
export default function connect(mapStateToOpts, mapDispatchToOpts, mergeOpts, options={pure: true, withRef: false}) {
    const shouldSubscribe = Boolean(mapStateToOpts)
    const mapState = mapStateToOpts || defaultMapStateToOpts;

    let mapDispatch = null;
    if(typeof mapDispatchToOpts === 'function'){
        mapDispatch = mapDispatchToOpts;
    } else if (!mapDispatchToOpts) {
        mapDispatch = defaultMapDispatchToOpts;
    } else {
        mapDispatch = wrapActionCreators(mapDispatchToOpts);
    }

    const finalMergeOpts = mergeOpts || defaultMergeOpts;
    const checkMergedEquals = pure && finalMergeOpts !== defaultMergeOpts;

    const version = nextVersion++;

    return function wrapWithConnect(WrappedComponent){
        const connectDisplayName = `Connect(${getDisplayName(WrappedComponent)})`;

        function checkStateShape(opts, methodName){
            if (!isPlainObject(opts)) {
                warning(
                    `${methodName}() in ${connectDisplayName} must return a plain object. ` +
                    `Instead received ${opts}.`
                )
            }
        }

        function computeMergedOpts(stateOpts, dispatchOpts, parentOpts) {
            const mergedOpts = finalMergeOpts(stateOpts, dispatchOpts, parentOpts)
            if (process.env.NODE_ENV !== 'production') {
                checkStateShape(mergedOpts, 'mergeOpts');
            } 
            return mergedOpts;
        }

        class Connect extends WrappedComponent{
            onCreate(opts) {
                this.version = version;
                this.store = opts.store || getProvider(this).opts.store;

                const storeState = this.store.getState();

                invariant(this.store,
                    `Could not find "store" in either the context or ` +
                    `opts of "${connectDisplayName}". ` +
                    `Either wrap the root component in a Provider, ` +
                    `or explicitly pass "store" as a opt to "${connectDisplayName}".`
                )

                this.state = { storeState }
                this.clearCache();


                this.on('mount', this.componentDidMount);
                this.on('before-unmount', this.componentWillUnmount);
                this.on('update', this.render);

                super.onCreate(opts);
            }

            updateStateOptsIfNeeded() {
                const nextStateOpts = this.computeStateOpts(this.store, this.opts)
                if (this.stateOpts && shallowEqual(nextStateOpts, this.stateOpts)) {
                    return false
                }

                this.stateOpts = nextStateOpts
                return true
            }

            updateDispatchOptsIfNeeded() {
                const nextDispatchOpts = this.computeDispatchOpts(this.store, this.opts)
                if (this.dispatchOpts && shallowEqual(nextDispatchOpts, this.dispatchOpts)) {
                    return false
                }

                this.dispatchOpts = nextDispatchOpts
                return true
            }

            updateMergedOptsIfNeeded() {
                const nextMergedOpts = computeMergedOpts(this.stateOpts, this.dispatchOpts, this.opts)
                if (this.mergedOpts && checkMergedEquals && shallowEqual(nextMergedOpts, this.mergedOpts)) {
                    return false
                }

                this.mergedOpts = nextMergedOpts
                return true
            }

            configureFinalMapState(store, opts) {
                const mappedState = mapState(store.getState(), opts)
                const isFactory = typeof mappedState === 'function'

                this.finalMapStateToOpts = isFactory ? mappedState : mapState
                this.doStateOptsDependOnOwnOpts = this.finalMapStateToOpts.length !== 1

                if (isFactory) {
                    return this.computeStateOpts(store, opts)
                }

                if (process.env.NODE_ENV !== 'production') {
                    checkStateShape(mappedState, 'mapStateToOpts')
                }
                return mappedState
            }

            handleChange() {
                if (!this.unsubscribe) {
                    return
                }

                const storeState = this.store.getState()
                const prevStoreState = this.state.storeState
                if (pure && prevStoreState === storeState) {
                    return
                }

                if (pure && !this.doStateOptsDependOnOwnOpts) {
                    const haveStateOptsChanged = tryCatch(this.updateStateOptsIfNeeded, this)
                    if (!haveStateOptsChanged) {
                        return
                    }
                    if (haveStateOptsChanged === errorObject) {
                        this.stateOptsPrecalculationError = errorObject.value
                    }
                    this.haveStateOptsBeenPrecalculated = true
                }

                this.hasStoreStateChanged = true
                this.update({state: storeState})
            }

            componentDidMount() {
                this.trySubscribe()
            }

            componentWillUnmount() {
                this.tryUnsubscribe()
                this.clearCache()
            }

            trySubscribe() {
                if (shouldSubscribe && !this.unsubscribe) {
                    this.unsubscribe = this.store.subscribe(this.handleChange.bind(this))
                    this.handleChange()
                }
            }

            tryUnsubscribe() {
                if (this.unsubscribe) {
                this.unsubscribe()
                this.unsubscribe = null
                }
            }

            isSubscribed() {
                return typeof this.unsubscribe === 'function'
            }

            clearCache() {
                this.dispatchOpts = null
                this.stateOpts = null
                this.mergedOpts = null
                this.haveOwnOptsChanged = true
                this.hasStoreStateChanged = true
                this.haveStateOptsBeenPrecalculated = false
                this.stateOptsPrecalculationError = null
                this.renderedElement = null
                this.finalMapDispatchToOpts = null
                this.finalMapStateToOpts = null
            }

            componentWillReceiveOpts(nextProps) {
                if (!pure || !shallowEqual(nextProps, this.props)) {
                    this.haveOwnPropsChanged = true
                }
            }

            computeStateOpts(store, opts) {
                if (!this.finalMapStateToOpts) {
                    return this.configureFinalMapState(store, opts)
                }

                const state = store.getState()
                const stateOpts = this.doStateOptsDependOnOwnOpts ?
                this.finalMapStateToOpts(state, opts) :
                this.finalMapStateToOpts(state)

                if (process.env.NODE_ENV !== 'production') {
                    checkStateShape(stateOpts, 'mapStateToOpts')
                }
                return stateOpts
            }

            render () {
                const {
                    haveOwnOptsChanged,
                    hasStoreStateChanged,
                    haveStateOptsBeenPrecalculated,
                    stateOptsPrecalculationError,
                    renderedElement
                } = this

                this.haveOwnOptsChanged = false
                this.hasStoreStateChanged = false
                this.haveStateOptsBeenPrecalculated = false
                this.stateOptsPrecalculationError = null

                if (stateOptsPrecalculationError) {
                   throw stateOptsPrecalculationError
                }

                let shouldUpdateStateOpts = true
                let shouldUpdateDispatchOpts = true

                if (pure && renderedElement) {
                    shouldUpdateStateOpts = hasStoreStateChanged || (
                        haveOwnOptsChanged && this.doStateOptsDependOnOwnOpts
                    )
                    shouldUpdateDispatchOpts =
                        haveOwnOptsChanged && this.doDispatchOptsDependOnOwnOpts
                }

                let haveStateOptsChanged = false
                let haveDispatchOptsChanged = false

                if (haveStateOptsBeenPrecalculated) {
                    haveStateOptsChanged = true
                } else if (shouldUpdateStateOpts) {
                    haveStateOptsChanged = this.updateStateOptsIfNeeded()
                }
                if (shouldUpdateDispatchOpts) {
                    haveDispatchOptsChanged = this.updateDispatchOptsIfNeeded()
                }

                let haveMergedOptsChanged = true
                if (
                    haveStateOptsChanged ||
                    haveDispatchOptsChanged ||
                    haveOwnOptsChanged
                ) {
                    haveMergedOptsChanged = this.updateMergedOptsIfNeeded()
                } else {
                    haveMergedOptsChanged = false
                }

                if (!haveMergedOptsChanged && renderedElement) {
                    return;
                }

                this.renderedElement = true;

                Object.assign(this, {...mergedOpts});
            }
        }

        Connect.displayName = connectDisplayName;
        Connect.WrappedComponent = WrappedComponent;

        return Connect;
    }
}