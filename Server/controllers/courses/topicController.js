const { getDb } = require("../../db/connectDb");
const { restrictUsers, getUserId } = require("../utilController");

const getAllTopics = async (req, res) => {
  const db = await getDb();
  const { chapterId } = req.params;

  const query = `
    SELECT topicId, title, topicType, chapterId
    FROM Topics
    WHERE chapterId = $1
  `;

  try {
    const result = await db.query(query, [chapterId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No topics found for this chapter.",
      });
    }

    // Manually map keys to camelCase
    const formattedTopics = result.rows.map((topic) => ({
      topicId: topic.topicid,
      title: topic.title,
      topicType: topic.topictype,
      chapterId: topic.chapterid,
    }));

    return res.status(200).json({
      status: "success",
      results: formattedTopics.length,
      data: {
        topics: formattedTopics,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching topics",
      error: err.message,
    });
  }
};

const createTopic = async (req, res) => {
  const db = await getDb();
  const { chapterId } = req.params;
  const {
    title,
    description,
    content,
    topicType,
    videoUrl,
    videoDuration,
    pdfUrl,
    questionAndAnswers,
  } = req.body;

  const role = req.user.role;
  restrictUsers(res, ["student", "parent"], role, "to create a new topic");

  try {
    // Check if the topic already exists
    const checkDuplicateQuery = `
      SELECT * FROM Topics WHERE chapterId = $1 AND title = $2
    `;
    const result = await db.query(checkDuplicateQuery, [chapterId, title]);

    if (result.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Topic with the same title already exists in this chapter.",
      });
    }

    // Check if the chapter exists
    const checkChapterQuery = `
      SELECT * FROM Chapters WHERE chapterId = $1
    `;
    const chapterResult = await db.query(checkChapterQuery, [chapterId]);

    if (chapterResult.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Chapter not found to add a topic.",
      });
    }
    let videoId;
    if (videoUrl && videoDuration) {
      const videoUploadResult = await db.query(
        "INSERT INTO Videos (videoUrl, videoDuration) VALUES ($1, $2) RETURNING videoId",
        [videoUrl, parseInt(videoDuration)]
      );
      videoId = videoUploadResult.rows[0].videoid;
    }

    // Insert new topic
    const insertQuery = `
      INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING topicId
    `;
    const insertResult = await db.query(insertQuery, [
      title,
      description,
      content,
      topicType,
      videoId,
      pdfUrl,
      questionAndAnswers,
      chapterId,
    ]);

    return res.status(201).json({
      status: "success",
      data: {
        message: `${title} Topic created successfully`,
        topicId: insertResult.rows[0].topicid,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error creating topic",
      error: err.message,
    });
  }
};

const getTopic = async (req, res) => {
  const { topicId, chapterId } = req.params;
  const db = await getDb();
  const query = `
    SELECT topicId, title, description, content, topicType, v.videoId, v.videoUrl, pdfUrl, questionAndAnswers, chapterId
      FROM Topics t
      left join Videos v on t.videoId = v.videoId
      WHERE topicId = $1 AND chapterId = $2
  `;

  try {
    const result = await db.query(query, [topicId, chapterId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Topic not found",
      });
    }

    // Manually map keys to camelCase
    const topic = {
      topicId: result.rows[0].topicid,
      title: result.rows[0].title,
      description: result.rows[0].description,
      content: result.rows[0].content,
      topicType: result.rows[0].topictype,
      videoId: result.rows[0].videoid,
      videoUrl: result.rows[0].videourl,
      pdfUrl: result.rows[0].pdfurl,
      questionAndAnswers: result.rows[0].questionandanswers,
      chapterId: result.rows[0].chapterid,
    };

    return res.status(200).json({
      status: "success",
      data: topic,
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error fetching topic",
      error: err.message,
    });
  }
};

const deleteTopic = async (req, res) => {
  const db = await getDb();
  const { topicId, chapterId } = req.params;

  restrictUsers(res, ["student"], req.user.role, "to delete a topic");

  const deleteTopicQuery = `
    DELETE FROM Topics 
    WHERE topicId = $1 AND chapterId = $2
  `;

  try {
    const result = await db.query(deleteTopicQuery, [topicId, chapterId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "Topic not found with the specified chapter",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Topic deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error deleting topic",
      error: err.message,
    });
  }
};

const updateTopicTime = async (req, res) => {
  try {
    const db = await getDb();
    const userId = getUserId(req);
    const { topicId } = req.params;
    const { timeSpentOnTopic } = req.body;
    console.log("topic ",topicId, timeSpentOnTopic);

    const query = `
          INSERT INTO TimeSpentOnTopic (userId, topicId, timeSpentOnTopic)
          VALUES ($1, $2, $3)
          ON CONFLICT (userId, topicId)
          DO UPDATE SET 
              timeSpentOnTopic = TimeSpentOnTopic.timeSpentOnTopic + EXCLUDED.timeSpentOnTopic;
      `;

    await db.query(query, [userId, topicId, timeSpentOnTopic]);

    return res
      .status(200)
      .json({ status: "success", message: "Topic time updated" });
  } catch (error) {
    return res
      .status(500)
      .json({
        status: "failed",
        message: "Error updating topic time",
        error: error.message,
      });
  }
};

module.exports = {
  getAllTopics,
  createTopic,
  getTopic,
  deleteTopic,
  updateTopicTime,
};
