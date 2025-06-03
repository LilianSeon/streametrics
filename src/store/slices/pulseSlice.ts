import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type PulseValue = number;

export interface PulseState {
  value: PulseValue;
}

const initialState: PulseState = {
  value: 0,
};

const pulseSlice = createSlice({
  name: 'pulse',
  initialState,
  reducers: {
    updatePulse: (state, action: PayloadAction<PulseValue>) => {
        state.value = action.payload;
    },
  },
});

export const { updatePulse } = pulseSlice.actions;
export default pulseSlice.reducer;