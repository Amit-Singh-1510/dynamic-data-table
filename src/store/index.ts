import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import tableReducer from './tableSlice'
import uiReducer from './uiSlice'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'

/**
 * Root reducer setup
 */
const rootReducer = combineReducers({
  table: tableReducer,
  ui: uiReducer,
})

/**
 * Redux Persist configuration
 * 👉 Blacklist the "table" slice so that it’s not stored in localStorage
 */
const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['table'], // ✅ Don't persist heavy table data
}

/**
 * Persisted reducer
 */
const persistedReducer = persistReducer(persistConfig, rootReducer)

/**
 * Store configuration
 */
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

/**
 * Persistor for the app
 */
export const persistor = persistStore(store)

/**
 * Typed hooks (optional)
 */
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

/**
 * Typed hooks for the app
 */
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export { store as default }
