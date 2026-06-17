#!/usr/bin/env node
/**
 * Test requiring chatbot/index.js directly
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

console.log('Testing require of chatbot/index.js...\n');

try {
  console.log('Attempting require...');
  const chatbot = require('./chatbot/index.js');
  
  console.log('✅ Module loaded successfully');
  console.log('Exports:', Object.keys(chatbot));
  
  Object.keys(chatbot).forEach(key => {
    const type = typeof chatbot[key];
    const details = type === 'function' ? '(function)' : `(${type})`;
    console.log(`  ${key}: ${details}`);
  });
  
  // Check specifically for the functions
  console.log('\nFunction availability:');
  console.log('  initializeChatbot:', typeof chatbot.initializeChatbot === 'function' ? '✅' : '❌');
  console.log('  getServices:', typeof chatbot.getServices === 'function' ? '✅' : '❌');
  console.log('  shutdownChatbot:', typeof chatbot.shutdownChatbot === 'function' ? '✅' : '❌');
  console.log('  checkHealth:', typeof chatbot.checkHealth === 'function' ? '✅' : '❌');
  
} catch (error) {
  console.error('❌ Error loading module:');
  console.error('Message:', error.message);
  console.error('\nStack trace:');
  console.error(error.stack);
}
