const express = require("express");
const dotevn = require("dotenv");
dotevn.config();

const {connectDb} = require("./db/connectDb");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});



const start = () =>{
    try{
        connectDb();
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });
    }
    catch(err){
        console.log(err);
    }
}

start();