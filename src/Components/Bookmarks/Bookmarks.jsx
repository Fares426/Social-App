import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import { Helmet } from "react-helmet";
import PostCard from "../PostCard/PostCard";
import { FiBookmark } from "react-icons/fi";

export default function Bookmarks() {
  const { token } = useContext(AuthContext);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getBookmarks"],
    queryFn: () =>
      axios.get("https://route-posts.routemisr.com/users/bookmarks", {
        headers: { Authorization: `Bearer ${token}` },
      }),
    enabled: !!token,
  });

  const bookmarks = data?.data?.data?.bookmarks || [];

  return (
    <>
      <Helmet>
        <title>Saved — Meetra</title>
      </Helmet>

      <div className="min-h-screen bg-[#F0F2F5]">
        <div className="max-w-[680px] mx-auto px-4 py-6">

          {/* Page header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 flex items-center justify-center">
              <FiBookmark className="text-[#1877F2]" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#050505]">Saved</h1>
              <p className="text-sm text-[#65676B]">Posts you've bookmarked</p>
            </div>
          </div>

          {/* States */}
          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center rounded-xl px-4 py-6">
              {error?.response?.data?.message || "Failed to load bookmarks."}
            </div>
          )}

          {!isLoading && !isError && bookmarks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-xl shadow-sm text-[#65676B]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <FiBookmark size={28} className="text-gray-400" />
              </div>
              <p className="text-base font-semibold text-[#050505]">No saved posts yet</p>
              <p className="text-sm">When you bookmark posts, they'll appear here.</p>
            </div>
          )}

          {!isLoading && !isError && bookmarks.length > 0 && (
            <div className="flex flex-col gap-4">
              {bookmarks.map((post) => (
                <PostCard key={post._id} postInfo={post} />
              ))}
            </div>
          )}

        </div>
      </div>
    </>
  );
}