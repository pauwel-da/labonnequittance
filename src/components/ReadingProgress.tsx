'use client'

import { useEffect, useState } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    function onScroll() {
      const scrolled = window.scrollY
      const total = document.documentElement.scrollHeight - window.innerHeight
      setProgress(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-100">
      <div
        className="h-full bg-[#008020] transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
