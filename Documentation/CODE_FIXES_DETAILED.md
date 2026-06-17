# StudyNotion - Code Fixes Required

## FIX #1: Remove OTP from Response
**File**: `server/controllers/Auth.js`  
**Line**: ~223  
**Severity**: 🔴 CRITICAL - Security Vulnerability

### Current Code (WRONG):
```javascript
exports.sendotp = async (req, res) => {
	try {
		const { email } = req.body;
		
		// ... OTP generation code ...
		
		const otpPayload = { email, otp };
		const otpBody = await OTP.create(otpPayload);
		console.log("OTP Body", otpBody);
		res.status(200).json({
			success: true,
			message: `OTP Sent Successfully`,
			otp,  // ❌ THIS IS THE SECURITY BUG - OTP should NOT be in response
		});
	} catch (error) {
		console.log("Error in sendotp: ", error.message);
		return res.status(500).json({ 
			success: false, 
			message: "Failed to send OTP. Please try again.",
			error: error.message 
		});
	}
};
```

### Fixed Code (CORRECT):
```javascript
exports.sendotp = async (req, res) => {
	try {
		const { email } = req.body;
		
		// ... OTP generation code ...
		
		const otpPayload = { email, otp };
		const otpBody = await OTP.create(otpPayload);
		console.log("OTP Body", otpBody);
		res.status(200).json({
			success: true,
			message: `OTP Sent Successfully`,
			// ✅ OTP removed - user must get it from email
		});
	} catch (error) {
		console.log("Error in sendotp: ", error.message);
		return res.status(500).json({ 
			success: false, 
			message: "Failed to send OTP. Please try again.",
			error: error.message 
		});
	}
};
```

---

## FIX #2: Fix Auth Middleware Null Reference
**File**: `server/middlewares/auth.js`  
**Line**: 13  
**Severity**: 🔴 CRITICAL - Runtime Crash

### Current Code (WRONG):
```javascript
exports.auth = async (req, res, next) => {
    try{
        console.log("BEFORE ToKEN EXTRACTION");
        
        // ❌ PROBLEM: If no Authorization header, req.header() returns undefined
        // Then calling .replace() on undefined crashes
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorization").replace("Bearer ", "");
        
        console.log("AFTER ToKEN EXTRACTION");

        if(!token) {
            return res.status(401).json({
                success:false,
                message:'TOken is missing',
            });
        }

        // ... rest of code ...
    }
    catch(error) {  
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
        });
    }
}
```

### Fixed Code (CORRECT):
```javascript
exports.auth = async (req, res, next) => {
    try{
        console.log("BEFORE ToKEN EXTRACTION");
        
        // ✅ FIXED: Using optional chaining (?.) prevents crash on undefined
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorization")?.replace("Bearer ", "");
        
        console.log("AFTER ToKEN EXTRACTION");

        if(!token) {
            return res.status(401).json({
                success:false,
                message:'Token is missing',
            });
        }

        // ... rest of code ...
    }
    catch(error) {  
        return res.status(401).json({
            success:false,
            message:'Something went wrong while validating the token',
        });
    }
}
```

**Explanation**: Optional chaining (`?.`) means "only call replace() if the header exists, otherwise return undefined"

---

## FIX #3: Fix Email Typo in Payment Enrollment
**File**: `server/controllers/Payments.js`  
**Line**: 131  
**Severity**: 🔴 CRITICAL - Runtime Crash

### Current Code (WRONG):
```javascript
const enrollStudents = async(courses, userId, res) => {

    if(!courses || !userId) {
        return res.status(400).json({success:false,message:"Please Provide data for Courses or UserId"});
    }

    for(const courseId of courses) {
        try{
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true},
            )

            if(!enrolledCourse) {
                return res.status(500).json({success:false,message:"Course not Found"});
            }

            const courseProgress = await CourseProgress.create({
                courseID:courseId,
                userId:userId,
                completedVideos: [],
            })

            // ✅ This is correct - enrolledStudent object
            const enrolledStudent = await User.findByIdAndUpdate(userId,
                {$push:{
                    courses: courseId,
                    courseProgress: courseProgress._id,
                }},{new:true})
            
            // ❌ BUG: Using "enrollStudents" (the function name) instead of "enrolledStudent" (the object)
            const emailResponse = await mailSender(
                enrollStudents.email,  // ❌ WRONG! enrollStudents is a function
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
            )    
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }
}
```

