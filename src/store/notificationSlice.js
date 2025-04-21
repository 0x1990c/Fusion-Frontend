import { configureStore, createSlice } from "@reduxjs/toolkit";

const verifyString = (str) => {
    return str === 'n/a' || str === '0' || str === '?' || str === 'N/A';
}


const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        data : [],
        sendTimer: 5
    },
    reducers: {
        setClient: (state, action) => {
            const payloadData = action.payload;
            console.log("data", state.data);
            
            // const processedData = payloadData.map((newItem) => {
            //     let item = { ...newItem };
            //     if(verifyString(item.id)) {
            //         item.id = 'N/A';
            //     }
            //     if(!item.phone_numbers || verifyString(item.phone_numbers)) {
            //         item.phone_numbers = [];
            //     } else if(typeof item.phone_numbers === 'string') {
            //         // Handle case where phone_numbers might be a string
            //         try {
            //             item.phone_numbers = JSON.parse(item.phone_numbers);
            //         } catch {
            //             item.phone_numbers = [item.phone_numbers];
            //         }
            //     }
            //     return item;
            // });
            
            state.data = payloadData;
        },
        updateMessageStatus: (state, action) => {
            const { itemIndex, childIndex, newStatus } = action.payload;
            // Check if the itemIndex and childIndex are valid
            if (state.data[itemIndex] && state.data[itemIndex].data[childIndex]) {
                // Directly update the message_status using Immer's proxy state
                state.data[itemIndex].data[childIndex].message_status = newStatus;
            }
        },
        setSendTimer: (state, action) => {
            state.sendTimer = action.payload;
        },
    }
})

export default notificationSlice.reducer;
export const { setClient, updateMessageStatus, setSendTimer } = notificationSlice.actions;