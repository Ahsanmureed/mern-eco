import express from 'express';
import {   previousChatsController, previousMessagesController } from '../controller/messagesController.js';
import {verifyToken} from '../middlewares/verifyToken.js'
const messageRoutes = express.Router()
messageRoutes.get('/messages/:chatId',verifyToken,previousMessagesController)
messageRoutes.get('/chats/:userId',verifyToken,previousChatsController)

export default messageRoutes