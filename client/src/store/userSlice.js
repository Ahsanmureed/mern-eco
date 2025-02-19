import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const registerUser = createAsyncThunk('user/register', async (userData) => {
    try {
        const { data } = await axios.post(`${import.meta.env.VITE_URL}/customer/register`, userData);
        return data.message;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
});

export const loginUser = createAsyncThunk('user/login', async (userData) => {
    try {
        const { data } = await axios.post(`${import.meta.env.VITE_URL}/customer/login`, userData);
        localStorage.setItem('token', data.accessToken);
        return data;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
});

export const getUser = createAsyncThunk('user/fetchUserData', async () => {
   try {
    const token = localStorage.getItem('token');
    const { data } = await axios.get(`${import.meta.env.VITE_URL}/customer/fetch`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return data.data;
   }  catch (error) {
    throw new Error(error.response.data.message);
}
});
export const updateUser = createAsyncThunk('user/update',async({user,newAddress})=>{
    
 try {
    const token = localStorage.getItem('token');
    const {data}= await axios.patch(`${import.meta.env.VITE_URL}/customer/customer/${user._id}`,{address:newAddress},{headers:{Authorization:`Bearer ${token}`}})
 }  catch (error) {
    throw new Error(error.response.data.message);
}
})
export const resetPassword = createAsyncThunk('user/resetPassword', async ({ token, password }) => {
    try {
        const { data } = await axios.post(`${import.meta.env.VITE_URL}/customer/customer/forgot/${token}`, { password });
        return data.message; 
    } catch (error) {
        throw new Error(error.response.data.message);
    }
});

export const forgotPassword = createAsyncThunk('user/forgotPassword', async ({ email }) => {
    try {
        const { data } = await axios.post(`${import.meta.env.VITE_URL}/customer/customer/forgot`, { email });
        return data.message;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
});

export const resetTokenChecker = createAsyncThunk('user/resetPassword/check', async ({ token }) => {
    try {
        const { data } = await axios.get(`${import.meta.env.VITE_URL}/customer/reset-password/${token}`);
        return data.message;
    } catch (error) {
        throw new Error(error.response.data.message);
    }
});

const initialState = {
    user: null,
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        logout(state) {
            state.user = null;
            localStorage.removeItem('token');
        },
        clearError(state) {
            state.error = null; 
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.user = null;
                state.loading = false;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.error = action.error.message;
                state.loading = false;
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.data; 
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(getUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(getUser.rejected, (state, action) => {
                state.loading = false;
            })
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message; 
            })
            .addCase(resetTokenChecker.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetTokenChecker.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(resetTokenChecker.rejected, (state, action) => {
                state.loading = false;
            })
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.loading = false;
            });
    }
});

export const { logout, clearError } = userSlice.actions;

export default userSlice.reducer;
