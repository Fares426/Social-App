import React, { useContext, useRef, useState } from "react";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { FaPhotoVideo } from "react-icons/fa";
import { MdEmojiEmotions } from "react-icons/md";
import { Slide, toast } from "react-toastify";

export default function CreatePost() {
  const { token } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null)
  const imageInput = useRef(null)
  const captionInput = useRef(null)
  const queryClient = useQueryClient()
  function getUserData() {
    return axios.get("https://route-posts.routemisr.com/users/profile-data", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  const { data } = useQuery({
    queryKey: ["UserInfoNavbar"],
    queryFn: getUserData,
  });
  
  const userPhoto = data?.data.data.user.photo;
  const userName = data?.data.data.user.name;

  function handleChangeImage(e){
    console.log(e.target.files[0]);
    console.log(URL.createObjectURL(e.target.files[0]));
    setPreviewImage(URL.createObjectURL(e.target.files[0]))
  }

  function handleCreatePost(){
    const postObj = new FormData()
    if (captionInput.current.value) {
        
        postObj.append("body" , captionInput.current.value)
    }
    if (imageInput.current.value) {
        
        postObj.append("image" , imageInput.current.files[0])
    }
    return axios.post("https://route-posts.routemisr.com/posts" , postObj , {
        headers:{
            Authorization:`Bearer ${token}`
        }
    } )
  }

  const {mutate , isPending , reset , error} = useMutation({
    mutationFn:handleCreatePost,
    onSuccess:function(){
      imageInput.current.value = ""
      reset()
      queryClient.invalidateQueries({queryKey:["getPosts"] , exact:true})
      setIsModalOpen(false)
      toast.success('Post Created Successfully', {
position: "top-center",
autoClose: 2000,
hideProgressBar: false,
closeOnClick: true, 
pauseOnHover: true,
draggable: true,
// progress: ,
theme: "colored",
transition: Slide,
});
    },
    onError:function(error){
        toast.error(`${ error.response?.data?.message || error.message}`, {
position: "top-center",
autoClose: 2000,
hideProgressBar: false,
closeOnClick: true,
pauseOnHover: true,
draggable: true,
// progress: ,
theme: "colored",
transition: Slide,
});
    }
  })

  return (
    <div className="w-full max-w-[680px] mx-auto bg-white sm:rounded-xl rounded-none shadow-none sm:shadow-sm border-x-0 sm:border border-y border-gray-200 p-3 sm:p-4">
      {/* Top row — avatar + input trigger */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Avatar */}
        <div className="shrink-0">
          {userPhoto ? (
            <img
              src={userPhoto}
              alt="avatar"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm">
              {userName?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>

        {/* Fake input */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex-1 text-left px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-200 rounded-full text-gray-500 text-sm sm:text-[15px] transition-colors cursor-pointer"
        >
          What's on your mind, {userName?.split(" ")[0] || "friend"}?
        </button>
      </div>

      {/* Bottom actions */}
      <div className="border-t border-gray-100 mt-3 pt-1.5 flex items-center justify-around">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-500 text-sm font-semibold w-full justify-center"
        >
          <FaPhotoVideo className="text-green-500 text-base sm:text-lg shrink-0" />
          <span className="text-xs sm:text-sm">Photo / Video</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:px-4">
          <div className="bg-white sm:rounded-xl rounded-t-2xl shadow-2xl w-full sm:max-w-[500px] overflow-hidden">
            {/* Drag handle — mobile only */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Modal header */}
            <div className="relative flex items-center justify-center py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                Create post
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute cursor-pointer right-3 sm:right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="p-3 sm:p-4">
              {/* User info */}
              <div className="flex items-center gap-2.5 mb-3">
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt="avatar"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-sm">
                    {userName?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {userName}
                  </p>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-md px-2 py-0.5 text-xs text-gray-600 font-medium w-fit">
                    🌍 Public
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                ref={captionInput}
                autoFocus
                placeholder={`What's on your mind, ${userName?.split(" ")[0] || "friend"}?`}
                className="w-full min-h-[100px] sm:min-h-[120px] text-gray-800 text-base sm:text-lg placeholder-gray-400 resize-none outline-none"
              />

              {previewImage && <div className="relative mt-2 rounded-xl overflow-hidden border border-gray-200">
                <img
                  src={previewImage}
                  alt="preview"
                  className="w-full max-h-[300px] object-cover"
                />
                <button
                  onClick={() => {
                    setPreviewImage(null)
                    imageInput.current.value = "" 
                    // setSelectedImage(null)
                  }}
                  className="absolute cursor-pointer top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white font-bold text-lg transition-colors"
                >
                  ×
                </button>
              </div> }

              {/* Add to post */}
              <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mt-2">
                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                  Add to your post
                </span>
                <div className="flex items-center gap-3">
                  {/* <button title="Photo/Video"  className="text-green-500 cursor-pointer text-lg sm:text-xl hover:scale-110 transition-transform">
                  </button> */}
                  <label>
                    <FaPhotoVideo className="text-green-500 cursor-pointer text-lg sm:text-xl hover:scale-110 transition-transform" />
                    <input type="file" ref={imageInput} hidden onChange={handleChangeImage} />
                  </label>
                </div>
              </div>

              {/* Post button */}
              <button disabled={isPending} onClick={mutate} className="w-full cursor-pointer mt-3 bg-[#1877F2] hover:bg-[#166FE5] active:bg-[#1464D2] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors mb-1 sm:mb-0">
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
