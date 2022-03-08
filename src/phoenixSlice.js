import { createSlice } from "@reduxjs/toolkit";

export const socketSlice = createSlice({
  name: "phoenixSocketSlice",
  initialState: {
    socket: null,
    channels: {},
  },
  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setChannel: (state, {payload: channel}) => {
      state.channels[channel.topic] = channel;
    },
    removeChannel: (state, {payload: channel}) => {
      delete state.channels[channel.topic];
    },
  }
});

export const {
  setSocket, setChannel, removeChannel
} = socketSlice.actions;

export const phoenixReducer = {
  phoenix: socketSlice.reducer,
}

export const selectors = {
  socket: () => s => s.phoenix.socket,
  channels: () => s => s.phoenix.channels,
  channel: topic => s => s.phoenix.channels[topic],
};
