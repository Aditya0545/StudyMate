// Custom Netlify build plugin to handle environment variables
module.exports = {
  onPreBuild: ({ utils }) => {
    // Log the current environment
    console.log('Starting build with environment:', process.env.NODE_ENV);
    
    // Check for required environment variables
    const requiredVars = [
      'MONGODB_URI',
      'RESOURCES_PASSWORD'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('⚠️ WARNING: The following required environment variables are missing:');
      missingVars.forEach(varName => console.warn(`- ${varName}`));
      console.warn('These variables should be set in the Netlify dashboard under Site settings > Build & deploy > Environment variables');
      
      // Don't fail the build, but warn the user
      console.warn('⚠️ Continuing build, but application may not function correctly');
    } else {
      console.log('✅ All required environment variables are set');
    }
    
    // Create a simple .env.production.local file during build
    const fs = require('fs');
    
    try {
      // Create a minimal .env.production.local for the build
      const envVars = Object.keys(process.env)
        .filter(key => 
          key.startsWith('NEXT_PUBLIC_') || 
          requiredVars.includes(key)
        )
        .map(key => `${key}=${process.env[key]}`)
        .join('\n');
      
      fs.writeFileSync('.env.production.local', envVars);
      console.log('✅ Created .env.production.local file for build');
    } catch (error) {
      console.warn('⚠️ WARNING: Failed to create .env.production.local file:', error.message);
    }
  }
}; 