# StudyNotion - Comprehensive Testing Report

## Project Overview
- **Frontend**: React 18.2 + Redux + Tailwind CSS
- **Backend**: Node.js/Express
- **Database**: MongoDB Atlas
- **Services**: Authentication, Payments (Razorpay), Email (Nodemailer), File Upload (Cloudinary)

---

## 📋 Services to Test

### 1. **DATABASE CONNECTION**
- [ ] MongoDB connection test
- [ ] Connection string validation
- [ ] Timeout handling

### 2. **AUTHENTICATION SERVICE** (Auth.js)
**Endpoints**:
- POST `/api/v1/auth/sendotp` - Send OTP to email
- POST `/api/v1/auth/signup` - Register new user
- POST `/api/v1/auth/login` - Login user
- POST `/api/v1/auth/reset-password-token` - Request password reset
- POST `/api/v1/auth/reset-password` - Reset password
- POST `/api/v1/auth/changepassword` - Change password (authenticated)

**Test Cases**:
- [ ] Send OTP validation
- [ ] OTP verification
- [ ] User signup with valid data
- [ ] Signup with duplicate email
- [ ] Password mismatch handling
- [ ] Login with correct credentials
- [ ] Login with incorrect password
- [ ] Login with non-existent user
- [ ] Password reset flow
- [ ] JWT token generation

### 3. **PROFILE SERVICE** (Profile.js)
**Endpoints**:
- GET `/api/v1/profile/getUserDetails` - Get user profile
- GET `/api/v1/profile/getEnrolledCourses` - Get enrolled courses
- GET `/api/v1/profile/instructorDashboard` - Get instructor dashboard
- POST `/api/v1/profile/updateProfile` - Update user profile
- POST `/api/v1/profile/updateDisplayPicture` - Update profile picture
- DELETE `/api/v1/profile/deleteProfile` - Delete user account

**Test Cases**:
- [ ] Get user details (authenticated)
- [ ] Get enrolled courses list
- [ ] Update profile information
- [ ] Upload and update display picture
- [ ] Delete user account
- [ ] Unauthorized access attempt

### 4. **COURSE MANAGEMENT SERVICE** (Course.js, Section.js, Subsection.js)
**Endpoints**:
- POST `/api/v1/course/createCourse` - Create new course
- GET `/api/v1/course/getAllCourses` - Get all courses
- GET `/api/v1/course/getCourseDetails` - Get course details
- POST `/api/v1/course/addSection` - Add course section
- POST `/api/v1/course/addSubSection` - Add subsection
- POST `/api/v1/course/editCourse` - Edit course
- POST `/api/v1/course/updateSection` - Update section
- DELETE `/api/v1/course/deleteSection` - Delete section
- DELETE `/api/v1/course/deleteSubSection` - Delete subsection
- DELETE `/api/v1/course/deleteCourse` - Delete course
- GET `/api/v1/course/getInstructorCourses` - Get instructor's courses
- GET `/api/v1/course/showAllCategories` - Get categories
- GET `/api/v1/course/getCategoryPageDetails` - Get category details

**Test Cases**:
- [ ] Create course with valid data
- [ ] Create course without instructor privileges
- [ ] Missing required fields validation
- [ ] Upload course thumbnail (Cloudinary)
- [ ] Add section to course
- [ ] Add subsection with video upload
- [ ] Edit course information
- [ ] Update section content
- [ ] Delete section and subsections
- [ ] Delete entire course
- [ ] Get courses by category
- [ ] Verify course structure integrity

### 5. **PAYMENT SERVICE** (Payments.js)
**Endpoints**:
- POST `/api/v1/payment/capturePayment` - Initiate Razorpay order
- POST `/api/v1/payment/verifyPayment` - Verify and complete payment
- POST `/api/v1/payment/sendPaymentSuccessEmail` - Send payment success email

**Test Cases**:
- [ ] Initialize payment order with single course
- [ ] Initialize payment with multiple courses
- [ ] Razorpay order creation
- [ ] Payment verification with valid signature
- [ ] Payment verification with invalid signature
- [ ] Duplicate enrollment prevention
- [ ] Send enrollment confirmation email
- [ ] Update course enrollment list
- [ ] Create course progress tracking

### 6. **EMAIL SERVICE** (mailSender.js)
**Email Templates**:
- Email verification (signup)
- Password reset
- Payment success
- Course enrollment
- Contact form response

