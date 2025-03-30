// Netlify Function to test that serverless functions are working
exports.handler = async function(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from StudyMate Netlify Function!",
      timestamp: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        mongodb: process.env.MONGODB_URI ? "Configured" : "Not configured"
      }
    })
  };
}; 