import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import './globals.css'


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />
        </head>
      <body
        className={` antialiased light bg-gray-200 w-screen`}
      >
        {children}
      </body>
    </html>
  );
}
