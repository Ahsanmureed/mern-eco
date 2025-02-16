import { createSlice } from "@reduxjs/toolkit";
const chatSlice= createSlice({
    name:'chat',
    initialState:{
        users:[]
    },
    reducers:{
        setOnlineUsers:(state,action)=>{
            state.users=action.payload
        }
    }
})
export const {setOnlineUsers}=chatSlice.actions
export default chatSlice.reducer;