// Import only what's needed
const { createServerHandler } = require('@netlify/next');

// Path to Next.js app
const distDir = './.next';

// Simplified handler for Netlify Functions
exports.handler = createServerHandler({
  distDir,
}); 