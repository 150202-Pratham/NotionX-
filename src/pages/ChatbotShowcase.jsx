import React, { useState } from 'react';
import { MessageCircle, Zap, Brain, BarChart3 } from 'lucide-react';
import ChatbotUI from '../components/core/ChatbotUI';

/**
 * Chatbot Showcase Page
 * Perfect for presentations and demonstrations
 */
const ChatbotShowcase = () => {
  const [activeTab, setActiveTab] = useState('demo');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <Brain size={40} className="animate-pulse" />
            <h1 className="text-5xl font-bold">StudyNotion AI Assistant</h1>
          </div>
          <p className="text-xl text-blue-100">
            Intelligent chatbot powered by advanced AI and RAG architecture
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-6 my-8">
        <div className="flex gap-4 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-4 px-6 text-lg font-semibold transition-all ${
              activeTab === 'demo'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            💬 Live Demo
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`pb-4 px-6 text-lg font-semibold transition-all ${
              activeTab === 'features'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⚡ Features
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-4 px-6 text-lg font-semibold transition-all ${
              activeTab === 'architecture'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🏗️ Architecture
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        {/* Demo Tab */}
        {activeTab === 'demo' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Try It Out! 👇</h2>
                <p className="text-gray-600 mb-6">
                  Open the chatbot in the bottom right corner and ask it anything about our courses,
                  enrollment process, certificates, or payment methods.
                </p>
                <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-8 min-h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle size={64} className="text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold">Click the chat icon in the bottom right →</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Questions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Questions</h3>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition">
                  <p className="text-sm text-gray-700">❓ How to enroll in a course?</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 cursor-pointer transition">
                  <p className="text-sm text-gray-700">💳 What payment methods do you accept?</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg hover:bg-pink-100 cursor-pointer transition">
                  <p className="text-sm text-gray-700">📜 How do certificates work?</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 cursor-pointer transition">
                  <p className="text-sm text-gray-700">⚙️ What are the technical requirements?</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 cursor-pointer transition">
                  <p className="text-sm text-gray-700">🔄 What's your refund policy?</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <Brain size={32} className="text-blue-600" />,
                title: 'AI-Powered',
                desc: 'Uses advanced language models for natural conversations',
              },
              {
                icon: <Zap size={32} className="text-yellow-600" />,
                title: 'Instant Responses',
                desc: 'Get immediate answers to your questions 24/7',
              },
              {
                icon: <BarChart3 size={32} className="text-purple-600" />,
                title: 'Context-Aware',
                desc: 'Understands course-specific information through RAG',
              },
              {
                icon: <MessageCircle size={32} className="text-pink-600" />,
                title: 'Conversation History',
                desc: 'Maintains full context across your conversation',
              },
              {
                icon: <Brain size={32} className="text-green-600" />,
                title: 'Smart Search',
                desc: 'Hybrid semantic and keyword search for better results',
              },
              {
                icon: <Zap size={32} className="text-red-600" />,
                title: 'Fast & Reliable',
                desc: 'Optimized for speed with fallback mechanisms',
              },
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">{feature.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Architecture Tab */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">RAG Architecture</h2>
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 overflow-x-auto">
                <div className="flex items-center justify-between gap-4 min-w-max">
                  <div className="bg-white border-2 border-blue-500 rounded-lg p-4 w-32 text-center">
                    <p className="font-bold text-blue-600">User Query</p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="bg-white border-2 border-purple-500 rounded-lg p-4 w-32 text-center">
                    <p className="font-bold text-purple-600">Embedding</p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="bg-white border-2 border-pink-500 rounded-lg p-4 w-32 text-center">
                    <p className="font-bold text-pink-600">Search</p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="bg-white border-2 border-green-500 rounded-lg p-4 w-32 text-center">
                    <p className="font-bold text-green-600">LLM Response</p>
                  </div>
                  <div className="text-2xl text-gray-400">→</div>
                  <div className="bg-white border-2 border-yellow-500 rounded-lg p-4 w-32 text-center">
                    <p className="font-bold text-yellow-600">Answer</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-4">🛠️ Technologies</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✅ Node.js + Express Backend</li>
                  <li>✅ PostgreSQL Database</li>
                  <li>✅ Ollama AI Services</li>
                  <li>✅ Semantic Search (Embeddings)</li>
                  <li>✅ RAG (Retrieval Augmented Generation)</li>
                  <li>✅ In-Memory Fallback Mode</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-xl text-gray-900 mb-4">📊 Endpoints</h3>
                <ul className="space-y-2 text-gray-700 font-mono text-sm">
                  <li>POST /api/v1/chatbot/chat</li>
                  <li>GET /api/v1/chatbot/health</li>
                  <li>GET /api/v1/chatbot/status</li>
                  <li>GET /api/v1/chatbot/history</li>
                  <li>POST /api/v1/chatbot/add-doc</li>
                  <li>POST /api/v1/chatbot/batch-docs</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chatbot Widget */}
      <ChatbotUI />
    </div>
  );
};

export default ChatbotShowcase;
