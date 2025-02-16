import React, { useState } from "react";
import img from "../assets/logo.png";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import SearchInput from "./SearchInput";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {logout} from '../store/userSlice'
import { setSocket } from "../store/socketSlice";
const NavBar = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items); 
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const socket = useSelector((state) => state.socket.socket);
const totalCartItems = cartItems.reduce((acc,item)=>{
  return  acc+item.quantity
},0)
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
const handleLogout = ()=>{
 dispatch(logout());
 navigate('/login')
}
  return (
    <nav className="flex items-center justify-between px-4 md:px-8 lg:px-14 fixed top-0 z-50 bg-gray-200 w-full py-4 h-[70px] shadow-md">
      <Link to="/" className="flex items-center">
        <img src={img} alt="Logo" className="h-8" />
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden lg:flex items-center gap-8 text-lg uppercase">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/shop">Shop</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/contact">Contact</Link></li>
        {user?  <li className=" cursor-pointer" onClick={handleLogout} >Logout</li>:''}
      </ul>

      <ul className="flex items-center gap-4 text-2xl">
        <IoIosSearch onClick={() => setSearchOpen(!searchOpen)} className="cursor-pointer" />
        
        <Link to="/cart" className="relative">
          <FiShoppingCart />
          {cartItems?.length > 0 && (
            <span className="absolute top-[-8px] right-[-10px] bg-red-600 text-white text-xs rounded-full px-1">
              {totalCartItems}
            </span>
          )}
        </Link>

        {user ? (
          <Link to="/profile">
            <FiUser />
          </Link>
        ) : (
          <Link to="/login">
            <FiUser />
          </Link>
        )}

        {/* Menu Icon for Mobile */}
        <div className="lg:hidden cursor-pointer" onClick={toggleMenu}>
          {menuOpen ? <FiX className=" z-[999] absolute right-3 top-3" /> : <FiMenu />}
        </div>
      </ul>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 lg:hidden z-40 flex justify-end">
          <div className="flex flex-col bg-gray-200 w-2/3 h-full p-6">
            <ul className="flex flex-col gap-6 text-lg uppercase">
              <li><Link to="/" onClick={toggleMenu}>Home</Link></li>
              <li><Link to="/shop" onClick={toggleMenu}>Shop</Link></li>
              <li><Link to="/blog" onClick={toggleMenu}>Blog</Link></li>
              <li><Link to="/contact" onClick={toggleMenu}>Contact</Link></li>
            </ul>
          </div>
        </div>
      )}

      {/* Search Input */}
      {searchOpen && <SearchInput setSearchOpen={setSearchOpen} searchOpen={searchOpen} />}
    </nav>
  );
};

export default NavBar;
