import React, { useState } from "react";
import img from "../assets/logo.png";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import SearchInput from "./SearchInput";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const NavBar = () => {
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items); 
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Toggle menu visibility
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="flex items-center justify-between px-4 md:px-8 lg:px-14 absolute top-0 z-50 bg-gray-200 w-full py-4 h-[70px] shadow-md">
      <Link to="/" className="flex items-center">
        <img src={img} alt="Logo" className="h-8" />
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden lg:flex items-center gap-8 text-lg uppercase">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/shop">Shop</Link></li>
        <li><Link to="/blog">Blog</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>

      <ul className="flex items-center gap-4 text-2xl">
        <IoIosSearch onClick={() => setSearchOpen(!searchOpen)} className="cursor-pointer" />
        
        <Link to="/cart" className="relative">
          <FiShoppingCart />
          {cartItems?.length > 0 && (
            <span className="absolute top-[-8px] right-[-10px] bg-red-600 text-white text-xs rounded-full px-1">
              {cartItems.length}
            </span>
          )}
        </Link>

        {user ? (
          <Link to="/dashboard">
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
