const express = require('express');
const { getAllMessages, getMessagesBetweenUsers, deleteMessagesBetweenUsers } = require('../controllers/messageController');
const messageRouter = express.Router();

messageRouter.route('/').get(getAllMessages);
messageRouter.route('/:selectedUserId').get(getMessagesBetweenUsers).delete(deleteMessagesBetweenUsers);

module.exports = messageRouter;