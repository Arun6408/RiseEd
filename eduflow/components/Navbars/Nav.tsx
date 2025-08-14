"use client";
import { Children, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "../utils/Logo";
import useNameOfUser from "../hooks/useName";
import { getRole } from "@/utils/util";
import { userLogoBgColors } from "@/constants";
import UserLogo from "../utils/UserLogo";
import { useRef } from "react";

interface NavLinks {
  link: string;
  text: string;
  iconLink: string;
}

interface Score {
  points: number;
  totalPoints: number;
  text: string | null;
  rating: number;
}

const SideNav = ({
  links,
  activeLink,
  score,
  isOpen,
  setIsOpen,
}: {
  links: NavLinks[];
  activeLink: string;
  score?: Score;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const router = useRouter();
  const { name } = useNameOfUser();
  const role = getRole();
  const handleNavLinkClick = (link: string) => {
    router.push(link);
    setIsOpen(false);
  };

  return (
    <div
      className={`fixed lg:relative top-0 left-0 w-72 h-full z-50 bg-teal-50 flex flex-col items-start justify-between overflow-y-auto py-4 px-6 border-r border-gray-400 transition-transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 lg:flex`}
    >
      <div className="w-full">
        <button
          className="lg:hidden self-end text-lg font-bold"
          onClick={() => setIsOpen(false)}
        >
          ✖
        </button>
        <div className="flex flex-col gap-2">
          <div className="w-full flex justify-center">
            <Logo />
          </div>
          <div className="flex flex-col gap-2 mt-3">
            {links.map((navLink, index) => (
              <div
                key={index}
                className={`flex gap-2 hover:gap-4 items-center py-2.5 hover:bg-teal-500 transition-all ease-in-out duration-200 px-4 rounded-xl ${
                  activeLink === navLink.link ? "bg-teal-500" : ""
                }`}
                onClick={() => handleNavLinkClick(navLink.link)}
              >
                <img
                  src={navLink.iconLink}
                  alt={`${navLink.text} icon`}
                  className="w-6 h-6 mr-2"
                />
                <p className="text-md font-medium">{navLink.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {role && role === "teacher" && score && (
        <div className="w-full bg-cyan-500 rounded-xl mt-auto">
          <div className="flex flex-col justify-between items-center gap-1 px-2 py-2">
            <p className="text-lg text-white font-semibold">{name}</p>
            <p className="text-sm font-semibold">{score.text}</p>
            <p className="text-lg font-medium">
              {score.points}/{score.totalPoints}
            </p>
            <p className="text-lg font-medium">
              rating: {score.rating} out of 5
            </p>
            <div className="flex justify-center gap-2">
              <button className="text-md px-4 py-1.5 font-medium text-white bg-gradient-to-tl from-teal-600 via-teal-400 to-green-400 hover:bg-gradient-to-br rounded-xl">
                Review
              </button>
              <button className="text-md px-4 py-1.5 font-medium text-white bg-gradient-to-tl from-orange-400 via-pink-400 to-purple-400 hover:bg-gradient-to-br rounded-xl">
                Score Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Nav = ({
  children,
  links,
  activeLink,
  score,
}: {
  children: ReactNode;
  links: NavLinks[];
  activeLink: string;
  score?: Score;
}) => {
  const { name } = useNameOfUser();
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDivClick = () => {
    if (inputRef.current) {
      //@ts-ignore
      inputRef.current.focus();
    }
  };

  return (
    <div className="relative w-screen bg-teal-50 h-screen flex border-b border-gray-400">
      {/* Backdrop for mobile when side nav is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40 lg:hidden"
          onClick={() => setIsOpen(false)} // Close SideNav when clicking outside
        ></div>
      )}

      <SideNav
        links={links}
        activeLink={activeLink}
        score={score}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      <div className="flex flex-col z-10 relative w-full h-full">
        <div className="flex justify-between px-5 py-3">
          <div className="flex gap-5">
            <button
              className="lg:hidden text-xl font-bold"
              onClick={() => setIsOpen(!isOpen)}
            >
              ☰
            </button>
            <div
              onClick={handleDivClick}
              className="w-64 px-4 py-1 rounded-full bg-white outline cursor-text gap-4 hidden outline-gray-400 md:flex items-center focus-within:outline-black"
            >
              <img src="/icons/search.png" className="w-6" alt="" />
              <input
                type="text"
                className="focus:outline-none"
                placeholder="Search..."
                ref={inputRef}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <p className="px-4 py-1 bg-orange-600 text-lg rounded-full text-white hidden lg:block">
              <span className="mr-2">🔥</span>Explore our new content!!
            </p>
            <UserLogo name={name} className="" />
          </div>
        </div>

        <div className="flex h-full overflow-y-scroll">{children}</div>
      </div>
    </div>
  );
};


export default Nav;
