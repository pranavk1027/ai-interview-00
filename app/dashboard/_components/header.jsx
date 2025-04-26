'use client'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import React from 'react'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import Link from 'next/link'

function Header() {
    const path=usePathname();
    console.log(path);
    
  return (
    <div className='flex p-4 items-center justify-between bg-secondary shadow-sm dark:bg-gray-800' >
      <Link href="/dashboard">
        <Image 
          priority 
          src="/logo.svg" 
          width={100} 
          height={60} 
          alt='AI Interview Mocker Logo'
          className="dark:invert"
        />
      </Link>
         
      <ul className='hidden md:flex gap-6'>
        <li className={` hover:text-primary hover:font-bold transition-all hover:cursor-pointer  ${path=='/dashboard' && 'text-primary font-bold'} `}>Dashboard</li>
        <li className={` hover:text-primary hover:font-bold transition-all hover:cursor-pointer  ${path=='/upgrade' && 'text-primary font-bold'} `}>Upgrade</li>
        <li className={` hover:text-primary hover:font-bold transition-all hover:cursor-pointer  ${path=='/howitworks' && 'text-primary font-bold'} `}>How it works</li>
        <li className={` hover:text-primary hover:font-bold transition-all hover:cursor-pointer  ${path=='/about' && 'text-primary font-bold'} `}>About</li>
      </ul>
         
      <div className="flex items-center gap-4">
        <ThemeSwitcher />
        <UserButton/>
      </div>
    </div>
  )
}

export default Header