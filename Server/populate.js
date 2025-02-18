const dotenv = require("dotenv");
const { getDb, connectDb, closeDb } = require("./db/connectDb");
dotenv.config();

const types = `


-- Define ENUM types
CREATE TYPE user_role AS ENUM ('superAdmin', 'principal', 'headMaster', 'teacher', 'student', 'parent');
CREATE TYPE topic_type AS ENUM ('video', 'content', 'pdf', 'questionAndAnswers');
CREATE TYPE message_status AS ENUM ('Seen', 'Delivered');
CREATE TYPE answer_option AS ENUM ('A', 'B', 'C', 'D');
CREATE TYPE difficulty_level AS ENUM ('Easy', 'Medium', 'Hard');
CREATE TYPE ebook_genre AS ENUM ('Fiction', 'Non-Fiction', 'Science', 'Technology', 'Cooking', 'Health', 'Education', 'Biography', 'Travel', 'History');
CREATE TYPE salary_Transaction_Status AS ENUM('Paid', 'Pending');

`

const query = types + `

-- AllUsers table
CREATE TABLE IF NOT EXISTS AllUsers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    userName VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    age INT,
    phone VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- HeadMasters table
CREATE TABLE IF NOT EXISTS HeadMasters (
    headMasterId SERIAL PRIMARY KEY,
    department VARCHAR(30) NOT NULL,
    assignedClasses TEXT NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE
);

-- Teachers table
CREATE TABLE IF NOT EXISTS Teachers (
    teacherId SERIAL PRIMARY KEY,
    department VARCHAR(30) NOT NULL,
    assignedClasses TEXT NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE
);

-- Students table
CREATE TABLE IF NOT EXISTS Students (
    studentId SERIAL PRIMARY KEY,
    class INT NOT NULL,
    scholarshipAmount DECIMAL(10, 2),
    userId INT NOT NULL,
    score DECIMAL(5, 2),
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE
);

-- Parents table
CREATE TABLE IF NOT EXISTS Parents (
    parentId SERIAL PRIMARY KEY,
    totalFeeDue DECIMAL(10, 2) NOT NULL,
    studentId INT NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (studentId) REFERENCES AllUsers(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE
);

-- FeeStructure table
CREATE TABLE IF NOT EXISTS FeeStructure (
    id SERIAL PRIMARY KEY,
    class VARCHAR(50) NOT NULL,
    tuitionFee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    labFee DECIMAL(10, 2) DEFAULT 0.00,
    sportsFee DECIMAL(10, 2) DEFAULT 0.00,
    transportFee DECIMAL(10, 2) DEFAULT 0.00,
    miscellaneousFee DECIMAL(10, 2) DEFAULT 0.00
);

-- Videos table
CREATE TABLE IF NOT EXISTS Videos (
    videoId SERIAL PRIMARY KEY,
    videoDuration INT NOT NULL,
    videoUrl VARCHAR(255) NOT NULL
);

-- Courses table
CREATE TABLE IF NOT EXISTS Courses (
    courseId SERIAL PRIMARY KEY,
    class TEXT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    department VARCHAR(30) NOT NULL,
    userId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE
);

-- Chapters table
CREATE TABLE IF NOT EXISTS Chapters (
    chapterId SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    courseId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES Courses(courseId) ON DELETE CASCADE
);

-- Topics table
CREATE TABLE IF NOT EXISTS Topics (
    topicId SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    topicType topic_type NOT NULL,
    videoId INT,
    pdfUrl VARCHAR(255),
    questionAndAnswers TEXT,
    chapterId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chapterId) REFERENCES Chapters(chapterId) ON DELETE CASCADE,
    FOREIGN KEY (videoId) REFERENCES Videos(videoId)
);

-- Quiz table
CREATE TABLE IF NOT EXISTS Quiz (
    quizId SERIAL PRIMARY KEY,
    quizTitle VARCHAR(100) NOT NULL,
    quizDescription TEXT NOT NULL,
    quizCourseId INT NOT NULL,
    createdByUserId INT NOT NULL,
    assignedClasses TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdByUserId) REFERENCES AllUsers(id) ON DELETE CASCADE,
    FOREIGN KEY (quizCourseId) REFERENCES Courses(courseId) ON DELETE CASCADE
);

-- QuizQuestions table
CREATE TABLE IF NOT EXISTS QuizQuestions (
    quizQuestionId SERIAL PRIMARY KEY,
    quizId INT NOT NULL,
    question TEXT NOT NULL,
    optionA TEXT NOT NULL,
    optionB TEXT NOT NULL,
    optionC TEXT NOT NULL,
    optionD TEXT NOT NULL,
    correctAnswer answer_option NOT NULL,
    difficulty difficulty_level NOT NULL,
    FOREIGN KEY (quizId) REFERENCES Quiz(quizId) ON DELETE CASCADE
);

-- Ebooks table
CREATE TABLE IF NOT EXISTS Ebooks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    createdByUserId INT NOT NULL,
    description TEXT,
    genre ebook_genre NOT NULL,
    fileUrl VARCHAR(255) NOT NULL,
    uploadDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdByUserId) REFERENCES AllUsers(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE IF NOT EXISTS Messages (
    messageId SERIAL PRIMARY KEY,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    message TEXT NOT NULL,
    createdAt VARCHAR(50) NOT NULL,
    viewStatus message_status DEFAULT 'Delivered',
    fileType VARCHAR(20) NOT NULL,
    fileUrl VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (senderId) REFERENCES AllUsers(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES AllUsers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS QuizResults(
    resultId SERIAL PRIMARY KEY,
    quizId INT NOT NULL,
    userId INT NOT NULL,
    totalQues INT NOT NULL,
    correctCount INT NOT NULL,
    wrongCount INT NOT NULL,
    skippedCount INT NOT NULL,
    timeSpent INT NOT NULL,
    score INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quizId) REFERENCES Quiz(quizId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Homework (
    homeworkId SERIAL PRIMARY KEY,
    createdByUserId INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    assignedClasses TEXT NOT NULL,
    dueDate TIMESTAMP,
    fileType VARCHAR(20) DEFAULT NULL,
    fileUrl VARCHAR(255) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (createdByUserId) REFERENCES AllUsers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS HomeworkSubmissions(
    submissionId SERIAL PRIMARY KEY,
    homeworkId INT NOT NULL,
    submittedByUserId INT NOT NULL,
    answertext TEXT NOT NULL,
    fileType VARCHAR(20) DEFAULT NULL,
    fileUrl VARCHAR(255) DEFAULT NULL,
    grade DECIMAL(3,2) DEFAULT NULL,
    submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (homeworkId) REFERENCES Homework(homeworkId) ON DELETE CASCADE,
    FOREIGN KEY (submittedByUserId) REFERENCES AllUsers(id) ON DELETE CASCADE
);
    
CREATE TABLE salaries (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    basic DECIMAL(10,2) NOT NULL,
    rentAllowance DECIMAL(10,2) NOT NULL,
    foodAllowance DECIMAL(10,2) NOT NULL,
    travelAllowance DECIMAL(10,2) NOT NULL,
    otherAllowance DECIMAL(10,2) NOT NULL,
    taxDeduction DECIMAL(10,2) NOT NULL,
    providentFund DECIMAL(10,2) NOT NULL,
    otherDeductions DECIMAL(10,2) NOT NULL,
    netSalary DECIMAL(10,2) GENERATED ALWAYS AS 
        (basic + rentAllowance + foodAllowance + travelAllowance + otherAllowance - 
        (taxDeduction + providentFund + otherDeductions)) STORED,
    lastIncrementDate DATE,
    lastIncrementAmount DECIMAL(10,2),
    nextAppraisalDate DATE,
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE
);
    
CREATE TABLE salaryTransactions (
    id SERIAL PRIMARY KEY ,
    userId INT NOT NULL,
    transactionDate DATE NOT NULL,
    transactionId VARCHAR(50) UNIQUE NOT NULL,
    salaryMonth VARCHAR(20) NOT NULL, -- Example: 'Jan 2024'
    amount DECIMAL(10,2) NOT NULL,
    status salary_Transaction_Status NOT NULL DEFAULT 'Pending',
    payslipUrl VARCHAR(255) DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS VideoWatchStatus (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    videoId INT NOT NULL,
    watchTime INT NOT NULL DEFAULT 0, 
    lastPlaybackPosition INT DEFAULT 0,
    lastWatched TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE,
    FOREIGN KEY (videoId) REFERENCES Videos(videoId) ON DELETE CASCADE,
    UNIQUE (userId, videoId)
);


CREATE TABLE IF NOT EXISTS TimeSpentOnTopic (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    topicId INT NOT NULL,
    timeSpentOnTopic INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE,
    FOREIGN KEY (topicId) REFERENCES Topics(topicId) ON DELETE CASCADE,
    UNIQUE (userId, topicId)
);

CREATE TABLE IF NOT EXISTS Attendance (
    id SERIAL PRIMARY KEY,
    userId INT NOT NULL,
    attendanceDate DATE NOT NULL,
    present BOOLEAN DEFAULT false,
    FOREIGN KEY (userId) REFERENCES AllUsers(id) ON DELETE CASCADE
);
    
    
CREATE TABLE IF NOT EXISTS SchoolEvents (
    id SERIAL PRIMARY KEY,
    conductedBy INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    eventType VARCHAR(50) NOT NULL,
    startDate DATE,
    endDate DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conductedBy) REFERENCES AllUsers(id) ON DELETE CASCADE
);

-- Insert Super Admin
INSERT INTO AllUsers (name, userName, password, role, age, phone, email) 
VALUES ('Amit Sharma', 'superAdmin', 'admin123', 'superAdmin', 40, '9876543210', 'superadmin@example.com');

-- Insert Principal
INSERT INTO AllUsers (name, userName, password, role, age, phone, email) 
VALUES ('Rajesh Kumar', 'principal', 'principal123', 'principal', 50, '9876543211', 'principal@example.com');

-- Insert Head Master
INSERT INTO AllUsers (name, userName, password, role, age, phone, email) 
VALUES ('Suresh Kumar', 'headMaster', 'headMaster123', 'headMaster', 50, '9876543211', 'headMaster@example.com');

INSERT INTO HeadMasters (userId, department, assignedClasses) 
VALUES ((SELECT id FROM AllUsers WHERE userName = 'headMaster'), 'administration', '1,2,3,4,5');

-- Insert 5 Teachers
INSERT INTO AllUsers (name, userName, password, role, age, phone, email) 
VALUES 
('Sunita Mehta', 'teacher1', 'teacher123', 'teacher', 35, '9876543212', 'teacher1@example.com'),
('Ravi Singh', 'teacher2', 'teacher123', 'teacher', 38, '9876543213', 'teacher2@example.com'),
('Priya Joshi', 'teacher3', 'teacher123', 'teacher', 40, '9876543214', 'teacher3@example.com'),
('Anil Kapoor', 'teacher4', 'teacher123', 'teacher', 29, '9876543215', 'teacher4@example.com'),
('Neha Gupta', 'teacher5', 'teacher123', 'teacher', 45, '9876543216', 'teacher5@example.com');

INSERT INTO Teachers (userId, department, assignedClasses) 
VALUES 
((SELECT id FROM AllUsers WHERE userName = 'teacher1'), 'Mathematics','1,2,3,4,5'),
((SELECT id FROM AllUsers WHERE userName = 'teacher2'), 'Science','1,2,3,4,5'),
((SELECT id FROM AllUsers WHERE userName = 'teacher3'), 'English','1,2,3,4,5'),
((SELECT id FROM AllUsers WHERE userName = 'teacher4'), 'History','6,7,8,9,10'),
((SELECT id FROM AllUsers WHERE userName = 'teacher5'), 'Mathematics','6,7,8,9,10');

-- Insert 20 Students
INSERT INTO AllUsers (name, userName, password, role, age, phone, email) 
VALUES 
('Aryan Mishra', 'student1', 'student123', 'student', 15, '9876543217', 'student1@example.com'),
('Sneha Verma', 'student2', 'student123', 'student', 14, '9876543218', 'student2@example.com'),
('Kunal Roy', 'student3', 'student123', 'student', 16, '9876543219', 'student3@example.com'),
('Riya Sen', 'student4', 'student123', 'student', 14, '9876543220', 'student4@example.com'),
('Arjun Das', 'student5', 'student123', 'student', 15, '9876543221', 'student5@example.com'),
('Meera Pillai', 'student6', 'student123', 'student', 16, '9876543222', 'student6@example.com'),
('Aditya Kulkarni', 'student7', 'student123', 'student', 13, '9876543223', 'student7@example.com'),
('Pooja Reddy', 'student8', 'student123', 'student', 15, '9876543224', 'student8@example.com'),
('Suresh Nair', 'student9', 'student123', 'student', 14, '9876543225', 'student9@example.com'),
('Anjali Menon', 'student10', 'student123', 'student', 15, '9876543226', 'student10@example.com'),
('Raghav Bhat', 'student11', 'student123', 'student', 16, '9876543227', 'student11@example.com'),
('Tina Kapoor', 'student12', 'student123', 'student', 14, '9876543228', 'student12@example.com'),
('Vikram Rao', 'student13', 'student123', 'student', 13, '9876543229', 'student13@example.com'),
('Neeraj Jain', 'student14', 'student123', 'student', 14, '9876543230', 'student14@example.com'),
('Nisha Malik', 'student15', 'student123', 'student', 15, '9876543231', 'student15@example.com'),
('Ishaan Chawla', 'student16', 'student123', 'student', 13, '9876543232', 'student16@example.com'),
('Kavya Goel', 'student17', 'student123', 'student', 14, '9876543233', 'student17@example.com'),
('Rohan Vohra', 'student18', 'student123', 'student', 15, '9876543234', 'student18@example.com'),
('Aditi Arora', 'student19', 'student123', 'student', 16, '9876543235', 'student19@example.com'),
('Manav Tiwari', 'student20', 'student123', 'student', 14, '9876543236', 'student20@example.com');


INSERT INTO Students (userId, class, scholarshipAmount, score) 
VALUES 
((SELECT id FROM AllUsers WHERE userName = 'student1'), 1, 1000.00, 85.50),
((SELECT id FROM AllUsers WHERE userName = 'student2'), 2, 1500.00, 88.00),
((SELECT id FROM AllUsers WHERE userName = 'student3'), 3, 1200.00, 90.00),
((SELECT id FROM AllUsers WHERE userName = 'student4'), 4, 1000.00, 75.00),
((SELECT id FROM AllUsers WHERE userName = 'student5'), 5, 1500.00, 92.50),
((SELECT id FROM AllUsers WHERE userName = 'student6'), 6, 1200.00, 78.00),
((SELECT id FROM AllUsers WHERE userName = 'student7'), 7, NULL, 85.00),
((SELECT id FROM AllUsers WHERE userName = 'student8'), 8, NULL, 88.00),
((SELECT id FROM AllUsers WHERE userName = 'student9'), 9, 1000.00, 79.50),
((SELECT id FROM AllUsers WHERE userName = 'student10'), 10, NULL, 82.00),
((SELECT id FROM AllUsers WHERE userName = 'student11'), 1, 800.00, 83.50),
((SELECT id FROM AllUsers WHERE userName = 'student12'), 2, 1200.00, 87.00),
((SELECT id FROM AllUsers WHERE userName = 'student13'), 3, NULL, 86.00),
((SELECT id FROM AllUsers WHERE userName = 'student14'), 4, 1100.00, 88.50),
((SELECT id FROM AllUsers WHERE userName = 'student15'), 5, 900.00, 85.00),
((SELECT id FROM AllUsers WHERE userName = 'student16'), 6, NULL, 82.50),
((SELECT id FROM AllUsers WHERE userName = 'student17'), 7, 950.00, 84.00),
((SELECT id FROM AllUsers WHERE userName = 'student18'), 8, NULL, 89.50),
((SELECT id FROM AllUsers WHERE userName = 'student19'), 9, 1000.00, 81.00),
((SELECT id FROM AllUsers WHERE userName = 'student20'), 10, 1200.00, 80.00);



-- Insert Parents into AllUsers
INSERT INTO AllUsers (name, userName, password, role, age, phone, email) 
VALUES 
('Rajesh Mishra', 'parent1', 'parent123', 'parent', 40, '9876543299', 'parent1@example.com'),
('Suresh Verma', 'parent2', 'parent123', 'parent', 40, '9876543300', 'parent2@example.com'),
('Vinod Roy', 'parent3', 'parent123', 'parent', 40, '9876543301', 'parent3@example.com'),
('Ramesh Sen', 'parent4', 'parent123', 'parent', 40, '9876543302', 'parent4@example.com'),
('Subhash Das', 'parent5', 'parent123', 'parent', 40, '9876543303', 'parent5@example.com'),
('Rajeev Pillai', 'parent6', 'parent123', 'parent', 40, '9876543304', 'parent6@example.com'),
('Anil Kulkarni', 'parent7', 'parent123', 'parent', 40, '9876543305', 'parent7@example.com'),
('Madhav Reddy', 'parent8', 'parent123', 'parent', 40, '9876543306', 'parent8@example.com'),
('Mohan Nair', 'parent9', 'parent123', 'parent', 40, '9876543307', 'parent9@example.com'),
('Ravi Menon', 'parent10', 'parent123', 'parent', 40, '9876543308', 'parent10@example.com'),
('Deepak Bhat', 'parent11', 'parent123', 'parent', 40, '9876543309', 'parent11@example.com'),
('Manoj Kapoor', 'parent12', 'parent123', 'parent', 40, '9876543310', 'parent12@example.com'),
('Ashok Rao', 'parent13', 'parent123', 'parent', 40, '9876543311', 'parent13@example.com'),
('Vinay Jain', 'parent14', 'parent123', 'parent', 40, '9876543312', 'parent14@example.com'),
('Karan Malik', 'parent15', 'parent123', 'parent', 40, '9876543313', 'parent15@example.com'),
('Amit Chawla', 'parent16', 'parent123', 'parent', 40, '9876543314', 'parent16@example.com'),
('Vikas Goel', 'parent17', 'parent123', 'parent', 40, '9876543315', 'parent17@example.com'),
('Arvind Vohra', 'parent18', 'parent123', 'parent', 40, '9876543316', 'parent18@example.com'),
('Kishore Arora', 'parent19', 'parent123', 'parent', 40, '9876543317', 'parent19@example.com'),
('Ravi Tiwari', 'parent20', 'parent123', 'parent', 40, '9876543318', 'parent20@example.com');

-- Insert Parents into Parents Table
INSERT INTO Parents (totalFeeDue, studentId, userId) 
VALUES 
(15000.00, (SELECT id FROM AllUsers WHERE userName = 'student1'), (SELECT id FROM AllUsers WHERE userName = 'parent1')),
(12000.00, (SELECT id FROM AllUsers WHERE userName = 'student2'), (SELECT id FROM AllUsers WHERE userName = 'parent2')),
(10000.00, (SELECT id FROM AllUsers WHERE userName = 'student3'), (SELECT id FROM AllUsers WHERE userName = 'parent3')),
(13000.00, (SELECT id FROM AllUsers WHERE userName = 'student4'), (SELECT id FROM AllUsers WHERE userName = 'parent4')),
(14000.00, (SELECT id FROM AllUsers WHERE userName = 'student5'), (SELECT id FROM AllUsers WHERE userName = 'parent5')),
(9000.00, (SELECT id FROM AllUsers WHERE userName = 'student6'), (SELECT id FROM AllUsers WHERE userName = 'parent6')),
(16000.00, (SELECT id FROM AllUsers WHERE userName = 'student7'), (SELECT id FROM AllUsers WHERE userName = 'parent7')),
(8000.00, (SELECT id FROM AllUsers WHERE userName = 'student8'), (SELECT id FROM AllUsers WHERE userName = 'parent8')),
(11000.00, (SELECT id FROM AllUsers WHERE userName = 'student9'), (SELECT id FROM AllUsers WHERE userName = 'parent9')),
(7000.00, (SELECT id FROM AllUsers WHERE userName = 'student10'), (SELECT id FROM AllUsers WHERE userName = 'parent10')),
(15000.00, (SELECT id FROM AllUsers WHERE userName = 'student11'), (SELECT id FROM AllUsers WHERE userName = 'parent11')),
(10000.00, (SELECT id FROM AllUsers WHERE userName = 'student12'), (SELECT id FROM AllUsers WHERE userName = 'parent12')),
(17000.00, (SELECT id FROM AllUsers WHERE userName = 'student13'), (SELECT id FROM AllUsers WHERE userName = 'parent13')),
(9000.00, (SELECT id FROM AllUsers WHERE userName = 'student14'), (SELECT id FROM AllUsers WHERE userName = 'parent14')),
(20000.00, (SELECT id FROM AllUsers WHERE userName = 'student15'), (SELECT id FROM AllUsers WHERE userName = 'parent15')),
(11000.00, (SELECT id FROM AllUsers WHERE userName = 'student16'), (SELECT id FROM AllUsers WHERE userName = 'parent16')),
(13000.00, (SELECT id FROM AllUsers WHERE userName = 'student17'), (SELECT id FROM AllUsers WHERE userName = 'parent17')),
(18000.00, (SELECT id FROM AllUsers WHERE userName = 'student18'), (SELECT id FROM AllUsers WHERE userName = 'parent18')),
(12000.00, (SELECT id FROM AllUsers WHERE userName = 'student19'), (SELECT id FROM AllUsers WHERE userName = 'parent19')),
(10000.00, (SELECT id FROM AllUsers WHERE userName = 'student20'), (SELECT id FROM AllUsers WHERE userName = 'parent20'));

-- Fee Structure for Class 1 to 10
INSERT INTO FeeStructure (class, tuitionFee, labFee, sportsFee, transportFee, miscellaneousFee) 
VALUES 
('Class 1', 5000.00, 0.00, 500.00, 1000.00, 300.00),
('Class 2', 5500.00, 0.00, 500.00, 1200.00, 300.00),
('Class 3', 6000.00, 200.00, 600.00, 1500.00, 400.00),
('Class 4', 6500.00, 300.00, 600.00, 1600.00, 400.00),
('Class 5', 7000.00, 400.00, 700.00, 1800.00, 500.00),
('Class 6', 7500.00, 500.00, 800.00, 2000.00, 500.00),
('Class 7', 8000.00, 600.00, 900.00, 2200.00, 600.00),
('Class 8', 8500.00, 700.00, 1000.00, 2500.00, 700.00),
('Class 9', 9000.00, 800.00, 1100.00, 3000.00, 800.00),
('Class 10', 10000.00, 1000.00, 1200.00, 3500.00, 1000.00);

--Insert into Videos

INSERT INTO Videos (videoDuration, videoUrl)
VALUES
(60,'https://res.cloudinary.com/ddlvnsstz/video/upload/v1736765000/fpeniltflcmgu8ooidtl.mp4');


-- Insert into Courses
INSERT INTO Courses (class, title, description, content, department, userId)
VALUES 
('1,2,3,4,5', 'Basic Mathematics', 'This course introduces young learners to the fundamentals of mathematics, helping them build a strong foundation for future learning. It covers key topics like numbers, counting, shapes, and basic arithmetic through interactive lessons and engaging activities.', 'Comprehensive and interactive content covering foundational mathematics.', 'Mathematics', 4),
('6,7,8,9,10', 'Advanced Mathematics', 'Designed for middle school students, this course dives into advanced mathematical concepts, including algebra, geometry, and trigonometry. It helps students sharpen problem-solving skills and develop a deep understanding of mathematical principles.', 'In-depth and advanced content covering higher-level mathematics.', 'Mathematics', 5),
('1,2,3,4,5', 'Science Basics', 'An introductory course on basic scientific principles, experiments, and real-life applications.', 'Detailed and practical content covering basic science concepts.', 'Science', 6),
('6,7,8,9,10', 'History and Culture', 'A comprehensive course exploring historical events and cultural evolution from ancient to modern times.', 'In-depth content covering global history and cultural studies.', 'History',7),
('3,4,5,6', 'Physics Essentials', 'A dynamic course designed to introduce learners to the principles of physics, covering topics from motion to electricity.', 'Comprehensive content on foundational physics concepts.', 'Physics', 8),
('7,8,9,10', 'World Geography', 'An engaging course exploring the physical and human geography of the world, including continents, climates, and cultures.', 'In-depth content on geographical principles and real-world applications.', 'Geography', 8);

-- Insert into Chapters for Course 1
INSERT INTO Chapters (title, description, content, courseId)
VALUES 
('Numbers and Counting', 'This chapter helps students understand numbers and counting techniques, highlighting their importance in daily life. Activities include identifying patterns, exploring number sequences, and mastering counting skills through hands-on exercises.', 'Comprehensive and practical content on numbers and counting.', 1),
('Basic Geometry', 'This chapter introduces students to the world of shapes and geometry, focusing on the properties of basic geometric figures, their uses, and real-world applications. Students will learn to visualize and analyze shapes through fun exercises.', 'Interactive and detailed content on geometry and its practical relevance.', 1);

-- Insert into Chapters for Course 2
INSERT INTO Chapters (title, description, content, courseId)
VALUES 
('Algebra Fundamentals', 'This chapter provides a deep dive into the building blocks of algebra. Students will explore variables, equations, and algebraic expressions while learning to solve practical problems using logical reasoning and systematic approaches.', 'Detailed and structured content focusing on the fundamentals of algebra.', 2),
('Trigonometry Basics', 'Students will explore trigonometry, learning about angles, triangles, and trigonometric functions. This chapter emphasizes real-world applications of trigonometry, such as measuring heights and distances.', 'Comprehensive and application-oriented content on trigonometry basics.', 2);

-- Insert into Chapters for Course 3
INSERT INTO Chapters (title, description, content, courseId)
VALUES 
('Introduction to Science', 'Explore the fundamentals of science, including the scientific method, basic concepts, and their real-world applications.', 'Detailed content on understanding scientific basics.', 3),
('Living Organisms', 'Learn about plants, animals, and microorganisms, their characteristics, and how they interact with their environment.', 'Interactive content on biology and ecology.', 3);

-- Insert into Chapters for Course 4
INSERT INTO Chapters (title, description, content, courseId)
VALUES 
('Ancient Civilizations', 'Dive into the history of ancient civilizations such as Mesopotamia, Egypt, and the Indus Valley, and their contributions to modern society.', 'Comprehensive content on ancient history.', 4),
('Cultural Evolution', 'Understand how cultures evolve over time through language, art, and societal changes.', 'In-depth content on cultural development.', 4);

-- Insert into Chapters for Course 5
INSERT INTO Chapters (title, description, content, courseId)
VALUES 
('Motion and Forces', 'Learn about the fundamentals of motion, the laws of motion, and the forces acting on objects.', 'Comprehensive content on motion and forces.', 5),
('Electricity and Magnetism', 'Understand the principles of electricity and magnetism, and how they impact daily life.', 'Detailed content on electrical and magnetic phenomena.', 5);

-- Insert into Chapters for Course 6
INSERT INTO Chapters (title, description, content, courseId)
VALUES 
('Continents and Oceans', 'Explore the geography of continents and oceans, their features, and their role in shaping the world.', 'Interactive content on the physical features of Earth.', 6),
('Climate and Weather Patterns', 'Understand the different climate zones, weather patterns, and how they affect human life.', 'Detailed content on climate and meteorology.', 6);


-- Insert into Topics for Course 1, Chapter 1
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Understanding Numbers', 'Learn about the importance of numbers in everyday life, from counting objects to performing calculations. Explore how numbers form the basis of mathematical concepts and problem-solving.', 'Detailed content that explains the significance and applications of numbers.', 'video', 1, NULL, '[{"question":"What are prime numbers?","answer":"Prime numbers are numbers greater than 1 that have only two factors: 1 and themselves."}]', 1),
('Counting Practice', 'This topic focuses on mastering counting through real-world examples, such as organizing items, counting money, and identifying patterns. Fun activities make counting a practical and enjoyable skill.', 'Engaging and practical content for learning counting techniques.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', '[{"question":"What is skip counting?","answer":"Skip counting is counting by a specific number, such as by 2s, 5s, or 10s."}]', 1);

-- Insert into Topics for Course 1, Chapter 2
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Shapes and Sizes', 'Students will explore various shapes, their properties, and their real-life applications. The topic emphasizes recognizing and analyzing geometric figures, from basic polygons to 3D objects.', 'Comprehensive and engaging content on understanding shapes and their characteristics.', 'video', 1, NULL, '[{"question":"What is the difference between a square and a rectangle?","answer":"A square has all sides equal, while a rectangle has opposite sides equal."}]', 2),
('Geometry Practice', 'Through interactive exercises, students will identify, classify, and analyze geometric shapes. Activities include solving puzzles, drawing shapes, and understanding their significance in design and engineering.', 'Practical and application-focused content on geometric concepts.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', '[{"question":"What are parallel lines?","answer":"Parallel lines are two lines that never intersect and remain equidistant."}]', 2);

-- Insert into Topics for Course 2, Chapter 1
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Introduction to Algebra', 'Discover how algebra forms the basis of modern mathematics. Students will learn to work with variables, write equations, and solve real-world problems using algebraic methods.', 'Comprehensive and application-driven content on algebra basics.', 'video', 1, NULL, '[{"question":"What is a variable in algebra?","answer":"A variable is a symbol, usually a letter, that represents an unknown value in an equation."}]', 3),
('Practice Algebra', 'Students will practice solving equations, simplifying expressions, and understanding algebra’s practical applications. The exercises include relatable examples such as calculating distances and budgeting.', 'Interactive and problem-solving content for practicing algebra.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', '[{"question":"Solve: 3x - 5 = 10","answer":"x = 5."}]', 3);

-- Insert into Topics for Course 2, Chapter 2
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Basics of Trigonometry', 'This topic introduces trigonometry, focusing on understanding angles, the properties of triangles, and the use of trigonometric functions. Students will learn to apply these concepts in real-life scenarios like navigation and construction.', 'Comprehensive and real-world relevant content on trigonometry.', 'video', 1, NULL, '[{"question":"What is a right-angle triangle?","answer":"A right-angle triangle is a triangle with one angle measuring 90 degrees."}]', 4),
('Trigonometry Practice', 'Engage in hands-on activities to master trigonometric calculations and identities. Examples include measuring heights, calculating angles, and solving geometry problems.', 'Practical and engaging content for applying trigonometry concepts.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', '[{"question":"What is cos(0°)?","answer":"cos(0°) = 1."}]', 4);

-- Insert into Topics for Course 3, Chapter 1
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('The Scientific Method', 'Learn how to formulate hypotheses, conduct experiments, and analyze results using the scientific method.', 'Detailed content on scientific processes.', 'video', 1, NULL, '[{"question":"What is a hypothesis?","answer":"A hypothesis is a testable statement predicting the outcome of an experiment."}]', 5),
('Experiment Basics', 'Understand the components of a scientific experiment, including variables, controls, and safety guidelines.', 'Comprehensive content on experiment design.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', '[{"question":"What is a control in an experiment?","answer":"A control is a standard for comparison in an experiment."}]', 5);

-- Insert into Topics for Course 3, Chapter 2
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Characteristics of Living Organisms', 'Explore the defining characteristics of living organisms, including growth, reproduction, and metabolism.', 'Interactive content on biology basics.', 'video', 1, NULL, '[{"question":"What are the seven life processes?","answer":"The seven life processes are movement, respiration, sensitivity, growth, reproduction, excretion, and nutrition."}]', 6),
('Ecosystem Dynamics', 'Learn about ecosystems, food chains, and how organisms interact with their environment.', 'Detailed content on ecology and ecosystems.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', '[{"question":"What is an ecosystem?","answer":"An ecosystem is a community of interacting organisms and their physical environment."}]', 6);

-- Insert into Topics for Course 4, Chapter 1
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Mesopotamia: The Cradle of Civilization', 'Discover the history and achievements of Mesopotamia, including the invention of writing and the wheel.', 'Comprehensive content on Mesopotamian civilization.', 'video', 1, NULL, '[{"question":"What is Mesopotamia known for?","answer":"Mesopotamia is known for its contributions to writing, agriculture, and urbanization."}]', 7),
('Ancient Egypt: Society and Culture', 'Explore the social structure, art, and religious beliefs of ancient Egypt, along with its monumental architecture.', 'Detailed content on Egyptian culture and society.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', '[{"question":"What was the role of the pharaoh in ancient Egypt?","answer":"The pharaoh was both a political leader and a divine figure."}]', 7);

-- Insert into Topics for Course 4, Chapter 2
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('The Role of Language in Culture', 'Learn how language shapes cultural identity, facilitates communication, and influences societal development.', 'Interactive and engaging content on the importance of language.', 'video', 1, NULL, '[{"question":"Why is language important in culture?","answer":"Language helps preserve cultural heritage and fosters unity within communities."}]', 8),
('Art and Cultural Expression', 'Discover how art reflects cultural values and changes over time, influencing society and preserving traditions.', 'Detailed content on cultural art forms.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', '[{"question":"What is the purpose of art in culture?","answer":"Art serves as a medium for expression, storytelling, and preserving traditions."}]', 8);


-- Insert into Topics for Course 5, Chapter 1 (Continued)
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Gravitational Force', 'Explore the concept of gravity, its discovery, and its significance in the universe.', 'Comprehensive content on gravitational force and its effects.', 'video', 1, NULL, 
'[{"question":"Who discovered gravity?","answer":"Gravity was discovered by Sir Isaac Newton."},
{"question":"What is the formula for gravitational force?","answer":"The formula is F = G * (m1 * m2) / r²."}]', 9),
('Friction: A Necessary Evil', 'Learn about the concept of friction, its advantages, and its challenges in the physical world.', 'Detailed exploration of friction and its real-world applications.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', 
'[{"question":"What is friction?","answer":"Friction is the resistance to motion between two surfaces in contact."},
{"question":"How does friction help in daily life?","answer":"Friction helps in tasks like walking, driving, and writing."}]', 9),
('Friction and Its Applications', 'Learn about friction as a force, its types, advantages, and how it is minimized in certain applications.', 'Comprehensive content on friction and its real-world implications.', 'video', 1, NULL, 
'[{"question":"What is friction?","answer":"Friction is the resistive force acting between two surfaces in contact, opposing their relative motion."},
{"question":"Why is friction important?","answer":"Friction is essential for walking, driving vehicles, and holding objects."}]', 9);

-- Insert into Topics for Course 5, Chapter 2
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Basics of Electricity', 'Understand the fundamental concepts of electricity, including current, voltage, and resistance.', 'In-depth content on the basics of electricity and circuits.', 'video', 1, NULL, 
'[{"question":"What is electric current?","answer":"Electric current is the flow of electric charge in a conductor."},
{"question":"What is Ohm’s Law?","answer":"Ohm’s Law states that V = IR, where V is voltage, I is current, and R is resistance."}]', 10),
('Magnetic Fields and Applications', 'Learn about magnetic fields, their properties, and their applications in modern technology.', 'Detailed exploration of magnetic fields and their uses.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', 
'[{"question":"What is a magnetic field?","answer":"A magnetic field is the region around a magnet where its force is effective."},
{"question":"Give an example of a device that uses magnets.","answer":"Electric motors and generators use magnets."}]', 10),
('Electric Circuits', 'Understand the components of an electric circuit, how current flows, and the significance of resistance.', 'Detailed content on the principles of electric circuits and their construction.', 'video', 1, NULL, 
'[{"question":"What are the main components of an electric circuit?","answer":"An electric circuit typically includes a power source, conductive path, and load."},
{"question":"What is Ohm’s law?","answer":"Ohm’s law states that the current through a conductor is directly proportional to the voltage and inversely proportional to the resistance."}]', 10),
('Magnetic Fields and Their Uses', 'Explore magnetic fields, their characteristics, and how they are used in devices like motors and generators.', 'In-depth content on magnetic fields and their applications in technology.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', 
'[{"question":"What is a magnetic field?","answer":"A magnetic field is the region around a magnet where magnetic forces are observed."},
{"question":"Give an example of a device using magnets.","answer":"Electric motors use magnets to convert electrical energy into mechanical energy."}]', 10);

-- Insert into Topics for Course 6, Chapter 1
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('The Seven Continents', 'Discover the features, landmarks, and significance of the seven continents of the world.', 'Comprehensive content on the physical and cultural aspects of continents.', 'video', 1, NULL, 
'[{"question":"What is the largest continent?","answer":"Asia is the largest continent."},
{"question":"How many continents are there?","answer":"There are seven continents."}]', 11),
('Exploring the Oceans', 'Understand the major oceans of the world, their features, and their role in the ecosystem.', 'In-depth content on the geography and importance of oceans.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', 
'[{"question":"What is the largest ocean?","answer":"The Pacific Ocean is the largest."},
{"question":"Why are oceans important?","answer":"Oceans regulate climate, provide food, and support biodiversity."}]', 11),
('Continental Drift Theory', 'Understand the theory of continental drift and how it explains the movement of continents over time.', 'Comprehensive content on the history and evidence of continental drift.', 'video', 1, NULL, 
'[{"question":"What is continental drift?","answer":"Continental drift is the theory that continents have moved over geological time and were once part of a supercontinent."},
{"question":"Who proposed the theory of continental drift?","answer":"Alfred Wegener proposed the theory of continental drift in 1912."}]', 11),
('Oceans and Their Currents', 'Learn about the world’s oceans, their currents, and their role in shaping climate and ecosystems.', 'Detailed content on ocean currents and their environmental impact.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', 
'[{"question":"What causes ocean currents?","answer":"Ocean currents are caused by wind patterns, earth rotation, and differences in water density."},
{"question":"Why are ocean currents important?","answer":"Ocean currents regulate global climate and distribute nutrients in marine ecosystems."}]', 11);

-- Insert into Topics for Course 6, Chapter 2
INSERT INTO Topics (title, description, content, topicType, videoId, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Understanding Climate Zones', 'Learn about different climate zones, their characteristics, and their impact on life on Earth.', 'Detailed exploration of tropical, temperate, and polar climate zones.', 'video', 1, NULL, 
'[{"question":"What are the major climate zones?","answer":"The major climate zones are tropical, temperate, and polar."},
{"question":"How does climate affect ecosystems?","answer":"Climate determines the types of plants and animals that can thrive in an area."}]', 12),
('Weather Patterns and Predictions', 'Understand how weather patterns are formed, observed, and predicted using modern techniques.', 'Comprehensive content on meteorology and weather forecasting.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', 
'[{"question":"What causes weather changes?","answer":"Weather changes are caused by atmospheric conditions, including temperature, pressure, and humidity."},
{"question":"What is the role of satellites in weather prediction?","answer":"Satellites monitor weather patterns and provide data for forecasts."}]', 12),
('Climate Zones of the World', 'Explore the different climate zones of the world, their characteristics, and how they influence biodiversity.', 'In-depth content on global climate zones and their significance.', 'video', 1, NULL, 
'[{"question":"What are the main climate zones?","answer":"The main climate zones are tropical, temperate, and polar."},
{"question":"How does climate influence biodiversity?","answer":"Climate determines the types of plants and animals that can thrive in a region."}]', 12),
('Weather Phenomena', 'Understand various weather phenomena such as hurricanes, tornadoes, and their causes.', 'Comprehensive content on weather events and their impacts on human life.', 'pdf', NULL, 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736765002/sei1fgorfdtgweyo6zyn.pdf', 
'[{"question":"What causes hurricanes?","answer":"Hurricanes are caused by warm ocean waters and moist air rising into a low-pressure system."},
{"question":"How are tornadoes formed?","answer":"Tornadoes form from severe thunderstorms when warm, moist air meets cold, dry air."}]', 12);



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



INSERT INTO ebooks (title, createdByUserId, description, genre, fileUrl, uploadDate) 
VALUES 
('The Art of Programming', 4, 'A comprehensive guide to algorithms.', 'Technology', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', '2025-01-01 10:00:00'),
('Mystery of the Lost Island', 5, 'A thrilling mystery novel.', 'Fiction', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', '2025-01-02 15:30:00'),
('Healthy Living 101', 6, 'Tips for a healthy lifestyle.', 'Health', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', '2025-01-03 12:45:00'),
('Exploring Space', 7, 'An insightful book on space exploration.', 'Science', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', '2025-01-04 18:20:00'),
('Cooking Made Easy', 4, 'Simple recipes for everyday cooking.', 'Cooking', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', '2025-01-05 09:15:00');



-- Inserting sample messages with different createdAt values
INSERT INTO Messages (senderId, receiverId, message, fileType, viewStatus, createdAt) VALUES
(1, 2, 'Hello, how are you?', 'Message', 'Seen', '15/01/2025 10:00 AM'),
(1, 3, 'Meeting at 3 PM', 'Message', 'Seen', '14/01/2025 02:00 PM'),
(2, 1, 'I am good, thanks!', 'Message', 'Seen', '13/01/2025 01:00 PM'),
(3, 1, 'Got it, see you there!', 'Message', 'Seen', '12/01/2025 04:00 PM'),
(2, 3, 'Can you send me the report?', 'Message', 'Delivered', '11/01/2025 09:00 AM'),
(3, 2, 'Sure, I will send it now.', 'Message', 'Delivered', '10/01/2025 08:00 AM'),
(1, 4, 'How was your weekend?', 'Message', 'Seen', '09/01/2025 08:00 PM'),
(4, 1, 'It was great, thanks for asking!', 'Message', 'Seen', '08/01/2025 07:00 PM'),
(5, 1, 'Are we still meeting tomorrow?', 'Message', 'Seen', '07/01/2025 05:00 PM'),
(1, 5, 'Yes, see you then!', 'Message', 'Seen', '06/01/2025 04:00 PM'),
(2, 6, 'Can you send the presentation?', 'Message', 'Delivered', '05/01/2025 03:00 PM'),
(6, 2, 'Sure, sending it now.', 'Message', 'Delivered', '04/01/2025 02:00 PM'),
(3, 4, 'Need your feedback on the proposal.', 'Message', 'Seen', '03/01/2025 01:00 PM'),
(4, 3, 'I will look at it and get back to you.', 'Message', 'Seen', '02/01/2025 12:00 PM'),
(5, 3, 'How did the interview go?', 'Message', 'Seen', '01/01/2025 11:00 AM'),
(3, 5, 'It went well, thanks!', 'Message', 'Seen', '31/12/2024 10:00 AM'),
(7, 6, 'Got it, thanks!', 'Message', 'Seen', '29/12/2024 08:00 AM'),
(8, 9, 'Please send me the latest updates.', 'Message', 'Seen', '28/12/2024 07:00 AM'),
(9, 8, 'I will send them in a few minutes.', 'Message', 'Seen', '27/12/2024 06:00 AM');


-- insert File
INSERT INTO Messages (senderId, receiverId, message, fileType, fileUrl, createdAt) VALUES
(9, 8, 'I will send them in a few minutes.', 'Pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', '27/12/2024 06:00 AM');

-- insert QuizResults
INSERT INTO QuizResults (quizId, userId, totalQues, correctCount, wrongCount, skippedCount, timeSpent, score) 
VALUES 
(1, 9, 5, 3, 1, 1, 4, (3*4 - 1*1)), 
(1, 11, 5, 4, 1, 0, 5, (4*4 - 1*1)), 
(1, 12, 5, 2, 2, 1, 3, (2*4 - 2*1)), 
(1, 13, 5, 5, 0, 0, 5, (5*4 - 0*1)), 
(1, 14, 5, 1, 3, 1, 4, (1*4 - 3*1)), 
(1, 15, 5, 0, 2, 3, 2, (0*4 - 2*1)), 
(1, 16, 5, 4, 0, 1, 5, (4*4 - 0*1)), 
(1, 17, 5, 3, 2, 0, 4, (3*4 - 2*1)), 
(1, 18, 5, 2, 1, 2, 3, (2*4 - 1*1)), 
(1, 19, 5, 5, 0, 0, 5, (5*4 - 0*1)), 
(1, 10, 5, 1, 4, 0, 4, (1*4 - 4*1)), 
(1, 11, 5, 3, 1, 1, 4, (3*4 - 1*1)), 
(1, 12, 5, 2, 2, 1, 3, (2*4 - 2*1)), 
(1, 13, 5, 4, 1, 0, 5, (4*4 - 1*1)), 
(1, 14, 5, 3, 0, 2, 4, (3*4 - 0*1));


-- Insert sample homework 
INSERT INTO Homework (createdByUserId, title, description, assignedClasses, dueDate, fileType, fileUrl) 
VALUES 
(4, 'Math Algebra', 'Solve the given algebraic equations.', '1,2,4,5', '2025-02-10 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(5, 'History Assignment', 'Write a 500-word essay on World War II.', '3,6,7', '2025-02-12 23:59:59', NULL, NULL),
(6, 'Physics Numericals', 'Solve these kinematics problems.', '2,4,6,8', '2025-02-15 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(7, 'Biology Research', 'Research on the human digestive system.', '1,5,9', '2025-02-18 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(8, 'Computer Science Project', 'Create a simple website using HTML, CSS, and JavaScript.', '3,7,10', '2025-02-20 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(4, 'Chemistry Lab Report', 'Complete the organic chemistry lab report.', '2,3,5', '2025-02-22 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(5, 'Geography Mapping', 'Mark important geographical locations.', '1,4,8', '2025-02-24 23:59:59', NULL, NULL),
(6, 'Trigonometry Practice', 'Solve the given trigonometry questions.', '3,5,7', '2025-02-26 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(7, 'Essay on Global Warming', 'Write an essay on climate change and its impact.', '2,6,9', '2025-02-28 23:59:59', NULL, NULL),
(8, 'Database Management', 'Design a simple relational database.', '1,3,10', '2025-03-02 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),

(4, 'Statistics Assignment', 'Analyze the given statistical data.', '4,6,9', '2025-03-04 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(5, 'English Literature Review', 'Summarize the given novel.', '3,5,8', '2025-03-06 23:59:59', NULL, NULL),
(6, 'Electronics Circuit Design', 'Design a simple circuit for a given problem.', '2,7,10', '2025-03-08 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(7, 'Psychology Research', 'Write a report on cognitive biases.', '1,6,8', '2025-03-10 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(8, 'Artificial Intelligence Basics', 'Explain machine learning concepts.', '2,4,9', '2025-03-12 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),

(4, 'Linear Equations', 'Solve the given set of linear equations.', '1,3,5,7', '2025-03-14 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(5, 'Civics Report', 'Write a report on the Indian Constitution.', '2,4,6,8', '2025-03-16 23:59:59', NULL, NULL),
(6, 'Magnetism Experiment', 'Describe the results of the magnetism experiment.', '1,5,9', '2025-03-18 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(7, 'Botany Assignment', 'Research different types of medicinal plants.', '3,6,8', '2025-03-20 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(8, 'Web Development Basics', 'Create a landing page using Bootstrap.', '2,4,10', '2025-03-22 23:59:59', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf');


INSERT INTO HomeworkSubmissions (homeworkId, submittedByUserId, answertext, fileType, fileUrl, grade) 
VALUES 
(1, 9, 'Solved all algebra problems as per the instructions.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.5),
(1, 10, 'Here is my completed algebra assignment.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 7.8),
(2, 11, 'Detailed essay on World War II.', NULL, NULL, 9.2),
(2, 14, 'My perspective on the impacts of World War II.', NULL, NULL, 8.7),
(3, 10, 'Solved all physics numerical problems.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.0),
(3, 12, 'Attached solutions for the kinematics problems.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 7.9),
(4, 9, 'Research paper on the digestive system.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 7.5),
(4, 13, 'Summary of human digestion with diagrams.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.2),
(5, 11, 'Created a simple website using HTML, CSS, and JavaScript.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 9.0),
(5, 15, 'Implemented a responsive design for the website.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.4),
(6, 10, 'Solutions for linear equations problems.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.1),
(6, 11, 'Detailed explanation of methods used.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 7.6),
(7, 19, 'Report on Indian Constitution principles.', NULL, NULL, 9.0),
(7, 22, 'Analysis of constitutional amendments.', NULL, NULL, 8.5),
(8, 21, 'Experiment results with observations.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 7.8),
(8, 23, 'Comparison of different magnetic fields.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.6),
(9, 20, 'Research on medicinal plant properties.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.9),
(9, 24, 'List of medicinal plants and their uses.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 9.1),
(10, 19, 'Bootstrap landing page design.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.3),
(10, 21, 'Added animations and interactivity.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.7),
(11, 14, 'Statistical analysis with graphs.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.5),
(11, 17, 'Descriptive statistics and interpretations.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 7.9),
(12, 13, 'Summary of the novel with key themes.', NULL, NULL, 9.2),
(12, 23, 'Character analysis and critical review.', NULL, NULL, 8.7),
(13, 10, 'Designed a simple LED circuit.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.0),
(13, 25, 'Simulation of a basic amplifier circuit.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 7.8),
(14, 9, 'Cognitive biases affecting decision-making.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.2),
(14, 16, 'Report on heuristics and bias impact.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.5),
(15, 17, 'Basics of machine learning with examples.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.9),
(15, 27, 'Comparison of ML models.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 9.1),
(16, 11, 'Solved linear equations using substitution.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.3),
(16, 21, 'Graphical method for solving equations.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 7.9),
(17, 12, 'Constitution report covering fundamental rights.', NULL, NULL, 8.4),
(17, 24, 'Indian Constitution amendments summary.', NULL, NULL, 8.6),
(18, 9, 'Experimental data and observations on magnetism.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.7),
(18, 27, 'Comparison of electromagnets and permanent magnets.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 9.0),
(19, 16, 'List of medicinal plants and their healing properties.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.9),
(19, 26, 'Detailed research on traditional medicine.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 9.2),
(20, 18, 'Created a simple Bootstrap landing page.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.5),
(20, 28, 'Implemented responsive design and animations.', 'pdf', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf', 8.7);


-- insert salaries for users
INSERT INTO salaries (userId, basic, rentAllowance, foodAllowance, travelAllowance, otherAllowance, taxDeduction, providentFund, otherDeductions, lastIncrementDate, lastIncrementAmount, nextAppraisalDate) 
VALUES 
(2, 50000.00, 5000.00, 3000.00, 2000.00, 1000.00, 5000.00, 6000.00, 2000.00, '2024-01-15', 5000.00, '2025-01-15'),
(3, 45000.00, 4000.00, 2500.00, 1800.00, 1200.00, 4500.00, 5500.00, 1800.00, '2023-12-20', 4500.00, '2024-12-20'),
(4, 60000.00, 6000.00, 3500.00, 2500.00, 1500.00, 6000.00, 7000.00, 2500.00, '2024-02-10', 6000.00, '2025-02-10'),
(5, 55000.00, 5500.00, 3200.00, 2300.00, 1300.00, 5500.00, 6500.00, 2200.00, '2024-03-05', 5500.00, '2025-03-05'),
(6, 48000.00, 4500.00, 2800.00, 1900.00, 1100.00, 4800.00, 5800.00, 1900.00, '2023-11-30', 4800.00, '2024-11-30'),
(7, 53000.00, 5000.00, 3000.00, 2200.00, 1200.00, 5300.00, 6300.00, 2100.00, '2024-04-15', 5300.00, '2025-04-15'),
(8, 62000.00, 6500.00, 3700.00, 2700.00, 1600.00, 6200.00, 7200.00, 2700.00, '2024-05-01', 6200.00, '2025-05-01');

-- insert salary transactions
INSERT INTO salaryTransactions (userId, transactionDate, transactionId, salaryMonth, amount, status, payslipUrl) 
VALUES 

(2, '2024-01-31', 'TXN001', 'Jan 2024', 57200.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(3, '2024-01-31', 'TXN002', 'Jan 2024', 50800.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(4, '2024-01-31', 'TXN003', 'Jan 2024', 69300.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(5, '2024-01-31', 'TXN004', 'Jan 2024', 63200.00, 'Pending', null),
(6, '2024-01-31', 'TXN005', 'Jan 2024', 55300.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(7, '2024-01-31', 'TXN006', 'Jan 2024', 60500.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(8, '2024-01-31', 'TXN007', 'Jan 2024', 72600.00, 'Pending', null),

(2, '2024-02-29', 'TXN008', 'Feb 2024', 57200.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(3, '2024-02-29', 'TXN009', 'Feb 2024', 50800.00, 'Pending', null),
(4, '2024-02-29', 'TXN010', 'Feb 2024', 69300.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(5, '2024-02-29', 'TXN011', 'Feb 2024', 63200.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(6, '2024-02-29', 'TXN012', 'Feb 2024', 55300.00, 'Pending', null),
(7, '2024-02-29', 'TXN013', 'Feb 2024', 60500.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(8, '2024-02-29', 'TXN014', 'Feb 2024', 72600.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),

(2, '2024-03-31', 'TXN015', 'Mar 2024', 57200.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(3, '2024-03-31', 'TXN016', 'Mar 2024', 50800.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(4, '2024-03-31', 'TXN017', 'Mar 2024', 69300.00, 'Pending', null),
(5, '2024-03-31', 'TXN018', 'Mar 2024', 63200.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(6, '2024-03-31', 'TXN019', 'Mar 2024', 55300.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(7, '2024-03-31', 'TXN020', 'Mar 2024', 60500.00, 'Pending', null),
(8, '2024-03-31', 'TXN021', 'Mar 2024', 72600.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),

(2, '2024-04-30', 'TXN022', 'Apr 2024', 57200.00, 'Pending', null),
(3, '2024-04-30', 'TXN023', 'Apr 2024', 50800.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(4, '2024-04-30', 'TXN024', 'Apr 2024', 69300.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(5, '2024-04-30', 'TXN025', 'Apr 2024', 63200.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(6, '2024-04-30', 'TXN026', 'Apr 2024', 55300.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(7, '2024-04-30', 'TXN027', 'Apr 2024', 60500.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(8, '2024-04-30', 'TXN028', 'Apr 2024', 72600.00, 'Pending', null),

(2, '2024-05-31', 'TXN029', 'May 2024', 57200.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(3, '2024-05-31', 'TXN030', 'May 2024', 50800.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(4, '2024-05-31', 'TXN031', 'May 2024', 69300.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(5, '2024-05-31', 'TXN032', 'May 2024', 63200.00, 'Pending', null),
(6, '2024-05-31', 'TXN033', 'May 2024', 55300.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(7, '2024-05-31', 'TXN034', 'May 2024', 60500.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf'),
(8, '2024-05-31', 'TXN035', 'May 2024', 72600.00, 'Paid', 'https://res.cloudinary.com/ddlvnsstz/raw/upload/v1736716408/ym64cupxrgdeybazatoj.pdf');


INSERT INTO VideoWatchStatus (userId, videoId, watchTime, lastPlaybackPosition) VALUES
(4, 1, 12, 6),
(5, 1, 25, 0),
(6, 1, 8, 4),
(7, 1, 30, 0),
(8, 1, 18, 9),
(9, 1, 12, 6),
(10, 1, 25, 0),
(11, 1, 8, 4),
(12, 1, 30, 0),
(13, 1, 18, 9);

INSERT INTO TimeSpentOnTopic (userId, topicId, timeSpentOnTopic) VALUES
(4, 1, 1200),
(5, 2, 2500),
(6, 3, 800),
(7, 4, 3000),
(8, 5, 1800),
(4, 6, 2200),
(5, 7, 1400),
(6, 8, 3600),
(7, 9, 900),
(8, 10, 1700),
(4, 11, 2800),
(5, 12, 1900),
(6, 13, 2900),
(7, 14, 1100),
(8, 15, 2400),
(4, 16, 3300),
(5, 17, 2500),
(6, 18, 1300),
(7, 19, 2000),
(8, 20, 2700),
(4, 21, 1800),
(5, 22, 1400),
(6, 23, 2600),
(7, 24, 900),
(8, 25, 3200),
(4, 26, 2000),
(5, 27, 1500),
(6, 28, 3700),
(7, 29, 2900),
(8, 30, 3100);

INSERT INTO Attendance (userId, attendanceDate, present) VALUES
(4, DATE('2025-01-01'), true),
(5, DATE('2025-01-02'), false),
(6, DATE('2025-01-03'), true),
(7, DATE('2025-01-04'), true),
(8, DATE('2025-01-05'), false),
(4, DATE('2025-01-06'), true),
(5, DATE('2025-01-07'), true),
(6, DATE('2025-01-08'), false),
(7, DATE('2025-01-09'), true),
(8, DATE('2025-01-10'), true),
(4, DATE('2025-01-11'), false),
(5, DATE('2025-01-12'), true),
(6, DATE('2025-01-13'), false),
(7, DATE('2025-01-14'), true),
(8, DATE('2025-01-15'), true),
(4, DATE('2025-01-16'), false),
(5, DATE('2025-01-17'), true),
(6, DATE('2025-01-18'), false),
(7, DATE('2025-01-19'), true),
(8, DATE('2025-01-20'), true),
(4, DATE('2025-01-21'), true),
(5, DATE('2025-01-22'), false),
(6, DATE('2025-01-23'), true),
(7, DATE('2025-01-24'), false),
(8, DATE('2025-01-25'), true),
(4, DATE('2025-01-26'), true),
(5, DATE('2025-01-27'), false),
(6, DATE('2025-01-28'), true),
(7, DATE('2025-01-29'), true),
(8, DATE('2025-01-30'), false);

--Insert SchoolEvents
INSERT INTO SchoolEvents (conductedBy, title, description, eventType, startDate, endDate) VALUES
(2, 'Annual Sports Meet', 'A day full of sports activities and competitions.', 'Sports', DATE('2025-03-10'), DATE('2025-03-10')), -- Completed
(2, 'Science Exhibition', 'Showcase of innovative science projects by students.', 'Exhibition', DATE('2025-06-10'), DATE('2025-06-11')), -- Completed
(2, 'Parent-Teacher Meeting', 'Discussion of student progress with parents.', 'Meeting', DATE('2025-07-01'), DATE('2025-07-01')), -- Completed
(2, 'Independence Day Celebration', 'Cultural program and flag hoisting ceremony.', 'Cultural', DATE('2025-02-15'), DATE('2025-02-15')), -- Ongoing (today's date)
(2, 'Mathematics Olympiad', 'Inter-school competition for math enthusiasts.', 'Competition', DATE('2025-08-20'), DATE('2025-08-20')), -- Upcoming
(2, 'Teacher’s Workshop', 'Training session for teachers on new teaching methodologies.', 'Workshop', DATE('2025-02-15'), DATE('2025-02-16')), -- Ongoing (today's date)
(2, 'Music Concert', 'Live performance by students and guest artists.', 'Concert', DATE('2025-09-15'), DATE('2025-09-16')), -- Upcoming
(2, 'Art & Craft Exhibition', 'Display of student creativity through art and craft.', 'Exhibition', DATE('2025-09-05'), DATE('2025-09-06')), -- Upcoming
(2, 'Winter Carnival', 'Fun-filled winter event with games and food stalls.', 'Festival', DATE('2025-12-20'), DATE('2025-12-20')), -- Upcoming
(2, 'Career Guidance Seminar', 'Session on career opportunities for students.', 'Seminar', DATE('2025-09-25'), DATE('2025-09-25')); -- Upcoming



`;

const populate = async () => {
    await connectDb();
    const db = await getDb();
    try {
        await db.query(query);
        console.log("Database created successfully");
        await closeDb();

    } catch (error) {
        console.log(error)
    }
};

populate();
