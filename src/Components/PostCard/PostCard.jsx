import { Card, CardBody, CardFooter, Divider } from "@heroui/react";
import CardHeaderPart from "../CardHeaderPart/CardHeaderPart";
import CommentCard from "../CommentCard/CommentCard";
import CreateComment from "../CreateComment/CreateComment";
import { Link } from "react-router-dom";
import { FaThumbsUp, FaRegThumbsUp, FaRegComment, FaShare, FaBookmark, FaRegBookmark } from "react-icons/fa";
import { useState, useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import { Slide, toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

const BASE = "https://route-posts.routemisr.com";

// ── Follow persistence helpers ─────────────────────────────────────────────
const FOLLOW_KEY = "meetra_followed_ids";

function loadFollowedIds() {
  try {
    const raw = localStorage.getItem(FOLLOW_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFollowedIds(set) {
  localStorage.setItem(FOLLOW_KEY, JSON.stringify([...set]));
}

export default function PostCard({ postInfo, isPostDetailsPage = false, comments }) {
  const {
    body, image, user, createdAt, topComment, commentsCount, id,
    likesCount: initialLikesCount = 0,
    likes = [],
    bookmarked = false,
  } = postInfo;
  const { photo, name, _id: authorId } = user;
  const { content } = topComment || {};

  const { token, userId } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const isOwnPost = authorId === userId;

  const [postImage, setPostImage] = useState(image);
  const [isLiked, setIsLiked] = useState(() => likes.some((l) => l === userId || l?._id === userId));
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);

  // ── Follow — init from localStorage ──────────────────────────────────────
  const [isFollowing, setIsFollowing] = useState(() => loadFollowedIds().has(authorId));

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [shareBody, setShareBody] = useState("");

  // ── Like ──────────────────────────────────────────────────────────────────
  const { mutate: toggleLike, isPending: isLikePending } = useMutation({
    mutationFn: () =>
      axios.put(`${BASE}/posts/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onMutate: () => {
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => isLiked ? prev - 1 : prev + 1);
    },
    onError: () => {
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => isLiked ? prev + 1 : prev - 1);
      toast.error("Failed to update like", { position: "top-center", autoClose: 2000, theme: "colored", transition: Slide });
    },
  });

  // ── Bookmark ──────────────────────────────────────────────────────────────
  const { mutate: toggleBookmark, isPending: isBookmarkPending } = useMutation({
    mutationFn: () =>
      axios.put(`${BASE}/posts/${id}/bookmark`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onMutate: () => setIsBookmarked((prev) => !prev),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getBookmarks"] });
      toast.success(isBookmarked ? "Saved to bookmarks" : "Removed from saved", {
        position: "top-center", autoClose: 1500, theme: "colored", transition: Slide,
      });
    },
    onError: () => {
      setIsBookmarked((prev) => !prev);
      toast.error("Failed to update bookmark", { position: "top-center", autoClose: 2000, theme: "colored", transition: Slide });
    },
  });

  // ── Share ─────────────────────────────────────────────────────────────────
  const { mutate: sharePost, isPending: isSharePending } = useMutation({
    mutationFn: () =>
      axios.post(`${BASE}/posts/${id}/share`, { body: shareBody }, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      setShareBody("");
      setIsShareModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["getPosts"] });
      toast.success("Post shared!", { position: "top-center", autoClose: 2000, theme: "colored", transition: Slide });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to share post", {
        position: "top-center", autoClose: 2000, theme: "colored", transition: Slide,
      });
    },
  });

  // ── Follow — persist to localStorage on toggle ───────────────────────────
  const { mutate: toggleFollow, isPending: isFollowPending } = useMutation({
    mutationFn: () =>
      axios.put(`${BASE}/users/${authorId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    onMutate: () => setIsFollowing((prev) => !prev),
    onSuccess: () => {
      // Read current set, toggle this authorId, save back
      const current = loadFollowedIds();
      if (current.has(authorId)) current.delete(authorId);
      else current.add(authorId);
      saveFollowedIds(current);

      queryClient.invalidateQueries({ queryKey: ["getFollowSuggestions"] });
      queryClient.invalidateQueries({ queryKey: ["getProfile"] });
      toast.success(isFollowing ? "Unfollowed" : "Following!", {
        position: "top-center", autoClose: 1500, theme: "colored", transition: Slide,
      });
    },
    onError: () => {
      setIsFollowing((prev) => !prev);
      toast.error("Failed to update follow", { position: "top-center", autoClose: 2000, theme: "colored", transition: Slide });
    },
  });

  // ── Likes list ────────────────────────────────────────────────────────────
  const { data: likesData, isLoading: isLikesLoading } = useQuery({
    queryKey: ["getPostLikes", id],
    queryFn: () =>
      axios.get(`${BASE}/posts/${id}/likes?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: isLikesModalOpen,
  });

  const likesList = likesData?.data?.data?.likes || [];

  return (
    <>
      <Card className="
        w-full max-w-full sm:max-w-[680px] mx-auto
        bg-white rounded-none sm:rounded-xl
        shadow-none sm:shadow-sm
        border-0 border-y border-gray-100 sm:border sm:border-gray-200
        overflow-hidden
      ">
        {/* Header */}
        <div className="px-3 pt-3 pb-0 sm:px-4 sm:pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardHeaderPart
                onImageUpdate={(newImage) => setPostImage(newImage)}
                currentImage={image}
                body={body}
                postId={id}
                userIdCard={authorId}
                name={name}
                createdAt={createdAt}
                photo={photo}
                cardType="post"
              />
            </div>

            {/* Follow button — only on other people's posts */}
            {!isOwnPost && (
              <button
                onClick={() => toggleFollow()}
                disabled={isFollowPending}
                className={`shrink-0 mt-1 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 disabled:opacity-60
                  ${isFollowing
                    ? "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    : "bg-[#E7F0FD] hover:bg-[#d4e5fc] text-[#1877F2]"
                  }`}
              >
                {isFollowPending
                  ? <ClipLoader size={10} color={isFollowing ? "#6b7280" : "#1877F2"} />
                  : isFollowing ? "Following" : "+ Follow"
                }
              </button>
            )}
          </div>
        </div>

        <Divider className="bg-gray-100 mt-3" />

        {/* Body */}
        <CardBody className="px-3 sm:px-4 py-3 gap-0">
          <p className="text-sm sm:text-[15px] text-gray-900 leading-relaxed whitespace-pre-wrap">
            {body}
          </p>
          {postImage && (
            <div className="-mx-3 sm:-mx-4 mt-3 overflow-hidden bg-gray-100">
              <img
                src={postImage}
                alt="post"
                className="w-full object-cover transition-transform duration-500 ease-out active:scale-[1.01] sm:hover:scale-[1.02]"
              />
            </div>
          )}
        </CardBody>

        {/* Like count */}
        {likesCount > 0 && (
          <div className="px-3 sm:px-4 py-1.5">
            <button
              onClick={() => setIsLikesModalOpen(true)}
              className="flex items-center gap-1.5 text-[#65676B] text-xs hover:underline"
            >
              <span className="w-4 h-4 bg-[#1877F2] rounded-full flex items-center justify-center">
                <FaThumbsUp className="text-white text-[8px]" />
              </span>
              <span>{likesCount} {likesCount === 1 ? "like" : "likes"}</span>
            </button>
          </div>
        )}

        <Divider className="bg-gray-100" />

        {/* Action buttons */}
        <CardFooter className="flex items-center justify-between px-0 py-0 h-11 sm:h-12">

          <button
            onClick={() => toggleLike()}
            disabled={isLikePending}
            className={`flex-1 flex items-center justify-center gap-1.5 h-full transition-colors duration-150 touch-manipulation
              ${isLiked ? "text-[#1877F2]" : "text-gray-500 active:bg-gray-100 sm:hover:bg-gray-50"}`}
          >
            {isLiked
              ? <FaThumbsUp className="text-base sm:text-lg shrink-0" />
              : <FaRegThumbsUp className="text-base sm:text-lg shrink-0" />}
            <span className="text-xs sm:text-sm font-semibold">{isLiked ? "Liked" : "Like"}</span>
          </button>

          <Divider orientation="vertical" className="h-5 sm:h-6 w-px bg-gray-200" />

          <button className="flex-1 flex items-center justify-center gap-1.5 h-full text-gray-500 active:bg-gray-100 sm:hover:bg-gray-50 transition-colors duration-150 touch-manipulation">
            <FaRegComment className="text-base sm:text-lg shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Comment</span>
          </button>

          <Divider orientation="vertical" className="h-5 sm:h-6 w-px bg-gray-200" />

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 h-full text-gray-500 active:bg-gray-100 sm:hover:bg-gray-50 transition-colors duration-150 touch-manipulation"
          >
            <FaShare className="text-base sm:text-lg shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">Share</span>
          </button>

          <Divider orientation="vertical" className="h-5 sm:h-6 w-px bg-gray-200" />

          <button
            onClick={() => toggleBookmark()}
            disabled={isBookmarkPending}
            className={`flex-1 flex items-center justify-center gap-1.5 h-full transition-colors duration-150 touch-manipulation
              ${isBookmarked ? "text-[#1877F2]" : "text-gray-500 active:bg-gray-100 sm:hover:bg-gray-50"}`}
          >
            {isBookmarkPending
              ? <ClipLoader size={14} color={isBookmarked ? "#1877F2" : "#6b7280"} />
              : isBookmarked
                ? <FaBookmark className="text-base sm:text-lg shrink-0" />
                : <FaRegBookmark className="text-base sm:text-lg shrink-0" />}
            <span className="text-xs sm:text-sm font-semibold">{isBookmarked ? "Saved" : "Save"}</span>
          </button>

        </CardFooter>

        <Divider className="bg-gray-100" />

        {/* Comments */}
        <div className="px-3 sm:px-4 pt-2.5 pb-3 bg-gray-50/60">
          <CreateComment postId={id} />

          {!isPostDetailsPage && commentsCount > 1 && (
            <div className="mt-2.5 mb-1">
              <Link
                to={`/postDetails/${id}`}
                className="text-[#1877F2] text-sm font-semibold active:underline sm:hover:underline"
              >
                View {commentsCount - 1} more comment{commentsCount - 1 > 1 ? "s" : ""}
              </Link>
            </div>
          )}

          <div className="mt-2 space-y-2">
            {!isPostDetailsPage && content && (
              <CommentCard postId={id} commentDetails={topComment} />
            )}
            {isPostDetailsPage && commentsCount > 0 && comments?.map((comment) => (
              <CommentCard key={comment._id} postId={id} commentDetails={comment} />
            ))}
          </div>
        </div>
      </Card>

      {/* ── Share Modal ───────────────────────────────────────────────────── */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:px-4">
          <div className="bg-white sm:rounded-xl rounded-t-2xl shadow-2xl w-full sm:max-w-[500px] overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="relative flex items-center justify-center py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">Share Post</h2>
              <button
                onClick={() => { setIsShareModalOpen(false); setShareBody(""); }}
                className="absolute cursor-pointer right-3 sm:right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg transition-colors"
              >×</button>
            </div>
            <div className="p-3 sm:p-4">
              <div className="border border-gray-200 rounded-xl p-3 mb-3 bg-gray-50">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={photo}
                    alt={name}
                    onError={(e) => { e.target.src = "https://avatars.githubusercontent.com/u/86160567?s=200&v=4"; }}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <p className="text-xs font-semibold text-gray-800">{name}</p>
                </div>
                <p className="text-sm text-gray-700 line-clamp-3">{body}</p>
                {postImage && (
                  <img src={postImage} alt="" className="mt-2 w-full max-h-[160px] object-cover rounded-lg" />
                )}
              </div>
              <textarea
                autoFocus
                value={shareBody}
                onChange={(e) => setShareBody(e.target.value)}
                placeholder="Say something about this post..."
                className="w-full min-h-[80px] sm:min-h-[100px] text-gray-800 text-sm sm:text-base placeholder-gray-400 resize-none outline-none border-b border-gray-100 pb-2"
              />
              <button
                disabled={isSharePending || !shareBody.trim()}
                onClick={() => sharePost()}
                className="w-full cursor-pointer mt-3 bg-[#1877F2] hover:bg-[#166FE5] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isSharePending
                  ? <ClipLoader size={16} color="#fff" />
                  : <><FaShare className="text-sm" /> Share now</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Likes Modal ───────────────────────────────────────────────────── */}
      {isLikesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 sm:px-4">
          <div className="bg-white sm:rounded-xl rounded-t-2xl shadow-2xl w-full sm:max-w-[400px] overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            <div className="relative flex items-center justify-center py-3 sm:py-4 border-b border-gray-200">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {likesCount} {likesCount === 1 ? "Like" : "Likes"}
              </h2>
              <button
                onClick={() => setIsLikesModalOpen(false)}
                className="absolute cursor-pointer right-3 sm:right-4 w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg transition-colors"
              >×</button>
            </div>
            <div className="p-3 sm:p-4 max-h-[60vh] overflow-y-auto space-y-3">
              {isLikesLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-7 h-7 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : likesList.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No likes yet</p>
              ) : (
                likesList.map((like) => (
                  <div key={like._id} className="flex items-center gap-3">
                    <img
                      src={like.user?.photo || like.photo}
                      alt={like.user?.name || like.name}
                      onError={(e) => { e.target.src = "https://avatars.githubusercontent.com/u/86160567?s=200&v=4"; }}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#050505] truncate">
                        {like.user?.name || like.name}
                      </p>
                      {(like.user?.username || like.username) && (
                        <p className="text-xs text-gray-500 truncate">
                          @{like.user?.username || like.username}
                        </p>
                      )}
                    </div>
                    <FaThumbsUp className="ml-auto shrink-0 text-[#1877F2] text-sm" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}