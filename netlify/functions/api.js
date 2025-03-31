const { builder } = require('@netlify/functions');
const { createRequestHandler } = require('@netlify/next');

// Path to Next.js built files
const distDir = './.next';

// Create handler function for Next.js API routes
const handler = async (event, context) => {
  const nextHandler = createRequestHandler({
    build: { distDir }
  });
  
  return nextHandler(event, context);
};

// Export handler function with appropriate settings
exports.handler = builder(handler); 