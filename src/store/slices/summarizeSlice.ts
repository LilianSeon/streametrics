import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SummarizeValue = {
    text: string,
    time: number,
    streamerName?: string,
    streamerImage?: string,
}

export interface SummarizeState {
  value: SummarizeValue[];
}

const initialState: SummarizeState = {
  value: [],
};

const summarizeSlice = createSlice({
  name: 'summarize',
  initialState,
  reducers: {
    addSummary: (state, action: PayloadAction<SummarizeValue>) => {
      state.value.push(action.payload);
    },
    clearSummaries: (state) => {
      state.value = [];
    },
    clearSummariesExceptLast: (state) => {
      //@ts-ignore
      const getLastStreamer = state.value.findLast((summary) => typeof summary?.streamerImage != 'undefined');
      state.value = [getLastStreamer];
    }
  },
});

export const { addSummary, clearSummaries, clearSummariesExceptLast } = summarizeSlice.actions;
export default summarizeSlice.reducer;