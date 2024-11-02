import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios'
export const getOrders = createAsyncThunk('/get/orders',async(id)=>{
    try {
        const {data}= await axios.get(`http://localhost:3000/api/v1/master/customer/${id}`)
        console.log(data.data);
        return data.data;
        
        
    } catch (error) {
        
    }
})

const initialState = {
    orders:null,
    loading:false,
    error:null
}
export const orderSlice = createSlice({
    name:"orders",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
builder
.addCase(getOrders.pending,(state)=>{
state.loading=true,
state.error=null
})
.addCase(getOrders.fulfilled,(state,action)=>{
    state.error=null,
    state.loading=false,
    state.orders= action.payload
})
.addCase(getOrders.rejected,(state,action)=>{
    state.loading=false,
    state.error=action.error.message
})
    }
})
export default orderSlice.reducer;
export const selectOrders = (state) => state.orders.orders;