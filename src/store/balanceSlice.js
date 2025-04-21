import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    data: 0
}

export const balanceSlice = createSlice({
    name: 'balance',
    initialState,
    reducers: {
        setBalance: (state, action) => {
            state.data = action.payload
        },
        clearBalance: (state) => {
            state.data = 0
        }
    }
})

export const { setBalance, clearBalance } = balanceSlice.actions

export default balanceSlice.reducer 