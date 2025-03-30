export default function LearnMorePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">About StudyMate</h1>
        
        <section className="mb-12 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">What is StudyMate?</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            StudyMate is a smart study organizer designed to help students, professionals, and lifelong learners organize their study materials in one place. 
            Whether you're preparing for exams, learning new skills, or just trying to keep your knowledge organized, StudyMate provides the tools you need.
          </p>
          <p className="text-gray-700 dark:text-gray-300">
            With StudyMate, you can store various types of learning resources - notes, links, videos, and documents - and organize them with categories and tags for easy retrieval.
          </p>
        </section>
        
        <section className="mb-12 rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Key Features</h2>
          
          <div className="space-y-6">
            <div className="flex">
              <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resource Management</h3>
                <p className="text-gray-700 dark:text-gray-300">Create, edit, and organize different types of study materials in one central location.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Categorization</h3>
                <p className="text-gray-700 dark:text-gray-300">Organize resources by category and add custom tags to make them easy to find later.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Powerful Search</h3>
                <p className="text-gray-700 dark:text-gray-300">Quickly find what you need with advanced search and filtering capabilities.</p>
              </div>
            </div>
            
            <div className="flex">
              <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Multi-format Support</h3>
                <p className="text-gray-700 dark:text-gray-300">Store notes, links, videos, and documents all in one platform.</p>
              </div>
            </div>
          </div>
        </section>
        
        <div className="text-center">
          <a 
            href="/resources" 
            className="inline-block rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Start Organizing Your Study Materials
          </a>
        </div>
      </div>
    </div>
  )
} 