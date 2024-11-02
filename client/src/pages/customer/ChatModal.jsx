import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import socket from '../../components/socket'; 
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ChatModal = ({ isOpen, onClose, recipientId: initialRecipientId, recipientName: initialRecipientName }) => {
  const user = useSelector((state) => state.user.user);
  
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [recipientId, setRecipientId] = useState(initialRecipientId);
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = user?._id;
  
  const messagesEndRef = useRef(null); // Ref for the messages end

  useEffect(() => {
    if (isOpen && userId) {
      socket.emit('registerUser', userId);
      fetchPreviousMessages();
      fetchChatUsers();

      const handleReceiveMessage = (data) => {
        setMessages((prevMessages) => [...prevMessages, data]);
        updateChatUsers(data);
        toast.success(`New message from ${data.senderName}: ${data.content}`);
      };

      const handleUpdateLastMessage = ({ senderId, recipientId, content }) => {
        const otherUserId = recipientId === userId ? senderId : recipientId;
        updateChatUsersInList(otherUserId, content);
      };

      socket.on('receiveMessage', handleReceiveMessage);
      socket.on('updateLastMessage', handleUpdateLastMessage);

      return () => {
        socket.off('receiveMessage', handleReceiveMessage);
        socket.off('updateLastMessage', handleUpdateLastMessage);
      };
    }
  }, [isOpen, userId, recipientId]);

  useEffect(() => {
    if (recipientId) {
      fetchPreviousMessages();
    }
  }, [recipientId]);

  useEffect(() => {
    // Scroll to the bottom whenever messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchChatUsers = async () => {
    if (userId) {
      try {
        const response = await axios.get(`http://localhost:3000/api/v1/message/customers/${userId}/chats`);
        setChatUsers(response.data);
        
      } catch (error) {
        console.error('Error fetching chat users:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchPreviousMessages = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/v1/message/messages/${recipientId}/${user?._id}`);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Error fetching previous messages:', error);
    }
  };

  const sendMessage = () => {
    if (input.trim() === '') return;

    const messageData = {
      senderId: userId,
      recipientId,
      content: input,
      timestamp: Date.now(),
      senderName: user.username, // Include sender name for notifications
    };

    socket.emit('sendMessage', messageData);
    setMessages((prevMessages) => [...prevMessages, messageData]);
    setInput('');

    // Emit updateLastMessage event
    socket.emit('updateLastMessage', { senderId: userId, recipientId, content: input });
  };

  const handleSelectUser = (id, name) => {
    setRecipientId(id);
    setRecipientName(name);
  };

  const updateChatUsers = (data) => {
    const { senderId, recipientId, content } = data;
    const otherUserId = recipientId === userId ? senderId : recipientId;

    setChatUsers((prevUsers) => {
      return prevUsers.map((user) => {
        if (user.id === otherUserId) {
          return { ...user, lastMessage: content };
        }
        return user;
      });
    });
  };

  const updateChatUsersInList = (userId, content) => {
    setChatUsers((prevUsers) => {
      return prevUsers.map((user) => {
        if (user.id === userId) {
          return { ...user, lastMessage: content };
        }
        return user;
      });
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end justify-end z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg h-[65vh] w-[50vw] mr-[5%] flex shadow-lg">
        <div className="w-1/3 border-r p-4">
          <h3 className="text-lg font-bold">Previous Chats</h3>
          {loading ? (
            <p>Loading chat users...</p>
          ) : (
            <ul>
              {chatUsers.map(user => (
                <li
                  key={user.id}
                  onClick={() => handleSelectUser(user.id, user.shopName)}
                  className={`cursor-pointer hover:bg-gray-200 p-2 ${recipientId === user.id ? 'bg-blue-100' : ''}`}
                >
                  <div className="flex justify-between">
                    <span>{user.shopName}</span>
                    <p className="text-gray-500 text-sm">
                                    {user.lastMessage.length > 10 ? `${user.lastMessage.slice(0, 10)}...` : user.lastMessage}
                                  </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex-1 flex flex-col p-4">
          {user ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">{`Chat with ${recipientName || '...'}`}</h2>
                <button onClick={onClose} className="text-gray-500">X</button>
              </div>
              <div className="flex-1 h-64 overflow-y-auto mb-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`mb-2 ${msg.senderId === userId ? 'text-right' : 'text-left'}`}>
                    <p className={`inline-block p-2 rounded-lg ${msg.senderId === userId ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                      {msg.content}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} /> {/* Reference for scrolling */}
              </div>
              <div className="mt-auto flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="border rounded-l-lg p-2 flex-grow"
                />
                <button onClick={sendMessage} className="bg-blue-500 text-white rounded-r-lg p-2">Send</button>
              </div>
            </>
          ) : (
            <Link to='/login' className='bg-blue-600 p-3 rounded-md text-white text-[20px] font-semibold mx-auto my-auto'>
              Please login first
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
