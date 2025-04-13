// components/TeacherLayout.tsx
import React, { ReactNode } from "react";
import { teacherNavLinks } from "@/constants";
import Nav from "@/components/Navbars/Nav";

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
          <Nav
            links={teacherNavLinks}
            activeLink={activeLink} 
            score={teacherScore}
            >
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-gray-100 overflow-y-scroll">{children}</div>
        </div>
      </Nav>
    </div>
  );
};

export default TeacherLayout;
