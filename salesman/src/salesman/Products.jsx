import React, { useEffect, useState } from 'react';
import SideBar from './SideBar';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../store/productSlice';

Modal.setAppElement('#root');

const Products = () => {
  const [submitError, setSubmitError] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editModalIsOpen, setEditModalIsOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    images: [],
    quantity: 1,
  });
  const [productToEdit, setProductToEdit] = useState(null);
  const [imagesToRemove, setImagesToRemove] = useState([]); // New state for images to remove

  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.user);
  const products = useSelector((state) => state.products.products);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = await dispatch(createProduct(newProduct));

    if (createProduct.fulfilled.match(action)) {
      if (user?._id) {
        dispatch(fetchProducts(user._id));
      }
      closeCreateModal();
    } else {
      setSubmitError(action.error.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const action = await dispatch(updateProduct({
      id: productToEdit._id,
      productData: newProduct,
      imagesToRemove // Include imagesToRemove in the request
    }));

    if (updateProduct.fulfilled.match(action)) {
      if (user?._id) {
        dispatch(fetchProducts(user._id));
      }
      closeEditModal();
    } else {
      setSubmitError(action.error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    const action = await dispatch(deleteProduct(id));
    if (deleteProduct.fulfilled.match(action)) {
      if (user?._id) {
        dispatch(fetchProducts(user._id));
      }
    } else {
      setSubmitError(action.error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // Limit to 5 images
    setNewProduct((prev) => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = newProduct.images[index];
    setImagesToRemove(prev => [...prev, imageToRemove]);
    setNewProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setNewProduct({
      name: product.name,
      price: product.price,
      images: product.images,
      quantity: product.quantity,
    });
    setEditModalIsOpen(true);
  };

  const closeCreateModal = () => {
    setModalIsOpen(false);
    resetForm();
  };

  const closeEditModal = () => {
    setEditModalIsOpen(false);
    resetForm();
    setImagesToRemove([]); // Reset images to remove
  };

  const resetForm = () => {
    setNewProduct({ name: '', price: '', images: [], quantity: 1 });
    setSubmitError(null);
    setProductToEdit(null);
  };

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchProducts(user._id));
    }
  }, [user, dispatch]);
  return (
    <div className="flex">
      <div className="sidebar fixed top-16 left-0 h-full">
        <SideBar />
      </div>
      <div className="container ml-64 mt-0 h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Product List</h1>

        {products?.length === 0 ? (
          <div className="text-center">
            <p className="mb-4">No products available. Create a product!</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={() => setModalIsOpen(true)}>
              Create Product
            </button>
          </div>
        ) : (
          <div>
            <button className="bg-blue-500 text-white mb-4 px-4 py-2 rounded hover:bg-blue-600" onClick={() => setModalIsOpen(true)}>
              Create Product
            </button>
            <ul className="space-y-4">
              {products?.map((product) => (
                <li key={product._id} className="border p-4 rounded shadow">
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p>Price: ${product.price}</p>
                  <p>Quantity: {product.quantity}</p>
                  {product?.images?.length > 0 && (
                    <div className="flex space-x-2 mt-2">
                      {product?.images?.map((img, idx) => (
                        <img key={idx} src={img} alt={product.name} className="w-20 h-20 rounded" />
                      ))}
                    </div>
                  )}
                  <div className="mt-2">
                    <button onClick={() => handleEditProduct(product)} className="bg-yellow-500 text-white px-2 py-1 rounded">
                      Edit Product
                    </button>
                    <button onClick={() => handleDeleteProduct(product._id)} className="bg-red-500 text-white px-2 py-1 rounded ml-2">
                      Delete Product
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Create Product Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeCreateModal}
          className="modal"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Product</h2>
            {submitError && <p className="text-red-500 mb-4">{submitError}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Name:</label>
                <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} className="border rounded p-2 w-full" />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Price:</label>
                <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} className="border rounded p-2 w-full" />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Quantity:</label>
                <input type="number" name="quantity" value={newProduct.quantity} onChange={handleInputChange} min="1" className="border rounded p-2 w-full" />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Images:</label>
                <div className="flex flex-wrap mb-2">
                  {newProduct.images.map((img, index) => (
                    <div key={index} className="relative mr-2 mb-2">
                      <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={`Product Image ${index + 1}`} className="w-20 h-20 rounded" />
                      <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <input type="file" multiple onChange={handleImageChange} className="border rounded p-2 w-full" />
                <p className="text-gray-500">Maximum 5 images. Currently: {newProduct.images.length}</p>
              </div>
              <div className="flex justify-between">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Add Product
                </button>
                <button type="button" onClick={closeCreateModal} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  Close
                </button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Edit Product Modal */}
        <Modal
          isOpen={editModalIsOpen}
          onRequestClose={closeEditModal}
          className="modal"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Product</h2>
            {submitError && <p className="text-red-500 mb-4">{submitError}</p>}
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block mb-2">Name:</label>
                <input type="text" name="name" value={newProduct.name} onChange={handleInputChange} className="border rounded p-2 w-full" />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Price:</label>
                <input type="number" name="price" value={newProduct.price} onChange={handleInputChange} className="border rounded p-2 w-full" />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Quantity:</label>
                <input type="number" name="quantity" value={newProduct.quantity} onChange={handleInputChange} min="1" className="border rounded p-2 w-full" />
              </div>
              <div className="mb-4">
                <label className="block mb-2">Images:</label>
                <div className="flex flex-wrap mb-2">
                  {newProduct?.images?.map((img, index) => (
                    <div key={index} className="relative mr-2 mb-2">
                      <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={`Product Image ${index + 1}`} className="w-20 h-20 rounded" />
                      <button type="button" onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1">
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <input type="file" multiple onChange={handleImageChange} className="border rounded p-2 w-full" />
                <p className="text-gray-500">Maximum 5 images. Currently: {newProduct.images.length}</p>
              </div>
              <div className="flex justify-between">
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Save Changes
                </button>
                <button type="button" onClick={closeEditModal} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  Close
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Products;
