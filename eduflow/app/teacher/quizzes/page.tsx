import AllQuizPage from '@/components/pages/Quiz/AllQuizzesPageComponent';
import React from 'react';
import TeacherLayout from '../TeacherLayout';


const Page = () => {
    return (
        <TeacherLayout activeLink='/teacher/quizzes'>
            <AllQuizPage/>
        </TeacherLayout>
    );
};

export default Page;