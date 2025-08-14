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
          q.quizTitle,
          COUNT(qq.quizQuestionId)*4 AS maxMarks
      FROM quizResults qr
      JOIN quiz q ON qr.quizId = q.quizId
      JOIN quizQuestions qq ON q.quizId = qq.quizId
      WHERE qr.userId = $1
      GROUP BY qr.createdAt, qr.score, q.quizTitle
      ORDER BY qr.createdAt;

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
      upcomingEvents: results[3].rows,
      currentGrade: results[4].rows[0],
      attendance: {
        daysPresent: Number(results[5].rows[0]?.days_present),
        daysAbsent: 30 - Number(results[5].rows[0]?.days_present),
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

const studentSelfAnalysis = async (req, res) => {
  try {
    const db = await getDb();
    const userId = getUserId(req);

    const queries = [
      // Subject-wise performance analysis
      db.query(
        `
        SELECT 
          c.department,
          COUNT(DISTINCT qr.quizId) as quizzesTaken,
          ROUND(AVG(CAST(qr.score AS DECIMAL) * 100.0 / (qr.totalQues * 4)), 2) as avgScore,
          COUNT(DISTINCT h.homeworkId) as homeworkAssigned,
          COUNT(DISTINCT hs.homeworkId) as homeworkSubmitted,
          ROUND(AVG(CAST(hs.grade AS DECIMAL)), 2) as avgHomeworkGrade
        FROM students s
        LEFT JOIN courses c ON CAST(s.class AS TEXT) = ANY(string_to_array(c.class, ','))
        LEFT JOIN quiz q ON c.courseId = q.quizCourseId
        LEFT JOIN quizResults qr ON q.quizId = qr.quizId AND qr.userId = $1
        LEFT JOIN homework h ON CAST(s.class AS TEXT) = ANY(string_to_array(h.assignedClasses, ','))
        LEFT JOIN homeworkSubmissions hs ON h.homeworkId = hs.homeworkId AND hs.submittedByUserId = $1
        WHERE s.userId = $1
        GROUP BY c.department
        ORDER BY avgScore DESC NULLS LAST;
        `,
        [userId]
      ),

      // Learning progress over time (monthly trends)
      db.query(
        `
        SELECT 
          DATE_TRUNC('month', qr.createdAt) as month,
          COUNT(DISTINCT qr.quizId) as quizzesTaken,
          ROUND(AVG(CAST(qr.score AS DECIMAL) * 100.0 / (qr.totalQues * 4)), 2) as avgScore,
          COUNT(DISTINCT hs.homeworkId) as homeworkSubmitted,
          ROUND(AVG(CAST(hs.grade AS DECIMAL)), 2) as avgHomeworkGrade
        FROM students s
        LEFT JOIN quizResults qr ON s.userId = qr.userId
        LEFT JOIN homeworkSubmissions hs ON s.userId = hs.submittedByUserId
        WHERE s.userId = $1
        GROUP BY DATE_TRUNC('month', qr.createdAt), DATE_TRUNC('month', hs.submittedAt)
        ORDER BY month DESC
        LIMIT 6;
        `,
        [userId]
      ),

      // Difficulty level analysis
      db.query(
        `
        SELECT 
          qq.difficulty,
          COUNT(*) as questionsAttempted,
          COUNT(CASE WHEN qr.correctCount > 0 THEN 1 END) as correctAnswers,
          ROUND(
            (COUNT(CASE WHEN qr.correctCount > 0 THEN 1 END) * 100.0 / COUNT(*)), 2
          ) as accuracyPercentage
        FROM quizResults qr
        JOIN quiz q ON qr.quizId = q.quizId
        JOIN quizQuestions qq ON q.quizId = qq.quizId
        WHERE qr.userId = $1
        GROUP BY qq.difficulty
        ORDER BY 
          CASE qq.difficulty 
            WHEN 'Easy' THEN 1 
            WHEN 'Medium' THEN 2 
            WHEN 'Hard' THEN 3 
          END;
        `,
        [userId]
      ),

      // Time management analysis
      db.query(
        `
        SELECT 
          qr.quizId,
          q.quizTitle,
          qr.timeSpent,
          qr.totalQues,
          ROUND(qr.timeSpent::DECIMAL / qr.totalQues, 2) as avgTimePerQuestion,
          CASE 
            WHEN qr.timeSpent::DECIMAL / qr.totalQues <= 2 THEN 'Fast'
            WHEN qr.timeSpent::DECIMAL / qr.totalQues <= 4 THEN 'Moderate'
            ELSE 'Slow'
          END as timeEfficiency
        FROM quizResults qr
        JOIN quiz q ON qr.quizId = q.quizId
        WHERE qr.userId = $1
        ORDER BY qr.createdAt DESC
        LIMIT 10;
        `,
        [userId]
      ),

      // Peer comparison (class average)
      db.query(
        `
        SELECT 
          ROUND(AVG(CAST(qr.score AS DECIMAL) * 100.0 / (qr.totalQues * 4)), 2) as classAvgQuizScore,
          ROUND(AVG(CAST(hs.grade AS DECIMAL)), 2) as classAvgHomeworkGrade,
          COUNT(DISTINCT s.userId) as totalClassStudents
        FROM students s
        JOIN quizResults qr ON s.userId = qr.userId
        JOIN homeworkSubmissions hs ON s.userId = hs.submittedByUserId
        WHERE CAST(s.class AS TEXT) = (
          SELECT CAST(class AS TEXT) FROM students WHERE userId = $1
        )
        AND s.userId != $1;
        `,
        [userId]
      ),

      // Study pattern analysis
      db.query(
        `
        SELECT 
          EXTRACT(HOUR FROM qr.createdAt) as studyHour,
          COUNT(*) as activityCount,
          'Quiz' as activityType
        FROM quizResults qr
        WHERE qr.userId = $1
        GROUP BY EXTRACT(HOUR FROM qr.createdAt)
        UNION ALL
        SELECT 
          EXTRACT(HOUR FROM hs.submittedAt) as studyHour,
          COUNT(*) as activityCount,
          'Homework' as activityType
        FROM homeworkSubmissions hs
        WHERE hs.submittedByUserId = $1
        GROUP BY EXTRACT(HOUR FROM hs.submittedAt)
        ORDER BY studyHour;
        `,
        [userId]
      ),

      // Weak areas identification
      db.query(
        `
        SELECT 
          qq.question,
          qq.difficulty,
          qr.correctCount,
          qr.wrongCount,
          qr.skippedCount,
          CASE 
            WHEN qr.wrongCount > qr.correctCount THEN 'Needs Improvement'
            WHEN qr.skippedCount > 0 THEN 'Partially Understood'
            ELSE 'Good Understanding'
          END as understandingLevel
        FROM quizResults qr
        JOIN quiz q ON qr.quizId = q.quizId
        JOIN quizQuestions qq ON q.quizId = qq.quizId
        WHERE qr.userId = $1
        AND (qr.wrongCount > qr.correctCount OR qr.skippedCount > 0)
        ORDER BY qr.wrongCount DESC, qr.skippedCount DESC
        LIMIT 5;
        `,
        [userId]
      ),

      // Attendance pattern analysis
      db.query(
        `
        SELECT 
          EXTRACT(DOW FROM a.attendanceDate) as dayOfWeek,
          COUNT(*) as daysPresent,
          CASE 
            WHEN EXTRACT(DOW FROM a.attendanceDate) = 0 THEN 'Sunday'
            WHEN EXTRACT(DOW FROM a.attendanceDate) = 1 THEN 'Monday'
            WHEN EXTRACT(DOW FROM a.attendanceDate) = 2 THEN 'Tuesday'
            WHEN EXTRACT(DOW FROM a.attendanceDate) = 3 THEN 'Wednesday'
            WHEN EXTRACT(DOW FROM a.attendanceDate) = 4 THEN 'Thursday'
            WHEN EXTRACT(DOW FROM a.attendanceDate) = 5 THEN 'Friday'
            WHEN EXTRACT(DOW FROM a.attendanceDate) = 6 THEN 'Saturday'
          END as dayName
        FROM attendance a
        WHERE a.userId = $1
        AND a.attendanceDate >= CURRENT_DATE - INTERVAL '90 days'
        GROUP BY EXTRACT(DOW FROM a.attendanceDate)
        ORDER BY EXTRACT(DOW FROM a.attendanceDate);
        `,
        [userId]
      ),

      // Course completion progress
      db.query(
        `
        SELECT 
          c.title as courseTitle,
          c.department,
          COUNT(DISTINCT ch.chapterId) as totalChapters,
          COUNT(DISTINCT t.topicId) as totalTopics,
          ROUND(
            (COUNT(DISTINCT t.topicId) * 100.0 / 
             (SELECT COUNT(*) FROM topics WHERE chapterId IN (
               SELECT chapterId FROM chapters WHERE courseId = c.courseId
             ))), 2
          ) as completionPercentage
        FROM students s
        JOIN courses c ON CAST(s.class AS TEXT) = ANY(string_to_array(c.class, ','))
        LEFT JOIN chapters ch ON c.courseId = ch.courseId
        LEFT JOIN topics t ON ch.chapterId = t.chapterId
        WHERE s.userId = $1
        GROUP BY c.courseId, c.title, c.department
        ORDER BY completionPercentage DESC;
        `,
        [userId]
      ),

      // Learning consistency score
      db.query(
        `
        SELECT 
          ROUND(
            (
              (SELECT COUNT(*) FROM quizResults WHERE userId = $1 AND createdAt >= CURRENT_DATE - INTERVAL '30 days') * 0.4 +
              (SELECT COUNT(*) FROM homeworkSubmissions WHERE submittedByUserId = $1 AND submittedAt >= CURRENT_DATE - INTERVAL '30 days') * 0.3 +
              (SELECT COUNT(*) FROM attendance WHERE userId = $1 AND attendanceDate >= CURRENT_DATE - INTERVAL '30 days') * 0.3
            ) / 10, 2
          ) as consistencyScore
        `,
        [userId]
      ),

      // Improvement trends (comparing last 2 months)
      db.query(
        `
        SELECT 
          'Last Month' as period,
          ROUND(AVG(CAST(qr.score AS DECIMAL) * 100.0 / (qr.totalQues * 4)), 2) as avgQuizScore,
          ROUND(AVG(CAST(hs.grade AS DECIMAL)), 2) as avgHomeworkGrade
        FROM students s
        LEFT JOIN quizResults qr ON s.userId = qr.userId 
          AND qr.createdAt >= CURRENT_DATE - INTERVAL '30 days' 
          AND qr.createdAt < CURRENT_DATE
        LEFT JOIN homeworkSubmissions hs ON s.userId = hs.submittedByUserId 
          AND hs.submittedAt >= CURRENT_DATE - INTERVAL '30 days' 
          AND hs.submittedAt < CURRENT_DATE
        WHERE s.userId = $1
        UNION ALL
        SELECT 
          'Previous Month' as period,
          ROUND(AVG(CAST(qr.score AS DECIMAL) * 100.0 / (qr.totalQues * 4)), 2) as avgQuizScore,
          ROUND(AVG(CAST(hs.grade AS DECIMAL)), 2) as avgHomeworkGrade
        FROM students s
        LEFT JOIN quizResults qr ON s.userId = qr.userId 
          AND qr.createdAt >= CURRENT_DATE - INTERVAL '60 days' 
          AND qr.createdAt < CURRENT_DATE - INTERVAL '30 days'
        LEFT JOIN homeworkSubmissions hs ON s.userId = hs.submittedByUserId 
          AND hs.submittedAt >= CURRENT_DATE - INTERVAL '60 days' 
          AND hs.submittedAt < CURRENT_DATE - INTERVAL '30 days'
        WHERE s.userId = $1;
        `,
        [userId]
      )
    ];

    const results = await Promise.all(queries);

    const analysisData = {
      subjectPerformance: results[0].rows,
      learningTrends: results[1].rows,
      difficultyAnalysis: results[2].rows,
      timeManagement: results[3].rows,
      peerComparison: results[4].rows[0] || {},
      studyPatterns: results[5].rows,
      weakAreas: results[6].rows,
      attendancePattern: results[7].rows,
      courseProgress: results[8].rows,
      learningConsistency: results[9].rows[0] || {},
      improvementTrends: results[10].rows
    };

    // Calculate overall insights
    const insights = calculateInsights(analysisData);

    return res.json({
      status: "success",
      data: {
        ...analysisData,
        insights
      }
    });

  } catch (error) {
    console.error("Error fetching student self analysis:", error);
    return res.status(500).json({ status: "failed", message: error.message });
  }
};

// Helper function to calculate insights
const calculateInsights = (data) => {
  const insights = [];

  // Subject performance insights
  if (data.subjectPerformance.length > 0) {
    const bestSubject = data.subjectPerformance[0];
    const worstSubject = data.subjectPerformance[data.subjectPerformance.length - 1];
    
    if (bestSubject.avgScore > 80) {
      insights.push(`Excellent performance in ${bestSubject.department} with ${bestSubject.avgScore}% average score`);
    }
    
    if (worstSubject.avgScore < 60) {
      insights.push(`Consider focusing more on ${worstSubject.department} to improve your ${worstSubject.avgScore}% score`);
    }
  }

  // Time management insights
  if (data.timeManagement.length > 0) {
    const slowQuizzes = data.timeManagement.filter(q => q.timeEfficiency === 'Slow').length;
    if (slowQuizzes > 0) {
      insights.push(`You're taking more time than average on ${slowQuizzes} quizzes. Consider practicing time management`);
    }
  }

  // Study pattern insights
  if (data.studyPatterns.length > 0) {
    const peakHours = data.studyPatterns
      .sort((a, b) => b.activityCount - a.activityCount)
      .slice(0, 3);
    
    if (peakHours.length > 0) {
      insights.push(`Your most productive study hours are: ${peakHours.map(h => `${h.studyHour}:00`).join(', ')}`);
    }
  }

  // Attendance insights
  if (data.attendancePattern.length > 0) {
    const lowAttendanceDays = data.attendancePattern.filter(d => d.daysPresent < 3);
    if (lowAttendanceDays.length > 0) {
      insights.push(`Consider improving attendance on: ${lowAttendanceDays.map(d => d.dayName).join(', ')}`);
    }
  }

  // Learning consistency insights
  if (data.learningConsistency.consistencyScore) {
    const score = parseFloat(data.learningConsistency.consistencyScore);
    if (score >= 8) {
      insights.push(`Excellent learning consistency! Your consistency score is ${score}/10`);
    } else if (score >= 6) {
      insights.push(`Good learning consistency with a score of ${score}/10. Keep it up!`);
    } else {
      insights.push(`Your learning consistency score is ${score}/10. Try to maintain a more regular study schedule`);
    }
  }

  // Improvement trends insights
  if (data.improvementTrends.length >= 2) {
    const lastMonth = data.improvementTrends.find(t => t.period === 'Last Month');
    const prevMonth = data.improvementTrends.find(t => t.period === 'Previous Month');
    
    if (lastMonth && prevMonth) {
      const quizImprovement = (lastMonth.avgQuizScore || 0) - (prevMonth.avgQuizScore || 0);
      const homeworkImprovement = (lastMonth.avgHomeworkGrade || 0) - (prevMonth.avgHomeworkGrade || 0);
      
      if (quizImprovement > 5) {
        insights.push(`Great improvement in quiz performance! Your score increased by ${quizImprovement.toFixed(1)}%`);
      } else if (quizImprovement < -5) {
        insights.push(`Quiz performance decreased by ${Math.abs(quizImprovement).toFixed(1)}%. Consider reviewing your study methods`);
      }
      
      if (homeworkImprovement > 0.5) {
        insights.push(`Excellent progress in homework! Your grade improved by ${homeworkImprovement.toFixed(1)} points`);
      }
    }
  }

  return insights;
};

module.exports = {
  studentDashboardInfo,
  studentSelfAnalysis,
};


