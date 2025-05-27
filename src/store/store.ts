import { configureStore } from '@reduxjs/toolkit'

// Slices
import summarizeReducer from './slices/summarizeSlice';
import languageReducer from './slices/languageSlice';

export const store = configureStore({
  reducer: {
    summarize: summarizeReducer,
    language: languageReducer
  },
})


export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch