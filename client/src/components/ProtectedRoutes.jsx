import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoutes = () => {
  const user = useSelector((state) => state.user.user);
  
  

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
