import {configureStore} from '@reduxjs/toolkit'
import userReducer from './userSlice'
import cartReducer from './cartSlice'
import orderReducer from './orderSlice'

const store  = configureStore({
    reducer:{
        user:userReducer,
        cart:cartReducer,
        orders:orderReducer
    }
})
export default store