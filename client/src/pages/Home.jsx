import React from "react";
import bannerBg from "../assets/banner-bg.jpg";
import Categories from "../components/Categories";

const Home = () => {
  return (
   <>
    <div
      className=" height bg-cover bg-top flex items-center mt-[70px]" 
      style={{ backgroundImage: `url(${bannerBg})` }}
    >
      <div className="bg-opacity-60 w-full h-full flex items-center">
        <div className="w-full max-w-3xl mx-8 md:mx-16 lg:mx-28 p-6 md:p-12 lg:p-16 text-left text-white">
          <h3 className="text-lg md:text-xl lg:text-2xl font-semibold tracking-wider">
            MEN COLLECTION
          </h3>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold my-2 leading-tight">
            Show Your <br /> Personal Style
          </h1>
          <p className="text-base md:text-lg lg:text-xl mt-2">
            Fowl saw dry which a above together place.
          </p>
        </div>
      </div>
    </div>


    <Categories/>
   </>
  );
};

export default Home;
