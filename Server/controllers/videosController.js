const { getDb } = require("../db/connectDb");
const { getUserId } = require("./utilController");

const updateWatchTime = async (req, res) => {
    try {
        const db = await getDb();
        const userId = getUserId(req);
        const { videoId, watchTime, lastPlaybackPosition } = req.body;
        console.log(lastPlaybackPosition);
        const lastWatched = new Date().toISOString();

        const query = `
            INSERT INTO VideoWatchStatus (userId, videoId, watchTime, lastPlaybackPosition, lastWatched)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (userId, videoId)
            DO UPDATE SET 
                watchTime = VideoWatchStatus.watchTime + EXCLUDED.watchTime,
                lastPlaybackPosition = EXCLUDED.lastPlaybackPosition,
                lastWatched = EXCLUDED.lastWatched;
        `;

        await db.query(query, [userId, videoId, watchTime, lastPlaybackPosition, lastWatched]);

        return res.status(200).json({ status: "success", message: "Watch time updated" });
    } catch (error) {
        return res.status(500).json({ status: "failed", message: "Error updating watch time", error: error.message });
    }
};

module.exports = { updateWatchTime };
