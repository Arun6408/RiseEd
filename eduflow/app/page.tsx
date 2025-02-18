"use client";

import Logo from "@/components/utils/Logo";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/auth/login");
  };
  return (
    <div className="w-screen h-screen">
      <div className="absolute top-0 left-0 w-full z-20 bg-gray-50 h-20">
        <div className="flex justify-between px-20 items-center h-full">
          <Logo/>
          <div>
            <button onClick={handleLoginClick} className="bg-[linear-gradient(135deg,_#9b4dca,_#f72c8c)] hover:bg-[linear-gradient(135deg,_#f72c8c,_#9b4dca)] text-white px-10 font-semibold py-2 rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105">
              Login
            </button>
          </div>
        </div>
      </div>
      <BackgroundBeamsWithCollision className="h-full flex flex-col ">
        <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
          RiseEd: Revolutionizing School Management{" "}
          <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
            <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-purple-500 via-violet-500 to-pink-500 [text-shadow:0_0_rgba(0,0,0,0.2)]">
              <span className="">Empower Your School, Elevate Learning.</span>
            </div>
            <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 py-4">
              <span className="">Empower Your School, Elevate Learning.</span>
            </div>
          </div>
        </h2>
        <div className="">
          <button className="bg-gradient-to-tr from-violet-600  via-blue-600 to-sky-500 hover:bg-gradient-to-bl w-52 text-center h-12 rounded-lg text-white font-semibold text-lg m-5" onClick={handleLoginClick}>Get Started</button>
          <button className="bg-transparent w-52 text-center h-12 rounded-lg text-gray-600 outline outline-1 outline-slate-400 hover:outline-none hover:bg-gray-400 hover:text-white transition-all ease-in-out duration-300 font-semibold text-lg m-5" onClick={handleLoginClick}>Know Us More</button>
        </div>
      </BackgroundBeamsWithCollision>
    </div>
  );
}
