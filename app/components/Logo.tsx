export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex">
        {/* First studying person */}
        <svg className="h-8 w-8 text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" fill="currentColor" />
          <path d="M12 15c-2.7 0-5.8 1.29-6 2.01V18h12v-1c-.2-.71-3.3-2-6-2z" fill="currentColor" />
          <path d="M15 10.5c-1.2-.37-2.45-.5-3.8-.5-2.13 0-4.16.49-5.2 1.52V13h9.96c-.22-1.13-.84-2.04-2.05-2.5z" fill="currentColor" />
        </svg>
        {/* Second studying person (slightly overlapped and different color) */}
        <svg className="h-8 w-8 -ml-2 text-purple-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" fill="currentColor" />
          <path d="M12 15c-2.7 0-5.8 1.29-6 2.01V18h12v-1c-.2-.71-3.3-2-6-2z" fill="currentColor" />
          <path d="M15 10.5c-1.2-.37-2.45-.5-3.8-.5-2.13 0-4.16.49-5.2 1.52V13h9.96c-.22-1.13-.84-2.04-2.05-2.5z" fill="currentColor" />
        </svg>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Study Friend
      </span>
    </div>
  );
} 