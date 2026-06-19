/**
 * Integration Guide: Chatbot with NotionX Backend
 * 
 * This file demonstrates how to integrate the AI Chatbot module
 * with your existing NotionX backend application.
 */

// ============================================================
// STEP 1: Import the ChatBot Routes
// ============================================================

// In your main server/index.js or app.js:
const createChatRoutes = require('./chatbot/src/routes/chatRoutes');
const ChatService = require('./chatbot/src/services/chatService');
const SearchService = require('./chatbot/src/services/searchService');
const { getAIService } = require('./chatbot/src/services/aiService');
const { getDatabaseService } = require('./chatbot/src/services/databaseService');
const { getCacheService } = require('./chatbot/src/services/cacheService');

// ============================================================
// STEP 2: Initialize ChatBot Services in Your Express App
// ============================================================

async function setupChatbot(app) {
  try {
    console.log('Initializing ChatBot module...');

    // Get singleton service instances
    const aiService = getAIService();
    const databaseService = getDatabaseService();
    const cacheService = getCacheService();

    // Initialize database
    if (process.env.USE_POSTGRES === 'true') {
      await databaseService.initialize();
      console.log('ChatBot database initialized');
    }

    // Check AI service availability
    const aiHealthy = await aiService.isHealthy();
    console.log(`ChatBot AI Service Status: ${aiHealthy ? 'operational' : 'unavailable'}`);

    // Create search service
    const searchService = new SearchService(databaseService, aiService);
    await searchService.loadAllDocumentsToMemory();

    // Create chat service
    const chatService = new ChatService(aiService, databaseService, searchService, cacheService);

    // Create and mount routes
    const chatRoutes = createChatRoutes(chatService, aiService, databaseService);
    app.use('/api/chatbot', chatRoutes);

    console.log('✓ ChatBot module initialized successfully');
    return { chatService, aiService, databaseService };
  } catch (error) {
    console.error('Failed to initialize ChatBot:', error.message);
    throw error;
  }
}

// ============================================================
// STEP 3: Use in Your Main Server File
// ============================================================

// Example: server/index.js

const express = require('express');
require('dotenv').config();

const app = express();

// ... existing middleware setup ...

// Initialize ChatBot
setupChatbot(app)
  .then(() => {
    console.log('ChatBot ready');
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Server initialization failed:', error);
    process.exit(1);
  });

// ============================================================
// STEP 4: Example API Usage from Frontend
// ============================================================

/*
// Send chat message
const response = await fetch('http://localhost:8000/api/chatbot/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'How do I enroll in a course?',
    conversationId: 'optional-conv-id'
  })
});

const data = await response.json();
console.log('AI Response:', data.response);
console.log('Sources:', data.sources);

// Get conversation history
const historyResponse = await fetch('http://localhost:8000/api/chatbot/history/conv-id');
const history = await historyResponse.json();
console.log('Chat History:', history.messages);

// Add documents to knowledge base
const docResponse = await fetch('http://localhost:8000/api/chatbot/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'How to Reset Password',
    content: 'To reset your password...',
    metadata: { category: 'help', type: 'faq' }
  })
});
*/

// ============================================================
// STEP 5: Environment Configuration (.env)
// ============================================================

/*
# Server
PORT=8000
NODE_ENV=production

# ChatBot Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:0.6b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aichatbot
DB_USER=postgres
DB_PASSWORD=your_password

# Features
USE_POSTGRES=true
USE_IN_MEMORY_FALLBACK=true
ENABLE_CACHING=true
ENABLE_RATE_LIMITING=true

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
*/

// ============================================================
// STEP 6: Graceful Shutdown
// ============================================================

async function gracefulShutdown(server, databaseService) {
  console.log('Shutting down gracefully...');
  try {
    await databaseService.close();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Shutdown error:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown(server, databaseService));
process.on('SIGINT', () => gracefulShutdown(server, databaseService));

// ============================================================
// STEP 7: Monitoring and Logging
// ============================================================

/*
// Check ChatBot health status
async function checkChatbotHealth() {
  try {
    const response = await fetch('http://localhost:8000/api/chatbot/health');
    const health = await response.json();
    console.log('ChatBot Health:', health);
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

// Get statistics
async function getChatbotStats() {
  try {
    const response = await fetch('http://localhost:8000/api/chatbot/status');
    const stats = await response.json();
    console.log('ChatBot Stats:', stats);
  } catch (error) {
    console.error('Failed to get stats:', error);
  }
}

// Check periodically
setInterval(checkChatbotHealth, 60000);
*/

// ============================================================
// STEP 8: Authentication (Optional)
// ============================================================

/*
// Add authentication middleware if needed
const authenticateChatbot = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.CHATBOT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Apply to routes
app.use('/api/chatbot', authenticateChatbot, chatRoutes);
*/

module.exports = {
  setupChatbot,
  gracefulShutdown,
};
