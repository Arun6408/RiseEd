'use client';
import axios from 'axios'
import { useEffect, useState } from 'react'

const CoursePage:React.FC = () => {
  const [courses, setCourses] = useState([])

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await axios.get('http://localhost:5000/api/courses')
      setCourses(res.data);
    }
    fetchCourses()
  }, [])
  
  return (
    <div>
      
    </div>
  )
}

export default CoursePage
