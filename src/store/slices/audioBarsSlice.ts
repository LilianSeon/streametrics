import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AudioBarsValue = {
    y: string,
    height: string
}

export interface AudioBarsState {
  value: AudioBarsValue[];
}

const initialState: AudioBarsState = {
  value: [{ y: '9.00', height: '2.00' }, { y: '9.00', height: '2.00' }, { y: '9.00', height: '2.00' }],
};

const audioBarsSlice = createSlice({
  name: 'audioBars',
  initialState,
  reducers: {
    updateAudioBars: (state, action: PayloadAction<AudioBarsValue[]>) => {
        state.value = action.payload;
    },
  },
});

export const { updateAudioBars } = audioBarsSlice.actions;
export default audioBarsSlice.reducer;