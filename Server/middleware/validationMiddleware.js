const { body, validationResult } = require('express-validator');

const validateLogin = () => {
    return [
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
        body('password').notEmpty().withMessage('Password is required')
    ];
}

const validateRegister = () => {
    return [
        body('name').notEmpty().withMessage('Name is required'),
        body('username').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required'),
        body('role').notEmpty().withMessage('Role is required')
            .isIn(['super_admin', 'principal', 'head_master', 'teacher', 'student']).withMessage('Invalid role'),
        body('age').notEmpty().withMessage('Age is required').isInt().withMessage('Age must be a number'),
        body('phone').notEmpty().withMessage('Phone is required').isMobilePhone().withMessage('Invalid phone number'),
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
        
        // Role-specific validations
        body('salary').if(body('role').isIn(['principal', 'head_master', 'teacher']))
            .notEmpty().withMessage('Salary is required')
            .isNumeric().withMessage('Salary must be a number'),
        
        body('department').if(body('role').isIn(['head_master', 'teacher']))
            .notEmpty().withMessage('Department is required'),
        
        body('assignedClasses').if(body('role').isIn(['head_master', 'teacher']))
            .notEmpty().withMessage('Assigned classes are required'),
        
        body('class').if(body('role').equals('student'))
            .notEmpty().withMessage('Class is required'),
        
        body('scholarshipAmount').if(body('role').equals('student'))
            .notEmpty().withMessage('Scholarship amount is required')
            .isNumeric().withMessage('Scholarship amount must be a number'),
        
        body('score').if(body('role').equals('student'))
            .notEmpty().withMessage('Score is required')
            .isNumeric().withMessage('Score must be a number'),
    ];
};


const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(400).json({ errors: errors.array() });
}

module.exports = { validateLogin, validateRegister, validate };