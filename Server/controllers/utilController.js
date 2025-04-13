const restrictUsers = (res, restrictingRoles, currRole, message) => {
  if (restrictingRoles.includes(currRole)) {
    return res.status(403).json({
      status: "error",
      message: `Access Denied. You are not authorized ${message}. Please contact your administrator.`,
    });
  }
};

const allowUsers = (res,allowingRoles,currRole,message) => {
  if (!allowingRoles.includes(currRole)) {
    return res.status(403).json({
      status: "error",
      message: `Access Denied. You are not authorized ${message}. Please contact your administrator.`,
      role: currRole
    });
  }
}

const update_student_zcoins = async (userId) => {
  const db = await getDb();
  const result = await db.query(
    `UPDATE students SET currentZCoins = 
      (SELECT (TopicEarnings + HomeworkEarnings + quizEarnings - coursebought - quizzesBought) 
       FROM student_zcoin_summary WHERE userId = $1) 
    WHERE userId = $1
    RETURNING currentZCoins as zcoins`, 
    [userId]
  );
  return result.rows[0]?.zcoins;
}

const getUserId = (req) => {
  return req.user.userId;
}



module.exports = {
  restrictUsers,
  allowUsers,
  getUserId,
  update_student_zcoins,
};
