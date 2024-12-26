const { connectDb, getDb, endConnection } = require("./db/connectDb");
const dotenv = require("dotenv");
dotenv.config();

const query = `
CREATE TABLE AllUsers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    userName VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('superAdmin', 'principal', 'headMaster', 'teacher', 'student', 'parent') NOT NULL,
    age INT,
    phone VARCHAR(15),
    email VARCHAR(100) UNIQUE,
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Principals (
    principalId INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL UNIQUE,
    salary DECIMAL(10, 2) NOT NULL,
    otherMoneyBenefits TEXT,
    FOREIGN KEY (userId) REFERENCES AllUsers(id)
);

CREATE TABLE HeadMasters (
    headMasterId INT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(30) NOT NULL,
    assignedClasses TEXT NOT NULL,
    userId INT NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    otherMoneyBenefits TEXT,
    FOREIGN KEY (userId) REFERENCES AllUsers(id)
);

CREATE TABLE Teachers (
    teacherId INT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(30) NOT NULL,
    assignedClasses TEXT NOT NULL,
    userId INT NOT NULL,
    salary DECIMAL(10, 2) NOT NULL,
    otherMoneyBenefits TEXT,
    FOREIGN KEY (userId) REFERENCES AllUsers(id)
);

CREATE TABLE Students (
    studentId INT AUTO_INCREMENT PRIMARY KEY,
    class DECIMAL(2, 2) NOT NULL,
    scholarshipAmount DECIMAL(10, 2),
    userId INT NOT NULL,
    score DECIMAL(5, 2),
    FOREIGN KEY (userId) REFERENCES AllUsers(id)
);

CREATE TABLE Parents (
    parentId INT AUTO_INCREMENT PRIMARY KEY,
    totalFeeDue DECIMAL(10, 2) NOT NULL,
    studentId INT NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (studentId) REFERENCES AllUsers(id),
    FOREIGN KEY (userId) REFERENCES AllUsers(id)
);

CREATE TABLE IF NOT EXISTS FeeStructure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    class VARCHAR(50) NOT NULL,
    tuitionFee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    labFee DECIMAL(10, 2) DEFAULT 0.00,
    sportsFee DECIMAL(10, 2) DEFAULT 0.00,
    transportFee DECIMAL(10, 2) DEFAULT 0.00,
    miscellaneousFee DECIMAL(10, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS Courses (
    courseId INT AUTO_INCREMENT PRIMARY KEY,
    class TEXT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    department VARCHAR(30) NOT NULL,
    userId INT NOT NULL,
    FOREIGN KEY (userId) REFERENCES AllUsers(id)
);

CREATE TABLE IF NOT EXISTS Chapters (
    chapterId INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    courseId INT NOT NULL,
    FOREIGN KEY (courseId) REFERENCES Courses(courseId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Topics (
    topicId INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    content TEXT,
    topicType ENUM('video', 'content', 'pdf', 'questionAndAnswers') NOT NULL,
    videoUrl VARCHAR(255),
    pdfUrl VARCHAR(255),
    questionAndAnswers TEXT,
    chapterId INT NOT NULL,
    FOREIGN KEY (chapterId) REFERENCES Chapters(chapterId) ON DELETE CASCADE
);

-- Insert Super Admin
INSERT INTO AllUsers (name, userName, password, role, age, phone, email) 
VALUES ('Amit Sharma', 'superAdmin', 'admin123', 'superAdmin', 40, '9876543210', 'superadmin@example.com');

-- Insert Principal
INSERT INTO AllUsers (name, userName, password, role, age, phone, email) 
VALUES ('Rajesh Kumar', 'principal', 'principal123', 'principal', 50, '9876543211', 'principal@example.com');

INSERT INTO Principals (userId, salary, otherMoneyBenefits) 
VALUES ((SELECT id FROM AllUsers WHERE userName = 'principal'), 120000.00, '{"bonus": 10000}');

-- Insert Head Master
INSERT INTO AllUsers (name, userName, password, role, age, phone, email) 
VALUES ('Suresh Kumar', 'headMaster', 'headMaster123', 'headMaster', 50, '9876543211', 'headMaster@example.com');

INSERT INTO HeadMasters (userId, salary, department, assignedClasses, otherMoneyBenefits) 
VALUES ((SELECT id FROM AllUsers WHERE userName = 'headMaster'), 70000.00, 'administration', '1,2,3,4,5', '{"bonus": 5000}');

-- Insert 5 Teachers
INSERT INTO AllUsers (name, userName, password, role, age, phone, email) 
VALUES 
('Sunita Mehta', 'teacher1', 'teacher123', 'teacher', 35, '9876543212', 'teacher1@example.com'),
('Ravi Singh', 'teacher2', 'teacher123', 'teacher', 38, '9876543213', 'teacher2@example.com'),
('Priya Joshi', 'teacher3', 'teacher123', 'teacher', 40, '9876543214', 'teacher3@example.com'),
('Anil Kapoor', 'teacher4', 'teacher123', 'teacher', 29, '9876543215', 'teacher4@example.com'),
('Neha Gupta', 'teacher5', 'teacher123', 'teacher', 45, '9876543216', 'teacher5@example.com');

INSERT INTO Teachers (userId, department, assignedClasses, salary, otherMoneyBenefits) 
VALUES 
((SELECT id FROM AllUsers WHERE userName = 'teacher1'), 'Mathematics', '1,2,3,4,5', 40000.00, '{"bonus": 5000}'),
((SELECT id FROM AllUsers WHERE userName = 'teacher2'), 'Science', '1,2,3,4,5', 42000.00, '{"bonus": 6000}'),
((SELECT id FROM AllUsers WHERE userName = 'teacher3'), 'English', '1,2,3,4,5', 41000.00, '{"bonus": 5500}'),
((SELECT id FROM AllUsers WHERE userName = 'teacher4'), 'History', '6,7,8,9,10', 39000.00, '{"bonus": 4000}'),
((SELECT id FROM AllUsers WHERE userName = 'teacher5'), 'Mathematics', '6,7,8,9,10', 43000.00, '{"bonus": 7000}');

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
((SELECT id FROM AllUsers WHERE userName = 'student1'), 'Class 1', 1000.00, 85.50),
((SELECT id FROM AllUsers WHERE userName = 'student2'), 'Class 2', 1500.00, 88.00),
((SELECT id FROM AllUsers WHERE userName = 'student3'), 'Class 3', 1200.00, 90.00),
((SELECT id FROM AllUsers WHERE userName = 'student4'), 'Class 4', 1000.00, 75.00),
((SELECT id FROM AllUsers WHERE userName = 'student5'), 'Class 5', 1500.00, 92.50),
((SELECT id FROM AllUsers WHERE userName = 'student6'), 'Class 6', 1200.00, 78.00),
((SELECT id FROM AllUsers WHERE userName = 'student7'), 'Class 7', NULL, 85.00),
((SELECT id FROM AllUsers WHERE userName = 'student8'), 'Class 8', NULL, 88.00),
((SELECT id FROM AllUsers WHERE userName = 'student9'), 'Class 9', 1000.00, 79.50),
((SELECT id FROM AllUsers WHERE userName = 'student10'), 'Class 10', NULL, 82.00),
((SELECT id FROM AllUsers WHERE userName = 'student11'), 'Class 1', 800.00, 83.50),
((SELECT id FROM AllUsers WHERE userName = 'student12'), 'Class 2', 1200.00, 87.00),
((SELECT id FROM AllUsers WHERE userName = 'student13'), 'Class 3', NULL, 86.00),
((SELECT id FROM AllUsers WHERE userName = 'student14'), 'Class 4', 1100.00, 88.50),
((SELECT id FROM AllUsers WHERE userName = 'student15'), 'Class 5', 900.00, 85.00),
((SELECT id FROM AllUsers WHERE userName = 'student16'), 'Class 6', NULL, 82.50),
((SELECT id FROM AllUsers WHERE userName = 'student17'), 'Class 7', 950.00, 84.00),
((SELECT id FROM AllUsers WHERE userName = 'student18'), 'Class 8', NULL, 89.50),
((SELECT id FROM AllUsers WHERE userName = 'student19'), 'Class 9', 1000.00, 81.00),
((SELECT id FROM AllUsers WHERE userName = 'student20'), 'Class 10', 1200.00, 80.00);

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

-- Insert into Courses
INSERT INTO Courses (class, title, description, content, department, userId)
VALUES 
('1,2,3,4,5', 'Basic Mathematics', 'A foundational mathematics course for young learners.', 'Content for Basic Mathemetics', 'Mathematics' , 3),
('6,7,8,9,10', 'Advanced Mathematics', 'An advanced mathematics course designed for middle school students.', 'Content for Advanced Mathematics','Mathematics', 6);

-- Insert into Chapters for Course 1
INSERT INTO Chapters (title, description, content, courseId)
VALUES 
('Numbers and Counting', 'description for Numbers and Counting', 'content for Numbers and Counting', 1),
('Basic Geometry', 'description for Basic Geometry', 'content for Basic Geometry', 1);

-- Insert into Chapters for Course 2
INSERT INTO Chapters (title, description, content, courseId)
VALUES 
('Algebra Fundamentals', 'description for Algebra Fundamentals', 'content for Algebra Fundamentals', 2),
('Trigonometry Basics', 'description for Trigonometry Basics', 'content for Trigonometry Basics', 2);

-- Insert into Topics for Course 1, Chapter 1
INSERT INTO Topics (title, description, content, topicType, videoUrl, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Understanding Numbers', 'Learn about numbers and counting techniques.', 'Content about numbers.', 'video', 'video_url', NULL, NULL, 1),
('Counting Practice', 'Practice counting with fun examples.', 'Content for practice.', 'pdf', NULL, 'pdf_url', NULL, 1);

-- Insert into Topics for Course 1, Chapter 2
INSERT INTO Topics (title, description, content, topicType, videoUrl, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Shapes and Sizes', 'Introduction to basic shapes and their properties.', 'Content on shapes.', 'video', 'video_url', NULL, NULL, 2),
('Geometry Practice', 'Practice identifying shapes and their properties.', 'Geometry content.', 'pdf', NULL, 'pdf_url', NULL, 2);

-- Insert into Topics for Course 2, Chapter 1
INSERT INTO Topics (title, description, content, topicType, videoUrl, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Introduction to Algebra', 'Learn the basics of algebraic expressions.', 'Algebra content.', 'video', 'video_url', NULL, NULL, 3),
('Practice Algebra', 'Work through introductory algebra problems.', 'Practice content.', 'pdf', NULL, 'pdf_url', NULL, 3);

-- Insert into Topics for Course 2, Chapter 2
INSERT INTO Topics (title, description, content, topicType, videoUrl, pdfUrl, questionAndAnswers, chapterId)
VALUES 
('Basics of Trigonometry', 'Understand trigonometric functions and their uses.', 'Trigonometry content.', 'video', 'video_url', NULL, NULL, 4),
('Trigonometry Practice', 'Practice with basic trigonometric problems.', 'Practice content.', 'pdf', NULL, 'pdf_url', NULL, 4);



    `;

const populate = () => {
  connectDb();

  const db = getDb(); 


  db.query(query, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Data created successfully");
    
    endConnection();
   });
};

populate(); 