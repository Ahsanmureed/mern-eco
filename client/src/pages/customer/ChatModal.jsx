import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import Spinner from "../../components/Spinner";
import axios from "axios";
import { FiCircle } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
const ChatModal = ({
  isOpen,
  onClose,
  initialRecipientId,
  initialRecipientName,
  slug,
}) => {
  const user = useSelector((state) => state.user.user);
  const params = useParams().slug;

  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [newMessages, setNewMessages] = useState([]);
  const [recipientId, setRecipientId] = useState(initialRecipientId);
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [activeWindow, setActiveWindow] = useState("chats");
  const [chatUsers, setChatUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const socket = useSelector((state) => state.socket.socket);
  const onlineUsers = useSelector((state) => state.chat.users);

  const userId = user?._id;

  const messagesEndRef = useRef(null);
  const chatId = [userId, recipientId].sort().join("-");
  useEffect(() => {
    if (isOpen && recipientId) {
      socket.emit("messageSeen", {
        chatId: [userId, recipientId].sort().join("-"),
        recipientId: recipientId,
      });
    }
  }, [isOpen, recipientId]); 
  
  const token = localStorage.getItem("token");
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [messagesResponse, chatsResponse] = await Promise.allSettled([
        axios.get(`http://localhost:3000/api/v1/message/messages/${chatId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`http://localhost:3000/api/v1/message/chats/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (
        messagesResponse.status === "fulfilled" &&
        messagesResponse.value.data.data !== newMessages
      ) {
        setNewMessages(messagesResponse.value.data.data);
      }

      if (
        chatsResponse.status === "fulfilled" &&
        chatsResponse.value.data !== chatUsers
      ) {
        setChatUsers(chatsResponse.value.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [ userId,recipientId]);

  useEffect(() => {
    if (activeWindow === "messages" && recipientId) {
      fetchData();
    }
  }, [activeWindow, recipientId]);

  useEffect(() => {
    if (isOpen && userId) {
      const handleReceiveMessage = (data) => {
        toast.success(`New message from ${data.senderName}: ${data.content}`);
        if (recipientId === data.senderId) {
          socket.emit("messageSeen", {
            chatId: [userId, recipientId].sort().join("-"),
            recipientId: recipientId,
          });
        }
        setChatUsers((prevUsers) => {
          const existingChatIndex = prevUsers.findIndex(
            (chat) => chat.chatId === data.chatId
          );

          if (existingChatIndex !== -1) {
            const updatedChats = [...prevUsers];
            const existingChat = updatedChats[existingChatIndex];

            if (
              existingChat.lastMessage.content !== data.content ||
              existingChat.lastMessage.timestamp !== data.timestamp
            ) {
              updatedChats[existingChatIndex] = {
                ...existingChat,
                shopName: data.shopName || existingChat.shopName,
                lastMessage: {
                  content: data.content,
                  timestamp: data.timestamp,
                },
              };

              return updatedChats.sort(
                (a, b) =>
                  new Date(b.lastMessage.timestamp) -
                  new Date(a.lastMessage.timestamp)
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
          ].sort(
            (a, b) =>
              new Date(b.lastMessage.timestamp) -
              new Date(a.lastMessage.timestamp)
          );
        });

        setNewMessages((prevMessages) => {
          if (prevMessages.chatId === data.chatId) {
            return {
              ...prevMessages,
              messages: [
                ...prevMessages.messages,
                {
                  senderId: data.senderId,
                  recipientId: data.recipientId,
                  content: data.content,
                  seen: false,
                  timestamp: data.timestamp,
                },
              ],
            };
          }

          return {
            chatId: data.chatId,
            messages: [
              {
                senderId: data.senderId,
                recipientId: data.recipientId,
                content: data.content,
                seen: false,
                timestamp: data.timestamp,
              },
            ],
          };
        });
      };
      socket.on("error", (errorMessage) => {
        setError(errorMessage);
        if (errorMessage === "Authentication failed") {
          window.location.href = "/login";
        }
      });
      const handleSeenUpdate = ({ chatId }) => {
        console.log("mein chal gya hun");

        setNewMessages((prevMessages) => {
          const updatedMessages = prevMessages?.messages?.map((msg) => ({
            ...msg,
            seen: true,
          }));

          return { ...prevMessages, messages: [...updatedMessages] };
        });
      };

      socket.on("messageSeenUpdate", handleSeenUpdate);
      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
        socket.off("previousChats");
        socket.off("previousMessages");
      };
    }
  }, [isOpen, userId, recipientId]);

  const handleSelectUserChat = (id, name) => {
    setRecipientId(id);
    setRecipientName(name);
    setActiveWindow("messages");
    setNewMessages([]);
    socket.emit("messageSeen", {
      chatId: [userId, recipientId].sort().join("-"),
      recipientId: id,
    });
  };

  useEffect(() => {
    if (isOpen && !loading && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [newMessages,isOpen]);
  useEffect(() => {
    if (isOpen && recipientId !== initialRecipientId) {
      setRecipientId(initialRecipientId);
      setRecipientName(initialRecipientName);
      setNewMessages([]);
    }
  }, [isOpen, initialRecipientId, initialRecipientName]);

  const sendMessage = () => {
    if (input.trim() === "") return;

    const messageData = {
      senderId: userId,
      shopName: recipientName,
      recipientId,
      content: input.trim(), // Trim input for consistency
      timestamp: Date.now(), // Ensure timestamp is added
      senderName: user.username,
      chatId: [userId, recipientId].sort().join("-"),
    };

    // Emit the message via socket
    socket.emit("sendMessage", messageData);

    // Update chat users list
    setChatUsers((prevUsers) => {
      const existingChatIndex = prevUsers.findIndex(
        (chat) => chat.chatId === messageData.chatId
      );

      if (existingChatIndex !== -1) {
        const updatedChats = [...prevUsers];
        const existingChat = updatedChats[existingChatIndex];

        // Only update if the content or timestamp has changed
        if (
          existingChat.lastMessage.content !== messageData.content ||
          existingChat.lastMessage.timestamp !== messageData.timestamp
        ) {
          updatedChats[existingChatIndex] = {
            ...existingChat,
            lastMessage: {
              content: messageData.content,
              timestamp: messageData.timestamp,
            },
            shopName: messageData.shopName, // Update shopName if needed
          };

          // Sort only if there's an update
          return updatedChats.sort(
            (a, b) =>
              new Date(b.lastMessage.timestamp) -
              new Date(a.lastMessage.timestamp)
          );
        }

        return prevUsers; // No changes needed
      }

      // Add a new user if it doesn't exist
      return [
        ...prevUsers,
        {
          chatId: messageData.chatId,
          shopName: messageData.shopName,
          lastMessage: {
            content: messageData.content,
            timestamp: messageData.timestamp,
          },
          otherUserId: recipientId,
        },
      ].sort(
        (a, b) =>
          new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
      );
    });

    // Update messages
    setNewMessages((prevMessages) => {
      // Check if the chat already exists in newMessages (based on chatId)
      if (prevMessages.chatId === messageData.chatId) {
        return {
          ...prevMessages,
          messages: [
            ...prevMessages.messages,
            {
              senderId: messageData.senderId,
              recipientId: messageData.recipientId,
              content: messageData.content,
              seen: false,
              timestamp: messageData.timestamp,
            },
          ],
        };
      }

      // If the chat doesn't exist, create a new chat object
      return {
        chatId: messageData.chatId,
        messages: [
          {
            senderId: messageData.senderId,
            recipientId: messageData.recipientId,
            content: messageData.content,
            seen: false,
            timestamp: messageData.timestamp,
          },
        ],
      };
    });

    // Clear input field
    setInput("");
  };

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const goBackToChats = () => {
    setActiveWindow("chats");
    setRecipientId(null);
  };
  useEffect(() => {
    if (recipientId && recipientName) {
      setActiveWindow("messages"); // Automatically open the messages window when recipient is set
    }
  }, [isOpen, initialRecipientId, initialRecipientName]);

  console.log(newMessages.messages);

  const modalRef = useRef(null);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-end justify-center z-50 bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full lg:w-[60vw]   sm:w-[80vw] h-[100vh] sm:h-[70vh] flex shadow-lg"
      >
        {user ? (
          <>
            {" "}
            {loading ? (
              <div className="flex mx-auto items-center">
                <Spinner />
              </div>
            ) : (
              <>
                {/* Previous Chats Window */}
                {activeWindow === "chats" && (
                  <div className="w-full p-4 relative overflow-y-auto">
                    <button
                      onClick={onClose}
                      className="text-gray-500 absolute right-4 top-4 hover:text-red-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                    <h3 className="text-lg font-bold text-center">
                      Previous Chats
                    </h3>
                    <ul>
                      {chatUsers?.map((user) => {
                        const isOnline = onlineUsers.includes(
                          user?.otherUserId
                        );
                        return (
                          <li
                            key={user.otherUserId}
                            onClick={() =>
                              handleSelectUserChat(
                                user?.otherUserId,
                                user?.shopName
                              )
                            }
                            className="cursor-pointer hover:bg-gray-200 p-2 border-2 py-4 my-3 "
                          >
                            <div className="flex justify-between items-center p-4">
                              <div className="flex items-center space-x-4">
                                <div
                                  className={`w-12 h-12 flex items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-white`}
                                >
                                  {user?.shopName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="font-medium text-lg">
                                    {user?.shopName?.length > 30
                                      ? `${user?.shopName?.slice(0, 30)}...`
                                      : user?.shopName}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span
                                      className={`text-sm font-semibold ${
                                        isOnline
                                          ? "text-green-500"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {isOnline ? "Online" : "Offline"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <p className="text-gray-500 text-sm mt-1 text-right">
                                {user?.lastMessage?.content?.length > 35
                                  ? `${user?.lastMessage?.content.slice(
                                      0,
                                      35
                                    )}...`
                                  : user?.lastMessage?.content}
                              </p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Chat Window */}
                {activeWindow === "messages" && (
                  <div className="flex-1 flex flex-col  p-2.5">
                    <div className="flex justify-between  items-start ">
                      <button
                        onClick={goBackToChats}
                        className="flex items-center gap-2 text-gray-500 text-lg font-medium"
                      >
                        <ArrowLeftIcon className="h-5 w-5" />
                        Back
                      </button>
                      <div className=" flex flex-col items-center ">
                        <h2 className="text-lg flex  mx-auto text-center font-bold">{`${
                          recipientName?.length > 15
                            ? recipientName?.slice(0, 15) + "..."
                            : recipientName || "..."
                        }`}</h2>
                        <div>
                          {onlineUsers.includes(recipientId) ? (
                            <span
                              className={`text-sm font-semibold text-green-500`}
                            >
                              Online
                            </span>
                          ) : (
                            <span
                              className={`text-sm font-semibold text-red-500`}
                            >
                              Offline
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto mb-4">
                      {newMessages?.messages?.map((msg, index) => {
                        return (
                          <div
                            key={index}
                            className={`mb-2 ${
                              msg.senderId === userId
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            <p
                              className={`inline-block p-2 rounded-lg max-w-[70%] break-words ${
                                msg.senderId === userId
                                  ? "bg-blue-500 text-white"
                                  : "bg-gray-200"
                              }`}
                            >
                              {msg.content}
                            </p>
                            {msg.senderId === userId && (
                              <>
                                <p className="text-sm">
                                  {msg.seen ? "seen" : "not seen"}
                                </p>
                              </>
                            )}
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="mt-auto flex">
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
              </>
            )}
          </>
        ) : (
          <button
            onClick={() =>
              navigate("/login", { state: { from: `/product/${params}` } })
            }
            className=" bg-blue-600  h-10  my-auto  px-6 rounded-md text-white mx-auto "
          >
            Please Login First
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
