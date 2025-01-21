import { Message, UserMessage } from "@/types";
import { parseCreatedAt } from "@/utils/util";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

const useWebSocket = (
  url: string,
  userId: number,
  setUserMessages: Dispatch<SetStateAction<UserMessage[]>>,
  messages : Message[],
  setMessages:Dispatch<SetStateAction<Message[]>>,
  selectedUserId: number | null
) => {
  const socketRef: any = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(`${url}?userId=${userId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket connection established");
    };

    // Handle incoming messages
    socket.onmessage = (event) => {
      const { type, messageData, clientType } = JSON.parse(event.data);

      console.log("WebSocket message received - Type:", type);
      console.log("WebSocket message data:", messageData);
      console.log("WebSocket client type:", clientType);

      if (type === "newMessage" && messageData) {
        if (clientType === "receiver") {
          const formattedMessage: UserMessage = {
            messageId: messageData.messageId,
            senderId: messageData.senderId,
            receiverId: messageData.receiverId,
            message: messageData.message,
            createdAt: messageData.createdAt,
            viewStatus: messageData.viewStatus,
            fileType: messageData.fileType,
            fileUrl: messageData.fileUrl || null,
          };
          setMessages((prev)=>prev.map((msg)=>{
            if(msg.otherUserId === messageData.senderId){
              return{
                ...msg,
                messageId:messageData.messageId,
                message: messageData.message,
                type: 'sender', // type is sender because here we are client who receives message
                viewStatus: messageData.viewStatus,
                createdAt: messageData.createdAt,
              }
            }
            return msg;
          }));
          if(selectedUserId === messageData.senderId){
            setUserMessages((prev) => [...prev, formattedMessage]);
          }
        } else if (clientType === "sender") {
          console.log(messageData);
          setMessages((prev) => {
            const updatedMessages = prev.map((msg) => {
              if (msg.otherUserId === messageData.receiverId) {
                return {
                  ...msg,
                  messageId: messageData.messageId,
                  message: messageData.message,
                  type: 'receiver', // type is receiver because here we are sender sends message
                  viewStatus: messageData.viewStatus,
                  createdAt: messageData.createdAt,
                };
              }
              return msg;
            });
          
            // Ensure sorting by `createdAt` in descending order
            return updatedMessages.sort((a, b) => {
              console.log(a, b);
              if(a.createdAt === '01/01/2000 12:00 PM')return 1;
              else if(b.createdAt === '01/01/2000 12:00 PM') return -1;
              return (new Date(parseCreatedAt(b.createdAt)).getTime() - new Date(parseCreatedAt(a.createdAt)).getTime())
            });
          });
          
          

          setUserMessages((prev)=>
            prev.map((msg) => {
              if (
                msg.senderId === messageData.senderId &&
                msg.receiverId === messageData.receiverId &&
                msg.createdAt === messageData.createdAt 
              ) {
                return {
                  ...msg,
                  viewStatus: messageData.viewStatus,
                  messageId: messageData.messageId,
                };
              }
              return msg;
            })
          );
        }

      }
      if (type === "seenMessage" && messageData) {
        console.log(type, messageData,clientType);
        setUserMessages((prev) => {
          return prev.map((msg) => {
            if (
              msg.senderId === messageData.senderId &&
              msg.receiverId === messageData.receiverId
            ) {
              console.log('message:', msg);
              return {
                ...msg,
                viewStatus: messageData.viewStatus,
              };
            }
            return msg;
          });
        });
      }
    };

    // Handle connection close
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Handle connection error
    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [url, userId]);

  const sendMessage = (type: string, messageData: any) => {
    const socket = socketRef.current;
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, messageData });
      console.log({ type, messageData });
      socket.send(message);
    } else {
      console.error("WebSocket is not connected");
    }
  };

  return { sendMessage };
};

export default useWebSocket;
