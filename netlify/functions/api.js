// Import only what's needed
const { createRequestHandler } = require('@netlify/next');

// Simplified handler for Next.js API routes
exports.handler = createRequestHandler({
  build: { 
    dir: './.next' 
  }
}); 