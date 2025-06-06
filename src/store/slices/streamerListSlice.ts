import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StorageStreamerListType } from '../../typings/StorageType';

export interface StreamerListState {
  value: StorageStreamerListType[];
}

const initialState: StreamerListState = {
  value: [],
};

const streamerListSlice = createSlice({
  name: 'streamerList',
  initialState,
  reducers: {
    setStreamerList: (state, action: PayloadAction<StorageStreamerListType[]>) => {
        state.value = action.payload;
    },
  },
});

export const { setStreamerList } = streamerListSlice.actions;
export default streamerListSlice.reducer;