const restrictUsers = (res, restrictingRoles, currRole, message) => {
  if (restrictingRoles.includes(currRole)) {
    res.status(403).json({
      status: "error",
      message: `Access Denied. You are not authorized ${message}. Please contact your administrator.`,
    });
    return true;
  }
  return false;
};

module.exports = {
  restrictUsers,
};
