const { getDb } = require("../db/connectDb");
const { getUserId } = require("./utilController");

const { parseISO, format } = require('date-fns');

const getAllMessages = async (req, res) => {
  try {
    const userId = getUserId(req);
    const db = await getDb();

    // Query to fetch the latest message for each sender-receiver pair
    const query = `
      SELECT DISTINCT ON (LEAST(m.senderId, m.receiverId), GREATEST(m.senderId, m.receiverId)) 
        m.messageId as messageId,
        a1.id AS senderId, 
        a2.id AS receiverId,
        a1.name AS senderName, 
        a2.name AS receiverName,
        a1.role AS senderRole, 
        a2.role AS receiverRole,
        m.message, 
        m.createdAt, 
        m.viewStatus, 
        m.fileType,
        m.fileUrl
      FROM messages m
      LEFT JOIN allusers a1 ON a1.id = m.senderId
      LEFT JOIN allusers a2 ON a2.id = m.receiverId
      WHERE m.senderId = $1 OR m.receiverId = $1
      ORDER BY 
        LEAST(m.senderId, m.receiverId), 
        GREATEST(m.senderId, m.receiverId), 
        m.createdAt DESC;
    `;

    const results = await db.query(query, [userId]);

    // Map results to the desired format
    const messages = results.rows.map((message) => {
      const isSender = message.senderid === userId;
      console.log(message);
      return {
        type: isSender ? 'receiver' : 'sender',
        messageId: message.messageid,
        name: isSender ? message.receivername : message.sendername,
        otherUserId: isSender ? message.receiverid : message.senderid,
        role: isSender ? message.receiverrole : message.senderrole,
        message: message.message,
        createdAt: message.createdat,
        viewStatus: message.viewstatus,
        fileType: message.filetype,
        fileUrl: message.fileurl || null,
      };
    });

    // Get IDs of all users involved in messages
    const userIds = Array.from(
      new Set(
        results.rows.flatMap((msg) => [msg.senderid, msg.receiverid].filter(Boolean))
      )
    );

    // Query for remaining users not involved in messages
    const placeholders = userIds.map((_, index) => `$${index + 1}`).join(", ");
    const usersQuery = `
      SELECT id, name, role 
      FROM allusers 
      WHERE id NOT IN (${placeholders}) AND id != $${userIds.length + 1}
    `;
    const usersResult = await db.query(usersQuery, [...userIds, userId]);

    return res.status(200).json({
      status: "success",
      data: {
        messages,
        remainingUsers: usersResult.rows,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};






const createMessage = async (messageData) => {
  const { senderId, receiverId, message, createdAt, viewStatus, fileType, fileUrl} = messageData;
  const db = await getDb();
  
  console.log(messageData);
  const query = `
    INSERT INTO Messages (senderId, receiverId, createdAt, viewStatus, message, fileType, fileUrl)
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING messageId
  `;

  try {
    const result = await db.query(query, [senderId, receiverId, createdAt, 'Delivered', message, fileType, fileUrl || null]);
    messageData.messageId = result.rows[0].messageid;
    messageData.viewStatus = 'Delivered';
  } catch (error) {
    console.error("Error creating message: ", error);
    throw new Error("Failed to create message");
  }
};



const getMessagesBetweenUsers = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { selectedUserId } = req.params;

    const db = await getDb();
    const query = `
      SELECT * FROM Messages 
      WHERE (senderId = $1 AND receiverId = $2) OR (senderId = $3 AND receiverId = $4)
      ORDER BY createdAt ASC
    `;

    const results = await db.query(query, [userId, selectedUserId, selectedUserId, userId]);

    // Manually map the result to camelCase
    const messages = results.rows.map((row) => ({
      messageId : row.messageid,
      senderId: row.senderid,
      receiverId: row.receiverid,
      message: row.message,
      createdAt: row.createdat,
      viewStatus: row.viewstatus,
      fileType: row.filetype,
      fileUrl: row.fileurl || null,
    }));

    res.status(200).json({
      status: "success",
      data: messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

const deleteMessagesBetweenUsers = async (req, res) => {
  try {
    const senderId = getUserId(req); // Get the authenticated user's ID
    const { selectedUserId } = req.params;

    if (!selectedUserId) {
      return res.status(400).json({
        status: "error",
        message: "selectedUserId is required.",
      });
    }

    const db = await getDb();
    const query = `
        DELETE FROM Messages 
        WHERE (senderId = $1 AND receiverId = $2) OR (senderId = $3 AND receiverId = $4)
      `;

    await db.query(query, [senderId, selectedUserId, selectedUserId, senderId]);

    res.status(200).json({
      status: "success",
      message: `All messages between senderId ${senderId} and receiverId ${selectedUserId} have been deleted.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      error: error.message,
    });
  }
};


const seenMessages = async (messageData) => {
  try {
    const { receiverId, senderId } = messageData; 

    const db = await getDb();
    const query = `
      UPDATE Messages 
      SET viewStatus = 'Seen' 
      WHERE receiverId = $1 AND senderId = $2 AND viewStatus = 'Delivered'
    `;

    await db.query(query, [receiverId, senderId]);
    messageData.viewStatus = 'Seen';
  } catch (error) {
    console.error(error);
  }
};







module.exports = {
  getAllMessages,
  getMessagesBetweenUsers,
  deleteMessagesBetweenUsers,
  createMessage,
  seenMessages,
};
