import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useParams } from 'react-router-dom';
import { getFullDetailsOfCourse } from '../services/operations/courseDetailsAPI';
import { setCompletedLectures, setCourseSectionData, setEntireCourseData, setTotalNoOfLectures } from '../slices/viewCourseSlice';
import VideoDetailsSidebar from '../components/core/ViewCourse/VideoDetailsSidebar';
import CourseReviewModal from '../components/core/ViewCourse/CourseReviewModal';

const ViewCourse = () => {

    const [reviewModal, setReviewModal] = useState(false);
    const { courseId } = useParams();
    const { token } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const {
        courseEntireData,
        completedLectures,
        totalNoOfLectures,
    } = useSelector((state) => state.viewCourse);

    const progressPercentage =
        totalNoOfLectures === 0
            ? 0
            : Math.round(
                (completedLectures.length / totalNoOfLectures) * 100
            );


    useEffect(() => {
        const setCourseSpecificDetails = async () => {
            const courseData = await getFullDetailsOfCourse(courseId, token);
            dispatch(setCourseSectionData(courseData.courseDetails.courseContent));
            dispatch(setEntireCourseData(courseData.courseDetails));
            dispatch(setCompletedLectures(courseData.completedVideos));
            let lectures = 0;
            courseData?.courseDetails?.courseContent?.forEach((sec) => {
                lectures += sec.subSection.length
            })
            dispatch(setTotalNoOfLectures(lectures));
        }
        setCourseSpecificDetails();
    }, []);

    return (
        <>
            <div className='flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] bg-richblack-900'>
                {/* Sidebar - Fixed on Desktop, Mobile Toggle */}
                <div className='hidden lg:block'>
                    <VideoDetailsSidebar setReviewModal={setReviewModal} />
                </div>

                {/* Mobile Sidebar */}
                <div className='lg:hidden'>
                    <VideoDetailsSidebar setReviewModal={setReviewModal} />
                </div>


                {/* Main Video Area - Takes Remaining Space */}
                {/* <div className='flex-1 overflow-auto'>
                    <Outlet />
                </div> */}

                <div className='flex-1 overflow-auto p-4'>

                    <div className='mb-4 rounded-lg bg-richblack-800 p-4'>

                        <h1 className='text-2xl font-bold text-white'>
                            {courseEntireData?.courseName}
                        </h1>

                        <p className='mt-2 text-sm text-richblack-300'>
                            Progress : {progressPercentage}%
                        </p>

                        <div className='mt-2 h-2 w-full rounded-full bg-richblack-700'>

                            <div
                                className='h-2 rounded-full bg-yellow-50'
                                style={{
                                    width: `${progressPercentage}%`,
                                }}
                            />

                        </div>

                        <p className='mt-2 text-sm text-richblack-300'>
                            {completedLectures.length} / {totalNoOfLectures} Lectures Completed
                        </p>

                    </div>
                    <div className="mb-4 rounded-lg bg-richblack-800 p-4">

                        <h2 className="mb-3 text-xl font-semibold text-white">
                            🤖 NotionX AI
                        </h2>

                        <div className="flex flex-wrap gap-3">

                            <button className="rounded-md bg-yellow-50 px-4 py-2 text-richblack-900 font-semibold">
                                💬 Ask AI
                            </button>

                            <button className="rounded-md bg-richblack-700 px-4 py-2 text-white">
                                📝 Summarize
                            </button>

                            <button className="rounded-md bg-richblack-700 px-4 py-2 text-white">
                                🧠 Quiz Me
                            </button>

                            <button className="rounded-md bg-richblack-700 px-4 py-2 text-white">
                                📚 Key Points
                            </button>

                        </div>

                    </div>
                    <Outlet />

                </div>

                {/* Review Modal */}
                {reviewModal && <CourseReviewModal setReviewModal={setReviewModal} />}
            </div>
        </>
    )
}

export default ViewCourse
