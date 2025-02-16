import React from 'react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-solid rounded-full border-t-transparent animate-spin"></div>
      
    </div>
  );
};

export default Loader;
