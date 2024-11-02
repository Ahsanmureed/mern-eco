import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shop from "./salesman/Shop";
import SalesmanProducts from "./salesman/Products";
import Orders from "./salesman/Orders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./store/userSlice";
import ChatPage from './salesman/ChatPage'
import { Toaster } from 'react-hot-toast';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword'
const App = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getUser());
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
    <Toaster/>
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/forgot-password" 
          element={!user ? <ForgotPassword /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/reset-password/:token" 
          element={!user ? <ResetPassword /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/" 
          element={user ? <Shop /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/salesman/products" 
          element={user ? <SalesmanProducts /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/salesman/orders" 
          element={user ? <Orders /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/salesman/chat" 
          element={user ? <ChatPage /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
