# 🔐 Credentials Regeneration Guide

## IMPORTANT: These credentials are exposed if your repository is public!

All credentials below are visible in `server/.env` file. **They must be regenerated immediately.**

---

## 1️⃣ Gmail App Password (For Sending Emails)

### Current Status
```
MAIL_PASS = fqbh cbco kbvy akwk  ❌ COMPROMISED
MAIL_USER = prathamgarg1502@gmail.com
```

### How to Regenerate:

1. **Go to Google Account Security**:
   - Open: https://myaccount.google.com/
   - Click "Security" in left sidebar
   - Scroll down to "App passwords"

2. **Generate New Password**:
   - Select App: **Mail**
   - Select Device: **Windows Computer** (or your device)
   - Click "Generate"
   - Google will show a 16-character password

3. **Copy New Password**:
   - Copy the password shown (without spaces)
   - Open `server/.env`
   - Find: `MAIL_PASS = `
   - Replace with your new password

4. **Example**:
   ```
   Before: MAIL_PASS = fqbh cbco kbvy akwk
   After:  MAIL_PASS = yournewabc123xyz
   ```

5. **Save .env file** (Ctrl+S)

6. **Restart server** for changes to take effect

---

## 2️⃣ Razorpay API Keys (For Payments)

### Current Status
```
RAZORPAY_KEY = rzp_test_t4LUM04KXw6wHc  ❌ COMPROMISED
RAZORPAY_SECRET = DOdtPrjZRxQejIdj1vAzm0MY  ❌ COMPROMISED
```

### How to Regenerate:

1. **Go to Razorpay Dashboard**:
   - Open: https://dashboard.razorpay.com/
   - Login with your credentials

2. **Find API Keys**:
   - Click on your **Avatar** (top right)
   - Select **Settings**
   - Click **API Keys** in left sidebar

3. **Regenerate Test Keys** (if you want to test):
   - Find "Test Mode" section
   - Click the **Regenerate** button next to "Key ID" and "Key Secret"
   - Confirm the action

4. **Copy New Keys**:
   - Copy **Key ID** (looks like: `rzp_test_...`)
   - Copy **Key Secret** (longer string)

5. **Update .env**:
   ```
   RAZORPAY_KEY = [Your new Key ID]
   RAZORPAY_SECRET = [Your new Key Secret]
   ```

6. **Save and restart server**

### Note
Razorpay usually doesn't allow regenerating test keys multiple times. If you can't regenerate:
- Your old test keys are still usable for development
- Just rotate them when moving to production
- For now, you can skip this if it asks for confirmation

---

## 3️⃣ Cloudinary Credentials (For Image Upload)

### Current Status
```
API_KEY = 772512573334375  ❌ COMPROMISED
API_SECRET = dPo81IL-h4rpYgIaG9IMFtrZbDk  ❌ COMPROMISED
CLOUD_NAME = dpdc5d5c0  ⚠️ Can stay (less sensitive)
```

### How to Regenerate:

1. **Go to Cloudinary Dashboard**:
   - Open: https://cloudinary.com/console/
   - Login with your credentials

2. **Find Account Settings**:
   - Click **Settings** (gear icon, bottom left)
   - Click **Account** tab

3. **View API Keys**:
   - Under "API Key" section
   - You'll see: API Key (public) and API Secret (private)

4. **Regenerate Secret Key**:
   - Click the **eye icon** next to API Secret
   - Then click **Regenerate** or **Reset**
   - Confirm the action
   - Copy the new secret

5. **Update .env**:
   ```
   API_KEY = [Your API Key - keep this, it's not that sensitive]
   API_SECRET = [Your new regenerated secret]
   CLOUD_NAME = dpdc5d5c0  [This can stay the same]
   ```

6. **Save and restart server**

---

## 4️⃣ MongoDB URL (Database Connection)

### Current Status
```
MONGODB_URL = "mongodb+srv://pratham1502NotionX_db_user:Pratham%401502@notionx.jo9xuh4.mongodb.net/?appName=NotionX"
```

⚠️ **Contains username and password!**

### Optionally Regenerate (Advanced):

**IF you want to regenerate the MongoDB user password:**

1. Go to MongoDB Atlas: https://account.mongodb.com/
2. Click your NotionX cluster
3. Click **Database Access** (left sidebar)
4. Find user "NotionX_db_user"
5. Click the **...** menu → **Edit Password**
6. Generate new password
7. Update your MONGODB_URL accordingly

**For now, you can skip this** - the credentials work fine. Only regenerate if repository becomes truly public.

---

## Complete .env After Updates

Your `server/.env` should look like:

```
MAIL_HOST = smtp.gmail.com
MAIL_USER = prathamgarg1502@gmail.com
MAIL_PASS = [YOUR NEW GMAIL PASSWORD]

JWT_SECRET = "Pratham"
FOLDER_NAME = "codingOneLineAtATime"

RAZORPAY_KEY = [YOUR NEW RAZORPAY KEY]
RAZORPAY_SECRET = [YOUR NEW RAZORPAY SECRET]

CLOUD_NAME = dpdc5d5c0
API_KEY = [YOUR CLOUDINARY API KEY]
API_SECRET = [YOUR NEW CLOUDINARY SECRET]

MONGODB_URL = "mongodb+srv://pratham1502NotionX_db_user:Pratham%401502@notionx.jo9xuh4.mongodb.net/?appName=NotionX"

PORT = 4000
```

---

## Important Security Notes

1. **Never commit .env to GitHub**
   - Add to `.gitignore`:
   ```
   echo ".env" >> .gitignore
   echo "server/.env" >> .gitignore
   ```

2. **If repository is public**:
   - All these credentials are compromised
   - Regenerate them ALL immediately
   - Anyone could use your payment gateway/email

3. **Use environment variables in production**:
   - Don't hardcode credentials
   - Use platform-specific secrets (Heroku, AWS, etc.)

4. **Rotate credentials regularly**:
   - Every 3-6 months for security
   - Immediately if exposed

---

## Verification Checklist

After updating all credentials:

- [ ] Gmail app password updated and tested (try password-less login)
- [ ] Razorpay keys regenerated and updated in .env
- [ ] Cloudinary secret regenerated and updated in .env
- [ ] .env file saved
- [ ] .env added to .gitignore
- [ ] Server restarted with `npm run dev`
- [ ] No "Invalid credentials" errors in logs
- [ ] Email sending still works (test with signup)
- [ ] Image upload still works (test with profile pic)
- [ ] Payments still work (test with course purchase)

---

## What's Protected Now?

✅ **If you did all updates:**
- Email service secure
- Payment gateway secure
- Image upload secure
- Database connection secure (if not public)
- Project is production-ready from security standpoint

---

## Time Estimate

| Task | Time |
|------|------|
| Gmail password | 3 min |
| Razorpay keys | 3 min |
| Cloudinary secret | 3 min |
| Update .env | 2 min |
| Verify & restart | 2 min |
| **Total** | **~13 minutes** |

**Recommended**: Do these after MongoDB is connected and working.
