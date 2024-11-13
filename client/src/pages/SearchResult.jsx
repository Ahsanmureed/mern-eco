import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import axios from 'axios';
import Pagination from '../components/Pagination';
import SearchResultSkeleton from '../components/skeltons/SearchResultSkelton';

const SearchResult = () => {
    const query = useLocation();
    const navigate = useNavigate();
    
    const [state, setState] = useState({
        products: [],
        currentPage: 1,
        totalPages: 1,
        sortBy: 'name',
        sortOrder: 'asc',
        loading: true,
        searchQuery: '',  // Store search query here
    });

    const fetchProducts = async (page, searchQuery = '') => {
        setState((prev) => ({ ...prev, loading: true }));

        const URLSearch = new URLSearchParams(query.search);
        URLSearch.set('page', page);
        URLSearch.set('sortBy', state.sortBy);
        URLSearch.set('sortOrder', state.sortOrder);
        if (searchQuery) {
            URLSearch.set('search', searchQuery);  // Add search query to URL
        }

        try {
            const { data } = await axios.get(`http://localhost:3000/api/v1/product/product/pagination?${URLSearch.toString()}`);
            setState((prev) => ({
                ...prev,
                products: data.data,
                totalPages: data.totalPages,
                loading: false,
            }));
        } catch (error) {
            console.error(error);
            setState((prev) => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        const URLSearch = new URLSearchParams(query.search);
        const page = Number(URLSearch.get('page')) || 1;
        const searchQuery = URLSearch.get('search') || '';
        setState((prev) => ({ ...prev, currentPage: page, searchQuery }));
        fetchProducts(page, searchQuery);
    }, [query, state.sortBy, state.sortOrder]);

    const handleSortChange = (e) => {
        const [newSortBy, newSortOrder] = e.target.value.split('_');
        setState((prev) => ({ ...prev, sortBy: newSortBy, sortOrder: newSortOrder, currentPage: 1 }));

        const URLSearch = new URLSearchParams(query.search);
        URLSearch.set('sortBy', newSortBy);
        URLSearch.set('sortOrder', newSortOrder);
        URLSearch.set('page', 1);
        navigate(`/search?${URLSearch.toString()}`);
    };

    const handleSearchChange = (e) => {
        const searchQuery = e.target.value;
        setState((prev) => ({ ...prev, searchQuery }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (state.searchQuery) {
            const URLSearch = new URLSearchParams(query.search);
            URLSearch.set('search', state.searchQuery);
            URLSearch.set('page', 1); // Reset to the first page on new search
            navigate(`/search?${URLSearch.toString()}`);
        }
    };

    return (
        <div className="flex flex-col pt-[70px]">
            {/* Search Input and Sort by in Responsive Layout */}
            <div className="flex flex-col sm:flex-row justify-between items-center p-4 w-full space-y-4 sm:space-y-0 sm:space-x-4">
                <form onSubmit={handleSearchSubmit} className="flex items-center w-full sm:max-w-2xl space-x-2">
                    <input
                        type="text"
                        value={state.searchQuery}
                        onChange={handleSearchChange}
                        className="w-full sm:w-2/3 p-2 border rounded-l-lg focus:outline-none"
                        placeholder="Search for products..."
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 p-2 text-white rounded-r-lg hover:bg-blue-700 w-full sm:w-1/4"
                    >
                        Search
                    </button>
                </form>

                <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
                    <label className="font-semibold mr-2">Sort by:</label>
                    <select
                        value={`${state.sortBy}_${state.sortOrder}`}
                        onChange={handleSortChange}
                        className="border border-gray-300 rounded p-1"
                    >
                        <option value="name_asc">Name: A to Z</option>
                        <option value="name_desc">Name: Z to A</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Products Display */}
            <div className="p-4">
                {state.loading ? (
                    <SearchResultSkeleton count={6} /> 
                ) : (
                    <>
                        {state.products.length === 0 ? (
                            <div className="text-center text-lg text-gray-700">
                                No products found.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {state.products.map((product) => (
                                        <div className="flex items-center justify-center" key={product._id}>
                                            <Card product={product} />
                                        </div>
                                    ))}
                                </div>
                                <Pagination currentPage={state.currentPage} totalPages={state.totalPages} />
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchResult;
