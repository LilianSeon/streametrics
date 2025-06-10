import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CaptureAllowedState {
  value: boolean;
}

const initialState: CaptureAllowedState = {
  value: true,
};

const captureAllowedSlice = createSlice({
  name: 'captureAllowed',
  initialState,
  reducers: {
    updateCaptureAllowed: (state, action: PayloadAction<boolean>) => {
        state.value = action.payload;
    },
  },
});

export const { updateCaptureAllowed } = captureAllowedSlice.actions;
export default captureAllowedSlice.reducer;