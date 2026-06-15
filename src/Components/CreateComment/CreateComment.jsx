import { Input } from '@heroui/react'
import axios from 'axios';
import React, { useContext } from 'react'
import { BiSolidSend } from "react-icons/bi";
import { AuthContext } from '../../Contexts/AuthContextProvider';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function CreateComment({postId}) {
const {token} = useContext(AuthContext)
const queryClient = useQueryClient()
const {handleSubmit , register , reset} = useForm({
  defaultValues:{
    content:""
  }
})


   function HandleAddComment(data){
    const myForm = new FormData();
    myForm.append('content' , data.content)
   return axios.post(`https://route-posts.routemisr.com/posts/${postId}/comments` , myForm , {
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
   }

   const {mutate , data , isPending} = useMutation({
    mutationFn:HandleAddComment,
    onSuccess:function(){
      reset()
      queryClient.invalidateQueries({queryKey:["getPosts"]})
      queryClient.invalidateQueries({queryKey:["getPostComments"]})
    }
   })
// console.log(data);


  return <> 
  <div className='p-2'>
    <form onSubmit={handleSubmit(mutate)} >
      <Input
        {...register("content")}
          labelPlacement="outside"
          placeholder="Enter Your Comment ..."
          endContent={
            <button
            disabled={isPending}
            type="submit"
            className="bg-[#1877F2] hover:bg-[#166FE5] p-2 rounded-full cursor-pointer text-white transition-colors"
          >
            <BiSolidSend />
          </button>
          }
          type="text"
        />
    </form>
  </div>
  
  </>
}
