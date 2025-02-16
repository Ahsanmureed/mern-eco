import {configureStore} from '@reduxjs/toolkit'
import userReducer from './userSlice'
import cartReducer from './cartSlice'
import orderReducer from './orderSlice'
import socketReducer from './socketSlice'
import chatReducer from './chatSlice'

const store  = configureStore({
    reducer:{
        user:userReducer,
        cart:cartReducer,
        orders:orderReducer,
        socket:socketReducer,
        chat:chatReducer
    }
})
export default store