**Test Cases**:
- [ ] Email verification template
- [ ] Password reset email
- [ ] Payment success email
- [ ] Course enrollment email
- [ ] Contact form response email
- [ ] Verify email content and formatting
- [ ] Check email delivery

### 7. **RATING & REVIEW SERVICE** (RatingAndReview.js)
**Endpoints**:
- POST `/api/v1/course/createRating` - Create rating/review
- GET `/api/v1/course/getReviews` - Get course reviews

**Test Cases**:
- [ ] Create rating for completed course
- [ ] Create review with valid rating (1-5)
- [ ] Prevent rating for non-enrolled course
- [ ] Prevent duplicate ratings from same user
- [ ] Get all reviews for course
- [ ] Review pagination

### 8. **COURSE PROGRESS SERVICE** (courseProgress.js)
**Endpoints**:
- POST `/api/v1/course/updateCourseProgress` - Mark lecture as complete

**Test Cases**:
- [ ] Mark subsection as complete
- [ ] Calculate course progress percentage
- [ ] Prevent progress update for non-enrolled user
- [ ] Update progress tracking

### 9. **FILE UPLOAD SERVICE** (Cloudinary)
**Upload Types**:
- Course thumbnails
- Profile pictures
- Course video lectures

**Test Cases**:
- [ ] Upload image file
- [ ] Upload video file
- [ ] Verify upload validation
- [ ] Check file size limits
- [ ] Verify Cloudinary folder organization

### 10. **CONTACT FORM SERVICE** (ContactUs.js)
**Endpoints**:
- POST `/api/v1/reach/contact` - Submit contact form

**Test Cases**:
- [ ] Submit contact form with valid data
- [ ] Validate required fields
- [ ] Send response email
- [ ] Verify email content

### 11. **MIDDLEWARE & AUTHORIZATION**
**Components to Test**:
- Authentication middleware
- User verification
- Token validation
- Optional chaining fixes

**Test Cases**:
- [ ] Valid JWT token acceptance
- [ ] Invalid token rejection
- [ ] Missing token handling
- [ ] Expired token handling
- [ ] Verify middleware crash prevention

### 12. **CATEGORY SERVICE** (Category.js)
**Endpoints**:
- GET `/api/v1/course/showAllCategories` - Get all categories

**Test Cases**:
- [ ] Retrieve all categories
- [ ] Verify category structure

---

## 🔧 Environment Setup Status

### ✅ Configured
- MongoDB Atlas connection string
- Razorpay API keys (Test mode)
- Cloudinary API credentials
- Gmail SMTP (Nodemailer)
- JWT secret
- PORT: 4000

### 📝 Known Issues & Fixes Applied
1. ✅ OTP removed from signup response (security)
2. ✅ Auth middleware crash prevention (optional chaining)
3. ✅ Payment email variable fixed (enrolledStudent vs enrollStudents)
4. ✅ Course instructor lookup query fixed

---

## 🧪 Testing Sequence

1. **Basic Setup Tests**
   - Verify server starts
   - Test database connection
   - Check all required env variables

2. **API Health Checks**
   - Test root endpoint
   - Verify all routes are accessible
   - Check CORS configuration

3. **Authentication Flow**
   - OTP generation and verification
   - User signup and login
   - Password reset
   - JWT token validation

4. **Core Features**
   - Profile management
   - Course creation and management
   - Payment processing
   - Email notifications

5. **Advanced Features**
   - File uploads (Cloudinary)
   - Rating and reviews
   - Course progress tracking
   - Contact form

6. **Error Handling**
   - Invalid inputs
   - Missing required fields
   - Unauthorized access
   - Database connection issues

---

## 📊 Test Results

### Overall Status: ⏳ PENDING

| Service | Status | Notes |
|---------|--------|-------|
| Database Connection | ⏳ | |
| Authentication | ⏳ | |
| Profile | ⏳ | |
| Course Management | ⏳ | |
| Payments | ⏳ | |
| Email | ⏳ | |
| File Upload | ⏳ | |
| Contact Form | ⏳ | |
| Course Progress | ⏳ | |
| Ratings & Reviews | ⏳ | |
| Middleware | ⏳ | |

---

## 🚀 How to Run Tests

### Start Backend Server
```bash
cd d:\Coding\studyNotion16\studyNotion16
npm run dev
```

### Start Frontend
```bash
npm start
```

### Use Postman Collection
[Import the test endpoints into Postman to verify each service]

---

## 📅 Testing Timeline

- Started: [Current Date]
- In Progress: Database and API testing
- Complete: Will update as tests finish

---

**Last Updated**: April 28, 2026
