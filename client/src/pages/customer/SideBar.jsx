import React from "react";
import { Link, useLocation } from "react-router-dom";
import { IoCloseCircle } from "react-icons/io5";

const SideBar = ({ onClose }) => {
  const location = useLocation();

  return (
    <aside className="sidebar fixed top-0 left-0 w-64 bg-gray-800 text-white h-full p-5">
      <div className=" flex items-center justify-between">
        <h2 className="text-lg font-bold mb-5">Dashboard</h2>
        <IoCloseCircle
          onClick={onClose}
          className="text-2xl font-bold mb-5 md:hidden"
        />
      </div>
      <ul>
        <li>
          <Link
            onClick={onClose}
            to="/profile"
            className={`block p-2  ${
              location.pathname === "/profile" ? "bg-gray-700" : ""
            }`}
          >
            Profile
          </Link>
        </li>

        <li>
          <Link
            onClick={onClose}
            to="/orders"
            className={`block p-2  ${
              location.pathname === "/orders" ? "bg-gray-700" : ""
            }`}
          >
            Orders
          </Link>
        </li>
      </ul>
    </aside>
  );
};

export default SideBar;
