const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ 
            status: "error", 
            message: "Access denied. No token provided." 
        });
    }

    const token = authHeader.split(' ')[1];
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                status: "error", 
                message: "Token has expired. Please log in again." 
            });
        }
        console.error("Token verification error:", err.message);
        return res.status(400).json({ 
            status: "error", 
            message: "Invalid token. Please try logging in again.", 
            error: err.message 
        });
    }
};

module.exports = verifyToken;
