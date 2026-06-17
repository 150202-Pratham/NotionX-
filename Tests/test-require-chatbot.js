#!/usr/bin/env node
/**
 * Test requiring chatbot/src/index.js directly
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

console.log('Testing require of chatbot/src/index.js...\n');

try {
  console.log('Attempting require...');
  const moduleExports = require('./chatbot/src/index.js');
  
  console.log('✅ Module loaded successfully');
  console.log('Exports:', Object.keys(moduleExports));
  
  Object.keys(moduleExports).forEach(key => {
    console.log(`  ${key}: ${typeof moduleExports[key]}`);
  });
} catch (error) {
  console.error('❌ Error loading module:');
  console.error('Message:', error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
  
  // Try to get more details
  console.error('\nError details:');
  console.error('- Code:', error.code);
  console.error('- Type:', error.constructor.name);
}
