#!/usr/bin/env node
/**
 * Direct test of chatbot initialization
 * Helps identify what's failing during the initialization process
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server', '.env') });

console.log('=' * 80);
console.log('🔧 CHATBOT INITIALIZATION TEST');
console.log('=' * 80);
console.log('Environment: ', process.env.NODE_ENV || 'development');
console.log('Use PostgreSQL:', process.env.USE_POSTGRES);
console.log('Ollama URL:', process.env.OLLAMA_BASE_URL);
console.log('=' * 80);

async function testInitialization() {
  try {
    console.log('\n1. Testing module imports...');
    const chatbot = require('./chatbot');
    console.log('✅ ChatBot module imported successfully');
    
    console.log('\n2. Checking exports...');
    console.log('  - initializeChatbot:', typeof chatbot.initializeChatbot);
    console.log('  - getServices:', typeof chatbot.getServices);
    console.log('  - shutdownChatbot:', typeof chatbot.shutdownChatbot);
    console.log('  - checkHealth:', typeof chatbot.checkHealth);

    console.log('\n3. Creating Express app...');
    const express = require('express');
    const app = express();
    console.log('✅ Express app created');

    console.log('\n4. Running initializeChatbot...');
    const services = await chatbot.initializeChatbot(app);
    
    if (services) {
      console.log('✅ ChatBot initialized successfully');
      console.log('  - ChatService:', typeof services.chatService);
      console.log('  - AIService:', typeof services.aiService);
      console.log('  - DatabaseService:', typeof services.databaseService);
      console.log('  - SearchService:', typeof services.searchService);
      console.log('  - CacheService:', typeof services.cacheService);
    } else {
      console.log('⚠️  ChatBot services returned null');
    }

    console.log('\n5. Checking health...');
    const health = await chatbot.checkHealth();
    console.log('Health status:', JSON.stringify(health, null, 2));

    console.log('\n✅ All initialization tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Initialization failed:');
    console.error('Error message:', error.message);
    console.error('Error stack:');
    console.error(error.stack);
    process.exit(1);
  }
}

testInitialization();
