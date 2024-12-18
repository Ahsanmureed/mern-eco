import { Server } from 'socket.io';
import messageModel from '../models/messageSchema.js';

const socketSetup = (server) => {
    const io = new Server(server, {
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:5174'],
            methods: ['GET', 'POST'],
        },
    });

    const users = {};

    io.on('connection', (socket) => {
        console.log('User Connected', socket.id);

        socket.on('registerUser', (userId) => {
            users[userId] = socket.id;
            console.log(`User ${userId} registered with socket ID ${socket.id}`);
        });

        socket.on('sendMessage', async ({ recipientId, content, senderId, senderName }) => {
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
                                timestamp: Date.now() 
                            } 
                        }
                    },
                    { new: true, upsert: true } // Ensure we create the document if it doesn't exist
                );
        
                // Ensure the recipient is connected (via their socketId)
                const recipientSocketId = users[recipientId];
                if (recipientSocketId) {
                    // Emit the message to the recipient
                    io.to(recipientSocketId).emit('receiveMessage', {
                        content,
                        senderId,
                        recipientId,
                        senderName,
                        timestamp: Date.now(),
                    });
        
                    io.emit('updateLastMessage', {
                        senderId,
                        recipientId,
                        content,
                    });
                } else {
                    console.log(`User ${recipientId} is not connected`);
                }
            } catch (error) {
                console.error('Error while sending message:', error);
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
        });
    });

    return io; 
};

export default socketSetup;
