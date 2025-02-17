const { getDb } = require("../db/connectDb");
const { restrictUsers, allowUsers } = require("./utilController");

const getHomeWorks = async (req, res) => {
  try {
    const role = req.user.role;
    allowUsers(res, ["student", "teacher"], role, "to get HomeWorks");
    const homeworkId = req.query.homeworkid;

    const userId = req.user.userId;
    const db = await getDb();

    let allHomework = await db.query(
      `SELECT hw.*, au.name AS teacherName
       FROM homework hw
       JOIN allUsers au ON au.id = hw.createdByUserId
       ${homeworkId ? `WHERE hw.homeworkid = $1`:''}
       `
    ,homeworkId ? [homeworkId]:[]);

    allHomework = allHomework.rows;

    if (role === "teacher") {
      let result = await db.query(
        "SELECT assignedClasses FROM teachers WHERE userId = $1",
        [userId]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ status: "failed", message: "Teacher not found" });
      }

      let assignedClasses = result.rows[0].assignedclasses
        .split(",")
        .map((cls) => cls.trim());

      let filteredHomework = allHomework.filter((hw) =>
        hw.assignedclasses
          .split(",")
          .some((cls) => assignedClasses.includes(cls.trim()))
      );

      let homeworkIds = filteredHomework.map((hw) => hw.homeworkid);

      if (homeworkIds.length > 0) {
        let submissionsData = await db.query(
          `SELECT hs.homeworkId, au.name AS submittedStudent
           FROM HomeworkSubmissions hs
           JOIN AllUsers au ON hs.submittedByUserId = au.id
           WHERE hs.homeworkId = ANY($1)`,
          [homeworkIds]
        );

        let studentsData = await db.query(
          `SELECT s.class, au.name AS studentName
           FROM Students s
           JOIN AllUsers au ON s.userId = au.id`
        );

        let submissionsMap = submissionsData.rows.reduce((acc, row) => {
          if (!acc[row.homeworkid]) acc[row.homeworkid] = [];
          acc[row.homeworkid].push(row.submittedstudent);
          return acc;
        }, {});

        let studentsMap = studentsData.rows.reduce((acc, row) => {
          if (!acc[row.class]) acc[row.class] = [];
          acc[row.class].push(row.studentname);
          return acc;
        }, {});

        filteredHomework = filteredHomework.map((hw) => {
          let allStudents = hw.assignedclasses
            .split(",")
            .flatMap((cls) => studentsMap[cls.trim()] || []);
          let submittedStudents = submissionsMap[hw.homeworkid] || [];
          let pendingStudents = allStudents.filter(
            (student) => !submittedStudents.includes(student)
          );

          return {
            ...hw,
            submittedStudents,
            pendingStudents,
            submittedCount: submittedStudents.length,
            totalStudents: allStudents.length,
            pendingSubmissions: allStudents.length - submittedStudents.length,
          };
        });
      }

      return res.status(200).json({
        status: "success",
        data: filteredHomework,
      });
    } else if (role === "student") {
      let result = await db.query(
        "SELECT class FROM students WHERE userId = $1",
        [userId]
      );

      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ status: "failed", message: "Student not found" });
      }

      const studentClass = result.rows[0].class;

      const filteredHomework = allHomework.filter((hw) =>
        hw.assignedclasses.split(",").includes(`${studentClass}`)
      );

      if(filteredHomework.length === 0) {

        return res.status(200).json({
          status: "success",
          message: "No homework assigned to your class or with this homework Id"
        });
      }
      return res.status(200).json({
        status: "success",
        data: filteredHomework,
      });
    } else {
      return res.status(403).json({
        status: "failed",
        message: "You are not authorized to access this route",
      });
    }
  } catch (error) {
    console.error("Error in getHomeWorks:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const createHomework = async (req, res) => {
  try {
    const role = req.user.role;
    allowUsers(res, ["teacher"], role, "to create Homework");

    const { title, description, assignedClasses, dueDate, fileType, fileUrl } =
      req.body;
    const createdByUserId = req.user.userId;

    if (!title || !description || !assignedClasses || !dueDate) {
      return res
        .status(400)
        .json({ status: "failed", message: "Missing required fields" });
    }

    const db = await getDb();
    const result = await db.query(
      `INSERT INTO homework (createdByUserId, title, description, assignedClasses, dueDate, fileType, fileUrl) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        createdByUserId,
        title,
        description,
        assignedClasses,
        dueDate,
        fileType || null,
        fileUrl || null,
      ]
    );

    return res.status(201).json({
      status: "success",
      message: "Homework created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error in createHomework:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const submitHomework = async (req, res) => {
  try {
    const role = req.user.role;
    allowUsers(res, ["student"], role, "to submit homework");

    const { homeworkId, answerText, fileType, fileUrl } = req.body;
    const submittedByUserId = req.user.userId;

    if (!homeworkId || !answerText) {
      return res
        .status(400)
        .json({ status: "failed", message: "Missing required fields" });
    }

    const db = await getDb();
    const result = await db.query(
      `INSERT INTO HomeworkSubmissions (homeworkId, submittedByUserId, answerText, fileType, fileUrl, grade)
             VALUES ($1, $2, $3, $4, $5, NULL) RETURNING *`,
      [
        homeworkId,
        submittedByUserId,
        answerText,
        fileType || null,
        fileUrl || null,
      ]
    );

    return res.status(201).json({
      status: "success",
      message: "Homework submitted successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error in submitHomework:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getSubmittedHomeworks = async (req, res) => {
  try {
    const role = req.user.role;
    allowUsers(res, ["teacher"], role, "to get submitted HomeWorks");

    const userId = req.user.userId;
    const db = await getDb();

    let teacherHomeworks = await db.query(
      `SELECT hw.*, au.name AS teacherName 
       FROM homework hw 
       JOIN allUsers au ON au.id = hw.createdByUserId
       WHERE hw.createdByUserId = $1`,
      [userId]
    );

    teacherHomeworks = teacherHomeworks.rows;

    if (teacherHomeworks.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "No homeworks found for this teacher",
      });
    }

    let homeworkIds = teacherHomeworks.map((hw) => hw.homeworkid);

    let submissionsData = [];
    if (homeworkIds.length > 0) {
      submissionsData = await db.query(
        `SELECT hs.*, au.name AS submittedStudent, st.class as studentClass
         FROM HomeworkSubmissions hs
         JOIN AllUsers au ON hs.submittedByUserId = au.id
         JOIN Students st on hs.submittedByUserId = st.class
         JOIN Homework hw ON hs.homeworkId = hw.homeworkid
         WHERE hs.homeworkId = ANY($1)`,
        [homeworkIds]
      );

      submissionsData = submissionsData.rows.reduce((acc, row) => {
        if (!acc[row.homeworkid]) acc[row.homeworkid] = [];

        // Check if the submission already exists for the student in the given homework
        const existingSubmission = acc[row.homeworkid].find(
          (submission) => submission.studentId === row.submittedbyuserid
        );

        if (!existingSubmission) {
          acc[row.homeworkid].push({
            submissionId: row.submissionid,
            studentId: row.submittedbyuserid,
            studentName: row.submittedstudent,
            studentClass: row.studentclass,
            answerText: row.answertext,
            fileType: row.filetype || "No file",
            fileUrl: row.fileurl || "No file URL",
            submittedAt: row.submittedAt,
            grade: row.grade || "Not graded",
          });
        }
        return acc;
      }, {});
    }

    let response = {
      status: "success",
      data: {
        homeworks: teacherHomeworks.map((hw) => ({
          ...hw,
          submissions: submissionsData[hw.homeworkid] || [],
        })),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getSubmittedHomeworks:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const gradeUpdate = async (req, res) => {
  try {
    const { submissionId, grade } = req.body;

    allowUsers(
      res,
      ["teacher"],
      req.user.role,
      "to grade the student submission"
    );

    if (!submissionId || grade === undefined) {
      return res.status(400).json({
        status: "failed",
        message: "submissionId and grade are required",
      });
    }

    const db = await getDb();

    // Check if the submission exists
    const submissionCheck = await db.query(
      "SELECT * FROM HomeworkSubmissions WHERE submissionId = $1",
      [submissionId]
    );

    if (submissionCheck.rows.length === 0) {
      return res.status(404).json({
        status: "failed",
        message: "Submission not found",
      });
    }

    // Update the grade
    await db.query(
      "UPDATE HomeworkSubmissions SET grade = $1 WHERE submissionId = $2",
      [grade, submissionId]
    );

    return res.status(200).json({
      status: "success",
      message: "Grade updated successfully",
    });
  } catch (error) {
    console.error("Error in gradeUpdate:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getHomeWorks,
  createHomework,
  submitHomework,
  getSubmittedHomeworks,
  gradeUpdate,
};
