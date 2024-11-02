import { createSlice } from '@reduxjs/toolkit';

const loadCartFromLocalStorage = () => {
  const savedCart = localStorage.getItem('cart');
  return savedCart ? JSON.parse(savedCart) : [];
};

const saveCartToLocalStorage = (cart) => {
  localStorage.setItem('cart', JSON.stringify(cart));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCartFromLocalStorage(),
  },
  reducers: {
    addToCart: (state, action) => {
      const existingProduct = state.items.find(item => item._id === action.payload._id);
      if (existingProduct) {
        existingProduct.quantity += 1; 
      } else {
        state.items.push({ ...action.payload, quantity: 1 }); 
      }
      saveCartToLocalStorage(state.items); 
    },
    updateQuantity: (state, action) => {
      const { _id, quantity } = action.payload;
      const existingProduct = state.items.find(item => item._id === _id);
      if (existingProduct) {
        existingProduct.quantity = quantity;
      }
      saveCartToLocalStorage(state.items); 
    },
    removeFromCart: (state, action) => {
      const _id = action.payload;
      state.items = state.items.filter(item => item._id !== _id);
      saveCartToLocalStorage(state.items); 
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToLocalStorage(state.items); 
    },
  },
});


export const { addToCart, updateQuantity, removeFromCart, clearCart } = cartSlice.actions;


export default cartSlice.reducer;