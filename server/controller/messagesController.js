import messageModel from "../models/messageSchema.js";
import customerModel from "../models/customerSchema.js";
import userModel from '../models/userSchema.js'
import mongoose from "mongoose";
const getMessagesController =async (req,res)=>{
    const { senderId, recipientId } = req.params;
    const chatId = [senderId, recipientId].sort().join('-');
  
    try {
      const messages = await messageModel.findOne({ chatId });
      res.json(messages ? messages.messages : []);
    } catch (error) {
      res.status(500).send('Error fetching messages');
    }
}
const getChatListForShopOwnerController = async (req, res) => {
    const { shopOwnerId } = req.params;

    try {
        // Fetch all chats where the shop owner is involved
        const chats = await messageModel.find({
            $or: [
                { "messages.senderId": shopOwnerId },
                { "messages.recipientId": shopOwnerId }
            ]
        });

        // Object to store last messages and unique user IDs
        const userMessages = {};

        chats.forEach(chat => {
            chat.messages.forEach(message => {
                const otherUserId = message.senderId.toString() === shopOwnerId
                    ? message.recipientId.toString()
                    : message.senderId.toString();

                // Update last message for each user
                if (!userMessages[otherUserId]) {
                    userMessages[otherUserId] = {
                        lastMessage: message.content,
                        timestamp: message.timestamp,
                    };
                } else {
                    // Check if this message is more recent
                    if (new Date(message.timestamp) > new Date(userMessages[otherUserId].timestamp)) {
                        userMessages[otherUserId].lastMessage = message.content;
                        userMessages[otherUserId].timestamp = message.timestamp;
                    }
                }
            });
        });

        // Convert object keys to array of user IDs
        const userIds = Object.keys(userMessages);

        // Fetch user details
        const users = await customerModel.find({ _id: { $in: userIds } });

        // Map to create a chat list with names and last messages
        const chatList = users.map(user => ({
            id: user._id.toString(),
            name: user.username, // Adjust based on your User model
            lastMessage: userMessages[user._id.toString()].lastMessage,
            timestamp: userMessages[user._id.toString()].timestamp, // Include timestamp for sorting
        }));

        // Sort chatList by the last message timestamp, most recent first
        chatList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json(chatList);
    } catch (error) {
        console.error('Error fetching chat list:', error);
        res.status(500).send('Error fetching chat list');
    }
};




  
const getChatListForCustomerController = async (req, res) => {
    const { customerId } = req.params;
    const custId = new mongoose.Types.ObjectId(customerId);

    try {
        const chatList = await messageModel.aggregate([
            {
                $match: {
                    $or: [
                        { "messages.senderId": custId },
                        { "messages.recipientId": custId }
                    ]
                }
            },
            {
                $unwind: "$messages"
            },
            {
                $match: {
                    $or: [
                        { "messages.senderId": custId },
                        { "messages.recipientId": custId }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$messages.senderId", custId] },
                            "$messages.recipientId",
                            "$messages.senderId"
                        ]
                    },
                    lastMessage: { $last: "$messages.content" }, // Capture last message content
                    lastMessageTimestamp: { $last: "$messages.timestamp" } // Capture last message timestamp
                }
            },
            {
                $lookup: {
                    from: "shops",
                    localField: "_id",
                    foreignField: "userId",
                    as: "shopInfo"
                }
            },
            {
                $unwind: {
                    path: "$shopInfo",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    id: "$_id",
                    shopName: { $ifNull: ["$shopInfo.name", "Unknown Shop"] },
                    lastMessage: "$lastMessage",
                    lastMessageTimestamp: "$lastMessageTimestamp"
                }
            },
            {
                $sort: {
                    lastMessageTimestamp: -1 // Sort by last message timestamp, most recent first
                }
            }
        ]);

        res.json(chatList);
    } catch (error) {
        console.error('Error fetching chat list:', error);
        res.status(500).send('Error fetching chat list');
    }
};


const LastMessageController = async(req,res)=>{}

export {getMessagesController,getChatListForCustomerController,getChatListForShopOwnerController,LastMessageController }