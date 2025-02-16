import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import {io} from 'socket.io-client';
import { ArrowLeftIcon } from '@heroicons/react/24/outline'; 
import {  useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import axios from 'axios';

const ChatPage = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const [input, setInput] = useState('');
  const [newMessages, setNewMessages] = useState({});
  const [recipientId, setRecipientId] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeWindow, setActiveWindow] = useState('chats'); 
  const socket = useSelector((state)=>state.socket.socket)
 
  const userId = user?._id;
    console.log(chatUsers);
    
  const messagesEndRef = useRef(null);
const chatId = [userId,recipientId].sort().join('-');
 

  const token = localStorage.getItem('token')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:3000/api/v1/message/chats/${userId}`, {
          headers:{
 
              Authorization: `Bearer ${token}`,
          },
          params: {
            isShopOwner: true,
          },
        
        });
        setChatUsers(data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3000/api/v1/message/messages/${chatId}`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNewMessages(data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };
  
  // Only fetch messages when recipientId is not empty
  useEffect(() => {
    if (recipientId) {
      fetchMessages();
    }
  }, [recipientId]);
  
  useEffect(() => {
    if (userId) {
      socket.emit('registerUser', userId);
      console.log(`user registration with &{userId}`);
      

      socket.on('receiveMessage', (data) => {
        console.log(data);
        
        if (recipientId === data.senderId) {
          socket.emit("messageSeen", { chatId:[userId, recipientId].sort().join("-"), recipientId: recipientId });
        }
        
        toast.success(`New message from ${data.senderName}: ${data.content}`);

        setChatUsers((prevUsers) => {
          const existingChatIndex = prevUsers.findIndex((chat) => chat.chatId === data.chatId);

          if (existingChatIndex !== -1) {
            const updatedChats = [...prevUsers];
            const existingChat = updatedChats[existingChatIndex];

            if (
              existingChat.lastMessage.content !== data.content ||
              existingChat.lastMessage.timestamp !== data.timestamp
            ) {
              updatedChats[existingChatIndex] = {
                ...existingChat,
                shopName: data.senderName || existingChat.shopName,
                lastMessage: {
                  content: data.content,
                  timestamp: data.timestamp,
                },
              };

              return updatedChats.sort(
                (a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
              );
            }

            return prevUsers;
          }

          return [
            ...prevUsers,
            {
              chatId: data.chatId,
              shopName: data.senderName,
              lastMessage: {
                content: data.content,
                timestamp: data.timestamp,
              },
              otherUserId: data.senderId,
            },
          ].sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
        });

        setNewMessages((prevMessages) => {
          // Check if the chat already exists in newMessages (based on chatId)
          if (prevMessages.chatId === data.chatId) {
            return {
              ...prevMessages,
              messages: [
                ...prevMessages.messages,
                {
                  senderId: data.senderId,
                  recipientId: data.recipientId,
                  content: data.content,
                  seen:false,
                  timestamp: data.timestamp,
                },
              ],
            };
          }
      
          // If the chat doesn't exist, create a new chat object
          return {
            chatId: data.chatId,
            messages: [
              {
                senderId: data.senderId,
                recipientId: data.recipientId,
                content: data.content,
                seen:false,
                timestamp: data.timestamp,
              },
            ],
          };
        });
      });

  
      const handleSeenUpdate = ({ chatId }) => {
 console.log('mein chal gya hun');
 
      
        setNewMessages((prevMessages) => {
         
      
      
          const updatedMessages = prevMessages?.messages?.map((msg) => ({
            ...msg,
            seen: true,
        }));
      
      
          return { ...prevMessages, messages: [...updatedMessages] };
        });
      };
      
        socket.on("messageSeenUpdate", handleSeenUpdate);
     
      return () => {
        socket.off('receiveMessage');
        socket.off('previousMessages');
        socket.off('previousChats');
      };
    }
  }, [userId, recipientId]);
  const handleSelectUserChat = (id, name) => {
    setRecipientId(id);
    setRecipientName(name);
    setActiveWindow('messages');
    socket.emit("messageSeen", { chatId:[userId, recipientId].sort().join("-"), recipientId: id });
  };
  useEffect(() => {
    if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [newMessages,handleSelectUserChat]);

  const sendMessage = () => {
    if (input.trim() === '') return;

    const data = {
      senderId: userId,
      shopName: recipientName,
      recipientId,
      content: input.trim(),
      timestamp: Date.now(),
      senderName: user.username,
      chatId: [userId, recipientId].sort().join('-'),
    };

    socket.emit('sendMessage', data);

    setChatUsers((prevUsers) => {
      const existingChatIndex = prevUsers.findIndex((chat) => chat.chatId === data.chatId);

      if (existingChatIndex !== -1) {
        const updatedChats = [...prevUsers];
        const existingChat = updatedChats[existingChatIndex];

        if (
          existingChat.lastMessage.content !== data.content ||
          existingChat.lastMessage.timestamp !== data.timestamp
        ) {
          updatedChats[existingChatIndex] = {
            ...existingChat,
            lastMessage: {
              content: data.content,
              timestamp: data.timestamp,
            },
            shopName: data.shopName,
          };

          return updatedChats.sort(
            (a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
          );
        }

        return prevUsers;
      }

      return [
        ...prevUsers,
        {
          chatId: data.chatId,
          shopName: data.shopName,
          lastMessage: {
            content: data.content,
            timestamp: data.timestamp,
          },
          otherUserId: recipientId,
        },
      ].sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
    });

    setNewMessages((prevMessages) => {
      // Check if the chat already exists in newMessages (based on chatId)
      if (prevMessages.chatId === data.chatId) {
        return {
          ...prevMessages,
          messages: [
            ...prevMessages.messages,
            {
              senderId: data.senderId,
              recipientId: data.recipientId,
              content: data.content,
              seen:false,
              timestamp: data.timestamp,
            },
          ],
        };
      }
  
      // If the chat doesn't exist, create a new chat object
      return {
        chatId: data.chatId,
        messages: [
          {
            senderId: data.senderId,
            recipientId: data.recipientId,
            content: data.content,
            seen:false,
            timestamp: data.timestamp,
          },
        ],
      };
    });

    setInput('');
  };

 console.log(newMessages.messages);
 

  if (!user) {
    return (
      <div>
        <button onClick={() => navigate('/login',{state:{from:'/salesman/chat'}})} className="bg-blue-600 h-10 my-auto px-6 rounded-md text-white">
          Please Login First
        </button>
      </div>
    );
  }
  
  return (
    <div className="chat-page flex flex-col h-screen bg-gray-50">
    {/* Chats Window */}
    {activeWindow === 'chats' && (
      <div className="flex-1 p-6 overflow-y-auto">
        <h3 className="text-2xl font-semibold text-gray-800 text-center mb-6">Previous Chats</h3>
        <ul className="space-y-4">
          {chatUsers?.map((user) => (
            <li
              key={user.otherUserId}
              onClick={() => handleSelectUserChat(user.otherUserId, user.shopName)}
              className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md hover:bg-gray-100 cursor-pointer transition duration-300"
            >
              <div className="flex flex-col">
                <span className="text-lg font-medium text-gray-800">{user?.shopName?.length>30 ? user?.shopName?.slice(0,30)+'...':user?.shopName }</span>
                <p className="text-sm text-gray-600 mt-2">
                  {user?.lastMessage?.content?.length > 35?user?.lastMessage?.content?.slice(0, 35)+'...':user?.lastMessage?.content }
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}
  
    {/* Chat Window */}
    {activeWindow === 'messages' && (
  <div className="flex-1 flex flex-col bg-white rounded-lg shadow-md">
    {/* Header */}
    <div className="fixed p-2 h-16 bg-gray-50 w-full flex items-center justify-center">
      <button
        onClick={() => {setActiveWindow('chats'); setRecipientId(null);}}
        className="absolute left-2 flex items-center gap-2 text-gray-500 text-lg font-medium"
      >
        <ArrowLeftIcon className="h-5 w-5" />
        Back
      </button>
      <h2 className="text-2xl font-semibold text-gray-800">{recipientName}</h2>
    </div>
    
    {/* Messages Window */}
    <div className="flex-1 overflow-y-auto space-y-4 pb-16 pt-20">
      {newMessages?.messages?.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'} px-2.5`}
        >
          <div
            className={` max-w-[70%] p-3 rounded-lg break-words ${msg.senderId === userId ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            <p className="text-sm">{msg.content}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>

    {/* Input and Send Button (Fixed at the bottom) */}
    <div className="flex fixed bottom-0  w-full bg-white p-3 ">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="border outline-none rounded-l-lg p-2 flex-grow text-sm sm:text-base"
      />
      <button
        onClick={sendMessage}
        className="bg-blue-500 text-white rounded-r-lg p-2 text-sm sm:text-base"
      >
        Send
      </button>
    </div>
  </div>
)}


  </div>
  
  );
};

export default ChatPage;
