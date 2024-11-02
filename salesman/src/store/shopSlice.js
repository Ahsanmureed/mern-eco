// src/store/shopSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    shop: null,
    isLoading: false,
    error: null,
};

export const fetchShop = createAsyncThunk(
    'shop/fetchShop',
    async (userId) => {
        const response = await axios.get(`http://localhost:3000/api/v1/shop/user/${userId}`);
        return response.data.data[0]; 
    }
);

export const createShop = createAsyncThunk(
    'shop/createShop',
    async ({ shopName }) => {
        const token = localStorage.getItem('token');
        try {
            const response = await axios.post('http://localhost:3000/api/v1/shop/create/shop', {name:shopName}, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            return response.data; 
          } catch (error) {
              throw new Error(error.response.data.message)
          }
    }
);

const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchShop.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchShop.fulfilled, (state, action) => {
                state.isLoading = false;
                state.shop = action.payload;
                state.error = null;
            })
            .addCase(fetchShop.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            .addCase(createShop.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createShop.fulfilled, (state, action) => {
                state.isLoading = false;
                state.shop = action.payload; // Assuming the shop data is returned
                state.error = null;
            })
            .addCase(createShop.rejected, (state, action) => {
                state.loading = false; 
                state.error = action.payload || action.error.message; 
            });
    },
});

export const selectShop = (state) => state.shop.shop;
export const selectShopLoading = (state) => state.shop.isLoading;
export const selectShopError = (state) => state.shop.error;

export default shopSlice.reducer;
