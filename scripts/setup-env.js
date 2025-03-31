// Script to set up environment variables before build
console.log('Setting up environment for Netlify build...');

const fs = require('fs');
const path = require('path');

// Required environment variables
const requiredVars = [
  'MONGODB_URI',
  'RESOURCES_PASSWORD'
];

// Check for required environment variables
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn('⚠️ WARNING: The following required environment variables are missing:');
  missingVars.forEach(varName => console.warn(`- ${varName}`));
  console.warn('These variables should be set in the Netlify dashboard under Site settings > Build & deploy > Environment variables');
  console.warn('⚠️ Continuing build, but application may not function correctly');
} else {
  console.log('✅ All required environment variables are set');
}

// Create scripts directory if it doesn't exist
const scriptsDir = path.dirname(__filename);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

try {
  // Create a minimal .env.production.local for the build
  const envVars = Object.keys(process.env)
    .filter(key => 
      key.startsWith('NEXT_PUBLIC_') || 
      requiredVars.includes(key)
    )
    .map(key => `${key}=${process.env[key]}`)
    .join('\n');
  
  fs.writeFileSync(path.join(process.cwd(), '.env.production.local'), envVars);
  console.log('✅ Created .env.production.local file for build');
} catch (error) {
  console.warn('⚠️ WARNING: Failed to create .env.production.local file:', error.message);
}

console.log('Environment setup complete, proceeding with build...'); 