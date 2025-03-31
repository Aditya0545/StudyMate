// Minimal script to check environment variables for Netlify deployment
console.log('Setting up environment for Netlify build...');

// Required environment variables
const requiredVars = ['MONGODB_URI', 'RESOURCES_PASSWORD'];

// Check for required variables
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️ Missing environment variables:', missingVars.join(', '));
  console.warn('Continuing build but app functionality may be limited');
} else {
  console.log('✅ All required environment variables found');
}

// Skip writing files to reduce complexity
console.log('Environment setup complete'); 