import React, { ReactNode } from "react";
import { principalNavLinks } from "@/constants";
import Nav from "@/components/Navbars/Nav";

interface PrincipalLayoutProps {
  children: ReactNode;
  activeLink: string;
}

const PrincipalLayout: React.FC<PrincipalLayoutProps> = ({
  children,
  activeLink,
}) => {
  return (
    <div className="w-full h-screen flex">
      <Nav links={principalNavLinks} activeLink={activeLink}>
        <div className="flex-1 bg-teal-50 overflow-y-scroll">{children}</div>
      </Nav>
    </div>
  );
};

export default PrincipalLayout;
