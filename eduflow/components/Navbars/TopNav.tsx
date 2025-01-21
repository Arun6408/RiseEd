'use client';
import { userLogoBgColors } from "@/constants";
import UserLogo from "../utils/UserLogo";
import { useRef } from "react";
import useNameOfUser from "../hooks/useName";

const TopNav = () => {
  const {name} = useNameOfUser();
  const inputRef = useRef(null);

  const handleDivClick = () => {
    if (inputRef.current) {
      //@ts-ignore
      inputRef.current.focus();  
    }
  };
  return (
    <div className="w-full bg-white h-full flex justify-between items-center px-5 border-b border-gray-400">
      <div
        onClick={handleDivClick}
        className="w-64 px-4 py-1 rounded-full bg-white outline cursor-text gap-4 outline-gray-400 flex focus-within:outline-black"
      >
        <img src="/icons/search.png" className="w-6 aspect-square" alt="" />
        <input
          type="text"
          className="focus:outline-none"
          name=""
          id=""
          placeholder="Search..."
          ref={inputRef}
        />
      </div>

      <div className="flex items-center gap-3">
        <p className="px-4 py-1 bg-orange-600 text-lg rounded-full text-white">
          <span className="mr-2">🔥</span>Explore our new content!!
        </p>
        <UserLogo name={name} className="" />
      </div>
    </div>
  );
};

export default TopNav;
