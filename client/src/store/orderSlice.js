import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios'
export const getOrders = createAsyncThunk('/get/orders',async(id)=>{
    try {
        const {data}= await axios.get(`${import.meta.env.VITE_URL}/master/customer/${id}`)
        console.log(data.data);
        return data.data;
        
        
    } catch (error) {
        
    }
})


export const createOrder = createAsyncThunk(
    'orders/createOrder',
    async (orderData) => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${import.meta.env.VITE_URL}/order/create/order`, orderData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data; 
      } catch (error) {
       throw new Error(error.response.data.message);
      }
    }
  );

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
  .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    }
})
export default orderSlice.reducer;
export const selectOrders = (state) => state.orders.orders;