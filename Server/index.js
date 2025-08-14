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
const homeworkRouter = require("./routes/homeworkRoutes");
const salariesRouter = require("./routes/salariesRoutes");
const teacherRouter = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const ensureDbConnection = require("./middleware/dbMiddleware");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(ensureDbConnection); 
app.use("/api/auth", authRouter); 
app.use(verifyToken); 
app.use("/api/courses", courseRouter);
app.use("/api", quizRouter);
app.use("/api/ebooks", ebooksRouter);
app.use("/api/messages", messageRouter);
app.use("/api/homework", homeworkRouter);
app.use("/api/salaries", salariesRouter);
app.use('/api/teacher', teacherRouter);
app.use("/api/student", studentRoutes); 

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDb(); 
    const server = app.listen(port, () => {
      console.log(`Server started on port ${port} (${process.env.NODE_ENV || 'development'})`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please choose a different port.`);
      } else {
        console.error('Server Error:', error.message);
      }
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });

    initWebSocket(server);
  } catch (err) {
    console.error("Startup Error:", err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

start();
