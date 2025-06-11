import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SummarizeTypes = 'error';

export type SummarizeValue = {
  text: string,
  time: number,
  tabId?: number,
  type?: SummarizeTypes,
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
    },
    clearSummariesError: (state) => {
      state.value = state.value.filter((summary) => summary?.type !== 'error');
    }
  },
});

export const { clearSummariesError, addSummary, clearSummaries, clearSummariesExceptLast } = summarizeSlice.actions;
export default summarizeSlice.reducer;