import { NextResponse } from 'next/server';
import clientPromise from '@/app/lib/mongodb';

export async function GET() {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    steps: [],
    errors: [],
    resources: []
  };

  try {
    // Step 1: Connect to MongoDB
    debugInfo.steps.push({ step: 1, name: 'Connect to MongoDB', status: 'attempting' });
    try {
      const client = await clientPromise;
      debugInfo.steps[0].status = 'success';
      
      // Step 2: Access database
      debugInfo.steps.push({ step: 2, name: 'Access database', status: 'attempting' });
      const db = client.db('studymate');
      debugInfo.steps[1].status = 'success';
      
      // Step 3: Check if resources collection exists
      debugInfo.steps.push({ step: 3, name: 'Check resources collection', status: 'attempting' });
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      debugInfo.collections = collectionNames;
      
      if (collectionNames.includes('resources')) {
        debugInfo.steps[2].status = 'success';
        
        // Step 4: Try to fetch resources
        debugInfo.steps.push({ step: 4, name: 'Fetch resources', status: 'attempting' });
        try {
          const resources = await db.collection('resources').find({}).toArray();
          debugInfo.steps[3].status = 'success';
          debugInfo.resourceCount = resources.length;
          
          // Include a limited sample of resources with sensitive data removed
          debugInfo.resources = resources.slice(0, 3).map(resource => {
            const { _id, title, type, category, createdAt, updatedAt } = resource;
            return { _id, title, type, category, createdAt, updatedAt };
          });
          
          // Step 5: Test filtering (for debugging)
          debugInfo.steps.push({ step: 5, name: 'Test filtering', status: 'attempting' });
          try {
            if (resources.length > 0) {
              const category = resources[0].category;
              const filtered = await db.collection('resources').find({ 
                category: category 
              }).toArray();
              
              debugInfo.steps[4].status = 'success';
              debugInfo.filterTest = {
                filterBy: 'category',
                value: category,
                count: filtered.length
              };
            } else {
              debugInfo.steps[4].status = 'skipped';
              debugInfo.filterTest = 'No resources to filter';
            }
          } catch (error) {
            debugInfo.steps[4].status = 'error';
            debugInfo.errors.push({
              step: 'filter test',
              message: error instanceof Error ? error.message : String(error)
            });
          }
        } catch (error) {
          debugInfo.steps[3].status = 'error';
          debugInfo.errors.push({
            step: 'fetch resources',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
          });
        }
      } else {
        debugInfo.steps[2].status = 'error';
        debugInfo.errors.push({
          step: 'check resources collection',
          message: 'Resources collection does not exist'
        });
        
        // Create resources collection
        debugInfo.steps.push({ step: 'extra', name: 'Create resources collection', status: 'attempting' });
        try {
          await db.createCollection('resources');
          debugInfo.steps[debugInfo.steps.length - 1].status = 'success';
          debugInfo.collectionCreated = true;
        } catch (error) {
          debugInfo.steps[debugInfo.steps.length - 1].status = 'error';
          debugInfo.errors.push({
            step: 'create collection',
            message: error instanceof Error ? error.message : String(error)
          });
        }
      }
    } catch (error) {
      // Handle connection error
      debugInfo.steps[0].status = 'error';
      debugInfo.errors.push({
        step: 'connect',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
    }
  } catch (error) {
    // Handle unexpected errors
    debugInfo.errors.push({
      step: 'unexpected',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
  
  return NextResponse.json(debugInfo);
} 