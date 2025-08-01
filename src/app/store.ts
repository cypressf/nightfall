import { configureStore, type ThunkAction, type Action } from '@reduxjs/toolkit'
import gameReducer from '../features/game/gameSlice'

export const store = configureStore({
    reducer: {
        game: gameReducer,
    },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>
