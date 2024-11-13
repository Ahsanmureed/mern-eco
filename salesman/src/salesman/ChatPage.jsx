import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const socket = io('http://localhost:3000');

const ChatContainer = () => {
    const user = useSelector((state) => state.user.user);
    const [chatList, setChatList] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef(null); 
console.log(messages);

    useEffect(() => {
        if (user?._id) {
            socket.emit('registerUser', user._id);
        }
    }, [user?._id]);

    const fetchChatList = async () => {
        if (user?._id) {
            setLoadingChats(true);
            try {
                const response = await axios.get(`http://localhost:3000/api/v1/message/chatlist/${user._id}`);
                setChatList(response.data);
            } catch (error) {
                console.error('Error fetching chat list:', error);
                toast.error('Failed to fetch chat list.');
            } finally {
                setLoadingChats(false);
            }
        }
    };

    useEffect(() => {
        fetchChatList();
    }, [user?._id]);

    useEffect(() => {
        const handleReceiveMessage = (data) => {
            console.log(data);
            
            if (data.recipientId === user?._id || data.senderId === user?._id) {
                const otherUserId = data.recipientId === user._id ? data.senderId : data.recipientId;

                if (selectedChat?.recipientId === otherUserId) {
                    setMessages((prevMessages) => [...prevMessages, data]);
                }
                
                fetchChatList();
                toast.success(`New message from ${data.senderName}: ${data.content}`);
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [user?._id, selectedChat]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleChatSelect = async (recipientId, recipientName) => {
        setSelectedChat({ recipientId, recipientName });
        setMessages([]);
        setLoadingMessages(true);

        try {
            const response = await axios.get(`http://localhost:3000/api/v1/message/messages/${recipientId}/${user?._id}`);
            console.log(response);
            
            setMessages(response.data );
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages.');
        } finally {
            setLoadingMessages(false);
        }
    };

    const sendMessage = () => {
        if (input.trim() === '') return;

        const messageData = {
            senderId: user?._id,
            recipientId: selectedChat.recipientId,
            content: input,
            timestamp: Date.now(),
            senderName: user.username,
        };

        socket.emit('sendMessage', messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);

        // Update the chat list immediately after sending
        setChatList((prevList) => 
            prevList.map((chat) => 
                chat.id === selectedChat.recipientId 
                    ? { ...chat, lastMessage: input, timestamp: messageData.timestamp } 
                    : chat
            )
        );

        
        setInput('');
    };
    console.log(chatList);
    
    return (
       <>
       {
        chatList?.length >0 ? (<><div className="flex h-screen">
            <div className="w-1/3 p-4 border-r-2">
                <h1 className="text-lg font-bold mb-2">Chat List</h1>
                {loadingChats ? (
                    <p>Loading chats...</p>
                ) : (
                    chatList.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => handleChatSelect(chat?.id, chat?.name)}
                            className={`chat-item cursor-pointer mb-2 p-2 rounded ${
                                selectedChat?.recipientId === chat.id ? 'bg-blue-200' : 'hover:bg-gray-200'
                            }`}
                        >
                            <div className="flex justify-between">
                                <p>{chat.name}</p>
                                {chat.lastMessage && (
                                    <p className="text-gray-500 text-sm">
                                    {chat.lastMessage.length > 10 ? `${chat.lastMessage.slice(0, 10)}...` : chat.lastMessage}
                                  </p>
                                  
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        <h2 className="text-lg font-bold mb-2">{`Chat with ${selectedChat.recipientName}`}</h2>
                        <div className="flex-1 overflow-y-auto mb-4 border rounded p-2">
                            {loadingMessages ? (
                                <p>Loading messages...</p>
                            ) : (
                                messages.map((msg, index) => (
                                    <div key={index} className={`mb-2 ${msg.senderId === user?._id ? 'text-right' : 'text-left'}`}>
                                        <p className={`inline-block p-2 rounded-lg ${msg.senderId === user?._id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                                            {msg.content}
                                        </p>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        <div className="flex mb-3">
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
                    <p>Select a chat to start messaging.</p>
                )}
            </div>
        </div></>):<h1 className='text-3xl text-center mt-4 font-semibold '>No chats</h1>
       }
       </>
    );
};

export default ChatContainer;
