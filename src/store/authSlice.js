import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isLoading: false
    },
    reducers: {
        loadingOn: (state) => {
            state.isLoading = true;
        },
        loadingOff: (state) => {
            state.isLoading = false;
        }
    }
})

export default authSlice.reducer;
export const { loadingOn, loadingOff } = authSlice.actions;