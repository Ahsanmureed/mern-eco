import {configureStore} from '@reduxjs/toolkit'

import shopReducer from './shopSlice';
import productReducer from './productSlice';
import userReducer from './userSlice'
import orderReducer from './orderSlice'
const store  = configureStore({
    reducer:{
        user:userReducer,
        shop: shopReducer,
        products: productReducer,
        orders:orderReducer
    }
})
export default store