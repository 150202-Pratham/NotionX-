# AI ChatBot Integration Guide - Quick Start

This guide helps you integrate the production-ready AI ChatBot module into your existing NotionX backend.

## Prerequisites

Before integration, ensure you have:

- **Node.js 18+** installed
- **PostgreSQL 13+** with pgvector extension
- **Ollama** running locally or accessible
- **NotionX backend** already set up (Express.js application)

## Installation Steps

### 1. Install ChatBot Dependencies

```bash
cd chatbot
npm install
```

### 2. Configure Environment Variables

Copy the template and customize:

```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:

```env
# Server
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:0.6b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# PostgreSQL Configuration
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

# Cache
CACHE_TTL=3600
CACHE_CLEANUP_INTERVAL=600000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Setup PostgreSQL Database

Create the database and enable pgvector:

```bash
# Create database
createdb aichatbot

# Connect to database
psql -U postgres -d aichatbot

# In psql shell, run:
CREATE EXTENSION vector;
\q
```

### 4. Initialize Database Schema

Run database migrations:

```bash
npm run migrate
```

### 5. Seed Sample Documents

Load initial knowledge base:

```bash
npm run seed
```

## Integration with NotionX Backend

### Option A: Modular Integration (Recommended)

Create a new file `server/chatbot/init.js`:

```javascript
const createChatRoutes = require('../../chatbot/src/routes/chatRoutes');
const ChatService = require('../../chatbot/src/services/chatService');
const SearchService = require('../../chatbot/src/services/searchService');
const { getAIService } = require('../../chatbot/src/services/aiService');
const { getDatabaseService } = require('../../chatbot/src/services/databaseService');
const { getCacheService } = require('../../chatbot/src/services/cacheService');
const logger = require('../../chatbot/src/utils/logger');

async function initializeChatbot(app) {
  try {
    logger.info('Initializing ChatBot module...');

    // Get singleton instances
    const aiService = getAIService();
    const databaseService = getDatabaseService();
    const cacheService = getCacheService();

    // Initialize database
    if (process.env.USE_POSTGRES === 'true') {
      await databaseService.initialize();
      logger.info('ChatBot database initialized');
    }

    // Check AI service
    const aiHealthy = await aiService.isHealthy();
    logger.info(`ChatBot AI Service: ${aiHealthy ? 'operational' : 'unavailable'}`);

    // Setup search and chat services
    const searchService = new SearchService(databaseService, aiService);
    await searchService.loadAllDocumentsToMemory();

    const chatService = new ChatService(aiService, databaseService, searchService, cacheService);

    // Mount routes
    const chatRoutes = createChatRoutes(chatService, aiService, databaseService);
    app.use('/api/chatbot', chatRoutes);

    logger.info('✓ ChatBot module initialized successfully');
    return { chatService, aiService, databaseService };
  } catch (error) {
    logger.error('ChatBot initialization failed:', error);
    throw error;
  }
}

module.exports = { initializeChatbot };
```

### Option B: Direct Integration in server/index.js

Add to your main server file:

```javascript
const express = require('express');
require('dotenv').config();

const { initializeChatbot } = require('./chatbot/init');

const app = express();

// ... existing middleware ...

// Initialize ChatBot
initializeChatbot(app)
  .then(() => {
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`NotionX Server running on port ${PORT}`);
      console.log(`ChatBot API available at /api/chatbot`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
```

## API Endpoints

After integration, the following endpoints are available:

### Chat Endpoint
```
POST /api/chatbot/chat
Body: { "message": "Your question", "conversationId": "optional-id" }
Returns: { "response": "AI response", "sources": [...], "conversationId": "uuid" }
```

### Health Check
```
GET /api/chatbot/health
Returns: { "status": "ok/error", "aiService": boolean, "database": boolean }
```

### Status & Statistics
```
GET /api/chatbot/status
Returns: { "documentsIndexed": 10, "aiModel": "qwen3:0.6b", "cacheSize": 0 }
```

### Get Conversation History
```
GET /api/chatbot/history/:conversationId
Returns: { "messages": [...] }
```

### Add Single Document
```
POST /api/chatbot/documents
Body: { "title": "...", "content": "...", "metadata": {} }
```

### Batch Add Documents
```
POST /api/chatbot/documents/batch
Body: { "documents": [...] }
```

## Docker Setup (Optional)

For containerized deployment:

```bash
# Build and start all services
docker-compose --profile with-ollama up --build

# Or start without Ollama (use external instance)
docker-compose up --build
```

Services:
- **PostgreSQL**: localhost:5432
- **Ollama**: localhost:11434
- **ChatBot API**: localhost:5000

## Frontend Integration Example

```javascript
// React component example
import React, { useState } from 'react';

export function ChatBot() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [sources, setSources] = useState([]);

  const sendMessage = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      setResponse(data.response);
      setSources(data.sources);
    } catch (error) {
      console.error('Chat failed:', error);
    }
  };

  return (
    <div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask a question..."
      />
      <button onClick={sendMessage}>Send</button>
      {response && <div className="response">{response}</div>}
      {sources.length > 0 && (
        <div className="sources">
          <h4>Sources:</h4>
          {sources.map((src) => (
            <div key={src.id}>{src.title}</div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

### Ollama Connection Issues
```bash
# Test Ollama connectivity
curl http://localhost:11434/api/tags

# If not available, start Ollama
ollama serve
```

### PostgreSQL Connection Issues
```bash
# Test database connection
psql -U postgres -d aichatbot -c "SELECT version();"

# Verify pgvector extension
psql -U postgres -d aichatbot -c "SELECT * FROM pg_extension WHERE extname='vector';"
```

### Docker Issues
```bash
# View logs
docker-compose logs -f chatbot

# Restart services
docker-compose restart

# Full cleanup and restart
docker-compose down -v
docker-compose up --build
```

## Performance Tips

1. **Batch API Calls**: Use `/documents/batch` endpoint for multiple documents
2. **Enable Caching**: Set `ENABLE_CACHING=true` for faster repeated queries
3. **Adjust Cache TTL**: Increase `CACHE_TTL` for stable knowledge bases
4. **Rate Limiting**: Adjust `RATE_LIMIT_MAX_REQUESTS` based on expected load
5. **Database Indexing**: Ensure `pgvector` indices are created on `embedding` column

```sql
-- Create index for faster similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

## Security Considerations

1. **API Keys**: Implement authentication for production
2. **Input Validation**: All inputs are sanitized and validated
3. **Rate Limiting**: Enabled by default (configurable)
4. **CORS**: Whitelist allowed origins in `.env`
5. **Environment Variables**: Never commit `.env` files
6. **Database Passwords**: Use strong credentials

## Monitoring

Check ChatBot health regularly:

```javascript
// Add to your monitoring/health check endpoint
app.get('/health', async (req, res) => {
  try {
    const chatbotRes = await fetch('http://localhost:5000/api/chatbot/health');
    const chatbotHealth = await chatbotRes.json();
    res.json({ status: 'ok', chatbot: chatbotHealth });
  } catch (error) {
    res.status(500).json({ error: 'ChatBot unavailable' });
  }
});
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Setup PostgreSQL
4. ✅ Integrate routes
5. ✅ Test endpoints
6. ✅ Deploy with Docker

For detailed architecture and advanced configuration, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
