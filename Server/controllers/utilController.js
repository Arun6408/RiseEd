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

const getUserId = (req) => {
  return req.user.userId;
}



module.exports = {
  restrictUsers,
  allowUsers,
  getUserId,
};
