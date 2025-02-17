// components/TeacherLayout.tsx
import React, { ReactNode } from "react";
import SideNav from "@/components/Navbars/SideNav";
import TopNav from "@/components/Navbars/TopNav";
import { teacherNavLinks } from "@/constants";

interface TeacherLayoutProps {
  children: ReactNode;
  activeLink: string; 
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({
  children,
  activeLink,
}) => {
  const teacherScore = {
    points: 85,
    totalPoints: 100,
    text: "Excellent performance",
    rating: 4.5,
  };

  return (
      <div className="w-full h-screen flex">
        <div>
          <SideNav
            links={teacherNavLinks}
            activeLink={activeLink} 
            score={teacherScore}
          />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16">
            <TopNav />
          </div>
          <div className="flex-1 bg-gray-100 overflow-y-scroll">{children}</div>
        </div>
      </div>
  );
};

export default TeacherLayout;
