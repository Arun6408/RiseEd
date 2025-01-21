"use client";
import React, { useEffect, useState } from "react";
import TeacherLayout from "../TeacherLayout";
import axios from "axios";
import {
  convertCamelToName,
  formatCustomDate,
  getUserId,
  handleUpload,
  setToken,
} from "@/utils/util";
import UserLogo from "@/components/utils/UserLogo";
import useWebSocket from "@/components/hooks/websocket";
import { Message, UserMessage } from "@/types";
import EmojiPicker from "emoji-picker-react";
import Loader from "@/components/utils/Loader";

const Page = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [userMessages, setUserMessages] = useState<UserMessage[]>([]);
  const [searchUserInput, setSearchUserInput] = useState<string>("");
  const [messageText, setMessageText] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const currentUserId = getUserId();
  const { sendMessage } = useWebSocket(
    process.env.NEXT_PUBLIC_API_URL!, // WebSocket URL
    currentUserId!,
    setUserMessages,
    messages,
    setMessages,
    selectedUserId
  );

  const handleEmojiClick = (emojiObject: any) => {
    setMessageText((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };
  const fetchMessages = async () => {
    try {
      setToken();
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/messages`
      );

      const receivedMessages = data.data.messages;

      const remainingUsersMessages: Message[] = data.data.remainingUsers.map(
        (user: any) => ({
          messageId: 9999, // a random number
          type: "receiver",
          name: user.name,
          otherUserId: user.id,
          role: user.role,
          message: "Let's start a chat",
          createdAt: "01/01/2000 12:00 PM",
          viewStatus: "NotDelivered",
          fileType: "Message",
        })
      );
      setMessages([...receivedMessages, ...remainingUsersMessages]);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleUserSelect = (message: Message) => {
    setSelectedUserId(message.otherUserId);
    setSelectedUserName(message.name);
  };

  const fetchUserMessages = async () => {
    try {
      setToken();
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/messages/${selectedUserId}`
      );
      setUserMessages(data.data || []);
    } catch (error) {
      console.error("Error fetching user messages:", error);
    }
  };

  const handleSendMessage = () => {
    if (selectedUserId) {
      const createdAt = formatCustomDate(new Date().toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }));
      if (selectedFiles.length > 0) {
        selectedFiles.map(async (file) => {
          const url = await handleUpload(file, file.type);

          const messageDataWithFile = {
            senderId: currentUserId,
            receiverId: selectedUserId,
            message: messageText,
            createdAt,
            viewStatus: "Pending",
            fileType: file.type,
            fileUrl: url,
          };

          //@ts-ignore
          setUserMessages((prev) => [...prev, messageDataWithFile]);
          sendMessage("newMessage", messageDataWithFile);
          setMessageText("");
        });
        setSelectedFiles([]);
      } else {
        const messageData = {
          senderId: currentUserId,
          receiverId: selectedUserId,
          message: messageText,
          createdAt,
          viewStatus: "Pending",
          fileType: "Message",
        };
        console.log(messageData);
        sendMessage("newMessage", messageData);
        //@ts-ignore
        setUserMessages((prev) => [...prev, messageData]);
        setMessageText("");
      }
    }
  };

  const handledeleteMessage = async () => {
    if (selectedUserId) {
      try {
        setToken();
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL}/messages/${selectedUserId}`
        );
        setUserMessages([]);
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserMessages();
      sendMessage("seenMessage", {
        receiverId: currentUserId, // when u see a message you will upadte the message as seen so you are the receiver
        senderId: selectedUserId,
      });
    }
  }, [selectedUserId]);

  useEffect(() => {
    if (searchUserInput) {
      const filteredMessages = messages.filter(
        (message) =>
          message.name.toLowerCase().includes(searchUserInput.toLowerCase()) ||
          message.role?.toLowerCase().includes(searchUserInput.toLowerCase()) ||
          message.message?.toLowerCase().includes(searchUserInput.toLowerCase())
      );
      setMessages(filteredMessages);
    }
  }, [searchUserInput]);

  return (
    <div>
      {loading && <Loader />}
      <TeacherLayout activeLink="/teacher/doubts">
        <div className="flex h-full bg-gradient-to-br from-teal-100 via-teal-50 to-teal-200">
          {/* Left Sidebar */}
          <div className="w-1/3 bg-gradient-to-b from-teal-700 to-teal-900 text-white p-6 shadow-lg rounded-tr-lg h-full flex flex-col">
            <h2 className="text-2xl h-fit font-semibold mb-6">Users</h2>

            {/* Search Input */}
            <div className="flex items-center justify-between h-10 my-4 bg-white rounded-xl px-4 py-2 gap-3">
              <img
                src="/icons/search.png"
                loading="lazy"
                className="h-full aspect-square"
                alt="Search icon"
              />
              <input
                type="text"
                placeholder="Search users..."
                className="border-none w-full text-black focus:outline-none"
                value={searchUserInput}
                onChange={(e) => setSearchUserInput(e.target.value)}
              />
            </div>

            {/* Messages List */}
            <div className="w-full max-h-fit overflow-x-clip overflow-y-scroll">
              {messages.length > 0 ? (
                <ul className="space-y-4">
                  {messages.map((message, index) => {
                    const isSelected = message.otherUserId === selectedUserId;
                    const viewStatusImgSrc =
                      message.viewStatus === "Seen"
                        ? "/icons/seen.png"
                        : message.viewStatus === "Delivered"
                        ? "/icons/delivered.png"
                        : null;

                    return (
                      <li
                        key={index}
                        onClick={() => handleUserSelect(message)}
                        className={`p-4 rounded-xl cursor-pointer flex items-center gap-4 transition-transform transform hover:scale-105 shadow ${
                          isSelected
                            ? "bg-teal-600"
                            : "bg-teal-800 hover:bg-teal-700"
                        }`}
                      >
                        <UserLogo
                          name={message.name || "User"}
                          className="bg-white text-teal-800"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold">
                            {message.name}
                          </p>
                          <p className="text-sm text-teal-200 truncate max-w-[200px] flex gap-1 items-center">
                            {viewStatusImgSrc && (
                              <img
                                src={viewStatusImgSrc}
                                alt={message.viewStatus}
                                className="w-5"
                              />
                            )}
                            {message.message?.length > 25
                              ? `${message.message.slice(0, 25)}...`
                              : message.message || "No message"}
                          </p>
                          {message.viewStatus !== "notDelivered" && (
                            <p className="text-xs text-teal-300">
                              {message.createdAt || "Unknown time"}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-teal-200">No users found.</p>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-2/3 flex flex-col p-4">
            <div className="border-b border-teal-300 pb-6 mb-6">
              <h2 className="text-3xl font-bold text-teal-800">
                {selectedUserId ? (
                  <div className="flex justify-between">
                    <div className="flex gap-4 items-center">
                      <UserLogo
                        name={selectedUserName || ""}
                        className="w-10 h-10 bg-white text-teal-800"
                      />
                      <p>{selectedUserName}</p>
                    </div>
                    <div>
                      <button
                        className="text-red-600 rounded-xl p-4"
                        onClick={() => handledeleteMessage()}
                      >
                        <img src="/icons/delete.png" className="w-8" />
                      </button>
                    </div>
                  </div>
                ) : (
                  "Select a user to view the chat"
                )}
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-6">
              {selectedUserId ? (
                <div className="flex flex-col gap-2 h-full">
                  <div className="flex flex-col gap-0.5 h-full overflow-y-scroll my-1">
                    {userMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`max-w-lg px-6 py-4 rounded-xl flex flex-col shadow-lg backdrop-blur-lg ${
                          msg.senderId === selectedUserId
                            ? "bg-teal-100 text-teal-900 self-start"
                            : " bg-teal-500 text-white self-end"
                        }`}
                      >
                        <p>{msg.message}</p>
                        {msg.fileType !== "Message" && msg.fileUrl && (
                          <a
                            target="_blank"
                            href={msg.fileUrl}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
                          >
                            Open File
                          </a>
                        )}
                        <p className="text-xs text-right mt-2 flex">
                          {msg.createdAt}
                          <img
                            src={
                              msg.viewStatus === "Seen"
                                ? "/icons/seen.png"
                                : "/icons/delivered.png"
                            }
                            className="w-5 aspect-square"
                            alt="icon"
                          />
                        </p>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={(e) => e.preventDefault()}>
                    <div className="flex justify-end gap-4 h-full p-2">
                      {/* Emoji Picker */}

                      <div className="relative h-full">
                        <button
                          type="button"
                          className="bg-teal-500 p-2 rounded-md h-full aspect-square text-xl"
                          onClick={() => setShowEmojiPicker((prev) => !prev)}
                        >
                          😊
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute bottom-12 right-0 z-10 w-full">
                            <EmojiPicker
                              onEmojiClick={(emojiObject) =>
                                handleEmojiClick(emojiObject)
                              }
                              className="w-fit"
                            />
                          </div>
                        )}
                      </div>

                      {/* Message Input */}
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="border-2 border-teal-300 rounded-xl p-4 w-full focus:outline-none"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                      />

                      {/* File Upload */}
                      <button
                        type="button"
                        className="bg-teal-500 p-4 rounded-md relative"
                      >
                        <img
                          src="/icons/attachment.png"
                          alt="Attach icon"
                          className="w-8 aspect-square"
                        />
                        <input
                          type="file"
                          className="w-full h-full absolute top-0 left-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setSelectedFiles(files);
                          }}
                          multiple
                        />
                        <div className="text-sm mt-1 text-gray-600">
                          {selectedFiles.map((file, index) => (
                            <span key={index}>{file.name}</span>
                          ))}
                        </div>
                      </button>

                      {/* Send Button */}
                      <button
                        type="submit"
                        className="text-white bg-teal-600 rounded-xl p-4 disabled:bg-teal-400"
                        disabled={!messageText && selectedFiles.length === 0}
                        onClick={() => handleSendMessage()}
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <p className="text-teal-600">Let's start a chat</p>
              )}
            </div>
          </div>
        </div>
      </TeacherLayout>
    </div>
  );
};

export default Page;
