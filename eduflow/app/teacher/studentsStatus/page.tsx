import React from 'react'
import TeacherLayout from '../TeacherLayout'

const page = () => {
  return (
    <TeacherLayout activeLink='/teacher/studentsStatus'>
    <div>
        <h1>Student Status Page</h1>
        <p>This is the student status page.</p>
    </div>
    </TeacherLayout>
  )
}

export default page
