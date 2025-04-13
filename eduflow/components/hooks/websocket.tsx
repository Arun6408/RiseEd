import { Message, UserMessage } from "@/types";
import { parseCreatedAt } from "@/utils/util";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

const useWebSocket = (
  url: string,
  userId: number,
  setUserMessages: Dispatch<SetStateAction<UserMessage[]>>,
  messages: Message[],
  setMessages: Dispatch<SetStateAction<Message[]>>,
  selectedUserId: number | null
) => {
  const socketRef: any = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      const socket = new WebSocket(`${url}?userId=${userId}`);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established");
        reconnectAttempts.current = 0;
      };

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
            setMessages((prev) =>
              prev.map((msg) => {
                if (msg.otherUserId === messageData.senderId) {
                  return {
                    ...msg,
                    messageId: messageData.messageId,
                    message: messageData.message,
                    type: "sender",
                    viewStatus: messageData.viewStatus,
                    createdAt: messageData.createdAt,
                  };
                }
                return msg;
              })
            );
            if (selectedUserId === messageData.senderId) {
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
                    type: "receiver",
                    viewStatus: messageData.viewStatus,
                    createdAt: messageData.createdAt,
                  };
                }
                return msg;
              });

              return updatedMessages;
            });

            setUserMessages((prev) =>
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
          console.log(type, messageData, clientType);
          setMessages((prev) => {
            return prev.map((msg) => {
              if (
                msg.otherUserId === messageData.senderId &&
                msg.createdAt !== "01/01/2000 12:00 PM"
              ) {
                return {
                  ...msg,
                  viewStatus: messageData.viewStatus,
                };
              }
              return msg;
            });
          });
          setUserMessages((prev) => {
            return prev.map((msg) => {
              if (
                msg.senderId === messageData.senderId &&
                msg.receiverId === messageData.receiverId
              ) {
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

      socket.onclose = () => {
        console.log("WebSocket connection closed");
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeout.current = setTimeout(connect, delay);
        }
      };

      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeout.current = setTimeout(connect, delay);
        }
      };
    } catch (error) {
      console.error("Error creating WebSocket connection:", error);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current += 1;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectTimeout.current = setTimeout(connect, delay);
      }
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
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
