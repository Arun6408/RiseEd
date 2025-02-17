import AllQuizPage from '@/components/pages/Quiz/AllQuizzesPageComponent';
import React from 'react';
import StudentLayout from '../StudentLayout';


const Page = () => {
    return (
        <StudentLayout activeLink='/student/quizzes'>
            <AllQuizPage/>
        </StudentLayout>
    );
};

export default Page;