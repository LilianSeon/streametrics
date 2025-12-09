import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Languages } from '../../components/Chart/src/js/Texts';

export type LanguageState = {
  value: Languages
}

const initialState: LanguageState = {
  value: 'en'
};

const languageSlice = createSlice({
  name: 'summarize',
  initialState,
  reducers: {
    updateLanguage: (state, action: PayloadAction<Languages>) => {
      state.value = action.payload;
    },
  },
});

export const { updateLanguage } = languageSlice.actions;
export default languageSlice.reducer;