export type Message = {
    messageId: number;
    type: string;
    name:string;
    otherUserId: number;
    role: string;
    message: string;
    createdAt: string;
    viewStatus: string;
    fileType: string;
  };
  
  export type UserMessage = {
    messageId: number ;
    senderId: number;
    receiverId: number;
    message: string;
    createdAt: string;
    viewStatus: string;
    fileType: string;
    fileUrl: string | null;
  };
  
  export interface QuizDetails {
    quizid: number;
    quiztitle: string;
    quizdescription: string;
    quizcourseid: number;
    createdbyuserid: number;
    assignedclasses: string;
    createdat: string;
    coursetitle: string;
    teachername: string;
}

export interface QuizQuestions {
  quizquestionid: number;
  question: string;
  optiona: string;
  optionb: string;
  optionc: string;
  optiond: string;
  correctanswer: string;
  difficulty: string;
}

export type Course = {
  courseId: number;
  title: string;
  class: string;
  description: string;
  content: string | null;
  taughtBy: string;
};

export type Topic = {
  topicId: number;
  title: string;
  description: string;
  content: string | null;
  type: "video" | "text" | "quiz";
  videoUrl: string | null;
  pdfUrl: string | null;
  questions: { question: string; answer: string }[];
};

export type RegisterUser = {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  role: string;
  phone: number | null;
  age: number | null;

  subject: string;
  assignedClasses: string[];
  basicSalary: number | null;
  rentAllowance: number | null;
  foodAllowance: number | null;
  travelAllowance: number | null;
  otherAllowance: number | null;

  taxDeduction: number | null;
  providentFund: number | null;
  otherDeductions: number | null;

  class: number | null;
  scholarshipAmount: number | null;
  score: number | null;

  parentName: string;
  parentUsername: string;
  parentPassword: string;
  parentPasswordConfirmation: string;
  parentAge: number | null;
  parentPhoneNumber: number | null;
  parentEmail: string;
  totalFeeAmount: number | null;
  feePaid: number | null;
};
