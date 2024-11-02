import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import axios from 'axios';
import Pagination from '../components/Pagination';
import SearchResultSkeleton from  '../components/skeltons/SearchResultSkelton';

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
    });

    const fetchProducts = async (page) => {
        setState((prev) => ({ ...prev, loading: true }));

        const URLSearch = new URLSearchParams(query.search);
        URLSearch.set('page', page);
        URLSearch.set('sortBy', state.sortBy);
        URLSearch.set('sortOrder', state.sortOrder);

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
        setState((prev) => ({ ...prev, currentPage: page }));
        fetchProducts(page);
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

    return (
        <div className="flex flex-col lg:flex-row pt-[70px]">
            <div className="fixed w-1/4 p-4 ml-4 hidden md:block h-full overflow-y-auto">
                <h2 className="text-lg font-bold mb-4 text-left">Filters</h2>
                <div>
                    <h3 className="font-semibold mb-2 text-left">Sort by:</h3>
                    <div className="flex flex-col">
                        {['name_asc', 'name_desc', 'price_asc', 'price_desc'].map((value) => (
                            <label className="ml-2" key={value}>
                                <input 
                                    type="radio" 
                                    name="sort" 
                                    value={value} 
                                    checked={state.sortBy === value.split('_')[0] && state.sortOrder === value.split('_')[1]}
                                    onChange={handleSortChange}
                                />
                                <strong> {value.split('_')[0]}:</strong> {value.includes('asc') ? 'Low to High' : 'High to Low'}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="ml-1/4 w-3/4 ml-64 p-4"> 
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
                                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {state.products.map((product) => (
                                        <div className='flex items-center justify-center' key={product._id}>
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
