'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function routerMiddlewareCreator(historyMode) {
    return function (store) {
        return function (next) {
            return function (action) {
                if (action.type === 'route') {}
                return next(action);
            };
        };
    };
}
function syncHistoryWithStore(hub, store) {
    hub.off('state-search').on('state-search', function (_ref) {
        var param = _ref.param,
            value = _ref.value;

        var route = store.getState().route;
        var query = route.data.req.query;
        // if(query[param] && (query[param] = value)){
        //     return;
        // }
        query[param] = value;
        riot.route(route.$location + '?' + $.util.querystring.stringify(query), null, true);
    });
    hub.off('state-change').on('state-change', function (route) {
        store.dispatch({
            type: '$route',
            payload: {
                route: route
            }
        });
    });
    hub.off('sync-state-query').on('sync-state-query', function (query) {
        store.dispatch({
            type: '$query',
            payload: query
        });
    });
    hub.off('busy-pending').on('busy-pending', function () {
        // store.dispatch({
        //     type: 'maskShow'
        // });
        // store.dispatch({
        //     type: '$routeBusy'
        // })
    });
    hub.off('busy-resolve').on('busy-resolve', function () {
        // store.dispatch({
        //     type: 'maskHidden'
        // });
        // store.dispatch({
        //     type: '$routeUnBusy'
        // })
    });
}
exports.default = { routerMiddlewareCreator: routerMiddlewareCreator, syncHistoryWithStore: syncHistoryWithStore };