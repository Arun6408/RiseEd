import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import cookie from "cookie";

interface User {
  userId: string | null;
  username: string | null;
  name: string | null;
  role: string | null;
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  
  const userCookie = cookie.parse(req.headers.get("cookie") || "").user;
  
  const user: User | null = userCookie ? JSON.parse(userCookie) : null;
  
  const role: string = user?.role || 'guest';

  const publicRoutes: string[] = ['/', "/auth/login", "/events", "/feeStructure", '/unauthorized'];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (role === 'guest') {
    return NextResponse.redirect(`${req.nextUrl.origin}/unauthorized`);
  }

  if (role === "superAdmin") {
    return NextResponse.next();
  }

  if (role === "principal" && pathname.startsWith("/principal")) {
    return NextResponse.next();
  }

  if (role === "student" && pathname.startsWith("/student")) {
    return NextResponse.next();
  }

  if (role === "teacher" && pathname.startsWith("/teacher")) {
    return NextResponse.next();
  }

  if (role === "headmaster" && pathname.startsWith("/headMaster")) {
    return NextResponse.next();
  }

  if (role === "parent" && pathname.startsWith("/parent")) {
    return NextResponse.next();
  }

  return NextResponse.redirect(`${req.nextUrl.origin}/unauthorized`);
}

export const config = {
  matcher: [
    "/auth/login",
    "/superAdmin",
    "/events",
    "/fees",
    "/dashboard",
    "/homeworks",
    "/doubts",
    "/student",
    "/teacher",
    "/principal/:path*",
    "/headMaster",
    "/parent",
    "/unauthorized",
  ],
};
