import axios from "axios";
import { useContext } from "react";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import PostCard from "../PostCard/PostCard";
import LoaderPage from "../LoaderPage/LoaderPage";
import { useQuery } from "@tanstack/react-query";
import CreatePost from "../CreatePost/CreatePost";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import FollowSuggestions from "../FollowSuggestions/FollowSuggestions";

export default function Home() {
  const { token } = useContext(AuthContext);

  function getAllPosts() {
    return axios.get("https://route-posts.routemisr.com/posts", {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["getPosts"],
    queryFn: getAllPosts,
    enabled: !!token,
  });

  const allPosts = data?.data?.data?.posts;
// console.log(allPosts)

  if (isError) {
    return <h1>{error.message}</h1>;
  }
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Helmet>
        <title>Home</title>
      </Helmet>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">

        {/* Left Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/home"
                  className="block w-full bg-blue-50 text-blue-600 p-3 rounded-xl font-medium transition"
                >
                  Feed
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="block w-full hover:bg-gray-100 p-3 rounded-xl transition"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/saved"
                  className="block w-full hover:bg-gray-100 p-3 rounded-xl transition"
                >
                  Saved
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        {/* Feed */}
        <main className="col-span-12 lg:col-span-6 flex flex-col gap-5">
          {!isLoading && <CreatePost />}

          {isLoading ? (
            <LoaderPage />
          ) : (
            allPosts?.map((post) => (
              <PostCard key={post._id} postInfo={post} />
            ))
          )}
        </main>

        {/* Right Sidebar — real suggestions */}
        <aside className="hidden lg:block lg:col-span-3">
          <FollowSuggestions />
        </aside>

      </div>
    </div>
  );
}