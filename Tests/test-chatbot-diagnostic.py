#!/usr/bin/env python3
"""
Enhanced Chatbot Integration Diagnostic Test
More detailed testing and debugging for chatbot route mounting
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:4000"
API_BASE = f"{BASE_URL}/api/v1"
CHATBOT_URL = f"{API_BASE}/chatbot"

print("=" * 80)
print("🔍 CHATBOT INTEGRATION DIAGNOSTIC TEST")
print("=" * 80)
print(f"Base URL: {BASE_URL}")
print(f"API Base: {API_BASE}")
print(f"ChatBot URL: {CHATBOT_URL}")
print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 80)
print()

results = {
    "timestamp": datetime.now().isoformat(),
    "routing_checks": {},
    "chatbot_checks": {},
    "issues_found": [],
    "summary": {}
}

# Test 1: Root endpoint
print("\n1️⃣ Testing Root Endpoint")
print("-" * 80)
try:
    response = requests.get(f"{BASE_URL}/", timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    results["routing_checks"]["root"] = {"status": response.status_code, "success": response.status_code == 200}
except Exception as e:
    print(f"Error: {e}")
    results["routing_checks"]["root"] = {"status": "error", "error": str(e)}
    results["issues_found"].append("Cannot connect to server at root endpoint")

# Test 2: API v1 base
print("\n2️⃣ Testing API v1 Base Endpoint")
print("-" * 80)
try:
    response = requests.get(f"{API_BASE}/", timeout=5)
    print(f"Status: {response.status_code}")
    if response.status_code != 404:
        print(f"Response: {response.json()}")
    else:
        print("(404 - No specific endpoint at /api/v1)")
    results["routing_checks"]["api_v1_base"] = {"status": response.status_code}
except Exception as e:
    print(f"Error: {e}")
    results["routing_checks"]["api_v1_base"] = {"status": "error", "error": str(e)}

# Test 3: Existing courses endpoint (should work)
print("\n3️⃣ Testing Existing Courses Endpoint (Reference)")
print("-" * 80)
try:
    response = requests.get(f"{API_BASE}/course/getAllCourses", timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response length: {len(response.text)} chars")
    results["routing_checks"]["courses_endpoint"] = {"status": response.status_code, "success": response.status_code == 200}
    if response.status_code == 200:
        print("✅ Working API route confirmed")
except Exception as e:
    print(f"Error: {e}")
    results["routing_checks"]["courses_endpoint"] = {"status": "error", "error": str(e)}

# Test 4: Chatbot base path
print("\n4️⃣ Testing ChatBot Base Path")
print("-" * 80)
try:
    response = requests.get(f"{CHATBOT_URL}/", timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    results["chatbot_checks"]["base_path"] = {"status": response.status_code}
except Exception as e:
    print(f"Error: {e}")
    results["chatbot_checks"]["base_path"] = {"status": "error", "error": str(e)}

# Test 5: Chatbot health endpoint
print("\n5️⃣ Testing ChatBot Health Endpoint")
print("-" * 80)
try:
    response = requests.get(f"{CHATBOT_URL}/health", timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    results["chatbot_checks"]["health"] = {"status": response.status_code, "success": response.status_code == 200}
    if response.status_code != 200:
        results["issues_found"].append(f"ChatBot health endpoint returned {response.status_code}")
except Exception as e:
    print(f"Error: {e}")
    results["chatbot_checks"]["health"] = {"status": "error", "error": str(e)}
    results["issues_found"].append(f"ChatBot health endpoint error: {str(e)}")

# Test 6: Chatbot status endpoint
print("\n6️⃣ Testing ChatBot Status Endpoint")
print("-" * 80)
try:
    response = requests.get(f"{CHATBOT_URL}/status", timeout=5)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    results["chatbot_checks"]["status"] = {"status": response.status_code, "success": response.status_code == 200}
except Exception as e:
    print(f"Error: {e}")
    results["chatbot_checks"]["status"] = {"status": "error", "error": str(e)}

# Test 7: POST chat endpoint
print("\n7️⃣ Testing ChatBot Chat POST Endpoint")
print("-" * 80)
try:
    response = requests.post(
        f"{CHATBOT_URL}/chat",
        json={"message": "Hello", "conversationId": "test-001"},
        timeout=5
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    results["chatbot_checks"]["chat"] = {"status": response.status_code, "success": response.status_code == 200}
except Exception as e:
    print(f"Error: {e}")
    results["chatbot_checks"]["chat"] = {"status": "error", "error": str(e)}

# Test 8: Check all mounted routes (try common patterns)
print("\n8️⃣ Testing Route Mounting Patterns")
print("-" * 80)
test_paths = [
    f"{API_BASE}/chatbot",
    f"{API_BASE}/chatbot/",
    f"{API_BASE}/chatbot/health",
    f"{BASE_URL}/api/chatbot",
    f"{BASE_URL}/api/chatbot/",
    f"{BASE_URL}/api/chatbot/health",
]

for path in test_paths:
    try:
        response = requests.get(path, timeout=2)
        status = "✅" if response.status_code < 400 else "❌"
        print(f"{status} {path}: {response.status_code}")
    except Exception as e:
        print(f"❌ {path}: {str(e)[:50]}")

# Summary
print("\n" + "=" * 80)
print("📊 DIAGNOSTIC SUMMARY")
print("=" * 80)

if results["issues_found"]:
    print(f"\n⚠️  Issues Found ({len(results['issues_found'])}):")
    for i, issue in enumerate(results["issues_found"], 1):
        print(f"  {i}. {issue}")
else:
    print("\n✅ No issues detected")

# Save results
with open("test-chatbot-diagnostic.json", "w") as f:
    json.dump(results, f, indent=2)

print("\n📄 Results saved to: test-chatbot-diagnostic.json")
print(f"Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 80)
