import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: 'messages',
    initialState: {
        data: [],

    },
    reducers: {
        setMessages: (state, action) => {
            state.data = action.payload;
        },
    }
});

export const {setMessages} = messageSlice.actions;
export default messageSlice.reducer;
