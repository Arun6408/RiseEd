class BadRequestError extends CustomError {
    constructor(message = "Bad Request") {
        super(message, 400);
    }
}

class ForbiddenError extends CustomError {
    constructor(message = "Forbidden") {
        super(message, 403);
    }
}

class UnauthorizedError extends CustomError {
    constructor(message = "Unauthorized") {
        super(message, 401);
    }
}

class DuplicateError extends CustomError {
    constructor(message = "Duplicate Entry") {
        super(message, 409);
    }
}

class NotFoundError extends CustomError {
    constructor(message = "Not Found") {
        super(message, 404);
    }
}

class InternalServerError extends CustomError {
    constructor(message = "Internal Server Error") {
        super(message, 500);
    }
}
