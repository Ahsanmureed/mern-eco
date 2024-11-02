import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SideBar = () => {
    const location = useLocation();

    return (
        <aside className="sidebar fixed top-0 left-0 w-64 bg-gray-800 text-white h-full p-5">
            <h2 className="text-lg font-bold mb-5">Dashboard</h2>
            <ul>
                <li>
                    <Link
                        to="/dashboard"
                        className={`block p-2 hover:bg-gray-700 ${location.pathname === '/dashboard ' ? 'bg-gray-700' : ''}`}
                    >
                        Profile
                    </Link>
                </li>
               
                <li>
                    <Link
                        to="/orders"
                        className={`block p-2 hover:bg-gray-700 ${location.pathname === '/orders' ? 'bg-gray-700' : ''}`}
                    >
                        Orders
                    </Link>
                </li>
            </ul>
        </aside>
    );
};

export default SideBar;
