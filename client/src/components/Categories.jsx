import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:3000/api/v1/category/all');
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className='bg-gray-50'>
      <h1 className="text-4xl font-semibold text-gray-800 mb-8 pt-10 text-center">Shop by Categories</h1>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent w-16 h-16"></div>
        </div>
      ) : (
        <>
          {categories?.length === 0 ? (
            <h1 className='mt-[90px] text-3xl font-semibold mb-10 text-center'>No categories available</h1>
          ) : (
            <div className="px-6 py-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {categories?.map((category) => (
                  <div key={category._id} className="flex flex-col items-center bg-white rounded-xl">
                    <div className="w-full h-56 relative">
                      <img
                        className="w-full h-full object-cover rounded-t-xl"
                        src={category.image}
                        alt={category.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50 rounded-t-xl"></div>
                    </div>
                    <div className="w-full p-4 text-center">
                      <Link to={`/subcategory/${category._id}`}>
                        <button className="w-full py-3 bg-gradient-to-r bg-blue-600 text-white font-semibold text-lg rounded-full transition-all duration-300 ease-in-out transform hover:scale-105">
                          {category.name}
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Categories;
