const { getServices } = require("../chatbot/src/index");
const Course = require("../models/Course");
async function indexCourse(courseData) {
  try {
    const services = getServices();

    if (!services || !services.chatService) {
      return;
    }

    await services.chatService.addDocument({
      title: courseData.courseName,

      content: `
Course Name:
${courseData.courseName}

Instructor:
${courseData.instructor}

Category:
${courseData.category}

Description:
${courseData.description}

Instructions:
${courseData.instructions}

Learning Outcomes:
${courseData.whatYouWillLearn}

Price:
${courseData.price}
      `,

      metadata: {
        type: "course",
        courseId: courseData.courseId,
      },
    });

    console.log(
      "✅ AI indexed:",
      courseData.courseName
    );

  } catch (err) {
    console.log(
      "⚠ AI indexing failed:",
      err.message
    );
  }
}


async function rebuildCourseKnowledge() {
  try {
    const services = getServices();
    console.log(services);
    if (!services || !services.chatService) {
      console.log("AI services unavailable");
      return 0;
    }

    // Clear existing course knowledge
    services.searchService.clearCourseDocuments();

    // Load published courses
    const courses = await Course.find({
      status: "Published",
    })
      .populate("instructor")
      .populate("category");

    let count = 0;

    for (const course of courses) {
      await indexCourse({
        courseId: course._id.toString(),
        courseName: course.courseName,
        description: course.courseDescription,
        whatYouWillLearn: course.whatYouWillLearn,
        instructions: course.instructions,
        price: course.price,

        instructor:
          `${course.instructor.firstName} ${course.instructor.lastName}`,

        category:
          course.category?.name || "General",
      });

      count++;
    }

    console.log(
      `✅ Rebuilt ${count} published courses`
    );

    return count;

  } catch (err) {
    console.log(
      "❌ Course rebuild failed:",
      err.message
    );

    return 0;
  }
}

module.exports = {
  indexCourse, rebuildCourseKnowledge
};