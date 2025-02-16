import express from 'express';
import { allCustomerController, customerForgotPassword, customerLoginController, customerPaginationController, customerRegisterController, deleteCustomerController, fetchCustomerController, singleCustomerController, updateCustomerController } from '../controller/customerController.js';
import {forgotPasswordCustomer, jwtChecker} from '../middlewares/forgotPassword.js';
import {verifyToken} from '../middlewares/verifyToken.js'
const customerRoute = express.Router();
customerRoute.post('/login',customerLoginController);
customerRoute.post('/register',customerRegisterController);
customerRoute.get('/customer/:id',singleCustomerController)
customerRoute.delete('/customer/:id',deleteCustomerController)
customerRoute.patch('/customer/:id',verifyToken,updateCustomerController)
customerRoute.get('/customers',allCustomerController)
customerRoute.get('/customer/pagination',customerPaginationController)
customerRoute.post('/customer/forgot',customerForgotPassword)
customerRoute.post('/customer/forgot/:token',forgotPasswordCustomer)
customerRoute.get('/reset-password/:token',jwtChecker,(req,res)=>{
    res.json({message:'ok'})
})
customerRoute.get('/fetch',verifyToken,fetchCustomerController)
export default customerRoute;
