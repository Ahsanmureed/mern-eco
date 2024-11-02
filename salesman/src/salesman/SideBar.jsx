import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SideBar = () => {
    const location = useLocation();

    return (
        <aside className="sidebar fixed top-0 left-0 w-64 bg-gray-800 text-white h-full p-5">
            <h2 className="text-lg font-bold mb-5">Salesman Dashboard</h2>
            <ul>
                <li>
                    <Link
                        to="/"
                        className={`block p-2 hover:bg-gray-700 ${location.pathname === '/ ' ? 'bg-gray-700' : ''}`}
                    >
                        Shop
                    </Link>
                </li>
                <li>
                    <Link
                        to="/salesman/products"
                        className={`block p-2 hover:bg-gray-700 ${location.pathname === '/salesman/products' ? 'bg-gray-700' : ''}`}
                    >
                        Products
                    </Link>
                </li>
                <li>
                    <Link
                        to="/salesman/orders"
                        className={`block p-2 hover:bg-gray-700 ${location.pathname === '/salesman/orders' ? 'bg-gray-700' : ''}`}
                    >
                        Orders
                    </Link>
                </li>
                <li>
                    <Link
                        to="/salesman/chat"
                        className={`block p-2 hover:bg-gray-700 ${location.pathname === '/salesman/chat' ? 'bg-gray-700' : ''}`}
                    >
                        Chats
                    </Link>
                </li>
            </ul>
        </aside>
    );
};

export default SideBar;
