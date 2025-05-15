import { configureStore } from "@reduxjs/toolkit"
import authReducer from './authSlice'
import notificationReducer from "./notificationSlice";
import categoryReducer from './categorySlice'
import balanceReducer from './balanceSlice'
const appStore = configureStore({
    reducer: {
        auth: authReducer,
        notification: notificationReducer,
        category: categoryReducer,
        balance: balanceReducer
    }
})

export default appStore;