'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";


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

export const getUserId = () => {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('user') ||'{}').userId;
  }
  return null; 
};

export async function getCourses(courseId: number | null) {
  try {
    setToken(); 
    if (courseId) {
      console.log(process.env.NEXT_PUBLIC_API_URL);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}`);
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
      return res.data.data;
    }
    
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/chapters/${chapterId}/topics`); 
    return res.data.data.topics; 
  } catch (error) {
    console.log('Error While Fetching: ',error)
    return [];
  }
}



export const handleUpload = async (file: File, fileType: string | null) => {
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME!
  );
  let url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;

  if (fileType === "pdf") {
    url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`;
  }

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  return data.secure_url;
};


export const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined; // Ensure this runs only in the browser
  const cookieString = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return cookieString ? decodeURIComponent(cookieString.split("=")[1]) : undefined;
};


export function convertCamelToName(camelName:string){
  return camelName.replace(/([A-Z])/g, " $1").trim().replace(/^./, function(str){ return str.toUpperCase(); });
}


export function formatCustomDate(date:string){
  date = date.replace(',','');
  return date;
}

//@ts-ignore
export const parseCreatedAt = (createdAt) => {
  console.log(createdAt);
  const [date, time, period] = createdAt.split(" ");
  const [day, month, year] = date.split("/");
  const [hour, minute] = time.split(":");
  const adjustedHour =
    period.toLowerCase() === "pm" && hour !== "12"
      ? parseInt(hour, 10) + 12
      : period.toLowerCase() === "am" && hour === "12"
      ? 0
      : parseInt(hour, 10);

      console.log(`${year}-${month}-${day}T${String(adjustedHour).padStart(2, "0")}:${minute}:00`);
  return new Date(
    `${year}-${month}-${day}T${String(adjustedHour).padStart(2, "0")}:${minute}:00`
  );
};
