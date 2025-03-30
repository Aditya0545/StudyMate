const { createRequestHandler } = require('@netlify/next');

// Create a handler for Next.js API routes on Netlify
module.exports.handler = createRequestHandler({
  build: {
    // Path to Next.js build output
    dir: './.next',
  },
}); 