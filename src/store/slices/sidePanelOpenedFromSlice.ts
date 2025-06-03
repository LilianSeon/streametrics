import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SidePanelOpenedFromState = {
  value: chrome.tabs.Tab
}

const initialState: SidePanelOpenedFromState | { value: {} } = {
  value: {  }
};

const sidePanelOpenedFromSlice = createSlice({
  name: 'sidePanelOpenedFrom',
  initialState,
  reducers: {
    updateSidePanelOpenedFrom: (state, action: PayloadAction<SidePanelOpenedFromState['value']>) => {
      state.value = action.payload;
    },
  },
});

export const { updateSidePanelOpenedFrom } = sidePanelOpenedFromSlice.actions;
export default sidePanelOpenedFromSlice.reducer;