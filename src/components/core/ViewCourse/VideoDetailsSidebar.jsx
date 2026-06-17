import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import IconBtn from '../../common/IconBtn';
import { HiOutlineChevronDown } from 'react-icons/hi';
import { AiOutlineCheck } from 'react-icons/ai';
import { MdClose } from 'react-icons/md';

const VideoDetailsSidebar = ({setReviewModal}) => {

    const [activeStatus, setActiveStatus] = useState("");
    const [videoBarActive, setVideoBarActive] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const {sectionId, subSectionId} = useParams();
    const {
        courseSectionData,
        courseEntireData,
        totalNoOfLectures,
        completedLectures,
    } = useSelector((state)=>state.viewCourse);

    useEffect(()=> {
        const setActiveFlags = () => {
            if(!courseSectionData.length)
                return;
            const currentSectionIndex = courseSectionData.findIndex(
                (data) => data._id === sectionId
            )
            const currentSubSectionIndex = courseSectionData?.[currentSectionIndex]?.subSection.findIndex(
                (data) => data._id === subSectionId
            )
            const activeSubSectionId = courseSectionData[currentSectionIndex]?.subSection?.[currentSubSectionIndex]?._id;
            setActiveStatus(courseSectionData?.[currentSectionIndex]?._id);
            setVideoBarActive(activeSubSectionId);
        }
        setActiveFlags();
    },[courseSectionData, courseEntireData, location.pathname])

    const handleAddReview = () => {
        setReviewModal(true);
    }

    const progressPercentage = totalNoOfLectures > 0 ? (completedLectures?.length / totalNoOfLectures) * 100 : 0;

  return (
    <>
        {/* Mobile Toggle Button */}
        <div className='lg:hidden fixed top-20 right-4 z-40'>
            <button 
                onClick={() => setMobileOpen(!mobileOpen)}
                className='bg-yellow-25 text-richblack-900 p-2 rounded-lg font-bold'
            >
                {mobileOpen ? <MdClose size={24} /> : '☰'}
            </button>
        </div>

        {/* Sidebar */}
        <div className={`fixed lg:static w-full lg:w-[320px] h-[calc(100vh-3.5rem)] bg-richblack-800 border-r border-richblack-600 overflow-y-auto transition-all duration-300 z-30
            ${mobileOpen ? 'left-0' : 'left-[-100%]'} lg:left-0 top-14`}>
            
            {/* Header Section */}
            <div className='sticky top-0 bg-richblack-800 border-b border-richblack-600 p-4 z-40'>
                {/* Back Button & Add Review */}
                <div className='flex gap-2 mb-4'>
                    <button 
                        onClick={()=> {
                            navigate("/dashboard/enrolled-courses")
                            setMobileOpen(false)
                        }}
                        className='flex-1 px-3 py-2 bg-richblack-700 hover:bg-richblack-600 rounded text-sm font-semibold text-richblack-5 transition'
                    >
                        ← Back
                    </button>
                    <IconBtn 
                        text="Review"
                        onclick={() => {
                            handleAddReview()
                            setMobileOpen(false)
                        }}
                        customClasses="text-sm"
                    />
                </div>

                {/* Course Title & Progress */}
                <div className='mb-4'>
                    <h2 className='text-lg font-bold text-richblack-5 line-clamp-2 mb-2'>{courseEntireData?.courseName}</h2>
                    
                    {/* Progress Bar */}
                    <div className='mb-2'>
                        <div className='flex justify-between items-center mb-1'>
                            <span className='text-xs text-richblack-200'>Progress</span>
                            <span className='text-xs font-semibold text-yellow-25'>{completedLectures?.length}/{totalNoOfLectures}</span>
                        </div>
                        <div className='w-full h-2 bg-richblack-700 rounded-full overflow-hidden'>
                            <div 
                                className='h-full bg-yellow-25 rounded-full transition-all duration-300'
                                style={{width: `${progressPercentage}%`}}
                            ></div>
                        </div>
                    </div>
                    
                    <p className='text-xs text-richblack-300'>{Math.round(progressPercentage)}% Complete</p>
                </div>
            </div>

            {/* Sections & Subsections */}
            <div className='p-4 space-y-3'>
                {courseSectionData.map((course, index)=> (
                    <div key={index} className='bg-richblack-700 rounded-lg overflow-hidden hover:bg-richblack-600 transition'>
                        {/* Section Header */}
                        <button
                            onClick={() => setActiveStatus(activeStatus === course?._id ? "" : course?._id)}
                            className='w-full flex items-center justify-between p-4 hover:bg-richblack-600 transition'
                        >
                            <div className='flex items-center gap-3 flex-1'>
                                <HiOutlineChevronDown 
                                    size={20}
                                    className={`text-yellow-25 transition-transform ${activeStatus === course?._id ? 'rotate-180' : ''}`}
                                />
                                <span className='text-sm font-semibold text-richblack-5 text-left'>{course?.sectionName}</span>
                            </div>
                            <span className='text-xs bg-richblack-900 text-yellow-25 px-2 py-1 rounded font-semibold'>
                                {course?.subSection?.length}
                            </span>
                        </button>

                        {/* Subsections */}
                        {activeStatus === course?._id && (
                            <div className='bg-richblack-900 border-t border-richblack-600 max-h-96 overflow-y-auto'>
                                {course.subSection.map((topic, topicIndex) => {
                                    const isCompleted = completedLectures.includes(topic._id);
                                    const isActive = videoBarActive === topic._id;
                                    
                                    return (
                                        <button
                                            key={topicIndex}
                                            onClick={() => {
                                                navigate(`/view-course/${courseEntireData?._id}/section/${course?._id}/sub-section/${topic?._id}`);
                                                setVideoBarActive(topic?._id);
                                                setMobileOpen(false);
                                            }}
                                            className={`w-full flex items-center gap-3 p-3 text-left border-b border-richblack-700 last:border-0 transition
                                                ${isActive ? 'bg-yellow-25 text-richblack-900' : 'bg-richblack-900 text-richblack-5 hover:bg-richblack-800'}
                                            `}
                                        >
                                            {/* Checkbox/Check Icon */}
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                                                ${isCompleted ? 'bg-caribbeangreen-300 border-caribbeangreen-300' : 'border-richblack-300'}
                                            `}>
                                                {isCompleted && <AiOutlineCheck size={16} className='text-richblack-900' />}
                                            </div>
                                            
                                            {/* Video Title */}
                                            <span className='text-sm font-medium line-clamp-2'>{topic.title}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </>
  )
}

export default VideoDetailsSidebar
