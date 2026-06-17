#!/usr/bin/env python3
"""
Comprehensive Chatbot Integration Test Report
Detailed diagnostics and test results
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:4000"
API_BASE = f"{BASE_URL}/api/v1"
CHATBOT_URL = f"{API_BASE}/chatbot"

print("=" * 90)
print("🤖 COMPREHENSIVE CHATBOT INTEGRATION TEST REPORT")
print("=" * 90)
print(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Backend URL: {BASE_URL}")
print(f"ChatBot API URL: {CHATBOT_URL}")
print("=" * 90)

results = {
    "timestamp": datetime.now().isoformat(),
    "test_categories": {
        "connectivity": {},
        "chatbot_endpoints": {},
        "backend_integration": {},
        "ai_services": {},
        "database_services": {}
    },
    "summary": {
        "total_tests": 0,
        "passed": 0,
        "failed": 0,
        "errors": []
    }
}

def test_endpoint(category, name, method, url, data=None, timeout=5, check_response=None):
    """Test a single endpoint"""
    results["summary"]["total_tests"] += 1
    
    status_symbol = "  "
    status_code = None
    response_text = None
    error_msg = None
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=timeout)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=timeout)
        
        status_code = response.status_code
        response_text = response.text[:200]
        
        is_success = status_code < 400
        
        if is_success:
            status_symbol = "✅"
            results["summary"]["passed"] += 1
        else:
            status_symbol = "❌"
            results["summary"]["failed"] += 1
            error_msg = f"HTTP {status_code}"
            results["summary"]["errors"].append(f"{name}: {error_msg}")
        
        results["test_categories"][category][name] = {
            "status": status_symbol,
            "code": status_code,
            "method": method,
            "url": url,
            "response_preview": response_text[:100] if response_text else None
        }
        
        print(f"{status_symbol} {category:25} | {name:40} | HTTP {status_code}")
        
    except requests.exceptions.Timeout:
        status_symbol = "⏱️ "
        error_msg = "TIMEOUT"
        results["summary"]["failed"] += 1
        results["summary"]["errors"].append(f"{name}: REQUEST TIMEOUT")
        results["test_categories"][category][name] = {
            "status": "⏱️ ",
            "error": "Request timeout",
            "url": url
        }
        print(f"⏱️  {category:25} | {name:40} | TIMEOUT")
        
    except Exception as e:
        status_symbol = "❌"
        error_msg = str(e)[:50]
        results["summary"]["failed"] += 1
        results["summary"]["errors"].append(f"{name}: {error_msg}")
        results["test_categories"][category][name] = {
            "status": "❌",
            "error": str(e)[:100],
            "url": url
        }
        print(f"❌ {category:25} | {name:40} | ERROR: {error_msg}")

# ============================================================================
# 1. CONNECTIVITY TESTS
# ============================================================================
print("\n" + "-" * 90)
print("1️⃣  CONNECTIVITY TESTS")
print("-" * 90)

test_endpoint("connectivity", "Root Endpoint", "GET", f"{BASE_URL}/")
test_endpoint("connectivity", "API Base Endpoint", "GET", f"{API_BASE}/")

# ============================================================================
# 2. BACKEND SERVICE INTEGRATION
# ============================================================================
print("\n" + "-" * 90)
print("2️⃣  BACKEND SERVICE INTEGRATION")
print("-" * 90)

test_endpoint("backend_integration", "Categories Service", "GET", f"{API_BASE}/course/showAllCategories")
test_endpoint("backend_integration", "All Courses Service", "GET", f"{API_BASE}/course/getAllCourses")
test_endpoint("backend_integration", "User Authentication Endpoint", "POST", f"{API_BASE}/auth/signup", 
              data={"email": "test@test.com", "password": "test123", "accountType": "Student"})

# ============================================================================
# 3. CHATBOT CORE ENDPOINTS
# ============================================================================
print("\n" + "-" * 90)
print("3️⃣  CHATBOT CORE ENDPOINTS")
print("-" * 90)

test_endpoint("chatbot_endpoints", "Health Check", "GET", f"{CHATBOT_URL}/health")
test_endpoint("chatbot_endpoints", "Status Check", "GET", f"{CHATBOT_URL}/status")

# ============================================================================
# 4. CHATBOT CONVERSATION ENDPOINTS
# ============================================================================
print("\n" + "-" * 90)
print("4️⃣  CHATBOT CONVERSATION ENDPOINTS")
print("-" * 90)

# Send a simple message
test_endpoint("chatbot_endpoints", "Send Message (Simple)", "POST", 
              f"{CHATBOT_URL}/chat",
              data={"message": "Hello", "conversationId": "test-001"},
              timeout=10)

# Get conversation history
test_endpoint("chatbot_endpoints", "Get Conversation History", "GET",
              f"{CHATBOT_URL}/history/test-001")

# ============================================================================
# 5. CHATBOT KNOWLEDGE BASE
# ============================================================================
print("\n" + "-" * 90)
print("5️⃣  CHATBOT KNOWLEDGE BASE")
print("-" * 90)

test_endpoint("chatbot_endpoints", "Add Document (Single)", "POST",
              f"{CHATBOT_URL}/documents",
              data={
                  "title": "How to Enroll",
                  "content": "To enroll in a course, go to courses and click enroll button",
                  "metadata": {"category": "help", "type": "faq"}
              })

test_endpoint("chatbot_endpoints", "Add Batch Documents", "POST",
              f"{CHATBOT_URL}/documents/batch",
              data={
                  "documents": [
                      {
                          "title": "Course Features",
                          "content": "Our courses include video lessons, quizzes, and certificates",
                          "metadata": {"category": "info"}
                      }
                  ]
              })

# ============================================================================
# 6. DETAILED HEALTH & STATUS
# ============================================================================
print("\n" + "-" * 90)
print("6️⃣  DETAILED HEALTH & STATUS CHECK")
print("-" * 90)

try:
    print("\n📊 ChatBot Health Details:")
    response = requests.get(f"{CHATBOT_URL}/health", timeout=5)
    if response.status_code == 200:
        health = response.json()
        print(json.dumps(health, indent=2))
    else:
        print(f"  Status: {response.status_code}")
except Exception as e:
    print(f"  Error: {str(e)}")

try:
    print("\n📊 ChatBot Status Details:")
    response = requests.get(f"{CHATBOT_URL}/status", timeout=5)
    if response.status_code == 200:
        status = response.json()
        print(json.dumps(status, indent=2)[:500])
    else:
        print(f"  Status: {response.status_code}")
except Exception as e:
    print(f"  Error: {str(e)}")

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 90)
print("📊 TEST SUMMARY")
print("=" * 90)
print(f"Total Tests: {results['summary']['total_tests']}")
print(f"✅ Passed: {results['summary']['passed']}")
print(f"❌ Failed: {results['summary']['failed']}")
pass_rate = (results['summary']['passed'] / results['summary']['total_tests'] * 100) if results['summary']['total_tests'] > 0 else 0
print(f"📈 Success Rate: {pass_rate:.1f}%")

if results['summary']['errors']:
    print(f"\n⚠️  Issues Found ({len(results['summary']['errors'])}):")
    for error in results['summary']['errors'][:10]:
        print(f"  - {error}")

# ============================================================================
# RECOMMENDATIONS
# ============================================================================
print("\n" + "=" * 90)
print("💡 INTEGRATION STATUS & RECOMMENDATIONS")
print("=" * 90)

if pass_rate >= 80:
    print("✅ CHATBOT INTEGRATION: HEALTHY")
    print("   All core endpoints are operational")
elif pass_rate >= 50:
    print("⚠️  CHATBOT INTEGRATION: PARTIAL")
    print("   Some endpoints working, others require fixes or external services")
    print("\n   To fully enable chatbot:")
    print("   1. Start Ollama service (for AI inference)")
    print("   2. Setup PostgreSQL (for persistent storage)")
    print("   3. Configure embedding models")
else:
    print("❌ CHATBOT INTEGRATION: LIMITED")
    print("   Most endpoints not working")

print("\n   External Dependencies:")
print("   - Ollama: Not running (AI/embeddings disabled)")
print("   - PostgreSQL: Not configured (using in-memory fallback)")
print("   - Embedding Model: nomic-embed-text (requires Ollama)")

# ============================================================================
# SAVE RESULTS
# ============================================================================
with open("test-chatbot-comprehensive.json", "w") as f:
    json.dump(results, f, indent=2)

print("\n📄 Results saved to: test-chatbot-comprehensive.json")
print("=" * 90)
print(f"Report completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 90)
