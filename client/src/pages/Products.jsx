import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import axios from 'axios'

const Products = () => {
  const [products,setProducts]= useState([])
  const fetchProducts = async(page)=>{
    const {data}= await axios.get(`http://localhost:3000/api/v1/product/product/pagination`)
    setProducts(data.data);
           
    
  }
  useEffect(()=>{
fetchProducts();
  },[])
 
  
  return (
    <div>
     {
      products?.map((product)=>(
        <Card product={product}/>
      ))
     }
    </div>
  )
}

export default Products
