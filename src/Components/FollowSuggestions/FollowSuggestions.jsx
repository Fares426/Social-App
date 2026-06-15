  import { useContext, useState } from "react";
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import axios from "axios";
  import { AuthContext } from "../../Contexts/AuthContextProvider";
  import { ClipLoader } from "react-spinners";

  export default function FollowSuggestions() {
    const { token } = useContext(AuthContext);
    const queryClient = useQueryClient();

    // Track which users are currently being toggled
    const [loadingIds, setLoadingIds] = useState(new Set());
    // Track follow state locally (userId => true/false)
    const [followedIds, setFollowedIds] = useState(new Set());

    const { data, isLoading } = useQuery({
      queryKey: ["getFollowSuggestions"],
      queryFn: () =>
        axios.get("https://route-posts.routemisr.com/users/suggestions?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      enabled: !!token,
    });

    const suggestions = data?.data?.data?.suggestions || [];

    const { mutate: toggleFollow } = useMutation({
      mutationFn: (userId) =>
        axios.put(
          `https://route-posts.routemisr.com/users/${userId}/follow`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      onMutate: (userId) => {
        setLoadingIds((prev) => new Set(prev).add(userId));
      },
      onSuccess: (_, userId) => {
        setFollowedIds((prev) => {
          const next = new Set(prev);
          if (next.has(userId)) next.delete(userId);
          else next.add(userId);
          return next;
        });
        // Invalidate profile so followers/following counts refresh
        queryClient.invalidateQueries({ queryKey: ["getProfile"] });
        queryClient.invalidateQueries({ queryKey: ["UserNavbarInfo"] });
      },
      onSettled: (_, __, userId) => {
        setLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      },
    });

    if (isLoading) {
      return (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gray-200 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-8 w-16 rounded-lg bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (suggestions.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Suggested Friends</h2>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-500">
            {suggestions.length}
          </span>
        </div>

        <div className="space-y-4">
          {suggestions.map((user) => {
            const isFollowed = followedIds.has(user._id);
            const isThisLoading = loadingIds.has(user._id);

            return (
              <div key={user._id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.photo}
                    alt={user.name}
                    onError={(e) => {
                      e.target.src = "https://avatars.githubusercontent.com/u/86160567?s=200&v=4";
                    }}
                    className="w-11 h-11 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium text-[#050505] truncate">{user.name}</h3>
                    {user.username && (
                      <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(user._id)}
                  disabled={isThisLoading}
                  className={`shrink-0 text-sm px-3 py-1.5 rounded-lg font-medium transition-all duration-150 min-w-[72px] flex items-center justify-center
                    ${isFollowed
                      ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      : "bg-blue-50 hover:bg-blue-100 text-[#1877F2]"
                    } disabled:opacity-60`}
                >
                  {isThisLoading ? (
                    <ClipLoader size={14} color={isFollowed ? "#374151" : "#1877F2"} />
                  ) : isFollowed ? (
                    "Unfollow"
                  ) : (
                    "Follow"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }