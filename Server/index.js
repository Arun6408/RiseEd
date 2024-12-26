const express = require("express");
const dotevn = require("dotenv");
const cors = require("cors");
dotevn.config();

const {connectDb} = require("./db/connectDb");
const authRouter = require("./routes/authRoutes");
const courseRouter = require("./routes/courseRoutes");
const verifyToken = require("./middleware/authMiddleware");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use('/api/auth',authRouter);
//only verified users can access the other routes 
app.use(verifyToken);
app.use('/api/courses', courseRouter);

const port = process.env.PORT || 5000;

const start = () =>{
    try{
        connectDb();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
    catch(err){
        console.log(err);
    }
}

start();