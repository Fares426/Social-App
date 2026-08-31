import axios from 'axios'
import React, { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { AuthContext } from '../../Contexts/AuthContextProvider'
import { useQuery } from '@tanstack/react-query'
import LoaderPage from '../LoaderPage/LoaderPage'
import PostCard from '../PostCard/PostCard'

export default function PostDetails() {
    const { id } = useParams()
    const { token } = useContext(AuthContext)

    function getPostDetails() {
        return axios.get(`https://route-posts.routemisr.com/posts/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    const { data, isLoading, error, isError } = useQuery({
        queryKey: ["getPostDetails", id],
        queryFn: getPostDetails
    })

    function getPostComments() {
        return axios.get(`https://route-posts.routemisr.com/posts/${id}/comments`, {
            headers: { Authorization: `Bearer ${token}` }
        })
    }

    const { data: comments } = useQuery({
        queryKey: ["getPostComments", id], // ✅ id added here
        queryFn: getPostComments
    })

    const postDetails = data?.data.data.post
    const postComments = comments?.data.data.comments
    console.log("raw comments from API:", postComments)

    if (isLoading) return <LoaderPage />
    if (isError) return <h1>{error.message}</h1>

    return (
        <div className='mt-7 min-h-screen w-full px-4 sm:w-4/5 sm:px-0 lg:w-1/2 mx-auto flex justify-center items-start'>
            <PostCard postInfo={postDetails} comments={postComments} isPostDetailsPage={true} />
        </div>
    )
}