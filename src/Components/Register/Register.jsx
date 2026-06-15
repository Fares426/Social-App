import { useForm } from "react-hook-form"
import * as zod from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import axios from "axios";
import { useState } from "react";
import { ClipLoader } from "react-spinners";
import { Link, useNavigate } from "react-router-dom";




const registerSchema = zod.object({
    name:zod.string().nonempty("Username is required").min(3,"Name must be atleast 3 characters").max(13,"Name must be atmost 13 characters"),
    email:zod.string().nonempty("Email is required").email("Please enter a valid email address (e.g., name@example.com)."),
    password:zod.string().nonempty("Password is Required").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/ , "Password must be 8 to 15 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&)."),
    rePassword:zod.string().nonempty("Confirm Password is Required").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/ , "Password must be 8 to 15 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&)."),
    dateOfBirth:zod.coerce.date("Invalid Date").transform(function(date){
        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    }),
    gender:zod.enum(['male' , 'female'])
}).refine(function(values){
    return values.password === values.rePassword
} , {path:'rePassword' , error:"Passwords Doesn't match"} );





export default function Register() {
 
    const [isSuccessResponse, setIsSuccessResponse] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const {handleSubmit , register , formState } = useForm({
        mode:'onBlur',
        resolver:zodResolver(registerSchema)
    })

    function handleRegisterSubmit(values){
            console.log("Submitting" , values);
          
            setIsLoading(true)
            axios.post("https://route-posts.routemisr.com/users/signup" , values)
            .then(function(res){
                console.log("response" , res);
                setIsSuccessResponse(true)

                setTimeout(() => {
                    setIsSuccessResponse(false)
                    navigate('/login')
                }, 2000);
            })
            .catch(function(err){
                console.log("error" , err.response.data.errors);
                setErrorMessage(err.response.data.errors)
                setTimeout(() => {
                    setErrorMessage(null)
                }, 2000);
            }).finally(function(){
                setIsLoading(false)
            })
    }

//  RHF (react-hook-form) => handle => using references not states !!
//  register => registers new field in your RHF object


return (
  <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center px-4 py-10">

    {/* Brand */}
    <div className="mb-6 text-center">
      <h1 className="text-5xl font-bold text-[#1877F2] tracking-tight">meetra</h1>
      <p className="text-gray-600 mt-2 text-lg">Connect with friends and the world around you.</p>
    </div>

    {/* Card */}
    <div className="bg-white rounded-xl shadow-md w-full max-w-[400px] p-6">

      <div className="mb-5">
        <h2 className="text-2xl font-bold text-gray-900">Create a new account</h2>
        <p className="text-gray-500 text-sm mt-1">It's quick and easy.</p>
      </div>

      <hr className="border-gray-200 mb-4" />

      {isSuccessResponse && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm text-center rounded-lg px-4 py-2 mb-4">
          Registration Successful 🎉
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center rounded-lg px-4 py-2 mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(handleRegisterSubmit)} className="flex flex-col gap-3">

        {/* Username */}
        <div className="flex flex-col gap-1">
          <input
            id="userName"
            {...register("name")}
            type="text"
            placeholder="Username"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition"
          />
          {formState.errors.name && formState.touchedFields.name && (
            <p className="text-red-500 text-xs">{formState.errors.name?.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <input
            id="email"
            {...register("email")}
            type="email"
            placeholder="Email address"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition"
          />
          {formState.errors.email && formState.touchedFields.email && (
            <p className="text-red-500 text-xs">{formState.errors.email?.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1">
          <input
            id="password"
            {...register("password")}
            type="password"
            placeholder="New password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition"
          />
          {formState.errors.password && formState.touchedFields.password && (
            <p className="text-red-500 text-xs">{formState.errors.password?.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1">
          <input
            id="repassword"
            {...register("rePassword")}
            type="password"
            placeholder="Confirm password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition"
          />
          {formState.errors.rePassword && formState.touchedFields.rePassword && (
            <p className="text-red-500 text-xs">{formState.errors.rePassword?.message}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Date of birth</label>
          <input
            id="dateOfBirth"
            {...register("dateOfBirth")}
            type="date"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition"
          />
          {formState.errors.dateOfBirth && formState.touchedFields.dateOfBirth && (
            <p className="text-red-500 text-xs">{formState.errors.dateOfBirth?.message}</p>
          )}
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Gender</label>
          <div className="flex gap-3">
            <label className="flex-1 flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition">
              Male
              <input
                {...register("gender")}
                value="male"
                id="male"
                type="radio"
                className="accent-[#1877F2]"
              />
            </label>
            <label className="flex-1 flex items-center justify-between border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 transition">
              Female
              <input
                {...register("gender")}
                value="female"
                id="female"
                type="radio"
                className="accent-[#1877F2]"
              />
            </label>
          </div>
          {formState.errors.gender && formState.touchedFields.gender && (
            <p className="text-red-500 text-xs">{formState.errors.gender?.message}</p>
          )}
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          By clicking Sign Up, you agree to our <a href="#" className="text-[#1877F2] hover:underline">Terms</a> and <a href="#" className="text-[#1877F2] hover:underline">Privacy Policy</a>.
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#42B72A] hover:bg-[#36A420] active:bg-[#2B9115] text-white font-bold rounded-lg py-3 text-base transition disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? <ClipLoader size={20} color="#fff" /> : "Sign Up"}
        </button>

        <div className="text-center">
          <Link to="/login" className="text-[#1877F2] text-sm font-semibold hover:underline">
            Already have an account? Log in
          </Link>
        </div>

      </form>
    </div>

    <p className="mt-6 text-xs text-gray-500">© {new Date().getFullYear()} Meetra</p>
  </div>
)
}
