import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import messageModel from '../models/messageSchema.js';
import shopModel from '../models/shopSchema.js';

const socketSetup = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://localhost:5174'],
      methods: ['GET', 'POST'],
    },
  });

  const users = {};
  const verifyToken = (token) => {
    if (!token) {
      console.error("Token is missing");
      return null; 
    }
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      return decoded; 
    } catch (error) {
      return null; 
    }
  };

  io.on('connection', (socket) => {
    console.log('User Connected', socket.id);

    const token = socket.handshake.auth.token;
   
   
    const user = verifyToken(token); 
    if (!user) {
      socket.emit('error', 'Authentication failed');
      socket.disconnect(); 
      return;
    }

    console.log(`User ${user._id} authenticated with socket ID ${socket.id}`);
    users[user._id] = socket.id; 

    socket.on('registerUser', (userId) => {
      users[userId] = socket.id;
      console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });
    io.emit('onlineUsers',Object.keys(users))

    socket.on('sendMessage', async ({ recipientId, content, senderId, senderName }) => {
      if (!user || user._id !== senderId) {
        socket.emit('error', 'Authentication failed. You are not authorized to send messages.');
        return;
      }

      try {
        const chatId = [senderId, recipientId].sort().join('-');

        const messageDoc = await messageModel.findOneAndUpdate(
          { chatId },
          {
            $push: {
              messages: {
                senderId,
                recipientId,
                content,
                timestamp: Date.now(),
              },
            },
          },
          { new: true, upsert: true }
        );

        let recipientShopName = null;
        const recipientShop = await shopModel.findOne({ userId: recipientId });
        if (recipientShop) {
          recipientShopName = recipientShop.name;
        } else {
          const senderShop = await shopModel.findOne({ userId: senderId });
          if (senderShop) {
            recipientShopName = senderShop.name;
          }
        }

        const recipientSocketId = users[recipientId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('receiveMessage', {
            chatId,
            content,
            senderId,
            recipientId,
            senderName,
            shopName: recipientShopName,
            timestamp: Date.now(),
          });
        }

      } catch (error) {
        console.error('Error while sending message:', error);
        socket.emit('error', 'Error while sending message. Please try again.');
      }
    });
    socket.on('messageSeen', async ({ chatId, recipientId }) => {
      console.log('......>>>>',recipientId);
      
      try {
        await messageModel.updateOne(
          { chatId },
          { $set: { "messages.$[msg].seen": true } },
          { arrayFilters: [{ "msg.senderId": recipientId, "msg.seen": false }] }
        );
    
        console.log(`Messages in chat ${chatId} seen by ${recipientId}`);
    
        // Notify the sender that their messages were seen
        const senderSocketId = users[recipientId];
        if (senderSocketId) {
          io.to(senderSocketId).emit('messageSeenUpdate', { chatId });
        }
      } catch (error) {
        console.error('Error updating message seen status:', error);
      }
    });
    socket.on('disconnect', () => {
      

      for (const userId in users) {
        if (users[userId] === socket.id) {
          delete users[userId]; 
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
      io.emit('onlineUsers',Object.keys(users))
    });
  });

  return io;
};

export default socketSetup;
