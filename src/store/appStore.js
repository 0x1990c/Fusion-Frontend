import { configureStore } from "@reduxjs/toolkit"
import authReducer from './authSlice'
import notificationReducer from "./notificationSlice";
import clientReducer from './clientSlice'
import messageReducer from './messageSlice'
import categoryReducer from './categorySlice'
import phoneReducer from './phoneSlice'
import balanceReducer from './balanceSlice'
const appStore = configureStore({
    reducer: {
        auth: authReducer,
        client: clientReducer,
        message: messageReducer,
        notification: notificationReducer,
        category: categoryReducer,
        phone: phoneReducer,
        balance: balanceReducer
    }
})

export default appStore;