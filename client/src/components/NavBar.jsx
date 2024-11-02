import React, { useState } from "react";
import img from "../assets/logo.png";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { FiUser } from "react-icons/fi";
import SearchInput from "./SearchInput";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const NavBar = () => {
  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector((state) => state.cart.items); 
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between navbar px-14 fixed z-50 bg-gray-200 w-full py-4 h-[70px]">
      <img src={img} alt="Logo" />
      <ul className="flex items-center gap-9 text-2xl uppercase">
        <li>home</li>
        <li>shop</li>
        <li>blog</li>
        <li>contact</li>
      </ul>
      <ul className="flex items-center gap-4 text-2xl">
        <IoIosSearch onClick={() => setSearchOpen(!searchOpen)} />
        <Link to="/cart" className="relative">
          <FiShoppingCart />
          {cartItems?.length >= 0 && (
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
      </ul>
      {searchOpen && <SearchInput setSearchOpen={setSearchOpen} searchOpen={searchOpen} />}
    </nav>
  );
};

export default NavBar;
