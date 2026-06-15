import React, { useState, useContext, useEffect } from 'react'
import CardHeaderPart from '../CardHeaderPart/CardHeaderPart'
import { AuthContext } from '../../Contexts/AuthContextProvider'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { FaThumbsUp, FaRegThumbsUp } from 'react-icons/fa'
import { BiSolidSend } from 'react-icons/bi'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { Input } from '@heroui/react'
import { ClipLoader } from 'react-spinners'
import { Slide, toast } from 'react-toastify'

// ── LocalStorage helpers ───────────────────────────────────────────
function getLikedComments() {
  try { return JSON.parse(localStorage.getItem('likedComments') || '{}') }
  catch { return {} }
}

function setLikedComment(commentId, value) {
  const liked = getLikedComments()
  if (value) liked[commentId] = true
  else delete liked[commentId]
  localStorage.setItem('likedComments', JSON.stringify(liked))
}

function isCommentLikedLocally(commentId) {
  return !!getLikedComments()[commentId]
}
// ──────────────────────────────────────────────────────────────────

export default function CommentCard({ commentDetails, postId }) {
  const { content, createdAt, commentCreator, _id: commentId, post,
          likesCount: initialLikesCount = 0,
          repliesCount = 0 } = commentDetails
  const { name, photo, _id } = commentCreator || {}

  const resolvedPostId = postId || (typeof post === 'object' ? post?._id : post)

  const { token } = useContext(AuthContext)
  const queryClient = useQueryClient()

  // ── Like state — use localStorage as source of truth ──────────────
  const [isLiked, setIsLiked] = useState(() => isCommentLikedLocally(commentId))
  const [likesCount, setLikesCount] = useState(initialLikesCount)

  // ── Replies UI state ───────────────────────────────────────────────
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyInput, setShowReplyInput] = useState(false)

  // ── Like mutation ──────────────────────────────────────────────────
  const { mutate: toggleLike, isPending: isLikePending } = useMutation({
    mutationFn: () =>
      axios.put(
        `https://route-posts.routemisr.com/posts/${resolvedPostId}/comments/${commentId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    onMutate: () => {
      const newLiked = !isLiked
      setIsLiked(newLiked)
      setLikedComment(commentId, newLiked) // ← persist to localStorage
      setLikesCount(prev => newLiked ? prev + 1 : prev - 1)
    },
    onError: () => {
      const revert = !isLiked
      setIsLiked(revert)
      setLikedComment(commentId, revert)
      setLikesCount(prev => revert ? prev + 1 : prev - 1)
      toast.error('Failed to update like', { position: 'top-center', autoClose: 2000, theme: 'colored', transition: Slide })
    },
  })

  // ── Fetch replies ──────────────────────────────────────────────────
  const { data: repliesData, isLoading: isRepliesLoading } = useQuery({
    queryKey: ['getReplies', commentId],
    queryFn: () =>
      axios.get(
        `https://route-posts.routemisr.com/posts/${resolvedPostId}/comments/${commentId}/replies?page=1&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    enabled: !!resolvedPostId && !!commentId,
  })

  const replies = repliesData?.data?.data?.replies || []
  const actualRepliesCount = repliesData?.data?.meta?.pagination?.total ?? repliesCount

  // ── Create reply ───────────────────────────────────────────────────
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { content: '' },
  })

  const { mutate: createReply, isPending: isReplyPending } = useMutation({
    mutationFn: (data) => {
      const formData = new FormData()
      formData.append('content', data.content)
      return axios.post(
        `https://route-posts.routemisr.com/posts/${resolvedPostId}/comments/${commentId}/replies`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    },
    onSuccess: () => {
      reset()
      setShowReplies(true)
      queryClient.invalidateQueries({ queryKey: ['getReplies', commentId] })
      queryClient.invalidateQueries({ queryKey: ['getPosts'] })
      queryClient.invalidateQueries({ queryKey: ['getPostComments'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post reply', {
        position: 'top-center', autoClose: 2000, theme: 'colored', transition: Slide,
      })
    },
  })

  return (
    <div className="mt-2 ms-1.5 mb-1.5">

      {/* Comment bubble */}
      <div className="flex flex-col bg-gray-100 p-1 rounded relative">
        <CardHeaderPart
          comment={content}
          userIdCard={_id}
          cardCommentId={commentId}
          postId={resolvedPostId}
          createdAt={createdAt}
          name={name}
          photo={photo}
          cardType="comment"
        />
        <p className="ms-1.5 text-sm text-gray-800 pb-1">{content}</p>
      </div>

      {/* Action row — Like + Reply */}
      <div className="flex items-center gap-3 ms-2 mt-1">

        {/* Like */}
        <button
          onClick={() => toggleLike()}
          disabled={isLikePending}
          className={`flex items-center gap-1 text-xs font-semibold transition-colors
            ${isLiked ? 'text-[#1877F2]' : 'text-gray-500 hover:text-gray-700'}`}
        >
          {isLikePending
            ? <ClipLoader size={10} color={isLiked ? '#1877F2' : '#6b7280'} />
            : isLiked
              ? <FaThumbsUp className="text-xs" />
              : <FaRegThumbsUp className="text-xs" />}
          <span className='cursor-pointer'>{isLiked ? 'Liked' : 'Like'}</span>
          {likesCount > 0 && (
            <span className="text-gray-400 font-normal">· {likesCount}</span>
          )}
        </button>

        <span className="text-gray-300 text-xs">|</span>

        {/* Reply toggle */}
        <button
          onClick={() => setShowReplyInput(prev => !prev)}
          className="text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
        >
          Reply
        </button>

        {/* View replies toggle */}
        {actualRepliesCount > 0 && (
          <>
            <span className="text-gray-300 text-xs">|</span>
            <button
              onClick={() => setShowReplies(prev => !prev)}
              className="flex items-center gap-0.5 text-xs cursor-pointer font-semibold text-[#1877F2] hover:underline transition-colors"
            >
              {showReplies
                ? <><FiChevronUp size={12}  className='cursor-pointer'/> <span className='cursor-pointer'>Hide replies</span></>
                : <><FiChevronDown size={12} className='cursor-pointer' /> {actualRepliesCount} {actualRepliesCount === 1 ? 'reply' : 'replies'}</>}
            </button>
          </>
        )}
      </div>

      {/* Reply input */}
      {showReplyInput && (
        <div className="ms-4 mt-2">
          <form onSubmit={handleSubmit((data) => createReply(data))}>
            <Input
              {...register('content')}
              size="sm"
              placeholder="Write a reply..."
              endContent={
                <button
                  type="submit"
                  disabled={isReplyPending}
                  className="bg-[#1877F2] hover:bg-[#166FE5] p-1.5 rounded-full cursor-pointer text-white transition-colors disabled:opacity-60"
                >
                  {isReplyPending
                    ? <ClipLoader size={10} color="#fff" />
                    : <BiSolidSend size={12} />}
                </button>
              }
            />
          </form>
        </div>
      )}

      {/* Replies list */}
      {showReplies && (
        <div className="ms-4 mt-2 space-y-2">
          {isRepliesLoading ? (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 border-2 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : replies.length === 0 ? (
            <p className="text-xs text-gray-400 ms-1">No replies yet</p>
          ) : (
            replies.map((reply) => (
              <div key={reply._id} className="flex gap-2 items-start">
                <img
                  src={reply.commentCreator?.photo}
                  alt={reply.commentCreator?.name}
                  onError={(e) => { e.target.src = 'https://avatars.githubusercontent.com/u/86160567?s=200&v=4' }}
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5"
                />
                <div className="bg-gray-100 rounded-xl px-3 py-2 flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#050505]">
                    {reply.commentCreator?.name}
                  </p>
                  <p className="text-xs text-gray-700 mt-0.5">{reply.content}</p>
                  {reply.image && (
                    <img
                      src={reply.image}
                      alt="reply"
                      className="mt-1.5 rounded-lg max-h-[120px] object-cover"
                    />
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {reply.createdAt?.split('T')[0]}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  )
}