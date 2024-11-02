import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";

const SearchInput = ({ setSearchOpen }) => {
    const navigate = useNavigate();
    const query = useLocation();
    const URLSearch = new URLSearchParams(query.search);
    const [search, setSearch] = useState(URLSearch.get('search') || '');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (search) {
            navigate(`/search?search=${search}&page=1`); 
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white mb-16 flex items-center w-full h-[70px] fixed top-0 z-20 justify-center px-4"
            style={{ left: 0, right: 0 }}
        >
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-2xl text-2xl w-full py-2.5 border-2 border-gray-600 focus:outline-none focus:border-blue-500 transition-all"
                type="text"
                placeholder="Search..."
            />
            <button
                type='submit'
                className="bg-blue-600 py-3 text-2xl text-white rounded-2xl px-7 hover:bg-blue-700 transition-all"
            >
                Search
            </button>
            <button
                type='button'
                onClick={() => setSearchOpen(false)}
                className="text-gray-600 hover:text-red-600 transition-all ml-3"
                aria-label="Close search"
            >
                <IoMdClose size={24} />
            </button>
        </form>
    );
};

export default SearchInput;
