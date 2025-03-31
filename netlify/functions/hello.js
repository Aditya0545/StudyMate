const { builder } = require('@netlify/functions');

/**
 * Simple hello world function to test if Netlify Functions are working
 */
// Simple hello world function
exports.handler = async function() {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Hello from StudyMate!',
      timestamp: new Date().toISOString()
    }),
  };
}; 