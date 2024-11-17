import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./store/userSlice";
import NavBar from "./components/NavBar";
import ProtectedRoutes from './components/ProtectedRoutes';
import Home from "./pages/Home";
import SearchResult from "./pages/SearchResult";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from './pages/customer/Dashboard';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Loader from './components/Loader'
import ShoppingCart from "./pages/ShoppingCart";
import Orders from "./pages/customer/Orders";
import ReviewPage from "./pages/customer/ReviewPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Toaster } from 'react-hot-toast';
import CreateOrder from "./pages/customer/CreateOrder";
import Categories from "./components/Categories";
import SubCategories from "./pages/SubCategories";
import Products from "./pages/Products";

const App = () => {
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(true); 
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getUser()).finally(() => setLoading(false));
    } else {
      setLoading(false); 
    }
  }, [dispatch]);

  if (loading) return <Loader/>;

  return (
    <>
      <BrowserRouter>
        <Toaster />
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchResult />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="/subcategory/:id" element={<SubCategories />} />
          <Route path="/products/:id" element={<Products />} />
          
          {!user ? (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
            </>
          ) : (
         <>
            <Route path="/login" element={<Navigate to="/dashboard" />} />
            <Route path="/register" element={<Navigate to="/dashboard" />} />
            <Route path="/forgot-password" element={<Navigate to="/dashboard" />} />
            <Route path="/reset-password/:token" element={<Navigate to="/dashboard" />} />
            </>
            
          )}

          <Route element={<ProtectedRoutes />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/review/:slug/:order" element={<ReviewPage />} />
            <Route path="/create-order" element={<CreateOrder />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
