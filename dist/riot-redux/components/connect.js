'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = Connect;

var _redux = require('redux');

var _warning = require('../util/warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('../util/invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _isPlainObject = require('../util/isPlainObject');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _shallowEqual = require('../util/shallowEqual');

var _shallowEqual2 = _interopRequireDefault(_shallowEqual);

var _provider = require('./provider');

var _util = require('../../util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultMapStateToOpts = function defaultMapStateToOpts(state) {
    return {};
};
var defaultMapDispatchToOpts = function defaultMapDispatchToOpts(dispatch) {
    return { dispatch: dispatch };
};
var defaultMergeOpts = function defaultMergeOpts(stateOpts, dispatchOpts, parentOpts) {
    return _extends({}, parentOpts, stateOpts, dispatchOpts);
};

var getDisplayName = function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || _util2.default.lineToCamel(WrappedComponent.originName) || 'Component';
};

var errorObject = { value: null };
function tryCatch(fn, ctx) {
    try {
        return fn.apply(ctx);
    } catch (e) {
        errorObject.value = e;
        return errorObject;
    }
};

// Helps track hot reloading.
var nextVersion = 0;

function wrapActionCreators(actionCreators) {
    return function (dispatch) {
        return (0, _redux.bindActionCreators)(actionCreators, dispatch);
    };
}