### Fixed Code (CORRECT):
```javascript
const enrollStudents = async(courses, userId, res) => {

    if(!courses || !userId) {
        return res.status(400).json({success:false,message:"Please Provide data for Courses or UserId"});
    }

    for(const courseId of courses) {
        try{
            const enrolledCourse = await Course.findOneAndUpdate(
                {_id:courseId},
                {$push:{studentsEnrolled:userId}},
                {new:true},
            )

            if(!enrolledCourse) {
                return res.status(500).json({success:false,message:"Course not Found"});
            }

            const courseProgress = await CourseProgress.create({
                courseID:courseId,
                userId:userId,
                completedVideos: [],
            })

            const enrolledStudent = await User.findByIdAndUpdate(userId,
                {$push:{
                    courses: courseId,
                    courseProgress: courseProgress._id,
                }},{new:true})
            
            // ✅ FIXED: Using "enrolledStudent" (the student object)
            const emailResponse = await mailSender(
                enrolledStudent.email,  // ✅ CORRECT! enrolledStudent is the user object
                `Successfully Enrolled into ${enrolledCourse.courseName}`,
                courseEnrollmentEmail(enrolledCourse.courseName, `${enrolledStudent.firstName}`)
            )    
        }
        catch(error) {
            console.log(error);
            return res.status(500).json({success:false, message:error.message});
        }
    }
}
```

---

## FIX #4: Fix Course Instructor Lookup
**File**: `server/controllers/Course.js`  
**Line**: 48  
**Severity**: ⚠️⚠️ HIGH - Logic Error

### Current Code (WRONG):
```javascript
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id

    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body
    
    const thumbnail = req.files.thumbnailImage

    const tag = JSON.parse(_tag)
    const instructions = JSON.parse(_instructions)

    console.log("tag", tag)
    console.log("instructions", instructions)

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }
    
    if (!status || status === undefined) {
      status = "Draft"
    }
    
    // ❌ WRONG: Second parameter is NOT a query filter, it's the options parameter
    // This code will always return null
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    })

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      })
    }

    // ... rest of code ...
  } catch (error) {
    // ... error handling ...
  }
}
```

### Fixed Code (CORRECT):
```javascript
exports.createCourse = async (req, res) => {
  try {
    const userId = req.user.id

    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body
    
    const thumbnail = req.files.thumbnailImage

    const tag = JSON.parse(_tag)
    const instructions = JSON.parse(_instructions)

    console.log("tag", tag)
    console.log("instructions", instructions)

    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }
    
    if (!status || status === undefined) {
      status = "Draft"
    }
    
    // ✅ CORRECT: First find the user, then check if they're an instructor
    const instructorDetails = await User.findById(userId)

    if (!instructorDetails || instructorDetails.accountType !== "Instructor") {
      return res.status(404).json({
        success: false,
        message: "Only Instructors can create courses. You are not an Instructor.",
      })
    }

    // ... rest of code ...
  } catch (error) {
    // ... error handling ...
  }
}
```

**Explanation**: 
- `User.findById(id, options)` - Second param is Mongoose options like `{ lean: true }`
- Not a query filter! To filter by `accountType`, you must fetch first then check the property

---

## Credentials to Regenerate

### 1. Gmail App Password
1. Go to https://myaccount.google.com
2. Click "Security" in left sidebar
3. Scroll to "App passwords"
4. Generate new app password for Gmail
5. Copy and paste into `server/.env` → `MAIL_PASS`

### 2. Razorpay Keys
1. Go to https://dashboard.razorpay.com
2. Click Settings → API Keys
3. Regenerate Test Keys (and Live later)
4. Copy Key ID and Secret
5. Update `server/.env`:
   - `RAZORPAY_KEY` = Key ID
   - `RAZORPAY_SECRET` = Secret

### 3. Cloudinary API Secret
1. Go to https://cloudinary.com/console/
2. Click Settings → Account
3. Copy API Key and API Secret
4. Update `server/.env`:
   - `API_KEY` = Your Cloudinary API Key
   - `API_SECRET` = Your API Secret

---

## How to Apply These Fixes

### Option 1: Manual Edit (Recommended for learning)
1. Open each file mentioned
2. Find the line numbers
3. Replace the code exactly as shown

### Option 2: Automated (If tools available)
These files need editing:
- ✏️ `server/controllers/Auth.js` - Remove otp from response
- ✏️ `server/middlewares/auth.js` - Add optional chaining
- ✏️ `server/controllers/Payments.js` - Fix variable name
- ✏️ `server/controllers/Course.js` - Fix User.findById
- 🔄 `server/.env` - Update credentials

---

## Testing After Fixes

Once MongoDB is connected and code is fixed:

```bash
# Test OTP (should NOT return otp in response)
curl -X POST http://localhost:4000/api/v1/auth/sendotp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# Response should only have: {success: true, message: "OTP Sent Successfully"}

# Test protected route with missing header (should return token error, not crash)
curl http://localhost:4000/api/v1/profile/getUserDetails
# Should return: {success: false, message: "Token is missing"}

# Test protected route with proper token (should work)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:4000/api/v1/profile/getUserDetails
```

---

**All fixes are critical and should be applied BEFORE pushing to production.**
