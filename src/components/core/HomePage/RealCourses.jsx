import { useEffect, useState } from "react"
import { apiConnector } from "../../../services/apiconnector"
import { courseEndpoints } from "../../../services/apis"
import Course_Card from "../Catalog/Course_Card"

export default function RealCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const response = await apiConnector(
          "GET",
          courseEndpoints.GET_ALL_COURSE_API
        )
        if (response?.data?.success) {
          setCourses(response?.data?.data?.slice(0, 6))
        }
      } catch (error) {
        console.log("Error fetching courses:", error)
      }
      setLoading(false)
    }
    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className="grid min-h-[200px] place-items-center">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto box-content w-full max-w-maxContentTab px-4 py-12 lg:max-w-maxContent">
      <div className="text-4xl font-semibold text-center mb-10">
        Featured Courses
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {courses?.map((course, i) => (
          <Course_Card course={course} key={i} Height={"h-[400px]"} />
        ))}
      </div>
    </div>
  )
}
