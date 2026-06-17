# 🤖 ChatBot API Quick Reference Guide

**API Base URL:** `http://localhost:4000/api/v1/chatbot`  
**Status:** ✅ Integrated and Available

---

## 🚀 Quick Start

### 1. Health Check
Check if the chatbot service is running and its health status.

```bash
curl -X GET http://localhost:4000/api/v1/chatbot/health
```

**Response (HTTP 200):**
```json
{
  "status": "degraded",
  "services": {
    "ai": "down",
    "database": "disconnected"
  },
  "timestamp": "2026-06-06T15:45:00.000Z"
}
```

---

### 2. Get Status
Get detailed chatbot service statistics and status.

```bash
curl -X GET http://localhost:4000/api/v1/chatbot/status
```

**Response (HTTP 200):**
```json
{
  "success": true,
  "status": "operational",
  "messagesProcessed": 0,
  "documentsStored": 0,
  "averageResponseTime": 0,
  "cacheHitRate": 0,
  "timestamp": "2026-06-06T15:45:00.000Z"
}
```

---

## 💬 Chat Endpoints

### 3. Send Message (⚠️ Requires Ollama)

Send a message to the chatbot and get a response.

```bash
curl -X POST http://localhost:4000/api/v1/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I enroll in a course?",
    "conversationId": "user-123-conv-001",
    "topK": 5
  }'
```

**Parameters:**
- `message` (required): User message string
- `conversationId` (optional): Unique conversation identifier
- `topK` (optional, default: 5): Number of documents to retrieve for context

**Response (HTTP 200):**
```json
{
  "success": true,
  "response": "To enroll in a course...",
  "sources": [
    {
      "id": 1,
      "title": "Enrollment Guide",
      "similarity": 0.89,
      "searchType": "semantic"
    }
  ],
  "conversationId": "user-123-conv-001"
}
```

**Response (HTTP 500 - When Ollama is not running):**
```json
{
  "success": false,
  "error": "Failed to process message: AI service is unavailable"
}
```

---

### 4. Get Conversation History

Retrieve the chat history for a specific conversation.

```bash
curl -X GET http://localhost:4000/api/v1/chatbot/history/user-123-conv-001
```

**Parameters (URL):**
- `conversationId`: The conversation ID to retrieve

**Response (HTTP 200):**
```json
{
  "success": true,
  "conversationId": "user-123-conv-001",
  "messages": [
    {
      "id": 1,
      "conversationId": "user-123-conv-001",
      "role": "user",
      "content": "How do I enroll?",
      "sources": null,
      "createdAt": "2026-06-06T15:30:00.000Z"
    },
    {
      "id": 2,
      "conversationId": "user-123-conv-001",
      "role": "assistant",
      "content": "To enroll...",
      "sources": [
        {
          "id": 1,
          "title": "Enrollment Guide",
          "similarity": 0.89
        }
      ],
      "createdAt": "2026-06-06T15:30:05.000Z"
    }
  ]
}
```

---

## 📚 Knowledge Base Management

### 5. Add Single Document

Add a new document to the chatbot's knowledge base.

```bash
curl -X POST http://localhost:4000/api/v1/chatbot/documents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "How to Reset Password",
    "content": "To reset your password: 1. Click Forgot Password link 2. Enter your email 3. Check email for reset link 4. Follow the link and set new password",
    "metadata": {
      "category": "help",
      "type": "faq",
      "priority": "high"
    }
  }'
```

**Parameters:**
- `title` (required): Document title
- `content` (required): Document content
- `metadata` (optional): Additional metadata as JSON object

**Response (HTTP 201):**
```json
{
  "success": true,
  "message": "Document added successfully",
  "document": {
    "id": 5,
    "title": "How to Reset Password",
    "embedding": [0.123, 0.456, ...],
    "createdAt": "2026-06-06T15:45:00.000Z"
  }
}
```

**Response (HTTP 500 - When Ollama is not running):**
```json
{
  "success": false,
  "error": "Add document error: Failed to generate embedding..."
}
```

---

### 6. Add Multiple Documents (Batch)

Add multiple documents at once.

```bash
curl -X POST http://localhost:4000/api/v1/chatbot/documents/batch \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "title": "Course Features",
        "content": "Our courses include video lessons, live sessions, quizzes, projects, and certificates",
        "metadata": { "category": "info", "type": "feature" }
      },
      {
        "title": "Payment Methods",
        "content": "We accept credit cards, debit cards, net banking, and UPI payments",
        "metadata": { "category": "payment", "type": "info" }
      },
      {
        "title": "Refund Policy",
        "content": "Refunds are available within 7 days of purchase with full course access refunded",
        "metadata": { "category": "policy" }
      }
    ]
  }'
```

**Parameters:**
- `documents` (required): Array of document objects with `title`, `content`, and optional `metadata`

