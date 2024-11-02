import React, { useEffect } from "react";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import {BrowserRouter,Routes,Route, Navigate} from 'react-router-dom' 
import ProtectedRoutes from './components/ProtectedRoutes'
import SearchResult from "./pages/SearchResult";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from './pages/customer/Dashboard'
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./store/userSlice";
import ShoppingCart from "./pages/ShoppingCart";
import Orders from "./pages/customer/Orders";
import ReviewPage from "./pages/customer/ReviewPage";
import { Toaster } from 'react-hot-toast';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
const App = () => {
 
  const user = useSelector((state)=> state.user.user)
  const dispatch = useDispatch();
  useEffect(()=>{
   const token = localStorage.getItem('token');
    if(token){
      dispatch(getUser())
    }
  },[dispatch])
  return (
    <>
   <BrowserRouter>
   <Toaster />
   <NavBar/>
   <Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/search"  element={<SearchResult/>}/>
    <Route path="/product/:slug"  element={<ProductDetail/>}/>
    {!user && (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
             
            </>
          )}
    <Route path="/cart" element={<ShoppingCart/>}/>

    <Route element={<ProtectedRoutes/>
    }>
        <Route path="/login" element={<Navigate to="/dashboard" />} />
        <Route path="/register" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/orders" element={<Orders/>}/>
        <Route path="/review/:slug/:order" element={<ReviewPage/>}/>
    </Route>
 
   </Routes>
   </BrowserRouter>

    </>
  );
};

export default App;
