let initialRouteData = {
    $prev_state: '/',
    $prev_location: '/',
    $state: '/',
    $location: '/',
    $protocol: 'http://',
    $host: typeof window != 'undefined' && location && location.host || '',
    data: {},
    stack: [],
    $views: {}
};
const route = (route = initialRouteData, action) => {
    switch (action.type) {
        case '$enter':
            var tagName = action.payload;
            var newOne = {
                [tagName]: true
            };
            return Object.assign({}, route, {
                $views: {...route.$views, ...newOne}
            })
        case '$leave':
            var tagName = action.payload;
            return Object.assign({}, route, {
                $views: Object.keys(route.$views)
                .filter(v => v != tagName)
                .reduce((o, k) => {
                    o[k] = true;
                    return o;
                }, {})
            })
        case '$route':
            return Object.assign({}, route, {
                $prev_state: route.$state,
                $prev_location: route.$location,
                $state: action.payload.route.$state,
                $location: action.payload.route.$location,
                $protocol: action.payload.route.$protocol || route.$protocol,
                $host: route.$host,
                data: action.payload.route.ctx
            });
        case '$query':
            return Object.assign({}, route, {
                $prev_state: route.$state,
                $prev_location: route.$location,
                $state: route.$state,
                $location: route.$location,
                $protocol: route.$protocol,
                $host: route.$host,
                data: Object.assign({},
                    {
                        request: {
                            body: route.data.req.body,
                            params: route.data.req.params,
                            query: action.payload,
                        }
                    }
                )
            })
        case '$routeBusy':
            return Object.assign({}, route, {busy: true});
        case '$routeUnBusy':
            return Object.assign({}, route, {busy: false});
        default:
            return route;
    }
};
export default {route}