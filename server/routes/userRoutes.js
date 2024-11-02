import { allUserController, deleteUserController, forgotPassword, userLoginController ,userRegisterController, singleUserController, updateUserController, userPaginationController, fetchUserController} from '../controller/userController.js';
import express from 'express';
import {forgotPasswordUser} from '../middlewares/forgotPassword.js';
import { verifyToken } from '../middlewares/verifyToken.js';
const userRouter = express.Router();
userRouter.post('/login',userLoginController);
userRouter.post('/register',userRegisterController);
userRouter.get('/user/:id',singleUserController)
userRouter.delete('/user/:id',deleteUserController)
userRouter.put('/user/:id',updateUserController)
userRouter.get('/users',allUserController)
userRouter.get('/user/pagination',userPaginationController)
userRouter.post('/user/forgot',forgotPassword)
userRouter.post('/user/forgot/:token',forgotPasswordUser)
userRouter.get('/fetch',verifyToken,fetchUserController)
export default userRouter;
