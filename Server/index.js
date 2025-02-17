const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const authRouter = require("./routes/authRoutes");
const courseRouter = require("./routes/courseRoutes");
const quizRouter = require("./routes/quizRoutes");
const verifyToken = require("./middleware/authMiddleware");
const ebooksRouter = require("./routes/ebooksRoutes");
const messageRouter = require("./routes/messageRouter");
const { initWebSocket } = require("./controllers/webSocketController");
const { connectDb } = require("./db/connectDb");
const errorHandler = require("./errorHandlers/errorHandler");
const homeworkRouter = require("./routes/homeworkRoutes");
const salariesRouter = require("./routes/salariesRoutes");
const videoRouter = require("./routes/videoRoutes");
const teacherRouter = require("./routes/teacherRoutes");

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



app.use("/api/auth", authRouter); 
app.use(verifyToken); 
app.use("/api/courses", courseRouter);
app.use("/api", quizRouter);
app.use("/api/ebooks", ebooksRouter);
app.use("/api/messages", messageRouter);
app.use("/api/homework", homeworkRouter);
app.use("/api/salaries", salariesRouter);
app.use('/api/videos', videoRouter);
app.use('/api/teacher', teacherRouter);

app.use(errorHandler);


const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(); 
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    initWebSocket(server); // Initialize WebSocket server
  } catch (err) {
    console.error("Error starting server:", err);
  }
};

start();
