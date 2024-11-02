import React, { useState } from 'react'
import logo from '../assets/logo.png'
import { useNavigate ,Link} from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { registerUser } from '../store/userSlice'
import toast from 'react-hot-toast'
const Register = () => {
  const [error,setError]= useState('') 
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [values,setValues] = useState({
        username:'',
        email:'',
        password:''
    })
    const handleChange = (e)=>{
        setValues({...values,[e.target.name]:e.target.value})
    }
    const handleSubmit =async(e)=>{
        e.preventDefault();
   try {
    const action =await dispatch(registerUser(values));
    if(registerUser.fulfilled.match(action)){
    toast.success(action.payload)
    }
    else {
     setError(action.error.message)

 }
   } catch (error) {
    setError(action.error.message)

   }
    }
  return (
    <>
<div className="flex min-h-full flex-1 pt-[120px] flex-col justify-center px-6 py-12 lg:px-8">
  <div className="sm:mx-auto sm:w-full sm:max-w-sm">
    <img
      alt="Your Company"
      src={logo}
      className="mx-auto h-10 w-auto"
    />
    <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
      Create an account
    </h2>
  </div>

  <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
    <form onSubmit={handleSubmit} className="space-y-6">
    <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
          Username
        </label>
        <div className="mt-2">
          <input onChange={handleChange}
            id="email"
            name="username"
           type='text'
            autoComplete="email"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
          Email address
        </label>
        <div className="mt-2">
          <input
          onChange={handleChange}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
            Password
          </label>
         
        </div>
        <div className="mt-2">
          <input
          onChange={handleChange}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
        </div>
      </div>
      {error && (
                            <div className="text-red-500 text-sm mt-2">
                                {error} 
                            </div>
                        )}
      <div>
        <button
          type="submit"
          className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
           Register
        </button>
      </div>
    </form>

    <p className="mt-10 text-center text-sm text-gray-500">
                        Already have an account? {''}
                        <Link to={'/login'} className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                            login here
                        </Link>
                    </p>
  </div>
</div>
</>
  )
}

export default Register