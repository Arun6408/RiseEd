const WebSocket = require("ws");
const {
  validateCreateMessage,
  validateSeenMessage,
} = require("../middleware/validationMiddleware");
const { createMessage, seenMessages } = require("./messageController");
const clients = new Map();

const initWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection");
    const userId = Number(req.url.split("=")[1]);

    if (!userId) {
      ws.close();
      return;
    }

    clients[userId] = ws;

    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message);
        const { type, messageData } = data;

        switch (type) {
          case "newMessage":
            const createErrors = validateCreateMessage(messageData);
            if (createErrors.length > 0) {
              ws.send(
                JSON.stringify({ status: "error", errors: createErrors })
              );
              return;
            }
            await createMessage(messageData);
            broadcastMessage(messageData, type);
            break;

          case "seenMessage":
            const seenErrors = validateSeenMessage(messageData);
            if (seenErrors.length > 0) {
              ws.send(JSON.stringify({ status: "error", errors: seenErrors }));
              return;
            }
            await seenMessages(messageData);
            broadcastMessage(messageData, type);

            break;

          default:
            ws.send(
              JSON.stringify({
                status: "error",
                message: "Invalid message type.",
              })
            );
            break;
        }
      } catch (error) {
        console.error(error);
        ws.send(
          JSON.stringify({
            status: "error",
            message: "Internal server error.",
            error: error.message,
          })
        );
      }
    });

    ws.on("close", () => {
      clients.delete(userId);
    });
  });

  const broadcastMessage = (messageData, type) => {
    const sendToSocket = (socket, type, data, clientType) => {
      if (socket) {
        socket.send(
          JSON.stringify({
            type,
            messageData: data,
            clientType
          })
        );
      } else {
        console.error(`Socket not found for a ${clientType}.`);
      }
    };

    const { receiverId,senderId } = messageData;
    if (type === "newMessage" || type === "seenMessage") {
      const receiverSocket = clients[receiverId];
      const senderSocket = clients[senderId];
      sendToSocket(receiverSocket, type, messageData,'receiver');
      sendToSocket(senderSocket, type, messageData,'sender');
    } 
    else {
      console.error(`Invalid message type: ${type}`);
    }
  };

  console.log("WebSocket server initialized");
};

module.exports = { initWebSocket };
