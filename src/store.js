import _ from './util';
import { compose, createStore, combineReducers, applyMiddleware} from 'redux';
import ninjaRouterRedux from './ninja-router-redux';

export const configureStore = (initialState = {}, reducers, middlewares, HISTORY_MODE = 'browser') => {
		const reducer = combineReducers({
				...reducers
		});
    const routeMw = ninjaRouterRedux.routerMiddlewareCreator(HISTORY_MODE);
    return compose(applyMiddleware(routeMw, ...(_.values(middlewares))))(createStore)(reducer, initialState);
};