# NotionX UML Class Diagram - Mermaid Code

## Usage
Copy and paste this code into [mermaid.live](https://mermaid.live) or any Mermaid-compatible editor to view/edit the diagram.

```mermaid
classDiagram
    class User {
        -id: String
        -firstName: String
        -lastName: String
        -email: String
        -password: String
        -accountType: Enum[Student|Instructor|Admin]
        -active: Boolean
        -approved: Boolean
        -approvedAt: DateTime
        -createdAt: DateTime
        -updatedAt: DateTime
        +register(): void
        +login(): JWT
        +updateProfile(): void
        +resetPassword(): void
        +logout(): void
    }

    class Profile {
        -id: String
        -userId: String
        -gender: String
        -dateOfBirth: Date
        -about: String
        -phoneNumber: String
        -profileImage: String
        -contactNumber: String
        -createdAt: DateTime
        -updatedAt: DateTime
        +updateProfile(): void
        +getProfileImage(): String
    }

    class Category {
        -id: String
        -name: String
        -description: String
        -createdAt: DateTime
        -updatedAt: DateTime
        +createCategory(): void
        +updateCategory(): void
        +deleteCategory(): void
        +getCoursesByCategory(): List~Course~
    }

    class Course {
        -id: String
        -instructorId: String
        -categoryId: String
        -courseName: String
        -courseDescription: String
        -thumbnail: String
        -price: Decimal
        -level: Enum[Beginner|Intermediate|Advanced]
        -duration: Integer
        -learningObjectives: String
        -courseStatus: Enum[Published|Draft|Archived]
        -enrollmentCount: Integer
        -averageRating: Double
        -createdAt: DateTime
        -updatedAt: DateTime
        +createCourse(): void
        +updateCourse(): void
        +publishCourse(): void
        +addSection(): void
        +getEnrollments(): List~Enrollment~
        +getRatings(): List~RatingAndReview~
        +calculateAverageRating(): Double
    }

    class Section {
        -id: String
        -courseId: String
        -sectionName: String
        -description: String
        -displayOrder: Integer
        -createdAt: DateTime
        -updatedAt: DateTime
        +createSection(): void
        +updateSection(): void
        +deleteSection(): void
        +addSubsection(): void
        +getSubsections(): List~SubSection~
    }

    class SubSection {
        -id: String
        -sectionId: String
        -title: String
        -description: String
        -videoUrl: String
        -videoDuration: Integer
        -displayOrder: Integer
        -createdAt: DateTime
        -updatedAt: DateTime
        +uploadVideo(): void
        +updateSubsection(): void
        +deleteSubsection(): void
    }

    class Enrollment {
        -id: String
        -userId: String
        -courseId: String
        -enrollmentDate: DateTime
        -status: Enum[Active|Completed|Dropped]
        -paymentStatus: Enum[Paid|Pending|Free]
        -completionPercentage: Double
        -certificateIssued: Boolean
        -certificateDate: DateTime
        -createdAt: DateTime
        -updatedAt: DateTime
        +enrollStudent(): void
        +updateEnrollmentStatus(): void
        +completeEnrollment(): void
        +dropCourse(): void
        +issueCertificate(): void
    }

    class Payment {
        -id: String
        -enrollmentId: String
        -userId: String
        -courseId: String
        -amount: Decimal
        -currency: String
        -paymentMethod: String
        -razorpayOrderId: String
        -razorpayPaymentId: String
        -razorpaySignature: String
        -paymentStatus: Enum[Successful|Failed|Pending]
        -paymentDate: DateTime
        -createdAt: DateTime
        -updatedAt: DateTime
        +createPaymentOrder(): void
        +verifyPayment(): Boolean
        +generateReceipt(): String
        +refundPayment(): void
    }

    class CourseProgress {
        -id: String
        -userId: String
        -courseId: String
        -lastAccessedAt: DateTime
        -completedLessons: Integer
        -totalLessons: Integer
        -completionPercentage: Double
        -timeSpent: Integer
        -updatedAt: DateTime
        +recordLessonView(): void
        +markLessonComplete(): void
        +calculateProgress(): Double
        +getProgressReport(): Report
    }

    class RatingAndReview {
        -id: String
        -courseId: String
        -userId: String
        -rating: Integer
        -review: String
        -helpfulCount: Integer
        -createdAt: DateTime
        -updatedAt: DateTime
        +submitReview(): void
        +updateReview(): void
        +deleteReview(): void
        +markHelpful(): void
    }

    class OTP {
        -id: String
        -email: String
        -otp: String
        -createdAt: DateTime
        -expiresAt: DateTime
        +generateOTP(): void
        +verifyOTP(): Boolean
        +expireOTP(): void
    }

    class ContactUs {
        -id: String
        -firstName: String
        -lastName: String
        -email: String
        -contactNumber: String
        -message: String
        -status: Enum[New|InProgress|Resolved]
        -response: String
        -createdAt: DateTime
        -resolvedAt: DateTime
        +submitContact(): void
        +updateStatus(): void
        +addResponse(): void
    }

    class AuthService {
        +register(user: User): void
        +login(email: String, password: String): JWT
        +verifyToken(token: String): Boolean
        +resetPassword(email: String): void
    }

    class EmailService {
        +sendEnrollmentEmail(enrollment: Enrollment): void
        +sendProgressEmail(progress: CourseProgress): void
        +sendPasswordResetEmail(user: User): void
        +sendPaymentReceipt(payment: Payment): void
    }

    class PaymentService {
        +createOrder(enrollment: Enrollment): Order
        +verifyPayment(paymentId: String): Boolean
        +processRefund(payment: Payment): void
    }

    class CloudinaryService {
        +uploadImage(file: File): String
        +uploadVideo(file: File): String
        +deleteAsset(assetId: String): void
    }

    %% Relationships
    User "1" --> "1" Profile : has
    User "1" --> "*" Course : creates_as_instructor
    User "1" --> "*" Enrollment : enrolls_in
    User "1" --> "*" Payment : makes
    User "1" --> "*" RatingAndReview : writes
    User "1" --> "*" CourseProgress : tracks

    Category "1" --> "*" Course : contains

    Course "1" --> "*" Section : composed_of
    Course "1" --> "*" Enrollment : has
    Course "1" --> "*" Payment : associated_with
    Course "1" --> "*" RatingAndReview : receives
    Course "1" --> "*" CourseProgress : tracks

    Section "1" --> "*" SubSection : contains

    Enrollment "1" --> "*" Payment : has
    Enrollment "1" --> "1" CourseProgress : generates

    RatingAndReview "1" --> "*" CourseProgress : informs

    AuthService -.-> User : uses
    EmailService -.-> Enrollment : notifies
    EmailService -.-> Payment : notifies
    PaymentService -.-> Payment : manages
    CloudinaryService -.-> Course : stores_media
    CloudinaryService -.-> SubSection : stores_video
```

---

## Class Summary

### Entity Classes (12)
1. **User** - Platform users (Student, Instructor, Admin)
2. **Profile** - Extended user profile information
3. **Category** - Course categories
4. **Course** - Main course entity
5. **Section** - Course sections/modules
6. **SubSection** - Lessons within sections
7. **Enrollment** - Student course enrollment
8. **Payment** - Payment transactions
9. **CourseProgress** - Student progress tracking
10. **RatingAndReview** - Course reviews and ratings
11. **OTP** - Email verification codes
12. **ContactUs** - Support/contact submissions

### Service Classes (4)
1. **AuthService** - Authentication & authorization
2. **EmailService** - Email notifications
3. **PaymentService** - Payment processing
4. **CloudinaryService** - Media management

---

## Relationship Types

- **One-to-One (1:1)**: Solid arrow with "1" on both ends
- **One-to-Many (1:*)**: Solid arrow with "1" and "*"
- **Dependency (-.->)**: Dashed arrow for service dependencies

---

## How to Use This Code

1. **Online Editor**: Visit [mermaid.live](https://mermaid.live) and paste the code
2. **GitHub**: Add to README.md files wrapped in Mermaid code blocks
3. **VS Code**: Use Mermaid extension to preview
4. **Documentation**: Include in technical documentation
5. **Export**: From mermaid.live, export as PNG, SVG, or PDF
