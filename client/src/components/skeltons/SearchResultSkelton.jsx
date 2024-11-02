import React from 'react';

const SearchResultSkelton = ({ count }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="flex items-center justify-center">
                    <div className="animate-pulse border rounded-lg w-full h-48 bg-gray-300">
                        <div className="h-4 bg-gray-400 rounded mb-2"></div>
                        <div className="h-4 bg-gray-400 rounded mb-2"></div>
                        <div className="h-4 bg-gray-400 rounded mb-2"></div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SearchResultSkelton;
