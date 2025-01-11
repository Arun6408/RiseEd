'use client'
import { useRouter } from 'next/navigation'
import React from 'react'

const Logo = () => {
    const router = useRouter();
    const handleClick = () => {
        router.push('/');
    }

  return (
      <img
            src="/images/Logo.png"
            loading="lazy"
            alt="logo"
            className="hover:scale-105 transition-all duration-300 ease-in-out"
            style={{ width: "160px" }}
            onClick={handleClick}
          />
  )
}

export default Logo
