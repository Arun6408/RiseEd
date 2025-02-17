const { getDb, connectDb, closeDb } = require("./db/connectDb");

const query = `



`;

const populate = async () => {
    await connectDb();  // Ensure the connection is established first
    const db = getDb(); // Get the connected database client
    try {
        await db.query(query,async (err,res)=>{
            if(err) console.log(err);
            console.log("Query executed");
            await closeDb();
        });  // Execute the query
    } catch (error) {
        console.error("Error executing query:", error);
    }
};

populate();
