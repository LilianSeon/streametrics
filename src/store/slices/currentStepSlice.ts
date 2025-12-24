import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CurrentStep } from '../../typings/StatusType';

export interface CurrentStepState {
  value: CurrentStep;
}

const initialState: CurrentStepState = {
  value: 'listening',
};

const currentStepSlice = createSlice({
  name: 'currentStep',
  initialState,
  reducers: {
    updateCurrentStep: (state, action: PayloadAction<CurrentStep>) => {
        state.value = action.payload;
    },
  },
});

export const { updateCurrentStep } = currentStepSlice.actions;
export default currentStepSlice.reducer;