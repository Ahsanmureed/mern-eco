import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    chatId: { type: String, required: true }, 
    messages: [
      {
        senderId: {  type: mongoose.Schema.Types.ObjectId, required: true },
        recipientId:{ type: mongoose.Schema.Types.ObjectId, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  });

const messageModel = mongoose.model('Message', messageSchema);
export default messageModel;
