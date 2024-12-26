const { getDb } = require("../../db/connectDb");
const { restrictUsers } = require("../utilController");

const getAllTopics = async (req, res) => {
  const db = getDb();
  const { chapterId } = req.params;
  const query = `
    SELECT topicId, title, topicType, chapterId 
    FROM Topics
    WHERE chapterId = ?
  `;
  db.query(query, [chapterId], (err, result) => {
    if (err) {
      res.status(500).json({
        status: "error",
        message: "Error fetching topics",
        error: err,
      });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({
        status: "error",
        message: "No topics found for this chapter.",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      results: result.length,
      data: {
        topics: result,
      },
    });
  });
};

const createTopic = async (req, res) => {
  const db = getDb();
  const { chapterId } = req.params;
  const {
    title,
    description,
    content,
    topicType,
    videoUrl,
    pdfUrl,
    questionAndAnswers,
  } = req.body;
  const role = req.user.role;

  restrictUsers(res, ["student", "principal"], role, "to create a new topic");

  db.query(
    `SELECT * FROM Topics WHERE chapterId = ? AND title = ?`,
    [chapterId, title],
    (err, result) => {
      if (err) {
        res.status(500).json({
          status: "error",
          message: "Error checking topic existence",
          error: err,
        });
        return;
      }
      if (result.length > 0) {
        res.status(409).json({
          status: "error",
          message: "Topic with the same title already exists in this chapter.",
        });
        return;
      }

      const checkChapterQuery = `SELECT * FROM Chapters WHERE chapterId = ?`;

      db.query(checkChapterQuery, [chapterId], (err, result) => {
        if (err) {
          res.status(500).json({
            status: "error",
            message: "Error verifying chapter existence",
            error: err,
          });
          return;
        }

        if (result.length === 0) {
          res.status(404).json({
            status: "error",
            message: "Chapter not found to add a topic.",
          });
          return;
        }

        const query = `
          INSERT INTO Topics (title, description, content, topicType, videoUrl, pdfUrl, questionAndAnswers, chapterId)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        db.query(
          query,
          [
            title,
            description,
            content,
            topicType,
            videoUrl,
            pdfUrl,
            questionAndAnswers,
            chapterId,
          ],
          (err) => {
            if (err) {
              res.status(500).json({
                status: "error",
                message: "Error creating topic",
                error: err,
              });
              return;
            }
            res.status(201).json({
              status: "success",
              data: {
                message: `${title} Topic created successfully`,
              },
            });
          }
        );
      });
    }
  );
};

const getTopic = async (req, res) => {
  const { topicId, chapterId } = req.params;
  const db = getDb();
  const query = `
    SELECT topicId, title, description, content, topicType, videoUrl, pdfUrl, questionAndAnswers, chapterId
    FROM Topics
    WHERE topicId = ? AND chapterId = ?
  `;
  db.query(query, [topicId, chapterId], (err, result) => {
    if (err) {
      res.status(500).json({
        status: "error",
        message: "Error fetching topic",
        error: err,
      });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({
        status: "error",
        message: "Topic not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: result[0],
    });
  });
};

const deleteTopic = (req, res) => {
  const db = getDb();
  const { topicId, chapterId } = req.params;

  restrictUsers(res, ["student"], req.user.role, "to delete a topic");

  const deleteTopicQuery = `DELETE FROM Topics WHERE topicId = ? AND chapterId = ?`;

  db.query(deleteTopicQuery, [topicId, chapterId], (err, result) => {
    if (err) {
      res.status(500).json({
        status: "error",
        message: "Error deleting topic",
        error: err,
      });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({
        status: "error",
        message: "Topic not found with the specified chapter",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Topic deleted successfully",
    });
  });
};

module.exports = {
  getAllTopics,
  createTopic,
  getTopic,
  deleteTopic,
};
