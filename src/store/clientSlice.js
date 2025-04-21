import { createSlice } from "@reduxjs/toolkit";

const clientSlice = createSlice({
    name: 'client',
    initialState: {
        data: [],
    },
    reducers: {
        setClients: (state, action) => {
            state.data = action.payload;
        },
    }
})

export default clientSlice.reducer;
export const { setClients } = clientSlice.actions;