import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-white shadow dark:bg-gray-800">
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
              className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white text-base"
            >
              Resources
            </Link>
            <Link
              href="/private-resources"
              className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white text-base"
            >
              MY Assets
            </Link>
            <Link
              href="/creators-corner"
              className="text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-white text-base"
            >
              Creator's Corner
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
} 