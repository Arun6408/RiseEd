// components/StudentLayout.tsx
import React, { ReactNode } from "react";
import { studentNavLinks } from "@/constants";
import Nav from "@/components/Navbars/Nav";

interface StudentLayoutProps {
  children: ReactNode;
  activeLink: string; 
}

const StudentLayout: React.FC<StudentLayoutProps> = ({
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
    <div className="w-full h-screen flex flex-col lg:flex-row">
      <Nav links={studentNavLinks} activeLink={activeLink} score={teacherScore} >
        <div className="flex-1 bg-teal-50">{children}</div>
      </Nav>
    </div>
  );
};

export default StudentLayout;
