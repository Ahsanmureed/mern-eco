import express from 'express';
import { getChatListForCustomerController, getChatListForShopOwnerController, getMessagesController } from '../controller/messagesController.js';
const messageRoutes = express.Router()
messageRoutes.get('/messages/:senderId/:recipientId',getMessagesController)
messageRoutes.get('/customers/:customerId/chats',getChatListForCustomerController)
messageRoutes.get('/chatlist/:shopOwnerId', getChatListForShopOwnerController);

export default messageRoutes