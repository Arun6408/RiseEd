"use client"; // This tells Next.js this is a client-side component
import React from 'react'

import { usePathname } from "next/navigation";

interface ActiveLinkHandlerProps {
  children: React.ReactNode;
}

const ActiveLinkHandler: React.FC<ActiveLinkHandlerProps> = ({ children }) => {
  const pathname = usePathname(); // Get the current path using usePathname

  //@ts-ignore
  return <>{React.cloneElement(children as React.ReactElement, { activeLink: pathname })}</>;
};

export default ActiveLinkHandler;
