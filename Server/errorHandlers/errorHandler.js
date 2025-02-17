const CustomError = require("./CustomError");

const errorHandler = (err, req, res, next) => {
    let { statusCode, message } = err;

    // Default values for unexpected errors
    if (!statusCode) statusCode = 500;
    if (!message) message = "Internal Server Error";

    // Handle specific error types
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = Object.values(err.errors).map((val) => val.message).join(", ");
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Handle custom application errors
    if (err instanceof CustomError) {
        statusCode = err.statusCode || statusCode;
        message = err.message || message;
    }

    // Send error response
    return res.status(statusCode).json({
        status: "error",
        error: message,
    });
};

module.exports = errorHandler;