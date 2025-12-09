import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TranslatedText = Record<string, { message: string, description?: string }>

export interface TranslatedTextState {
  value: TranslatedText;
}

const initialState: TranslatedTextState = {
  value: {},
};

const translatedTextSlice = createSlice({
  name: 'translatedText',
  initialState,
  reducers: {
    addTranslatedText: (state, action: PayloadAction<TranslatedText>) => {
        state.value = action.payload;
    },
  },
});

export const { addTranslatedText } = translatedTextSlice.actions;
export default translatedTextSlice.reducer;