import { configureStore } from '@reduxjs/toolkit'

// Slices
import summarizeReducer from './slices/summarizeSlice';
import languageReducer from './slices/languageSlice';
import audioBarsSlice from './slices/audioBarsSlice';

export const store = configureStore({
  reducer: {
    audioBars: audioBarsSlice,
    summarize: summarizeReducer,
    language: languageReducer
  },
})


export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch