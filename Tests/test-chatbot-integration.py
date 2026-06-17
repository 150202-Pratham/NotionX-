#!/usr/bin/env python3
"""
ChatBot Integration Test Suite
Tests all chatbot endpoints integrated with StudyNotion backend
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:4000/api/v1"
CHATBOT_URL = f"{BASE_URL}/chatbot"

print("=" * 80)
print("🤖 STUDYNOTION CHATBOT INTEGRATION TEST SUITE")
print("=" * 80)
print(f"Base URL: {BASE_URL}")
print(f"Chatbot URL: {CHATBOT_URL}")
print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 80)
print()

test_results = {
    "timestamp": datetime.now().isoformat(),
    "services": {},
    "passed": 0,
    "failed": 0,
    "total": 0
}

def test_service(name, method, url, data=None, headers=None):
    """Test a single service endpoint"""
    global test_results
    test_results["total"] += 1
    
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print(f"Endpoint: {method} {url}")
    print("=" * 80)
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=5)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code in [200, 201]:
            try:
                response_data = response.json()
                print(f"Response: {json.dumps(response_data, indent=2)[:500]}...")
                print(f"✅ PASS - {name}")
                test_results["services"][name] = {"status": "✅ PASS", "code": response.status_code}
                test_results["passed"] += 1
                return True
            except:
                print(f"Response Text: {response.text[:500]}...")
                print(f"✅ PASS - {name}")
                test_results["services"][name] = {"status": "✅ PASS", "code": response.status_code}
                test_results["passed"] += 1
                return True
        else:
            print(f"Response: {response.text[:500]}...")
            print(f"❌ FAIL - {name}")
            test_results["services"][name] = {"status": "❌ FAIL", "code": response.status_code}
            test_results["failed"] += 1
            return False
            
    except Exception as e:
        print(f"Error: {str(e)}")
        print(f"❌ FAIL - {name}")
        test_results["services"][name] = {"status": "❌ FAIL", "error": str(e)}
        test_results["failed"] += 1
        return False

# ============================================================================
# TEST 1: ChatBot Health Check
# ============================================================================
print("\n1️⃣  TESTING CHATBOT HEALTH")
print("-" * 80)
test_service(
    "ChatBot Health Check",
    "GET",
    f"{CHATBOT_URL}/health"
)

# ============================================================================
# TEST 2: ChatBot Status
# ============================================================================
print("\n2️⃣  TESTING CHATBOT STATUS")
print("-" * 80)
test_service(
    "ChatBot Status",
    "GET",
    f"{CHATBOT_URL}/status"
)

# ============================================================================
# TEST 3: Send Chat Message
# ============================================================================
print("\n3️⃣  TESTING CHATBOT MESSAGE")
print("-" * 80)
test_service(
    "ChatBot Send Message",
    "POST",
    f"{CHATBOT_URL}/chat",
    data={
        "message": "How do I enroll in a course?",
        "conversationId": "test-conv-001"
    }
)

# ============================================================================
# TEST 4: Get Conversation History
# ============================================================================
print("\n4️⃣  TESTING CONVERSATION HISTORY")
print("-" * 80)
test_service(
    "Get Conversation History",
    "GET",
    f"{CHATBOT_URL}/history/test-conv-001"
)

# ============================================================================
# TEST 5: Add Document to Knowledge Base
# ============================================================================
print("\n5️⃣  TESTING ADD DOCUMENT")
print("-" * 80)
test_service(
    "Add Document to Knowledge Base",
    "POST",
    f"{CHATBOT_URL}/documents",
    data={
        "title": "How to Reset Password",
        "content": "To reset your password: 1. Click Forgot Password 2. Enter your email 3. Check for reset link 4. Set new password",
        "metadata": {
            "category": "help",
            "type": "faq",
            "priority": "high"
        }
    }
)

# ============================================================================
# TEST 6: Test Backend Services Integration
# ============================================================================
print("\n6️⃣  TESTING BACKEND SERVICES INTEGRATION")
print("-" * 80)

# Test 6a: Verify Server Health
test_service(
    "Backend Server Health",
    "GET",
    f"{BASE_URL}/../"
)

# Test 6b: Verify Database
test_service(
    "Database Connection (via Categories)",
    "GET",
    f"{BASE_URL}/course/showAllCategories"
)

# Test 6c: Verify Courses
test_service(
    "Courses Service",
    "GET",
    f"{BASE_URL}/course/getAllCourses"
)

# ============================================================================
# SUMMARY
# ============================================================================
print("\n" + "=" * 80)
print("📊 TEST SUMMARY")
print("=" * 80)
print(f"✅ PASSED: {test_results['passed']} services")
print(f"❌ FAILED: {test_results['failed']} services")
print(f"📈 TOTAL:  {test_results['total']} services")
print(f"📊 Success Rate: {(test_results['passed']/test_results['total']*100):.1f}%")
print("=" * 80)

# Detailed results
print("\n📋 DETAILED RESULTS:")
print("-" * 80)
for service, result in test_results["services"].items():
    status = result.get("status", "UNKNOWN")
    code = result.get("code", "N/A")
    print(f"{service:40} | {status:20} | Code: {code}")

# Save results
with open("test-chatbot-results.json", "w") as f:
    json.dump(test_results, f, indent=2)

print("\n📄 Results saved to: test-chatbot-results.json")
print(f"Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 80)

# Exit with appropriate code
exit(0 if test_results["failed"] == 0 else 1)
