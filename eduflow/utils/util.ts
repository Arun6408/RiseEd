'use client';

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function clearCookies() {
  const cookies = document.cookie.split(";");

  cookies.forEach((cookie) => {
    const [name] = cookie.split("=");
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  });
  console.log(`cookies cleared.`)
}

export function setToken(){
  const bearerToken = `Bearer ${localStorage.getItem('token')}`;
  axios.defaults.headers.common['Authorization'] = bearerToken;
}

export async function getCourses(courseId: number | null) {
  try {
    setToken(); 
    if (courseId) {
      console.log(process.env.NEXT_PUBLIC_API_URL);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`);
      console.log(res.data.data);
      return res.data.data;
    }
    
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/courses`); // Correct URL
    return res.data.data.courses; // Fetching all courses
  } catch (err) {
    console.error("Error fetching courses:", err);
    return [];  // Return an empty array in case of error
  }
}


export async function getChapters({
  courseId,
  chapterId
}: {
  courseId: number;
  chapterId: number | null;
}) {
  try {
    setToken();
    if (chapterId) {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/chapters/${chapterId}`
      );
      return res.data.data;
    }

    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/chapters`);
    return res.data.data.chapters;
  } catch (error) {
    console.error("Error While Fetching: ", error);
    return [];
  }
}

export async function getTopics({courseId,chapterId,topicId}:{
  chapterId: number,
  courseId: number,
  topicId:number | null
}) {
  try {
    setToken(); 
    if (topicId) {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/chapters/${chapterId}/topics/${topicId}`);
      console.log(res.data.data);
      return res.data.data;
    }
    
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/chapters/${chapterId}/topics`); 
    return res.data.data.topics; 
  } catch (error) {
    console.log('Error While Fetching: ',error)
    return [];
  }
}

export async function getAllUsers() {
  setToken();
  
}

