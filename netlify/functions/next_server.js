const { builder } = require('@netlify/functions');
const { createServerHandler } = require('@netlify/next');

// Path to Next.js app
const distDir = './.next';

// Create handler for server-side rendered pages
const handler = createServerHandler({
  distDir,
});

// Export the handler for Netlify Functions
exports.handler = builder(handler); 