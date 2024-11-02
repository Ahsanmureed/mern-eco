import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/product/user/${userId}`);
      return response.data.data; // Assuming the structure of your response
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }
);

// Async thunk to create a product
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('price', productData.price);
    formData.append('quantity', productData.quantity);
    productData.images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const response = await axios.post('http://localhost:3000/api/v1/product/create/product', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data; 
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  }
);

// Async thunk to update a product
// Async thunk to update a product
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData, imagesToRemove }, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('price', productData.price);
    formData.append('quantity', productData.quantity);
    
    // Append the images to remove
    formData.append('imagesToRemove', JSON.stringify(imagesToRemove));
    
    productData.images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const response = await axios.put(`http://localhost:3000/api/v1/product/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data; // Adjust based on your API response structure
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

// Async thunk to delete a product
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`http://localhost:3000/api/v1/product/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return id; // Return the id of the deleted product
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetProducts: (state) => {
      state.products = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null; // Clear previous errors
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message; // Set error message
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true; // Set loading true while creating a product
        state.error = null; // Clear previous errors
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.products.push(action.payload); 
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.payload || action.error.message; 
      })
      .addCase(updateProduct.pending, (state) => {
        state.loading = true; // Set loading true while updating a product
        state.error = null; // Clear previous errors
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Update the product in the products array
        const index = state.products.findIndex(product => product._id === action.payload._id);
        if (index !== -1) {
          state.products[index] = action.payload; 
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.payload || action.error.message; 
      })
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true; // Set loading true while deleting a product
        state.error = null; // Clear previous errors
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the product from the products array
        state.products = state.products.filter(product => product._id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false; 
        state.error = action.payload || action.error.message; 
      });
  },
});

export const { resetProducts } = productSlice.actions;

export default productSlice.reducer;
