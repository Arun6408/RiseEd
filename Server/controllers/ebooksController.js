const { getDb } = require("../db/connectDb");
const { restrictUsers } = require("./utilController");

const getAllEbooks = async (req, res) => {
  try {
    const query = `
      SELECT 
        e.id, 
        e.title, 
        e.description, 
        e.genre, 
        e.fileUrl, 
        e.uploadDate, 
        a.name 
      FROM ebooks e 
      JOIN AllUsers a ON e.createdByUserId = a.id
    `;

    const db = getDb();
    const result = await db.query(query);

    // Manually map keys to camelCase
    const formattedEbooks = result.rows.map((ebook) => ({
      id: ebook.id,
      title: ebook.title,
      description: ebook.description,
      genre: ebook.genre,
      fileUrl: ebook.fileurl,
      uploadDate: ebook.uploaddate,
      name: ebook.name,
    }));

    return res.status(200).json({
      status: "success",
      data: formattedEbooks,
    });
  } catch (error) {
    return res.status(500).json({
      status: "failed",
      message: error.message,
    });
  }
};


const createEbook = async (req, res) => {
  try {
    restrictUsers(
      res,
      ["student", "parent"],
      req.user.role,
      "to create a new ebook"
    );
    const { title, description, genre, fileUrl } = req.body;

    const query = `
            INSERT INTO ebooks (title, createdByUserId, description, genre, fileUrl) 
            VALUES ($1, $2, $3, $4, $5)`;

    const db = getDb();
    const userId = req.user.userId;
    await db.query(
      query,
      [title, userId, description, genre, fileUrl],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ status: "failed", message: err.message });
        }
        return res.status(201).json({
          status: "success",
          message: "Ebook created successfully",
        });
      }
    );
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message });
  }
};

const getEbookById = async (req, res) => {
  try {
    const { id } = req.params;

    const query =
      "SELECT e.id,title,description,genre,fileUrl,uploadDate,a.name FROM ebooks e join AllUsers a on e.createdByUserId = a.id where e.id = $1 ";
    const db = getDb();
    await db.query(query, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ status: "failed", message: err.message });
      }
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ status: "failed", message: "Ebook not found" });
      }

      // Manually map keys to camelCase
      const ebook = {
        id: result.rows[0].id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        genre: result.rows[0].genre,
        fileUrl: result.rows[0].fileurl,
        uploadDate: result.rows[0].uploaddate,
        createdBy: result.rows[0].name,
      };

      return res.status(200).json({
        status: "success",
        data: ebook,
      });
    });
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message });
  }
};


const deleteEbook = async (req, res) => {
  try {
    const { id } = req.params;

    restrictUsers(
      res,
      ["student", "parent"],
      req.user.role,
      "to create a new ebook"
    );

    const query = "DELETE FROM ebooks WHERE id = $1";
    const db = await getDb(); 

    const result = await db.query(query, [id]); 

    if (result.rowCount === 0) {
      return res.status(404).json({ status: "failed", message: "Ebook not found" });
    }

    return res.status(200).json({ status: "success", message: "Ebook deleted successfully" });
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.message });
  }
};


module.exports = {
  getAllEbooks,
  createEbook,
  getEbookById,
  deleteEbook,
};
