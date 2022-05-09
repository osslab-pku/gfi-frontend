import {combineReducers, createStore, Reducer} from 'redux';
import {persistStore, persistReducer} from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import {
	AccountNavState,
	accountNavStateReducer,
	GlobalProgressBarState,
	globalProgressBarStateReducer,
	loginReducer,
	showMainPagePopoverReducer
} from './reducers';
import {RepoShouldDisplayPopoverState} from '../../pages/main/GFIRepoDisplayView';

const persistConfig = {
	key: 'root',
	storage: storage,
	blacklist: [],
}

const persistReducers = persistReducer(persistConfig, loginReducer)

const combinedReducers = combineReducers({
	loginReducer: persistReducers,
	mainPopoverReducer: showMainPagePopoverReducer,
	globalProgressBarReducer: globalProgressBarStateReducer,
	accountNavStateReducer: accountNavStateReducer,
})

export const store = createStore(combinedReducers)
export const persistor = persistStore(store)

export interface GFIRootReducers {
	loginReducer: any,
	mainPopoverReducer: RepoShouldDisplayPopoverState,
	globalProgressBarReducer: GlobalProgressBarState,
	accountNavStateReducer: AccountNavState,
}
