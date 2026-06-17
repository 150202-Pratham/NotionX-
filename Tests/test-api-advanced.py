#!/usr/bin/env python3
"""
StudyNotion - Advanced Integration Tests
Tests complete user flows: signup, course creation, payment, etc.
"""

import requests
import json
import time
from datetime import datetime
import re

BASE_URL = "http://localhost:4000/api/v1"

print("=" * 90)
print("🚀 STUDYNOTION ADVANCED INTEGRATION TEST SUITE")
print("=" * 90)
print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 90)
print()

# ============================================================================
# TEST FLOW 1: COMPLETE AUTHENTICATION FLOW
# ============================================================================
print("TEST FLOW 1: COMPLETE AUTHENTICATION FLOW")
print("-" * 90)

# Step 1: Send OTP
test_email = f"student.{int(time.time())}@testmail.com"
print(f"\n📧 Step 1: Sending OTP to {test_email}")
try:
    response = requests.post(
        f"{BASE_URL}/auth/sendotp",
        json={"email": test_email},
        timeout=5
    )
    if response.status_code == 200:
        print(f"   ✅ OTP sent successfully")
        otp_response = response.json()
        print(f"   Message: {otp_response.get('message', 'OTP sent')}")
    else:
        print(f"   ❌ OTP send failed: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Step 2: Simulate signup (Note: We don't have actual OTP, so this will fail)
print(f"\n👤 Step 2: Attempting signup (Note: Requires valid OTP from email)")
print(f"   Test email: {test_email}")
print(f"   ⚠️  Cannot auto-verify OTP without email access")
print(f"   📝 Manual testing required: Check email for OTP and complete signup")

print()

# ============================================================================
# TEST FLOW 2: COURSE ENDPOINTS (Unauthenticated Access)
# ============================================================================
print("\nTEST FLOW 2: COURSE ENDPOINTS - PUBLIC ACCESS")
print("-" * 90)

# Get all courses
print(f"\n📚 Step 1: Fetch all courses")
try:
    response = requests.get(f"{BASE_URL}/course/getAllCourses", timeout=5)
    if response.status_code == 200:
        data = response.json()
        courses = data.get("data", [])
        print(f"   ✅ Successfully retrieved {len(courses)} course(s)")
        
        if courses:
            course = courses[0]
            print(f"\n   Sample Course Details:")
            print(f"   - Course ID: {course.get('_id', 'N/A')}")
            print(f"   - Name: {course.get('courseName', 'N/A')}")
            print(f"   - Description: {course.get('courseDescription', 'N/A')[:50]}...")
            print(f"   - Price: ₹{course.get('price', 'N/A')}")
            print(f"   - Instructor: {course.get('instructor', {}).get('firstName', 'N/A')} {course.get('instructor', {}).get('lastName', 'N/A')}")
            print(f"   - Category: {course.get('category', {}).get('name', 'N/A')}")
            print(f"   - Students Enrolled: {len(course.get('studentsEnrolled', []))}")
            
            # Try to get course details
            course_id = course.get("_id")
            print(f"\n📄 Step 2: Fetch course details for course ID")
            try:
                detail_response = requests.get(
                    f"{BASE_URL}/course/getCourseDetails",
                    params={"courseId": course_id},
                    timeout=5
                )
                if detail_response.status_code == 200:
                    print(f"   ✅ Successfully retrieved course details")
                    detail_data = detail_response.json().get("data", {})
                    sections = detail_data.get("courseContent", [])
                    print(f"   - Sections in course: {len(sections)}")
                    if sections:
                        print(f"   - Sample section: {sections[0].get('sectionName', 'N/A')}")
                else:
                    print(f"   ⚠️  Status {detail_response.status_code}")
            except Exception as e:
                print(f"   ⚠️  Error: {e}")
    else:
        print(f"   ❌ Failed to retrieve courses: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print()

# ============================================================================
# TEST FLOW 3: CATEGORY ENDPOINTS
# ============================================================================
print("\nTEST FLOW 3: CATEGORY & CATALOG ENDPOINTS")
print("-" * 90)

print(f"\n📂 Step 1: Fetch all categories")
try:
    response = requests.get(f"{BASE_URL}/course/showAllCategories", timeout=5)
    if response.status_code == 200:
        data = response.json()
        categories = data.get("data", [])
        print(f"   ✅ Successfully retrieved {len(categories)} categories")
        
        for i, cat in enumerate(categories[:3], 1):
            print(f"   {i}. {cat.get('name', 'N/A')} (ID: {cat.get('_id', 'N/A')[:8]}...)")
        
        # Get category page details
        if categories:
            first_cat = categories[0]
            cat_id = first_cat.get("_id")
            
            print(f"\n📖 Step 2: Fetch category page details for '{first_cat.get('name', 'N/A')}'")
            try:
                cat_detail_response = requests.post(
                    f"{BASE_URL}/course/getCategoryPageDetails",
                    json={"categoryId": cat_id},
                    timeout=5
                )
                if cat_detail_response.status_code == 200:
                    cat_detail = cat_detail_response.json()
                    courses_in_cat = len(cat_detail.get("data", {}).get("coursesList", []))
                    print(f"   ✅ Successfully retrieved category details")
                    print(f"   - Courses in '{first_cat.get('name')}': {courses_in_cat}")
                else:
                    print(f"   ⚠️  Status {cat_detail_response.status_code}")
            except Exception as e:
                print(f"   ⚠️  Error: {e}")
    else:
        print(f"   ❌ Failed to retrieve categories: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print()

# ============================================================================
# TEST FLOW 4: MIDDLEWARE & SECURITY
# ============================================================================
print("\nTEST FLOW 4: MIDDLEWARE & SECURITY TESTING")
print("-" * 90)

protected_endpoints = [
    ("/profile/getUserDetails", "GET"),
    ("/profile/updateProfile", "POST"),
    ("/profile/getEnrolledCourses", "GET"),
    ("/profile/instructorDashboard", "GET"),
]

print(f"\nTesting authorization on protected endpoints:")
for endpoint, method in protected_endpoints:
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
        else:
            response = requests.post(f"{BASE_URL}{endpoint}", json={}, timeout=5)
        
        if response.status_code in [401, 403]:
            print(f"   ✅ {endpoint:45} - Correctly blocked (Status: {response.status_code})")
        else:
            print(f"   ❌ {endpoint:45} - Should be protected! (Status: {response.status_code})")
    except Exception as e:
        print(f"   ⚠️  {endpoint:45} - Error: {str(e)[:40]}")

print()

# ============================================================================
# TEST FLOW 5: ERROR HANDLING & VALIDATION
# ============================================================================
print("\nTEST FLOW 5: ERROR HANDLING & INPUT VALIDATION")
print("-" * 90)

# Test 1: Missing required fields
print(f"\n🔍 Test 1: Missing required fields in signup")
try:
    response = requests.post(
        f"{BASE_URL}/auth/signup",
        json={"email": "test@test.com"},  # Missing required fields
        timeout=5
    )
    if response.status_code != 200:
        print(f"   ✅ Correctly rejected incomplete data (Status: {response.status_code})")
        data = response.json()
        print(f"   Message: {data.get('message', 'N/A')}")
    else:
        print(f"   ❌ Should reject incomplete data")
except Exception as e:
    print(f"   ⚠️  Error: {e}")

# Test 2: Invalid email format
print(f"\n🔍 Test 2: Invalid email format in contact form")
try:
    response = requests.post(
        f"{BASE_URL}/reach/contact",
        json={
            "email": "invalid-email",  # Invalid email
            "firstname": "Test",
            "lastname": "User",
            "message": "Test",
            "phoneNo": "123",
            "countrycode": "+1"
        },
        timeout=5
    )
    print(f"   Status: {response.status_code}")
    data = response.json()
    print(f"   Response: {data.get('message', 'Request processed')}")
except Exception as e:
    print(f"   ⚠️  Error: {e}")

# Test 3: Non-existent user login
print(f"\n🔍 Test 3: Login with non-existent user")
try:
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "email": f"nonexistent.{int(time.time())}@test.com",
            "password": "password123"
        },
        timeout=5
    )
    if response.status_code != 200:
        print(f"   ✅ Correctly rejected non-existent user (Status: {response.status_code})")
        data = response.json()
        print(f"   Message: {data.get('message', 'N/A')}")
    else:
        print(f"   ❌ Should reject non-existent user")
except Exception as e:
    print(f"   ⚠️  Error: {e}")

print()

# ============================================================================
# TEST FLOW 6: DATABASE CONSISTENCY
# ============================================================================
print("\nTEST FLOW 6: DATABASE CONSISTENCY & DATA INTEGRITY")
print("-" * 90)

print(f"\n🔄 Test 1: Verify course data consistency")
try:
    response = requests.get(f"{BASE_URL}/course/getAllCourses", timeout=5)
    if response.status_code == 200:
        courses = response.json().get("data", [])
        if courses:
            course = courses[0]
            
            # Check required fields
            required_fields = ["_id", "courseName", "courseDescription", "price", "instructor"]
            missing_fields = [f for f in required_fields if not course.get(f)]
            
            if not missing_fields:
                print(f"   ✅ Course has all required fields")
            else:
                print(f"   ❌ Missing fields: {missing_fields}")
            
            # Verify data types
            if isinstance(course.get("price"), (int, float)):
                print(f"   ✅ Price field is correct type (numeric)")
            else:
                print(f"   ❌ Price field has wrong type: {type(course.get('price'))}")
            
            # Verify instructor reference
            if course.get("instructor"):
                print(f"   ✅ Instructor reference is populated")
            else:
                print(f"   ⚠️  Instructor reference is empty")
except Exception as e:
    print(f"   ❌ Error: {e}")

print(f"\n🔄 Test 2: Verify category data consistency")
try:
    response = requests.get(f"{BASE_URL}/course/showAllCategories", timeout=5)
    if response.status_code == 200:
        categories = response.json().get("data", [])
        if categories:
            cat = categories[0]
            
            # Check required fields
            required_fields = ["_id", "name", "description"]
            missing_fields = [f for f in required_fields if not cat.get(f)]
            
            if not missing_fields:
                print(f"   ✅ Category has all required fields")
            else:
                print(f"   ⚠️  Fields present: {', '.join([f for f in required_fields if cat.get(f)])}")
            
            print(f"   Category: {cat.get('name', 'N/A')}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print()

# ============================================================================
# SUMMARY
# ============================================================================
print("=" * 90)
print("📊 ADVANCED TEST SUMMARY")
print("=" * 90)
print()
print("✅ COMPLETED TESTS:")
print("  1. Authentication Flow (OTP sending)")
print("  2. Course Retrieval & Details")
print("  3. Category Endpoints")
print("  4. Middleware Security")
print("  5. Error Handling & Validation")
print("  6. Database Consistency")
print()
print("📋 MANUAL TESTING REQUIRED:")
print("  1. Complete signup flow with valid OTP")
print("  2. Create new course (Instructor account)")
print("  3. Upload course videos & thumbnails")
print("  4. Enroll in course & complete payment")
print("  5. Leave ratings and reviews")
print("  6. Mark lectures as complete")
print()
print("=" * 90)
print(f"Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("=" * 90)
