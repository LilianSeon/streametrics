import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IsSummarizingState {
  value: boolean;
}

const initialState: IsSummarizingState = {
  value: true,
};

const isSummarizingSlice = createSlice({
  name: 'isSummarizing',
  initialState,
  reducers: {
    updateIsSummarizing: (state, action: PayloadAction<boolean>) => {
      //@ts-ignore
        state.value = action.payload;
    },
  },
});

export const { updateIsSummarizing } = isSummarizingSlice.actions;
export default isSummarizingSlice.reducer;