import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-lg dark:bg-gray-800/80' 
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="text-[32px] text-primary">👥</div>
              </div>
              <span className="text-xl font-bold text-primary">Study Friend</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/resources"
              className="nav-link"
            >
              Resources
            </Link>
            <Link
              href="/private-resources"
              className="nav-link"
            >
              MY Assets
            </Link>
            <Link
              href="/creators-corner"
              className="nav-link"
            >
              Creator's Corner
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 