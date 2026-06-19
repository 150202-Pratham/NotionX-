# AI ChatBot with RAG Pattern - Integration Guide

This directory contains the production-ready AI ChatBot module with RAG (Retrieval-Augmented Generation) pattern for the NotionX platform.

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 13+
- Ollama (for local LLM)
- Docker & Docker Compose (optional)

### Installation

```bash
# Install dependencies
cd chatbot
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

### Running with Docker

```bash
# Build and start with Docker Compose
docker-compose -f docker/docker-compose.yml up -d

# Check logs
docker-compose -f docker/docker-compose.yml logs -f chatbot
```

## Architecture

### Core Components

1. **AI Service** - Ollama integration for LLM inference
2. **Embedding Service** - Vector embedding generation
3. **PGVector Service** - PostgreSQL vector storage and similarity search
4. **Search Service** - Hybrid search (semantic + keyword)
5. **Database Service** - Connection pooling and migrations

### Data Flow

```
User Query
    ↓
Input Validation & Sanitization
    ↓
Generate Query Embedding
    ↓
Semantic + Keyword Search
    ↓
Retrieve Top K Documents
    ↓
Build Context Prompt
    ↓
Call Ollama LLM
    ↓
Generate Response
    ↓
Format & Return to User
```

## API Endpoints

### Chat Endpoint
```
POST /api/chatbot/chat
Content-Type: application/json

Request:
{
  "message": "What is RAG?",
  "conversationId": "optional-id",
  "topK": 5
}

Response:
{
  "success": true,
  "response": "RAG stands for Retrieval-Augmented Generation...",
  "sources": [
    {
      "id": "doc-1",
      "title": "RAG Documentation",
      "similarity": 0.95
    }
  ],
  "conversationId": "conv-123"
}
```

### Health Check
```
GET /api/chatbot/health

Response:
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "ollama": "running",
    "cache": "ready"
  }
}
```

### Status Endpoint
```
GET /api/chatbot/status

Response:
{
  "ai_model": "qwen3:0.6b",
  "documents_indexed": 150,
  "vector_dimension": 384,
  "memory_usage": "256MB"
}
```

## Configuration

See `.env.example` for all available configuration options:

```env
# Server
PORT=5000
NODE_ENV=production

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:0.6b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aichatbot
DB_USER=postgres
DB_PASSWORD=secure_password

# Features
USE_POSTGRES=true
USE_IN_MEMORY_FALLBACK=true
ENABLE_CACHING=true
CACHE_TTL=3600

# API
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## Integration with NotionX Backend

### Mount ChatBot Router

In your main Express app:

```javascript
const chatbotRouter = require('./chatbot/src/routes/chatRoutes');
const app = express();

// ... other middleware

app.use('/api/chatbot', chatbotRouter);

// ... rest of your app
```

### Initialize Services

```javascript
const ChatbotServices = require('./chatbot/src/services');

// Initialize on app startup
app.on('ready', async () => {
  await ChatbotServices.initialize();
});
```

## Features

✅ Retrieval-Augmented Generation (RAG)
✅ Semantic search with pgvector
✅ Hybrid search (semantic + keyword)
✅ Local LLM inference with Ollama
✅ Production-ready error handling
✅ Comprehensive logging
✅ Environment-based configuration
✅ Docker support
✅ Database connection pooling
✅ Response caching
✅ Rate limiting
✅ CORS support
✅ Health check endpoints

## Testing

```bash
# Run all tests
npm test

# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Database tests
npm run test:db
```

## Performance Optimization

- Vector embedding caching
- Response result caching
- Database connection pooling
- Lazy service initialization
- Batch embedding processing
- Query optimization with indices

## Security

- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention
- Request size limits
- Rate limiting
- CORS configuration
- Secure secret management (.env)

## Troubleshooting

### Ollama Not Responding
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Restart Ollama
ollama serve
```

### PostgreSQL Connection Failed
```bash
# Check PostgreSQL status
psql -U postgres -h localhost

# Run migrations
npm run migrate
```

### Vector Dimension Mismatch
```bash
# Ensure Ollama embedding model matches pgvector dimension
# Run: npm run migrate (recreates schema with correct dimension)
```

## Monitoring & Logging

Logs are written to:
- Console (development)
- Files in `/logs` directory (production)
- Winston logger with multiple transports

View logs:
```bash
# Development
npm run dev

# Production with PM2
npm run pm2:logs

# Docker
docker-compose -f docker/docker-compose.yml logs -f chatbot
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure PostgreSQL connection
3. Set Ollama URL for production server
4. Enable HTTPS
5. Set appropriate CORS origins
6. Configure rate limiting
7. Use PM2 for process management
8. Set up monitoring and alerts

## Documentation

- [API Documentation](./docs/API.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Configuration Guide](./docs/CONFIG.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## Support

For issues and questions, check the documentation or create an issue in the repository.
