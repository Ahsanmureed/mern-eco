import {configureStore} from '@reduxjs/toolkit'

import shopReducer from './shopSlice';
import productReducer from './productSlice';
import userReducer from './userSlice'
import orderReducer from './orderSlice'
import chatReducer from './chatSlice';
import socketReducer from './socketSlice'
const store  = configureStore({
    reducer:{
        user:userReducer,
        shop: shopReducer,
        products: productReducer,
        orders:orderReducer,
        socket:socketReducer,
        chat:chatReducer
    }
})
export default store