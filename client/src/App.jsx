import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUser } from "./store/userSlice";
import NavBar from "./components/NavBar";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Home from "./pages/Home";
import SearchResult from "./pages/SearchResult";
import ProductDetail from "./pages/ProductDetail";
import Dashboard from "./pages/customer/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Loader from "./components/Loader";
import ShoppingCart from "./pages/ShoppingCart";
import Orders from "./pages/customer/Orders";
import ReviewPage from "./pages/customer/ReviewPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Toaster } from "react-hot-toast";
import CreateOrder from "./pages/customer/CreateOrder";
import SubCategories from "./pages/SubCategories";
import Products from "./pages/Products";
import { io } from "socket.io-client";
import { setSocket } from "./store/socketSlice";
import { setOnlineUsers } from "./store/chatSlice";

const App = () => {
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const socket = useSelector((state) => state.socket.socket);

  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getUser()).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch]);
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (user) {
      const socket = io("http://localhost:3000", {
        auth: {
          token: localStorage.getItem("token"),
        },
        transports: ["websocket"],
      });
      socket.emit("registerUser", user._id);
      console.log("User registered with socket");
      dispatch(setSocket(socket));
      socket.on("onlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
      });
    } else if (socket) {
      socket?.disconnect();
      dispatch(setSocket(null));
    }
    return () => {
      socket?.disconnect();
      dispatch(setSocket(null));
    };
  }, [user, dispatch]);
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (loading) return <Loader />;

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          You are offline. Check your internet connection.
        </div>
      )}
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
              <Route
                path="/reset-password/:token"
                element={<ResetPassword />}
              />
            </>
          ) : (
            <>
              <Route path="/login" element={<Navigate to="/dashboard" />} />
              <Route path="/register" element={<Navigate to="/dashboard" />} />
              <Route
                path="/forgot-password"
                element={<Navigate to="/dashboard" />}
              />
              <Route
                path="/reset-password/:token"
                element={<Navigate to="/dashboard" />}
              />
            </>
          )}

          <Route element={<ProtectedRoutes />}>
            <Route path="/profile" element={<Dashboard />} />
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
