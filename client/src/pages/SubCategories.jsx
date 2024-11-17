import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const SubCategories = () => {
  const { id } = useParams(); 
  
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/api/v1/subcategory/by/${id}`);
        setSubcategories(response.data.data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategories();
  }, [id]);

  return (
    <div className="mt-[70px]">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 pt-8  pl-3">Subcategories:</h2>
      
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent w-12 h-12"></div>
        </div>
      ) : (
        <>
          {subcategories?.length === 0 ? (
            <h1 className=' text-3xl font-semibold text-center'>No subcategories available</h1>
          ) : (
            <div className="px-6 py-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {subcategories.map((subcategory) => (
                  <div key={subcategory._id} className="flex flex-col items-center bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-105">
                    <div className="w-full h-56 relative">
                      <img
                        className="w-full h-full object-cover rounded-t-lg"
                        src={subcategory.image}
                        alt={subcategory.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50 rounded-t-lg"></div>
                    </div>
                    <div className="w-full p-4 text-center">
                      <Link to={`/products/${subcategory._id}`}>
                        <button className="w-full py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none transition-all duration-200 ease-in-out transform hover:scale-105">
                          {subcategory.name}
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

export default SubCategories;
