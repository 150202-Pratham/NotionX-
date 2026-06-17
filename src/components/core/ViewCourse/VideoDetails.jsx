import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { markLectureAsComplete } from '../../../services/operations/courseDetailsAPI';
import { updateCompletedLectures } from '../../../slices/viewCourseSlice';
import { Player } from 'video-react';
import 'video-react/dist/video-react.css';
import {AiFillPlayCircle} from "react-icons/ai"
import IconBtn from '../../common/IconBtn';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const VideoDetails = () => {

  const {courseId, sectionId, subSectionId} = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const playerRef = useRef();
  const {token} = useSelector((state)=>state.auth);
  const {courseSectionData, courseEntireData, completedLectures} = useSelector((state)=>state.viewCourse);

  const [videoData, setVideoData] = useState([]);
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentSubSectionIndex, setCurrentSubSectionIndex] = useState(0);

  useEffect(()=> {
    const setVideoSpecificDetails = async() => {
        if(!courseSectionData.length)
            return;
        if(!courseId && !sectionId && !subSectionId) {
            navigate("/dashboard/enrolled-courses");
        }
        else {
            const filteredData = courseSectionData.filter(
                (course) => course._id === sectionId
            )
            const filteredVideoData = filteredData?.[0].subSection.filter(
                (data) => data._id === subSectionId
            )
            setVideoData(filteredVideoData[0]);
            setVideoEnded(false);
            
            const sIdx = courseSectionData.findIndex((c) => c._id === sectionId);
            const subIdx = courseSectionData[sIdx]?.subSection.findIndex((sub) => sub._id === subSectionId);
            setCurrentSectionIndex(sIdx);
            setCurrentSubSectionIndex(subIdx);
        }
    }
    setVideoSpecificDetails();
  },[courseSectionData, courseEntireData, location.pathname])

  const isFirstVideo = () => {
    return currentSectionIndex === 0 && currentSubSectionIndex === 0;
  } 

  const isLastVideo = () => {
    return currentSectionIndex === courseSectionData.length - 1 &&
        currentSubSectionIndex === courseSectionData[currentSectionIndex]?.subSection.length - 1;
  }

  const goToNextVideo = () => {
    if(currentSubSectionIndex !== courseSectionData[currentSectionIndex].subSection.length - 1) {
        const nextSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex + 1]._id;
        navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`)
    }
    else if(currentSectionIndex !== courseSectionData.length - 1) {
        const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
        const nextSubSectionId = courseSectionData[currentSectionIndex + 1].subSection[0]._id;
        navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`)
    }
  }

  const goToPrevVideo = () => {
    if(currentSubSectionIndex !== 0) {
        const prevSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex - 1]._id;
        navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`)
    }
    else if(currentSectionIndex !== 0) {
        const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;
        const prevSubSectionLength = courseSectionData[currentSectionIndex - 1].subSection.length;
        const prevSubSectionId = courseSectionData[currentSectionIndex - 1].subSection[prevSubSectionLength - 1]._id;
        navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`)
    }
  }

  const handleLectureCompletion = async() => {
    setLoading(true);
    const res = await markLectureAsComplete({courseId: courseId, subSectionId: subSectionId}, token);
    if(res) {
        dispatch(updateCompletedLectures(subSectionId)); 
    }
    setLoading(false);
  }

  return (
    <div className='flex flex-col w-full h-[calc(100vh-3.5rem)] bg-richblack-900'>
      {
        !videoData ? (
            <div className='flex items-center justify-center w-full h-full'>
                <div className='text-center'>
                    <p className='text-3xl font-bold text-richblack-5 mb-4'>No Video Found</p>
                    <button 
                        onClick={() => navigate("/dashboard/enrolled-courses")}
                        className='px-6 py-2 bg-yellow-25 text-richblack-900 font-bold rounded hover:scale-95 transition'
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        )
        : (
            <div className='flex flex-col h-full overflow-hidden'>
                {/* Video Player Section */}
                <div className='flex-1 bg-black flex items-center justify-center overflow-hidden'>
                    <div className='w-full h-full'>
                        <Player
                            ref={playerRef}
                            aspectRatio="16:9"
                            playsInline
                            onEnded={() => setVideoEnded(true)}
                            src={videoData?.videoUrl}
                        >
                            <AiFillPlayCircle />
                        </Player>
                    </div>
                </div>

                {/* Video Info & Controls Section */}
                <div className='bg-richblack-800 border-t border-richblack-700 px-6 py-6 overflow-y-auto flex-shrink-0'>
                    
                    {/* Video Title and Description */}
                    <div className='mb-6'>
                        <h1 className='text-2xl lg:text-3xl font-bold text-richblack-5 mb-2'>{videoData?.title}</h1>
                        <p className='text-richblack-300 text-sm lg:text-base line-clamp-2'>{videoData?.description || 'Learn from this lecture'}</p>
                    </div>

                    {/* Completion Status */}
                    <div className='mb-6 p-4 bg-richblack-700 rounded-lg'>
                        {!completedLectures?.includes(subSectionId) ? (
                            <p className='text-yellow-25 font-semibold flex items-center gap-2'>
                                <span className='w-3 h-3 bg-yellow-25 rounded-full'></span>
                                Mark this lecture as completed when you finish watching
                            </p>
                        ) : (
                            <p className='text-caribbeangreen-300 font-semibold flex items-center gap-2'>
                                <span className='w-3 h-3 bg-caribbeangreen-300 rounded-full'></span>
                                ✓ Lecture Completed!
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {videoEnded && (
                        <div className='flex flex-col lg:flex-row gap-3 mb-6'>
                            {!completedLectures?.includes(subSectionId) && (
                                <button
                                    disabled={loading}
                                    onClick={handleLectureCompletion}
                                    className={`flex-1 px-4 py-3 bg-yellow-25 text-richblack-900 font-bold rounded transition
                                        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-95'}`}
                                >
                                    {loading ? "Marking..." : "✓ Mark as Completed"}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    if(playerRef?.current) {
                                        playerRef.current?.seek(0);
                                        setVideoEnded(false);
                                    }
                                }}
                                className='flex-1 px-4 py-3 bg-richblack-600 hover:bg-richblack-500 text-richblack-5 font-bold rounded transition'
                            >
                                🔄 Rewatch Video
                            </button>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className='flex gap-3'>
                        <button
                            onClick={goToPrevVideo}
                            disabled={isFirstVideo()}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold rounded transition
                                ${isFirstVideo() 
                                    ? 'bg-richblack-600 text-richblack-400 cursor-not-allowed' 
                                    : 'bg-richblack-600 hover:bg-richblack-500 text-richblack-5'}`}
                        >
                            <FaChevronLeft /> Previous
                        </button>
                        <button
                            onClick={goToNextVideo}
                            disabled={isLastVideo()}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-bold rounded transition
                                ${isLastVideo() 
                                    ? 'bg-richblack-600 text-richblack-400 cursor-not-allowed' 
                                    : 'bg-richblack-600 hover:bg-richblack-500 text-richblack-5'}`}
                        >
                            Next <FaChevronRight />
                        </button>
                    </div>

                    {/* Course Progress Info */}
                    <div className='mt-6 pt-4 border-t border-richblack-600 text-center'>
                        <p className='text-xs lg:text-sm text-richblack-300'>
                            Course Progress: <span className='text-yellow-25 font-semibold'>{completedLectures?.length} lectures completed</span>
                        </p>
                    </div>
                </div>
            </div>
        )
      }
    </div>
  )
}

export default VideoDetails
//                             />

//                             <div>
//                                 {!isFirstVideo() && (
//                                     <button
//                                     disabled={loading}
//                                     onClick={goToPrevVideo}
//                                     className='blackButton'
//                                     >
//                                         Prev
//                                     </button>
//                                 )}
//                                 {!isLastVideo() && (
//                                     <button
//                                     disabled={loading}
//                                     onClick={goToNextVideo}
//                                     className='blackButton'>
//                                         Next
//                                     </button>
//                                 )}
//                             </div>
//                         </div>
//                     )
//                 }
//             </Player>
//         )
//       }
//       <h1>
//         {videoData?.title}
//       </h1>
//       <p>
//         {videoData?.description}
//       </p>
//     </div>
//   )
// }

// export default VideoDetails