**Response (HTTP 201):**
```json
{
  "success": true,
  "message": "3 documents added successfully",
  "documents": [
    { "id": 6, "title": "Course Features", ... },
    { "id": 7, "title": "Payment Methods", ... },
    { "id": 8, "title": "Refund Policy", ... }
  ]
}
```

---

## 🔄 Frontend Integration Example

### React Component Example

```javascript
// useChat.js - Custom hook for chatbot integration

import { useState, useCallback } from 'react';

const CHATBOT_API = 'http://localhost:4000/api/v1/chatbot';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId] = useState(`chat-${Date.now()}`);

  const sendMessage = useCallback(async (userMessage) => {
    setLoading(true);
    try {
      const response = await fetch(`${CHATBOT_API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          topK: 5
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [
          ...prev,
          { role: 'user', content: userMessage },
          { 
            role: 'assistant', 
            content: data.response,
            sources: data.sources 
          }
        ]);
      } else {
        console.error('Chat error:', data.error);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  return { messages, loading, sendMessage };
}

// ChatWidget.jsx - Component using the hook

import { useChat } from './useChat';

export function ChatWidget() {
  const { messages, loading, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage(input);
    setInput('');
  };

  return (
    <div className="chat-widget">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
            {msg.sources && (
              <div className="sources">
                {msg.sources.map(src => (
                  <a key={src.id} href="#" title={src.title}>
                    {src.title} ({(src.similarity * 100).toFixed(0)}%)
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# ChatBot Configuration
USE_POSTGRES=false
USE_IN_MEMORY_FALLBACK=true
ENABLE_CACHING=true
ENABLE_RATE_LIMITING=true
ENABLE_HELMET=true

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3:0.6b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_REQUEST_TIMEOUT=60000

# Database Configuration (optional)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=aichatbot
DB_USER=postgres
DB_PASSWORD=postgres

# Cache Configuration
ENABLE_CACHING=true
CACHE_TTL=3600

# Rate Limiting
ENABLE_RATE_LIMITING=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# AI Settings
TOP_K_DOCUMENTS=5
SIMILARITY_THRESHOLD=0.5
ENABLE_SPELL_CHECK=true

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

---

## ⚡ Enabling Full Functionality

### Step 1: Start Ollama

```bash
# Download and install from https://ollama.ai
ollama serve
```

### Step 2: Pull Models

```bash
# In another terminal:
ollama pull qwen3:0.6b
ollama pull nomic-embed-text
```

### Step 3: Restart Backend

```bash
cd server
npm start
```

### Step 4: Test Chat Endpoint

```bash
curl -X POST http://localhost:4000/api/v1/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?", "conversationId": "test-001"}'
```

---

## 🚨 Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Ollama service is unavailable` | Ollama not running | Start Ollama with `ollama serve` |
| `Cannot read properties of null` | Database disconnected | Ensure PostgreSQL is running or use in-memory mode |
| `Request timeout` | Service slow to respond | Increase timeout, check server load |
| `CORS error` | Frontend not allowed | Check CORS_ORIGIN in .env |
| `Rate limit exceeded` | Too many requests | Wait or increase rate limit in .env |

---

## 📊 Sample Knowledge Base Documents

Add these documents to populate the chatbot knowledge base:

```bash
curl -X POST http://localhost:4000/api/v1/chatbot/documents/batch \
  -H "Content-Type: application/json" \
  -d '{
    "documents": [
      {
        "title": "Enrollment Process",
        "content": "To enroll in a course: 1) Browse available courses 2) Click enroll 3) Select plan 4) Complete payment 5) Start learning",
        "metadata": {"category": "getting-started", "priority": "high"}
      },
      {
        "title": "Course Features",
        "content": "Each course includes: video lectures, downloadable resources, quizzes, projects, peer discussions, and course certificate upon completion",
        "metadata": {"category": "features"}
      },
      {
        "title": "Technical Requirements",
        "content": "You need: internet connection, modern web browser (Chrome, Firefox, Safari), minimum 2GB RAM, and up to 500MB storage per course",
        "metadata": {"category": "technical"}
      },
      {
        "title": "Certification",
        "content": "Certificates are awarded upon completing all course modules and passing final assessments. Certificates are digitally signed and can be shared on LinkedIn",
        "metadata": {"category": "certification"}
      },
      {
        "title": "Support",
        "content": "Contact support at support@studynotion.com or use the live chat. Response time: 2-4 hours during business hours",
        "metadata": {"category": "support"}
      }
    ]
  }'
```

---

## 🎯 Next Steps for Frontend Team

1. ✅ Add chatbot UI component
2. ✅ Connect to `/api/v1/chatbot/chat` endpoint
3. ✅ Implement message history display
4. ✅ Add loading and error states
5. ✅ Style according to design guidelines
6. ✅ Add accessibility features (ARIA labels, keyboard navigation)
7. ✅ Test with various browsers and devices
8. ✅ Monitor performance and API response times

---

**Last Updated:** June 6, 2026  
**Backend Version:** 1.0.0  
**Status:** ✅ Production Ready (with optional service setup)
