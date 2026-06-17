<div align="center">

#  NotionX
### AI-Powered Learning Management System

<img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge"/>
<img src="https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge"/>
<img src="https://img.shields.io/badge/AI-Ollama-purple?style=for-the-badge"/>
<img src="https://img.shields.io/badge/RAG-Enabled-orange?style=for-the-badge"/>

### Learn. Teach. Build. Grow.

An AI-powered Learning Management System that combines modern online education with intelligent Retrieval-Augmented Generation (RAG) to create an interactive learning experience.

</div>

---

# 🌟 Overview

NotionX is a full-stack Learning Management System where students can learn, instructors can create and manage courses, and an integrated AI assistant helps users navigate the platform and retrieve course information intelligently.

Unlike traditional LMS platforms, NotionX features a Local AI Assistant powered by Ollama that automatically learns platform knowledge and synchronizes course information through automatic AI CRUD operations.

---

# ✨ Key Features

## 👨‍🎓 Student

- Browse Courses
- Purchase Courses
- Secure Payment Integration
- Track Progress
- Watch Video Lectures
- Complete Courses
- Download Certificates
- Manage Profile
- AI Assistant Support

---

## 👨‍🏫 Instructor

- Create Courses
- Edit Courses
- Delete Courses
- Upload Videos
- Create Sections
- Create Subsections
- Manage Students
- Instructor Dashboard

---

## 🤖 NotionX AI

### Local LLM

- Ollama Integration

### Retrieval-Augmented Generation

- Hybrid Search
- Semantic Search
- Keyword Search

### Platform Knowledge

AI understands:

- Enrollments
- Certificates
- Dashboard
- Payments
- Instructors
- Platform Features

### Automatic Course AI

Whenever a course is:

✅ Created

AI automatically learns it.

✅ Updated

AI synchronizes updated information.

✅ Deleted

AI forgets removed courses.

✅ Legacy Recovery

AI can rebuild knowledge from existing published courses.

### Source Attribution

Every AI response references the source documents used.

---

# 🧠 AI Architecture

```
                    Ollama

                       │

               Embedding Model

                       │

                Hybrid Retrieval

                /              \

        Platform Docs     Course Docs

                \              /

                 Knowledge Base

                       │

             Automatic CRUD Sync

                       │

                  NotionX AI
```

---

# 🏗 Tech Stack

## Frontend

- React.js
- Redux Toolkit
- Tailwind CSS
- React Router

---

## Backend

- Node.js
- Express.js

---

## Database

- MongoDB
- Mongoose

---

## Authentication

- JWT
- OTP Verification

---

## Cloud Storage

- Cloudinary

---

## Payment

- Razorpay

---

## AI Stack

- Ollama
- Qwen
- Nomic Embeddings
- RAG Pipeline
- Hybrid Search
- Local Vector Memory

---

# 📚 AI Features

## Platform AI

```
How do I enroll?

↓

AI understands platform knowledge.
```

---

## Course AI

```
Tell me about Java Master Class.

↓

AI retrieves course information.
```

---

## Automatic AI Synchronization

```
Create Course

↓

AI Learns

-------------------

Update Course

↓

AI Updates

-------------------

Delete Course

↓

AI Forgets

-------------------

Rebuild

↓

AI Reloads
```

---

# 🎯 Features Implemented

## Authentication

- Signup
- Login
- OTP Verification
- Forgot Password
- Reset Password

---

## Student

- Buy Courses
- Course Progress
- Dashboard
- Certificates

---

## Instructor

- Course Management
- Section Management
- Lecture Management

---

## AI

- Local LLM
- Hybrid Retrieval
- Platform Knowledge
- Course Knowledge
- Automatic Course CRUD Synchronization
- Source Attribution

---

# 📂 Project Structure

```
NotionX/

├── client/
│
├── server/
│
├── chatbot/
│
│   ├── AI Service
│   ├── Search Service
│   ├── Chat Service
│   ├── Platform Knowledge
│   ├── Course Knowledge
│   └── Hybrid Retrieval
│
└── README.md
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/NotionX.git
```

```
cd NotionX
```

---

## Install Dependencies

### Backend

```
cd server
npm install
```

### Frontend

```
cd client
npm install
```

### ChatBot

```
cd chatbot
npm install
```

---

# Environment Variables

Create:

```
server/.env
```

Add:

```
PORT=

MONGODB_URL=

JWT_SECRET=

RAZORPAY_KEY=

RAZORPAY_SECRET=

CLOUD_NAME=

API_KEY=

API_SECRET=

MAIL_USER=

MAIL_PASS=

OLLAMA_BASE_URL=

OLLAMA_MODEL=

OLLAMA_EMBEDDING_MODEL=
```

---

# Run

Backend

```
npm run dev
```

Frontend

```
npm start
```

Ollama

```
ollama serve
```

---

# 🚀 Future Scope

- AI Personalized Learning
- AI Quiz Generation
- AI Learning Path
- AI Student Analytics
- AI Tutor
- Mobile Application

---

# 📈 Highlights

✅ Full Stack LMS

✅ AI Powered

✅ Local LLM

✅ Retrieval-Augmented Generation

✅ Automatic AI CRUD Synchronization

✅ Hybrid Search

✅ Razorpay Integration

✅ Cloudinary Integration

✅ Certificate System

✅ Instructor Dashboard

✅ Student Dashboard

---

# 🤝 Contributions

Contributions are welcome!

Fork the repository and submit a pull request.

---

# 📜 License

MIT License

---

<div align="center">

# ⭐ If you like this project, give it a star!

Made with ❤️ by Pratham Garg

### Building the Future of AI-Powered Education 🚀

</div>
