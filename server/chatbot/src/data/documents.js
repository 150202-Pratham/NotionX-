/**
 * Sample documents for NotionX knowledge base
 * These documents will be loaded into the system on startup
 */

const documents = [
  {
    title: 'What is NotionX?',
    content: `NotionX is an AI-integrated intelligent course management platform designed to modernize online education delivery. 
    It combines powerful course management tools with AI-driven personalization to create engaging learning experiences.
    The platform supports students, instructors, and administrators with comprehensive features for course creation, enrollment, 
    progress tracking, and payment processing.`,
    metadata: { category: 'overview', importance: 'high' },
  },
  {
    title: 'Course Creation and Management',
    content: `Instructors can easily create courses with NotionX's intuitive interface. Courses are organized into sections and subsections,
    allowing for structured content delivery. Each course can include videos, documents, images, and interactive materials.
    Instructors can set pricing, difficulty levels, and course descriptions. The platform supports both free and paid courses
    with automatic enrollment processing.`,
    metadata: { category: 'instructor-features', importance: 'high' },
  },
  {
    title: 'Student Enrollment and Progress Tracking',
    content: `Students can browse and enroll in courses through the course catalog. Once enrolled, they can access all course materials
    and track their progress through real-time completion percentages. The system tracks which lessons have been completed and
    provides insights into learning patterns. Students can view their enrollment history and see certificates upon course completion.`,
    metadata: { category: 'student-features', importance: 'high' },
  },
  {
    title: 'Payment Processing with Razorpay',
    content: `NotionX integrates with Razorpay for secure payment processing. The platform handles payment orders, verification,
    and automatic enrollment creation upon successful payment. All transactions are encrypted and PCI-compliant.
    Multiple payment methods are supported, and students receive automatic receipts and enrollment confirmations via email.`,
    metadata: { category: 'payments', importance: 'high' },
  },
  {
    title: 'AI-Powered Features',
    content: `NotionX includes AI-powered course recommendations based on student learning history and preferences.
    The platform uses machine learning to identify struggling learners and suggest personalized learning paths.
    AI features help optimize course content and identify areas for improvement based on student engagement metrics.`,
    metadata: { category: 'ai-features', importance: 'medium' },
  },
  {
    title: 'Rating and Review System',
    content: `Students can rate courses on a 5-star scale and provide detailed reviews. The platform calculates average ratings
    and displays them prominently to help other students make informed enrollment decisions. Instructors can view reviews
    and use feedback to improve their courses.`,
    metadata: { category: 'community', importance: 'medium' },
  },
  {
    title: 'Email Notifications',
    content: `NotionX sends automated email notifications for important events including course enrollment confirmations,
    progress milestone celebrations, password reset instructions, and course update announcements.
    These notifications keep students and instructors informed and engaged with the platform.`,
    metadata: { category: 'communication', importance: 'medium' },
  },
  {
    title: 'Admin Dashboard',
    content: `Administrators have access to a comprehensive dashboard for managing the entire platform.
    They can create and manage course categories, approve new courses, manage user accounts, view analytics,
    and perform content moderation. The admin panel provides insights into platform usage and performance.`,
    metadata: { category: 'admin-features', importance: 'high' },
  },
  {
    title: 'Security and Data Protection',
    content: `NotionX implements enterprise-grade security measures including JWT authentication, bcrypt password hashing,
    SSL/TLS encryption for data transmission, and secure database operations with parameterized queries.
    User data and payment information are protected with industry-standard security practices.`,
    metadata: { category: 'security', importance: 'high' },
  },
  {
    title: 'Platform Scalability',
    content: `NotionX is designed to scale with growing numbers of users and courses. The platform uses database connection pooling,
    horizontal scaling capabilities, and load balancing to handle peak traffic periods. Cloud-based infrastructure
    supports geographic scalability for global learner populations.`,
    metadata: { category: 'technical', importance: 'medium' },
  },
];

module.exports = documents;
