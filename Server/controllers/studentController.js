const { getDb } = require("../db/connectDb");
const { getUserId } = require("./utilController");

const studentDashboardInfo = async (req, res) => {
  try {
    const db = await getDb();
    const userId = getUserId(req);

    const queries = [
      // Pending assignments with due dates
      db.query(
        `
        SELECT 
    COUNT(*) AS totalHomeworks,
    COUNT(CASE 
        WHEN hs.submissionId IS NOT NULL AND hs.submittedAt <= h.dueDate 
        THEN 1 
    END) AS submittedOnTime,
    COUNT(CASE 
        WHEN hs.submissionId IS NOT NULL AND hs.submittedAt > h.dueDate 
        THEN 1 
    END) AS submittedLate,
    COUNT(CASE 
        WHEN hs.submissionId IS NULL AND h.dueDate < CURRENT_TIMESTAMP 
        THEN 1 
    END) AS missed,
    COUNT(CASE 
        WHEN hs.submissionId IS NULL AND h.dueDate >= CURRENT_TIMESTAMP 
        THEN 1 
    END) AS currentPending
FROM homework h
LEFT JOIN homeworkSubmissions hs ON h.homeworkId = hs.homeworkId AND hs.submittedByUserId = $1
JOIN students s ON s.userId = $1
WHERE CAST(s.class AS TEXT) = ANY(string_to_array(h.assignedClasses, ','));
      `,
        [userId]
      ),

      // Number of quizzes attempted
      db.query(
        `
        SELECT COUNT(DISTINCT qr.quizId) AS quizAttempted
        FROM quizResults qr
        WHERE qr.userId = $1;
      `,
        [userId]
      ),

      // Quiz scores over time
      db.query(
        `
        SELECT 
          qr.createdAt,
          qr.score,
          q.quizTitle
        FROM quizResults qr
        JOIN quiz q ON qr.quizId = q.quizId
        WHERE qr.userId = $1
        ORDER BY qr.createdAt;
      `,
        [userId]
      ),

      // Zcoins earnings and spending
      db.query(
        `
        SELECT 
          * from student_zcoin_summary
        where userId = $1;
      `,
        [userId]
      ),

      // Top 3 upcoming events
      db.query(
        `
        SELECT 
          id,
          title, 
          eventType,
          startDate
        FROM SchoolEvents
        WHERE startDate > CURRENT_DATE
        ORDER BY startDate
        LIMIT 3;
      `
      ),
      db.query(
        `
        SELECT ROUND((
            COALESCE((SELECT AVG(CAST(score AS DECIMAL) * 10 / (totalques * 4)) FROM quizResults WHERE userid = $1), 0) +
            COALESCE((SELECT AVG(grade) FROM homeworkSubmissions WHERE submittedbyuserid = $1), 0)
        ) / 2, 2) AS grade;
      `,
        [userId]
      ),
      db.query(
        `
        SELECT COUNT(*) AS days_present
          FROM Attendance
          WHERE userId = $1
            AND attendanceDate >= CURRENT_DATE - INTERVAL '30 days';

      `,
        [userId]
      ),
    ];

    const results = await Promise.all(queries);

    const data = {
      Assignments: results[0].rows[0],
      quizzes: results[1].rows[0],
      quizScores: results[2].rows,
      zcoinSummary: results[3].rows[0],
      upcomingEvents: results[4].rows,
      currentGrade: results[5].rows[0],
      attendance: {
        daysPresent: Number(results[6].rows[0]?.days_present),
        daysAbsent: 30 - Number(results[6].rows[0]?.days_present),
      },
    };

    return res.json({
      status: "success",
      data: data,
    });
  } catch (error) {
    console.error("Error fetching student dashboard info:", error);
    return res.status(500).json({ status: "failed", message: error.message });
  }
};

module.exports = {
  studentDashboardInfo,
};


