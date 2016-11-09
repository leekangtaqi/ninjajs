function routerMiddlewareCreator(historyMode){
    return store => next => action => {
        if(action.type === 'route'){
        }
        return next(action);
    }
}
function syncHistoryWithStore(hub, store){
    hub.off('state-search').on('state-search', ({param, value}) => {
        let route = store.getState().route;
        let query = route.data.req.query;
        // if(query[param] && (query[param] = value)){
        //     return;
        // }
        query[param] = value;
        riot.route(route.$location + '?' + $.util.querystring.stringify(query), null, true);
    });
    hub.off('state-change').on('state-change', route => {
        store.dispatch({
            type: '$route',
            payload: {
                route: route
            }
        })
    });
    hub.off('sync-state-query').on('sync-state-query', query => {
        store.dispatch({
            type: '$query',
            payload: query
        })
    })
    hub.off('busy-pending').on('busy-pending', () => {
        // store.dispatch({
        //     type: 'maskShow'
        // });
        // store.dispatch({
        //     type: '$routeBusy'
        // })
    });
    hub.off('busy-resolve').on('busy-resolve', () => {
        // store.dispatch({
        //     type: 'maskHidden'
        // });
        // store.dispatch({
        //     type: '$routeUnBusy'
        // })
    })
}
export default {routerMiddlewareCreator, syncHistoryWithStore}