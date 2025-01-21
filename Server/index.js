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

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/api/auth", authRouter); 
app.use(verifyToken); 
app.use("/api/courses", courseRouter);
app.use("/api/quiz", quizRouter);
app.use("/api", ebooksRouter);
app.use("/api/messages", messageRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

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
