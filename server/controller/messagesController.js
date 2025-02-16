import messageModel from "../models/messageSchema.js";
import customerModel from "../models/customerSchema.js";
import shopModel from "../models/shopSchema.js";


const previousMessagesController = async(req,res)=>{
    const { chatId } = req.params; 

    try {
      const chat = await messageModel.findOne({ chatId });
  
      if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
      }
  
      res.json({ data: chat });
    } catch (error) {
      console.error('Error fetching previous messages:', error);
      res.status(500).send('Server error');
    }
}
const previousChatsController = async(req,res)=>{
    const userId = req.params.userId;
    const {isShopOwner} = req.query || false;
   
    
  try {
    // Find all chats involving the user
    const chats = await messageModel.find({
      messages: { $elemMatch: { $or: [{ senderId: userId }, { recipientId: userId }] } },
    });
   
    const previousChats = [];

    for (let chat of chats) {
        for (let message of chat.messages) {
          const otherUserId = message.senderId.equals(userId) ? message.recipientId : message.senderId;
  
          let otherUserDetails;
          if (isShopOwner) {
            otherUserDetails = await customerModel.findById(otherUserId); 
            
          } else {
            otherUserDetails = await shopModel.findOne({ userId: otherUserId });
          }
  
          if (otherUserDetails) {
            previousChats.push({
              chatId: chat.chatId,
              shopName: isShopOwner ? otherUserDetails.username : otherUserDetails.name, 
              lastMessage: chat.messages[chat.messages.length - 1],
              otherUserId,
            });
          }
          break;
        }
      }

    previousChats.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

    res.json(previousChats);
  } catch (error) {
    console.error('Error fetching previous chats:', error);
    res.status(500).send('Server error');
  }
}
export {previousChatsController,previousMessagesController}