import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    data: []
}

export const phoneSlice = createSlice({
    name: 'phone',
    initialState,
    reducers: {
        setPhones: (state, action) => {
            state.data = action.payload
        },
        clearPhones: (state) => {
            state.data = []
        }
    }
})

export const { setPhones, clearPhones } = phoneSlice.actions

export default phoneSlice.reducer 