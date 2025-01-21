const { getDb, connectDb } = require("./db/connectDb");

const query = `


-- Quiz for Course 1
INSERT INTO Quiz (quizTitle, quizDescription, quizCourseId, createdByUserId, assignedClasses)
VALUES 
('Understanding Numbers', 'Quiz on Understanding basic numbers and operations.', 1, 4, '1,2,3'),
('Counting Practice', 'Quiz to test counting skills and number sequences.', 1, 5, '4,5'),
('Shapes and Sizes', 'Quiz on recognizing and understanding various shapes and sizes.', 1, 6, '1,2,3'),
('Geometry Practice', 'Quiz on basic geometry concepts and problems.', 1, 7, '4,5');

-- Questions for Course 1

-- Understanding Numbers
INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
VALUES
(1, 'What is the value of 2 + 3?', '4', '5', '6', '7', 'B', 'Easy'),
(1, 'Which number is the smallest?', '8', '4', '1', '10', 'C', 'Easy'),
(1, 'What is 5 multiplied by 6?', '11', '30', '35', '40', 'B', 'Medium'),
(1, 'If you subtract 4 from 9, what do you get?', '5', '6', '4', '3', 'A', 'Easy'),
(1, 'Which number is an even number?', '3', '4', '5', '7', 'B', 'Easy');

-- Counting Practice
INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
VALUES
(2, 'What is the next number after 99?', '100', '101', '98', '95', 'A', 'Easy'),
(2, 'How many even numbers are between 1 and 10?', '4', '5', '6', '7', 'B', 'Medium'),
(2, 'How many tens are in 150?', '12', '14', '15', '16', 'C', 'Medium'),
(2, 'What is the sum of the first 10 natural numbers?', '50', '45', '55', '60', 'A', 'Hard'),
(2, 'What comes after 0.5 in decimal?', '0.6', '0.7', '0.4', '0.9', 'A', 'Medium');

-- Shapes and Sizes
INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
VALUES
(3, 'How many sides does a square have?', '2', '4', '6', '8', 'B', 'Easy'),
(3, 'What shape has no corners?', 'Circle', 'Square', 'Rectangle', 'Triangle', 'A', 'Easy'),
(3, 'How many edges does a cube have?', '6', '8', '12', '16', 'C', 'Medium'),
(3, 'Which of these shapes is a 3D object?', 'Circle', 'Cube', 'Square', 'Rectangle', 'B', 'Hard'),
(3, 'Which of these is a triangle?', 'Circle', 'Square', 'Triangle', 'Rectangle', 'C', 'Easy');

-- Geometry Practice
INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
VALUES
(4, 'What is the area of a rectangle with length 5 and width 3?', '10', '15', '20', '8', 'B', 'Medium'),
(4, 'How many degrees are in a right angle?', '60', '90', '180', '120', 'B', 'Easy'),
(4, 'What is the perimeter of a square with side length 4?', '12', '16', '20', '24', 'B', 'Medium'),
(4, 'What is the volume of a cube with side length 3?', '6', '9', '27', '36', 'C', 'Hard'),
(4, 'What is the formula for the area of a triangle?', '1/2 * base * height', 'base * height', 'side^2', 'side * height', 'A', 'Easy');


-- Quiz for Course 2
INSERT INTO Quiz (quizTitle, quizDescription, quizCourseId, createdByUserId, assignedClasses)
VALUES 
('Introduction to Algebra', 'Basic introduction to algebraic expressions and operations.', 2, 4, '6,7,8'),
('Practice Algebra', 'Practice on solving simple algebraic equations.', 2, 5, '9,10'),
('Basics of Trigonometry', 'Introduction to trigonometric ratios and their applications.', 2, 6, '6,7,8'),
('Trigonometry Practice', 'Practice problems based on trigonometry concepts.', 2, 7, '9,10');

-- Questions for Course 2

-- Introduction to Algebra
INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
VALUES
(5, 'What is the value of x if 2x + 3 = 7?', '2', '3', '4', '5', 'A', 'Easy'),
(5, 'What is the simplified form of 3a + 4a?', '5a', '7a', '3a', '6a', 'B', 'Medium'),
(5, 'Which of the following is an algebraic expression?', '2 + 3', 'x + 5', '3 * 4', '10 / 2', 'B', 'Easy'),
(5, 'If x = 3, what is the value of 2x + 5?', '11', '12', '9', '13', 'A', 'Medium'),
(5, 'What is the value of x in the equation 5x - 4 = 16?', '4', '5', '3', '2', 'A', 'Hard');

-- Practice Algebra
INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
VALUES
(6, 'Solve for x: 4x - 6 = 10', 'x = 4', 'x = 5', 'x = 2', 'x = 3', 'D', 'Medium'),
(6, 'What is the value of x in 3x + 4 = 10?', '2', '4', '3', '6', 'A', 'Easy'),
(6, 'Simplify: 2(x + 3) = 8', 'x = 4', 'x = 5', 'x = 3', 'x = 2', 'A', 'Medium'),
(6, 'What is the value of x in the equation x/3 = 5?', '15', '10', '3', '5', 'A', 'Medium'),
(6, 'Solve for x: 2x + 3 = 11', 'x = 3', 'x = 4', 'x = 2', 'x = 5', 'A', 'Hard');

-- Basics of Trigonometry
INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
VALUES
(7, 'What is sin(90°)?', '0', '1', 'undefined', '0.5', 'B', 'Easy'),
(7, 'Which of the following is a trigonometric ratio?', 'cos', 'plus', 'minus', 'square root', 'A', 'Medium'),
(7, 'What is tan(45°)?', '1', '0', 'undefined', '0.5', 'A', 'Medium'),
(7, 'What is the value of cos(0°)?', '1', '0', '0.5', 'undefined', 'A', 'Easy'),
(7, 'What is the ratio for sine?', 'Opposite / Hypotenuse', 'Adjacent / Hypotenuse', 'Opposite / Adjacent', 'Hypotenuse / Adjacent', 'A', 'Medium');

-- Trigonometry Practice
INSERT INTO QuizQuestions (quizId, question, optionA, optionB, optionC, optionD, correctAnswer, difficulty)
VALUES
(8, 'What is the value of cos(60°)?', '0.5', '1', '0', '0.25', 'A', 'Medium'),
(8, 'What is tan(30°)?', '0.577', '1', '0', '0.5', 'A', 'Medium'),
(8, 'What is the sine of 45°?', '0.707', '1', '0.5', '0.5', 'A', 'Hard'),
(8, 'Find the value of sin(30°) in the right triangle with hypotenuse 10.', '5', '3', '7', '6', 'B', 'Hard'),
(8, 'What is the ratio of cosine of 90°?', '0', '1', 'undefined', '0.5', 'A', 'Medium');


`;

const populate = async () => {
    await connectDb();  // Ensure the connection is established first
    const db = getDb(); // Get the connected database client
    try {
        await db.query(query,(err,res)=>{
            console.log("Query executed");
        });  // Execute the query
    } catch (error) {
        console.error("Error executing query:", error);
    }
};

populate();
