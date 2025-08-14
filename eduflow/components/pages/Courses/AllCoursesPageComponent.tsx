"use client";
import { getCourses, getRole } from "@/utils/util";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const AllCoursesPageComponent = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const role = getRole();

  const fetchCourses = async () => {
    const fetchedCourses = await getCourses(null);
    setCourses(fetchedCourses);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleCourseClick = (courseId: string) => {
    router.push(`/${role}/courses/course/${courseId}`);
  };

  const handleAddCourse = ()=>{
    router.push(`/${role}/courses/upload`);
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="w-full h-[500px] bg-gradient-to-br from-teal-600 via-teal-800 to-teal-900 rounded-3xl flex flex-col items-center justify-center text-center px-6 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-12 w-40 h-40 bg-teal-500 opacity-20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-16 right-20 w-56 h-56 bg-cyan-500 opacity-30 rounded-full"></div>

        {/* Hero Content */}
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-teal-100 font-extrabold text-6xl mb-4">
          Explore Your Next Course
        </h1>
        <p className="text-teal-200 text-lg max-w-2xl">
          Find the best courses to boost your career and expand your knowledge.
          Start learning today!
        </p>

        {/* Search Bar */}
        <div className="mt-8 w-full max-w-2xl flex items-center bg-white shadow-xl rounded-full overflow-hidden">
          <input
            type="text"
            placeholder="Search for a course..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-6 py-3 text-gray-700 text-lg focus:outline-none"
          />
          <button className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 text-lg rounded-r-full transition duration-200">
            Search
          </button>
        </div>
      </div>

      {/* Courses Section */}
      <div className="mt-12 px-6 relative">
        {role !== "student" && role !== "parent" && (
          <button className="absolute top-0 right-5 px-4 py-2 bg-teal-700 text-white rounded-xl hover:bg-teal-800 transition" onClick={()=>{handleAddCourse()}}>
            + New Course
          </button>
        )}
        <h2 className="text-3xl font-bold text-teal-700 mb-6 text-center">
          Browse Our Courses
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses && filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white via-gray-50 to-teal-50 border border-teal-100 shadow-lg rounded-2xl p-6 flex flex-col justify-between space-y-4 hover:shadow-2xl hover:scale-105 transition transform duration-300 min-h-[350px]"
              >
                <div className="flex flex-col gap-3">
                  {/* Decorative Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-teal-700">
                    {course.title}
                  </h3>
                  <div className="bg-teal-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    New
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {course.description}
                </p>

                {/* Taught By */}
                <div className="flex items-center space-x-2">
                  <span className="text-teal-500 text-sm font-medium">
                    Taught by:
                  </span>
                  <span className="text-teal-800 font-semibold">
                    {course.taughtBy}
                  </span>
                </div>

                {/* Class Suitability */}
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-gray-700">
                    Suitable for Classes:
                  </span>{" "}
                  {course.class}
                </p>
                </div>

                {/* Learn More Button */}
                <button className="mt-4 bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 text-lg rounded-xl shadow-md hover:shadow-xl transition duration-200" onClick={()=>{handleCourseClick(course.courseId)}}>
                  Learn More
                </button>
              </div>
            ))
          ) : (
            <p className="text-center text-teal-700 col-span-full">
              No courses available
            </p>
          )}
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-16 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 py-12 rounded-lg text-center shadow-xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-teal-300 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-200 opacity-30 rounded-full blur-3xl animate-pulse"></div>

        <h3 className="text-3xl font-extrabold text-white mb-4">
          You&apos;re all set! Let&apos;s get learning.
        </h3>
        <p className="text-teal-100 mb-6 text-lg leading-relaxed max-w-xl mx-auto">
          Explore the courses we offer and
          start your learning journey today. The next big opportunity is just a
          course away!
        </p>

        <button className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white px-8 py-3 rounded-full text-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
          Explore Courses
        </button>
      </div>
    </div>
  );
};

export default AllCoursesPageComponent;
