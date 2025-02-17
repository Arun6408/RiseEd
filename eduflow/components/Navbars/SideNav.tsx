'use client';
import { useRouter } from "next/navigation";
import Logo from "../utils/Logo";
import useNameOfUser from "../hooks/useName";

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
}: {
  links: NavLinks[];
  activeLink: string;
  score: Score;
}) => {
  const router = useRouter();
  const {name} = useNameOfUser();
  const handleNavLinkClick = (link: string) => {
    router.push(link);
  };
  return (
    <div className="w-64 h-screen bg-teal-50 flex flex-col justify-between py-4 px-6 border-r border-gray-400">
      <div className="flex flex-col  gap-2">
        <div className="w-full flex justify-center">
          <Logo />
        </div>
        <div className="flex flex-col gap-1">
        {links.map((navLink, index) => (
          <div
            key={index}
            className={`flex gap-2 hover:gap-4 items-center py-2.5 hover:bg-teal-500 transition-all ease-in-out duration-200 px-4 rounded-xl ${
              activeLink === navLink.link ? "bg-teal-500" : ""
            }`}
            onClick={() => {
              handleNavLinkClick(navLink.link);
            }}
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
      <div className="w-full bg-cyan-500 rounded-xl ">
        <div className="flex flex-col justify-between items-center gap-1 px-2 py-2">
          <p className="text-lg text-white font-semibold">{name}</p>
          <p className="text-sm font-semibold">{score.text}</p>
          <p className="text-lg font-medium">
            {score.points}/{score.totalPoints}
          </p>
          <div className="flex gap-1"></div>
          <p className="text-lg font-medium">rating: {score.rating} out of 5</p>
          <div className="flex justify-center gap-2">
            <button className=" text-md px-4 py-1.5 font-medium text-white bg-gradient-to-tl from-teal-600 via-teal-400 to-green-400 hover:bg-gradient-to-br rounded-xl">
              Review
            </button>
            <button className="text-md px-4 py-1.5 font-medium text-white bg-gradient-to-tl from-orange-400 via-pink-400 to-purple-400 hover:bg-gradient-to-br rounded-xl ">
              Score Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
