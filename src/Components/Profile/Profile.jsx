import { Helmet } from "react-helmet";
import { useContext, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import { Slide, toast } from "react-toastify";
import PostCard from "../PostCard/PostCard";

const BASE = "https://route-posts.routemisr.com";

export default function Profile() {
  const { token, userId } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const photoInputRef = useRef(null);

  // ── Fetch profile ────────────────────────────────────────────────
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ["getProfile"],
    queryFn: () =>
      axios.get(`${BASE}/users/profile-data`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!token,
  });

  const profile = profileData?.data?.data?.user;

  // ── Fetch my posts ───────────────────────────────────────────────
  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["getMyPosts"],
    enabled: !!userId,
    queryFn: () =>
      axios.get(`${BASE}/users/${userId}/posts`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
  });

  const myPosts = postsData?.data?.data?.posts || [];
  const totalPosts = postsData?.data?.meta?.pagination?.total ?? myPosts.length;
  const photoPosts = myPosts.filter((p) => p.image);

  // ── Upload photo ─────────────────────────────────────────────────
  const { isPending: isPhotoUploading, mutate: uploadPhoto } = useMutation({
    mutationFn: (file) => {
      const formData = new FormData();
      formData.append("photo", file);
      return axios.put(`${BASE}/users/upload-photo`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getProfile"] });
      queryClient.invalidateQueries({ queryKey: ["UserNavbarInfo"] });
      setPreviewPhoto(null);
      setIsEditModalOpen(false);
      toast.success("Photo updated!", {
        position: "top-center", autoClose: 2000, theme: "colored", transition: Slide,
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Upload failed", {
        position: "top-center", autoClose: 3000, theme: "colored", transition: Slide,
      });
    },
  });

  // ── Loading skeleton ─────────────────────────────────────────────
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <div className="bg-white shadow-sm">
          <div className="max-w-[940px] mx-auto">
            <div className="w-full h-52 sm:h-72 bg-gradient-to-br from-[#1877F2] via-[#166FE5] to-[#2851A3] animate-pulse" />
            <div className="px-4 sm:px-6 pb-6 -mt-8 sm:-mt-14">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gray-200 border-4 border-white animate-pulse shrink-0" />
                <div className="flex-1 space-y-2 pb-2">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{profile?.name || "Profile"} · meetra</title>
      </Helmet>

      <div className="min-h-screen bg-[#F0F2F5] pb-12">

        {/* ── Cover + Avatar ───────────────────────────────────────── */}
        <div className="bg-white shadow-sm">
          <div className="max-w-[940px] mx-auto">

            {/* Cover */}
            <div className="relative w-full h-52 sm:h-72 md:h-80">
              <div className="w-full h-full bg-gradient-to-br from-[#1877F2] via-[#166FE5] to-[#2851A3] sm:rounded-b-2xl overflow-hidden">
                {/* subtle dot pattern */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                />
              </div>
            </div>

            {/* Profile info bar */}
            <div className="px-4 sm:px-6 pb-5 relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-10 sm:-mt-14 gap-4 sm:gap-5">

                {/* Avatar */}
                <div className="relative shrink-0 z-10">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-[3px] bg-white shadow-lg ring-2 ring-white">
                    <img
                      src={previewPhoto || profile?.photo}
                      alt={profile?.name}
                      onError={(e) => {
                        e.target.src =
                          "https://avatars.githubusercontent.com/u/86160567?s=200&v=4";
                      }}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  {/* Camera overlay */}
                  <label className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-8 h-8 bg-white hover:bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer shadow transition-all hover:scale-105">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      ref={photoInputRef}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setPreviewPhoto(URL.createObjectURL(file));
                        setIsEditModalOpen(true);
                        // store for later confirm
                        photoInputRef.current._pendingFile = file;
                      }}
                    />
                  </label>
                  {isPhotoUploading && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Name / username / stats */}
                <div className="flex-1 text-center sm:text-left pb-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight leading-tight truncate">
                    {profile?.name}
                  </h1>
                  {profile?.username && (
                    <p className="text-[#65676B] text-sm mt-0.5">@{profile.username}</p>
                  )}
                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm font-medium text-[#65676B]">
                    <span>
                      <strong className="text-[#050505]">{profile?.followersCount ?? 0}</strong> followers
                    </span>
                    <span className="text-gray-300">·</span>
                    <span>
                      <strong className="text-[#050505]">{profile?.followingCount ?? 0}</strong> following
                    </span>
                    <span className="text-gray-300">·</span>
                    <span>
                      <strong className="text-[#050505]">{totalPosts}</strong> posts
                    </span>
                  </div>
                </div>

                {/* Edit button */}
                <div className="shrink-0 pb-1">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#E4E6EB] hover:bg-[#d8dadf] text-[#050505] text-sm font-semibold rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16H8v-2a2 2 0 01.586-1.414z" />
                    </svg>
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content grid ────────────────────────────────────── */}
        <div className="max-w-[940px] mx-auto px-4 sm:px-6 mt-5 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">

          {/* Left sidebar */}
          <div className="space-y-4">

            {/* Intro card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-lg font-bold text-[#050505] mb-4">Intro</h2>
              <div className="space-y-3 text-sm text-[#65676B]">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>
                    <strong className="text-[#050505]">@{profile?.username || "—"}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{profile?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>
                    <strong className="text-[#050505]">{profile?.followersCount ?? 0}</strong> followers ·{" "}
                    <strong className="text-[#050505]">{profile?.followingCount ?? 0}</strong> following
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>
                    <strong className="text-[#050505]">{totalPosts}</strong> posts shared
                  </span>
                </div>
              </div>
            </div>

            {/* Photos card */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[#050505]">Photos</h2>
                <span className="text-xs text-gray-400">{photoPosts.length} photos</span>
              </div>

              {photoPosts.length === 0 ? (
                <div className="py-8 flex flex-col items-center gap-2 text-gray-400">
                  <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">No photos yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1 rounded-lg overflow-hidden">
                  {photoPosts.slice(0, 9).map((post, i) => (
                    <div
                      key={post._id || i}
                      className="aspect-square bg-gray-100 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <img src={post.image} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right — Posts feed */}
          <div className="space-y-4">
            {isPostsLoading ? (
              /* Post skeletons */
              [1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-4 space-y-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3.5 w-32 bg-gray-200 rounded" />
                      <div className="h-3 w-20 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-full" />
                    <div className="h-3 bg-gray-100 rounded w-4/5" />
                  </div>
                  <div className="h-48 bg-gray-100 rounded-lg" />
                </div>
              ))
            ) : myPosts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-3 text-[#65676B]">
                <div className="w-16 h-16 bg-[#F0F2F5] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-base font-semibold text-[#050505]">No posts yet</p>
                <p className="text-sm">Posts you share will appear here.</p>
              </div>
            ) : (
              myPosts.map((post) => <PostCard key={post._id} postInfo={post} />)
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Photo Modal ──────────────────────────────────────── */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsEditModalOpen(false);
              setPreviewPhoto(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden">

            {/* Header */}
            <div className="relative flex items-center justify-center py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-[#050505]">Update Profile Photo</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setPreviewPhoto(null);
                }}
                className="absolute right-4 w-8 h-8 rounded-full bg-[#E4E6EB] hover:bg-[#d8dadf] flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col items-center gap-5">
              {/* Avatar preview */}
              <div className="relative">
                <img
                  src={previewPhoto || profile?.photo}
                  alt={profile?.name}
                  onError={(e) => {
                    e.target.src = "https://avatars.githubusercontent.com/u/86160567?s=200&v=4";
                  }}
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {isPhotoUploading && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>

              {previewPhoto ? (
                <p className="text-xs text-[#65676B] text-center">
                  Looking good! Click <strong>Save</strong> to apply this photo.
                </p>
              ) : (
                <p className="text-xs text-[#65676B] text-center">
                  Choose a new photo to update your profile picture.
                </p>
              )}

              {/* Choose photo button */}
              <label className="w-full cursor-pointer">
                <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#E4E6EB] hover:bg-[#d8dadf] text-[#050505] text-sm font-semibold rounded-lg transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {previewPhoto ? "Choose a different photo" : "Choose photo"}
                </div>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setPreviewPhoto(URL.createObjectURL(file));
                    photoInputRef.current._pendingFile = file;
                  }}
                />
              </label>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setPreviewPhoto(null);
                }}
                className="flex-1 py-2.5 bg-[#E4E6EB] hover:bg-[#d8dadf] text-[#050505] text-sm font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!previewPhoto || isPhotoUploading}
                onClick={() => {
                  const file = photoInputRef.current?._pendingFile;
                  if (file) uploadPhoto(file);
                }}
                className="flex-1 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isPhotoUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}