const { builder } = require('@netlify/functions');

/**
 * Simple hello world function to test if Netlify Functions are working
 */
async function handler(event, context) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: 'Hello from StudyMate!',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      env: process.env.NODE_ENV
    }),
  };
}

exports.handler = builder(handler); 