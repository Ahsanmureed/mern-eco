import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Pagination = ({ currentPage, totalPages }) => {
    const navigate = useNavigate();
    const query = useLocation();
    const URLSearch = new URLSearchParams(query.search);

    const handlePageChange = (page) => {
        URLSearch.set('page', page);
        navigate(`/search?${URLSearch.toString()}`);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };


    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;

    
    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="flex justify-center my-4">
            <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`p-2 mx-1 ${currentPage === 1 ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}
            >
                Previous
            </button>

            {pageNumbers.map((page) => (
                <button
                    key={page}
                    className={`p-4 mx-1 ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => handlePageChange(page)}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`p-2 mx-1 ${currentPage === totalPages ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
