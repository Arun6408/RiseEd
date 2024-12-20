const express = require("express");
const princupalRouter = express.Router();

princupalRouter.route('/events').post(createEvents).get(getAllEvents);