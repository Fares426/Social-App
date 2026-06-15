import React, { useContext, useState, useRef } from 'react'
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CardHeader, Dropdown, DropdownTrigger } from "@heroui/react";
import { DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { HiDotsVertical } from "react-icons/hi";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { FaPhotoVideo } from "react-icons/fa";
import axios from 'axios';
import { AuthContext } from '../../Contexts/AuthContextProvider';
import { Slide, toast } from 'react-toastify';

export default function CardHeaderPart({ name, createdAt, photo, userIdCard, postId, cardType, cardCommentId, body, comment, currentImage ,onImageUpdate  }) {

  const { userId, token } = useContext(AuthContext)
  const queryClient = useQueryClient()

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editContent, setEditContent] = useState("")
  const [editImage, setEditImage] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const imageInputRef = useRef(null)

  // ── Delete ───────────────────────────────────────────────────────────────
  function handleDeleteCard() {
    if (cardType === "post") {
      return axios.delete(`https://route-posts.routemisr.com/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    if (cardType === "comment") {
      return axios.delete(`https://route-posts.routemisr.com/posts/${postId}/comments/${cardCommentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
  }

  const { isPending, mutate: handleDeleteMutation } = useMutation({
    mutationFn: handleDeleteCard,
    onSuccess: () => {
      if (cardType === "post") {
        queryClient.invalidateQueries({ queryKey: ["getPosts"], exact: true })
        toast.success('Post Deleted Successfully', {
          position: "top-center", autoClose: 2000, hideProgressBar: false,
          closeOnClick: true, pauseOnHover: true, draggable: true, theme: "colored", transition: Slide
        })
      }
      if (cardType === "comment") {
        queryClient.invalidateQueries({ queryKey: ["getPosts"] })
        queryClient.invalidateQueries({ queryKey: ["getPostComments"] })
        toast.success('Comment Deleted Successfully', {
          position: "top-center", autoClose: 2000, hideProgressBar: false,
          closeOnClick: true, pauseOnHover: true, draggable: true, theme: "colored", transition: Slide
        })
      }
    },
    onError: (error) => {
      toast.error(`${error.response?.data?.message || error.message}`, {
        position: "top-center", autoClose: 2000, hideProgressBar: false,
        closeOnClick: true, pauseOnHover: true, draggable: true, theme: "colored", transition: Slide
      })
    }
  })

  // ── Edit ─────────────────────────────────────────────────────────────────
  function handleEditCard() {
    if (cardType === "post") {
      const formData = new FormData()
      formData.append("body", editContent)
      if (editImage) {
        formData.append("image", editImage)
      }
      return axios.put(`https://route-posts.routemisr.com/posts/${postId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    }
    if (cardType === "comment") {
      return axios.put(`https://route-posts.routemisr.com/posts/${postId}/comments/${cardCommentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    }
  }

  const { isPending: isEditPending, mutate: handleEditMutation } = useMutation({
    mutationFn: handleEditCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getPosts"] })
      queryClient.invalidateQueries({ queryKey: ["getPostComments"] })

if (cardType === "post") {
    if (removeImage) {
      onImageUpdate(null)        // hide image visually
    } else if (previewImage) {
      onImageUpdate(previewImage) // show new image preview
    }
  }


      setIsEditModalOpen(false)
      setEditImage(null)
      setPreviewImage(null)
      setRemoveImage(false)
      toast.success(`${cardType === "post" ? "Post" : "Comment"} Updated Successfully`, {
        position: "top-center", autoClose: 2000, hideProgressBar: false,
        closeOnClick: true, pauseOnHover: true, draggable: true, theme: "colored", transition: Slide
      })
    },
    onError: (error) => {
      toast.error(`${error.response?.data?.message || error.message}`, {
        position: "top-center", autoClose: 2000, hideProgressBar: false,
        closeOnClick: true, pauseOnHover: true, draggable: true, theme: "colored", transition: Slide
      })
    }
  })

  return <>
    <CardHeader className="justify-between">
      <div className="flex justify-center gap-3 items-center">
        <img
          alt="User Photo"
          src={photo}
          onError={(e) => { e.target.src = "https://avatars.githubusercontent.com/u/86160567?s=200&v=4" }}
          className="w-11 h-11 rounded-full object-cover border border-gray-200"
        />
        <div className="flex flex-col">
          <p className="text-md">{name}</p>
          <p className="text-small text-default-500">{createdAt?.split("T")[0]}</p>
        </div>
      </div>

      <div>
        {userId === userIdCard ?
          <Dropdown isDisabled={isPending} className="min-w-fit">
            <DropdownTrigger>
              <Button variant="">
                <HiDotsVertical className="cursor-pointer" />
              </Button>
            </DropdownTrigger>

            <DropdownMenu aria-label="Static Actions">
              <DropdownItem
                key="edit"
                onClick={() => {
                  setEditContent(cardType === "post" ? body : comment)
                  setPreviewImage(cardType === "post" ? currentImage : null)
                  setRemoveImage(false)
                  setEditImage(null)
                  setIsEditModalOpen(true)
                }}
              >
                <div className="flex items-center gap-2">
                  <MdModeEdit />
                  <p>Edit {cardType === "post" ? "Post" : "Comment"}</p>
                </div>
              </DropdownItem>

              <DropdownItem onClick={handleDeleteMutation} key="delete" className="text-danger" color="danger">
                <div className="flex items-center gap-2">
                  <MdDelete />
                  <p>Delete {cardType === "comment" ? "Comment" : "Post"}</p>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          : ""}
      </div>
    </CardHeader>

    {/* ── Edit Modal ───────────────────────────────────────────────────────── */}
    {isEditModalOpen && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:px-4">
        <div className="bg-white sm:rounded-xl rounded-t-2xl shadow-2xl w-full sm:max-w-[500px] overflow-hidden">

          {/* Drag handle - mobile only */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-gray-300" />
          </div>

          {/* Header */}
          <div className="relative flex items-center justify-center py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Edit {cardType === "post" ? "Post" : "Comment"}
            </h2>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute cursor-pointer right-3 sm:right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg transition-colors"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="p-3 sm:p-4">

            {/* User info */}
            <div className="flex items-center gap-2.5 mb-3">
              <img
                src={photo}
                alt="avatar"
                onError={(e) => { e.target.src = "https://avatars.githubusercontent.com/u/86160567?s=200&v=4" }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
              />
              <p className="text-sm font-semibold text-gray-900">{name}</p>
            </div>

            {/* Textarea */}
            <textarea
              autoFocus
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder={`Edit your ${cardType}...`}
              className="w-full min-h-[100px] sm:min-h-[120px] text-gray-800 text-base sm:text-lg placeholder-gray-400 resize-none outline-none"
            />

            {/* Image section — posts only */}
            {cardType === "post" && (
              <>
                {previewImage && !removeImage && (
                  <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={previewImage}
                      alt="preview"
                      className="w-full max-h-[300px] object-cover"
                    />
                    <button
                      onClick={() => {
                        setRemoveImage(true)
                        setPreviewImage(null)
                        setEditImage(null)
                        if (imageInputRef.current) imageInputRef.current.value = ""
                      }}
                      className="absolute cursor-pointer top-2 right-2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white font-bold text-lg transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Add / Change image row */}
                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 mt-3">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">
                    {previewImage && !removeImage ? "Change image" : "Add image"}
                  </span>
                  <label className="cursor-pointer">
                    <FaPhotoVideo className="text-green-500 text-lg sm:text-xl hover:scale-110 transition-transform" />
                    <input
                      type="file"
                      ref={imageInputRef}
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0]
                        if (!file) return
                        setEditImage(file)
                        setPreviewImage(URL.createObjectURL(file))
                        setRemoveImage(false)
                      }}
                    />
                  </label>
                </div>
              </>
            )}

            {/* Save button */}
            <button
              disabled={isEditPending || !editContent.trim()}
              onClick={handleEditMutation}
              className="w-full cursor-pointer mt-3 bg-[#1877F2] hover:bg-[#166FE5] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors mb-1 sm:mb-0"
            >
              {isEditPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
}