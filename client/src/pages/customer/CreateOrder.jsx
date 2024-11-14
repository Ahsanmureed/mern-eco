import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import { clearCart } from '../../store/cartSlice';
import toast from 'react-hot-toast';
import { createOrder } from '../../store/orderSlice';

const CreateOrder = () => {
    const dispatch = useDispatch()
  const items = useSelector((state) => state.cart.items);
  const navigate = useNavigate()
  const [error,setError]= useState('')
  const [orderPlaced,setOrderPlaced]= useState(false)
  const total_amount = items?.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  const [order, setOrder] = useState({
    products: items.map((item) => ({
      product_id: item._id,
      product_quantity: item.quantity,
    })),
    total_amount,
    shipment_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      phone_number: '',
    },
    billing_address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      phone_number: '',
    },
    billing_type: 'COD',
  });

  const handleChange = (e, field, isAddress = false, addressType = '') => {
    const { name, value } = e.target;

    if (isAddress) {
      setOrder((prevOrder) => ({
        ...prevOrder,
        [addressType]: {
          ...prevOrder[addressType],
          [name]: value,
        },
      }));
    } else {
      setOrder((prevOrder) => ({ ...prevOrder, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

   
 
    try {
        const action = await dispatch(createOrder(order));
        if (createOrder.fulfilled.match(action)) {
          setOrderPlaced(true)
          toast.success('Order created successfully!');
          localStorage.removeItem('cart');
          dispatch(clearCart());
        } else {
          setError(action.error.message)
        }
      } catch (error) {
        setError(action.error.message)
      }
  };

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      navigate('/cart');
    } else if (orderPlaced) {
      navigate('/orders');  
    }
  }, [ orderPlaced]);    
  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto bg-white p-6 mt-[80px]  shadow-md rounded-lg">
      
      <h1 className="text-2xl text-center font-bold mb-6 text-gray-800">Place Order</h1>
      
      <div>
        <h1 className="font-semibold mb-1.5">Products:</h1>
        <div className="space-y-2">
          {items?.map((product) => (
            <div key={product._id} className="flex items-center justify-between border border-gray-400 px-2 py-6">
              <div className="flex items-center gap-2">
                <img className="w-20 h-10" src={product?.images[0]} alt="" />
                <h1>{product?.name}</h1>
              </div>
              <h1>Quantity: x{product?.quantity}</h1>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3 mt-3">
        <label className="block text-gray-700">Total Amount: $<span className="font-semibold">{total_amount}</span></label>
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Shipment Address</h2>
        {['street', 'city', 'state', 'zip', 'phone_number'].map((field) => (
          <div key={field} className="mb-2">
            <input
              type="text"
              name={field}
              placeholder={field.replace('_', ' ').toUpperCase()}
              value={order.shipment_address[field]}
              onChange={(e) => handleChange(e, field, true, 'shipment_address')}
              className="p-2 border rounded w-full"
              
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Billing Address</h2>
        {['street', 'city', 'state', 'zip', 'phone_number'].map((field) => (
          <div key={field} className="mb-2">
            <input
              type="text"
              name={field}
              placeholder={field.replace('_', ' ').toUpperCase()}
              value={order.billing_address[field]}
              onChange={(e) => handleChange(e, field, true, 'billing_address')}
              className="p-2 border rounded w-full"
              
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700">Billing Type</label>
        <select
          name="billing_type"
          value={order.billing_type}
          onChange={handleChange}
          className="p-2 border rounded w-full"
        >
          <option value="COD">COD</option>
          <option value="CardPayment">CardPayment</option>
        </select>
      </div>
      {error && (<h1  className="text-red-500 text-sm mb-3">{error}</h1>)}
      <button type="submit" className="bg-blue-500 flex mx-auto text-white p-2 rounded">
        Submit Order
      </button>
    </form>
  );
};

export default CreateOrder;
