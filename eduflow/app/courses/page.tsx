'use client';
import { getCourses } from '@/utils/util';
import axios from 'axios';
import { useEffect, useState } from 'react';

const CoursePage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);

  const fetchCourses = async () => {
    const fetchedCourses = await getCourses(null);
    setCourses(fetchedCourses);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div>
      <h2>Courses:</h2>
      {courses && courses.length > 0 ? (
        <ul>
          {courses.map((course, index) => (
            <li key={index}>{course.title}</li>
          ))}
        </ul>
      ) : (
        <p>No courses available</p>
      )}
    </div>
  );
};

export default CoursePage;
