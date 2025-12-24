import { configureStore } from '@reduxjs/toolkit'

// Slices
import summarizeReducer from './slices/summarizeSlice';
import languageReducer from './slices/languageSlice';
import audioBarsSlice from './slices/audioBarsSlice';
import sidePanelOpenedFromSlice from './slices/sidePanelOpenedFromSlice';
import pulseSlice from './slices/pulseSlice';
import translatedTextSlice from './slices/translatedTextSlice';
import isSummarizingSlice from './slices/isSummarizingSlice';
import streamerListSlice from './slices/streamerListSlice';
import captureAllowedSlice from './slices/captureAllowedSlice';
import currentStepSlice from './slices/currentStepSlice';

export const store = configureStore({
  reducer: {
    audioBars: audioBarsSlice,
    summarize: summarizeReducer,
    language: languageReducer,
    sidePanelOpenedFrom: sidePanelOpenedFromSlice,
    pulse: pulseSlice,
    translatedText: translatedTextSlice,
    isSummarizing: isSummarizingSlice,
    streamerList: streamerListSlice,
    captureAllowed: captureAllowedSlice,
    currentStep: currentStepSlice,
  },
})


export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch