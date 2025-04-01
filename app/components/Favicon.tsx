export default function Favicon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background circle */}
      <circle cx="16" cy="16" r="16" fill="url(#gradient)" />
      
      {/* Two studying people icons */}
      <g transform="translate(6, 8)">
        {/* First person */}
        <path d="M8 5.333c.733 0 1.333-.6 1.333-1.333S8.733 2.667 8 2.667s-1.333.6-1.333 1.333S7.267 5.333 8 5.333z" fill="white" />
        <path d="M8 10c-1.8 0-3.867.86-4 1.34v.66h8v-.667c-.133-.473-2.2-1.333-4-1.333z" fill="white" />
        <path d="M10 7c-.8-.247-1.633-.333-2.533-.333-1.42 0-2.773.327-3.467 1.013V8.667h6.64c-.147-.753-.56-1.36-1.367-1.667z" fill="white" />
      </g>
      
      {/* Second person (slightly offset) */}
      <g transform="translate(12, 8)">
        <path d="M8 5.333c.733 0 1.333-.6 1.333-1.333S8.733 2.667 8 2.667s-1.333.6-1.333 1.333S7.267 5.333 8 5.333z" fill="white" />
        <path d="M8 10c-1.8 0-3.867.86-4 1.34v.66h8v-.667c-.133-.473-2.2-1.333-4-1.333z" fill="white" />
        <path d="M10 7c-.8-.247-1.633-.333-2.533-.333-1.42 0-2.773.327-3.467 1.013V8.667h6.64c-.147-.753-.56-1.36-1.367-1.667z" fill="white" />
      </g>
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
      </defs>
    </svg>
  );
} 