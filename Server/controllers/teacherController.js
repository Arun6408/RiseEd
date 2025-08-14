const { getDb } = require("../db/connectDb");
const { getUserId } = require("./utilController");

const teacherDashboardInfo = async (req, res) => {
  try {
    const db = await getDb();
    const userId = getUserId(req);

    const queries = [
      // 1. Student count
      db.query(
        `
        SELECT COUNT(*) AS studentCount
        FROM students s 
        WHERE s.class::TEXT = ANY(
            STRING_TO_ARRAY(
                (SELECT assignedClasses FROM teachers WHERE userId = $1), ','
            )
        );
      `,
        [userId]
      ),

      // 2. Last salary transaction
      db.query(
        `
        SELECT salaryMonth, amount, status, transactionDate
        FROM salaryTransactions
        WHERE userId = $1 AND status = 'Paid'
        AND transactionDate = (
            SELECT MAX(transactionDate) 
            FROM salaryTransactions 
            WHERE userId = $1
        );
      `,
        [userId]
      ),

      // 3. Content stats
      db.query(
        `
        SELECT 
            COUNT(DISTINCT co.courseId) AS noOfCourses,
            COUNT(DISTINCT ch.chapterId) AS noOfChapters,
            COUNT(DISTINCT t.topicId) AS noOfTopics
        FROM topics t
        LEFT JOIN chapters ch ON ch.chapterId = t.chapterId
        LEFT JOIN courses co ON co.courseId = ch.courseId
        WHERE co.userId = $1;
      `,
        [userId]
      ),

      // 4. Total video duration
      db.query(
        `
        SELECT COALESCE(SUM(v.videoDuration), 0) AS totalDuration
        FROM courses co
        JOIN chapters ch ON ch.courseId = co.courseId
        JOIN topics t ON t.chapterId = ch.chapterId
        LEFT JOIN videos v ON t.videoId = v.videoId
        WHERE co.userId = $1;
      `,
        [userId]
      ),

      // 5. Videos created monthly
      db.query(
        `
        SELECT 
            DATE_TRUNC('month', t.createdAt) AS month,
            COUNT(t.videoId) AS totalVideos
        FROM topics t
        JOIN chapters ch ON t.chapterId = ch.chapterId
        JOIN courses co ON ch.courseId = co.courseId
        WHERE co.userId = $1
        GROUP BY month
        ORDER BY month;
      `,
        [userId]
      ),

      // 6. Homework stats
      db.query(
        `
        SELECT 
            h.homeworkId,
            h.title,
            COUNT(DISTINCT hs.submissionId) AS totalSubmitted,
            (COUNT(DISTINCT s.studentId) - COUNT(DISTINCT hs.submissionId)) AS totalNotSubmitted
        FROM homework h
        LEFT JOIN students s ON CAST(s.class AS TEXT) = ANY(string_to_array(h.assignedClasses, ','))
        LEFT JOIN homeworkSubmissions hs ON h.homeworkId = hs.homeworkId AND hs.submittedByUserId = s.userId
        WHERE h.createdByUserId = $1
        GROUP BY h.homeworkId, h.title
        ORDER BY h.homeworkId;
      `,
        [userId]
      ),

      // 7. Attendance stats (last 30 days)
      db.query(
        `
        SELECT COUNT(attendanceDate) AS presentDays,
               (30 - COUNT(attendanceDate)) AS absentDays
        FROM attendance
        WHERE userId = $1
        AND attendanceDate >= CURRENT_DATE - INTERVAL '30 days';
      `,
        [userId]
      ),

      // 8. Events
      db.query(
        `
        SELECT title, 
            CASE 
                WHEN endDate < CURRENT_DATE THEN 'Completed' 
                WHEN startDate <= CURRENT_DATE AND endDate >= CURRENT_DATE THEN 'Ongoing' 
                ELSE 'Upcoming' 
            END AS eventStatus
        FROM SchoolEvents;
        `
      ),

      // 9. Quiz scores + max marks
      db.query(
        `
        SELECT 
          qr.createdAt,
          qr.score,
          q.quizTitle,
          qq.maxMarks
        FROM quizResults qr
        JOIN quiz q ON qr.quizId = q.quizId
        JOIN (
            SELECT quizId, COUNT(*) * 1 AS maxMarks
            FROM quizQuestions
            GROUP BY quizId
        ) qq ON q.quizId = qq.quizId
        WHERE qr.userId = $1
        ORDER BY qr.createdAt;
        `,
        [userId]
      )
    ];

    const results = await Promise.all(queries);

    const events = results[7].rows; // now index 7 for events
    const eventsGrouped = events.reduce(
      (acc, event) => {
        const status = event.eventstatus.toLowerCase();
        if (!acc[status]) acc[status] = [];
        acc[status].push(event.title);
        return acc;
      },
      { upcoming: [], ongoing: [], completed: [] }
    );

    const data = {
      studentCount: results[0].rows[0]?.studentcount || 0,
      lastSalaryTransaction: results[1].rows[0] || null,
      contentStats: results[2].rows[0] || {
        noofcourses: 0,
        noofchapters: 0,
        nooftopics: 0
      },
      totalVideoDuration: results[3].rows[0]?.totalduration || 0,
      videosCreatedMonthly: results[4].rows,
      homeworkStats: results[5].rows,
      attendanceStats: results[6].rows[0] || {
        presentdays: 0,
        absentdays: 30
      },
      events: eventsGrouped,
      quizScores: results[8].rows // new quiz scores + max marks
    };

    return res.json({
      status: "success",
      data
    });
  } catch (error) {
    console.error("Error fetching dashboard info:", error);
    return res
      .status(500)
      .json({ status: "failed", message: error.message });
  }
};

module.exports = {
  teacherDashboardInfo
};