function hoistStatics(targetComponent, sourceComponent) {
    var RIOT_STATICS = {
        displayName: true,
        mixins: true,
        type: true
    };

    var KNOWN_STATICS = {
        name: true,
        length: true,
        prototype: true,
        caller: true,
        arguments: true,
        arity: true
    };

    var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';

    if (typeof sourceComponent !== 'string') {
        // don't hoist over string (html) components
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
function Connect(mapStateToOpts, mapDispatchToOpts, mergeOpts) {
    var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : { pure: true, withRef: false };

    var shouldSubscribe = Boolean(mapStateToOpts);
    var mapState = mapStateToOpts || defaultMapStateToOpts;

    var pure = options.pure,
        withRef = options.withRef;


    var mapDispatch = null;
    if (typeof mapDispatchToOpts === 'function') {
        mapDispatch = mapDispatchToOpts;
    } else if (!mapDispatchToOpts) {
        mapDispatch = defaultMapDispatchToOpts;
    } else {
        mapDispatch = wrapActionCreators(mapDispatchToOpts);
    }

    var finalMergeOpts = mergeOpts || defaultMergeOpts;
    var checkMergedEquals = pure && finalMergeOpts !== defaultMergeOpts;

    var version = nextVersion++;

    return function wrapWithConnect(WrappedComponent) {
        var connectDisplayName = 'Connect(' + getDisplayName(WrappedComponent) + ')';

        function checkStateShape(opts, methodName) {
            if (!(0, _isPlainObject2.default)(opts)) {
                (0, _warning2.default)(methodName + '() in ' + connectDisplayName + ' must return a plain object. ' + ('Instead received ' + opts + '.'));
            }
        }

        function computeMergedOpts(stateOpts, dispatchOpts, parentOpts) {
            var mergedOpts = finalMergeOpts(stateOpts, dispatchOpts, parentOpts);
            if (process.env.NODE_ENV !== 'production') {
                checkStateShape(mergedOpts, 'mergeOpts');
            }
            return mergedOpts;
        }

        var Connect = function (_WrappedComponent) {
            _inherits(Connect, _WrappedComponent);

            function Connect() {
                _classCallCheck(this, Connect);

                return _possibleConstructorReturn(this, (Connect.__proto__ || Object.getPrototypeOf(Connect)).apply(this, arguments));
            }

            _createClass(Connect, [{
                key: 'onCreate',
                value: function onCreate(opts) {
                    this.version = version;
                    this.store = opts.store || (0, _provider.getProvider)(this).opts.store;
                    this.displayName = connectDisplayName;
                    var storeState = this.store.getState();

                    (0, _invariant2.default)(this.store, 'Could not find "store" in either the context or ' + ('opts of "' + connectDisplayName + '". ') + 'Either wrap the root component in a Provider, ' + ('or explicitly pass "store" as a opt to "' + connectDisplayName + '".'));

                    this.state = { storeState: storeState };

                    this.clearCache();

                    this.on('mount', this.componentDidMount);
                    this.on('before-unmount', this.componentWillUnmount);
                    this.on('update', this.render);

                    _get(Connect.prototype.__proto__ || Object.getPrototypeOf(Connect.prototype), 'onCreate', this).call(this, opts);
                }
            }, {
                key: 'updateStateOptsIfNeeded',
                value: function updateStateOptsIfNeeded() {
                    var nextStateOpts = this.computeStateOpts(this.store, this.opts);
                    if (this.stateOpts && (0, _shallowEqual2.default)(nextStateOpts, this.stateOpts)) {
                        return false;
                    }

                    this.stateOpts = nextStateOpts;
                    return true;
                }
            }, {
                key: 'updateDispatchOptsIfNeeded',
                value: function updateDispatchOptsIfNeeded() {
                    var nextDispatchOpts = this.computeDispatchOpts(this.store, this.opts);
                    if (this.dispatchOpts && (0, _shallowEqual2.default)(nextDispatchOpts, this.dispatchOpts)) {
                        return false;
                    }

                    this.dispatchOpts = nextDispatchOpts;
                    return true;
                }
            }, {
                key: 'updateMergedOptsIfNeeded',
                value: function updateMergedOptsIfNeeded() {
                    var nextMergedOpts = computeMergedOpts(this.stateOpts, this.dispatchOpts, this.opts);
                    if (this.mergedOpts && checkMergedEquals && (0, _shallowEqual2.default)(nextMergedOpts, this.mergedOpts)) {
                        return false;
                    }

                    this.mergedOpts = nextMergedOpts;
                    return true;
                }
            }, {
                key: 'configureFinalMapState',
                value: function configureFinalMapState(store, opts) {
                    var mappedState = mapState(store.getState(), opts);
                    var isFactory = typeof mappedState === 'function';

                    this.finalMapStateToOpts = isFactory ? mappedState : mapState;
                    this.doStateOptsDependOnOwnOpts = this.finalMapStateToOpts.length !== 1;

                    if (isFactory) {
                        return this.computeStateOpts(store, opts);
                    }

                    if (process.env.NODE_ENV !== 'production') {
                        checkStateShape(mappedState, 'mapStateToOpts');
                    }
                    return mappedState;
                }
            }, {
                key: 'handleChange',
                value: function handleChange() {
                    if (!this.unsubscribe) {
                        return;
                    }

                    var storeState = this.store.getState();
                    var prevStoreState = this.state.storeState;

                    if (pure && prevStoreState === storeState) {
                        return;
                    }

                    if (pure && !this.doStateOptsDependOnOwnOpts) {
                        var haveStateOptsChanged = tryCatch(this.updateStateOptsIfNeeded, this);
                        if (!haveStateOptsChanged) {
                            return;
                        }
                        if (haveStateOptsChanged === errorObject) {
                            this.stateOptsPrecalculationError = errorObject.value;
                        }
                        this.haveStateOptsBeenPrecalculated = true;
                    }

                    this.hasStoreStateChanged = true;
                    this.update({ state: storeState });
                }
            }, {
                key: 'componentDidMount',
                value: function componentDidMount() {
                    this.render();
                    this.trySubscribe();
                }
            }, {
                key: 'componentWillUnmount',
                value: function componentWillUnmount() {
                    this.tryUnsubscribe();
                    this.clearCache();
                }
            }, {
                key: 'trySubscribe',
                value: function trySubscribe() {
                    if (shouldSubscribe && !this.unsubscribe) {
                        this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
                        this.handleChange();
                    }
                }
            }, {
                key: 'tryUnsubscribe',
                value: function tryUnsubscribe() {
                    if (this.unsubscribe) {
                        this.unsubscribe();
                        this.unsubscribe = null;
                    }
                }
            }, {
                key: 'isSubscribed',
                value: function isSubscribed() {
                    return typeof this.unsubscribe === 'function';
                }
            }, {
                key: 'clearCache',
                value: function clearCache() {
                    this.dispatchOpts = null;
                    this.stateOpts = null;
                    this.mergedOpts = null;
                    this.haveOwnOptsChanged = true;
                    this.hasStoreStateChanged = true;
                    this.haveStateOptsBeenPrecalculated = false;
                    this.stateOptsPrecalculationError = null;
                    this.renderedElement = null;
                    this.finalMapDispatchToOpts = null;
                    this.finalMapStateToOpts = null;
                }
            }, {
                key: 'componentWillReceiveOpts',
                value: function componentWillReceiveOpts(nextProps) {
                    if (!pure || !(0, _shallowEqual2.default)(nextProps, this.props)) {
                        this.haveOwnPropsChanged = true;
                    }
                }
            }, {
                key: 'computeStateOpts',
                value: function computeStateOpts(store, opts) {
                    if (!this.finalMapStateToOpts) {
                        return this.configureFinalMapState(store, opts);
                    }

                    var state = store.getState();
                    var stateOpts = this.doStateOptsDependOnOwnOpts ? this.finalMapStateToOpts(state, opts) : this.finalMapStateToOpts(state);

                    if (process.env.NODE_ENV !== 'production') {
                        checkStateShape(stateOpts, 'mapStateToOpts');
                    }
                    return stateOpts;
                }
            }, {
                key: 'computeDispatchOpts',
                value: function computeDispatchOpts(store, opts) {
                    if (!this.finalMapDispatchToOpts) {
                        return this.configureFinalMapDispatch(store, opts);
                    }

                    var dispatch = store.dispatch;

                    var dispatchOpts = this.doDispatchOptsDependOnOwnProps ? this.finalMapDispatchToOpts(dispatch, opts) : this.finalMapDispatchToOpts(dispatch);

                    return dispatchOpts;
                }
            }, {
                key: 'configureFinalMapDispatch',
                value: function configureFinalMapDispatch(store, opts) {
                    var mappedDispatch = mapDispatch(store.dispatch, opts);
                    var isFactory = typeof mappedDispatch === 'function';

                    this.finalMapDispatchToOpts = isFactory ? mappedDispatch : mapDispatch;
                    this.doDispatchOptsDependOnOwnOpts = this.finalMapDispatchToOpts.length !== 1;

                    if (isFactory) {
                        return this.computeDispatchOpts(store, opts);
                    }

                    return mappedDispatch;
                }
            }, {
                key: 'render',
                value: function render() {
                    var _this2 = this;

                    var haveOwnOptsChanged = this.haveOwnOptsChanged,
                        hasStoreStateChanged = this.hasStoreStateChanged,
                        haveStateOptsBeenPrecalculated = this.haveStateOptsBeenPrecalculated,
                        stateOptsPrecalculationError = this.stateOptsPrecalculationError,
                        renderedElement = this.renderedElement;


                    this.haveOwnOptsChanged = false;
                    this.hasStoreStateChanged = false;
                    this.haveStateOptsBeenPrecalculated = false;
                    this.stateOptsPrecalculationError = null;

                    if (stateOptsPrecalculationError) {
                        throw stateOptsPrecalculationError;
                    }

                    var shouldUpdateStateOpts = true;
                    var shouldUpdateDispatchOpts = true;

                    if (pure && renderedElement) {
                        shouldUpdateStateOpts = hasStoreStateChanged || haveOwnOptsChanged && this.doStateOptsDependOnOwnOpts;
                        shouldUpdateDispatchOpts = haveOwnOptsChanged && this.doDispatchOptsDependOnOwnOpts;
                    }

                    var haveStateOptsChanged = false;
                    var haveDispatchOptsChanged = false;

                    if (haveStateOptsBeenPrecalculated) {
                        haveStateOptsChanged = true;
                    } else if (shouldUpdateStateOpts) {
                        haveStateOptsChanged = this.updateStateOptsIfNeeded();
                    }
                    if (shouldUpdateDispatchOpts) {
                        haveDispatchOptsChanged = this.updateDispatchOptsIfNeeded();
                    }

                    var haveMergedOptsChanged = true;
                    if (haveStateOptsChanged || haveDispatchOptsChanged || haveOwnOptsChanged) {
                        haveMergedOptsChanged = this.updateMergedOptsIfNeeded();
                    } else {
                        haveMergedOptsChanged = false;
                    }

                    if (!haveMergedOptsChanged && renderedElement) {
                        return;
                    }

                    this.renderedElement = true;

                    Object.assign(this.opts, _extends({}, this.mergedOpts));

                    setTimeout(function () {
                        _this2.update();
                    }, 0);
                }
            }, {
                key: 'name',
                get: function get() {
                    return 'connect-' + _get(Connect.prototype.__proto__ || Object.getPrototypeOf(Connect.prototype), 'name', this) || WrappedComponent.name;
                }
            }]);

            return Connect;
        }(WrappedComponent);

        Connect.displayName = connectDisplayName;
        Connect.WrappedComponent = WrappedComponent;

        return Connect;
    };
}