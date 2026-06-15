import { useForm } from "react-hook-form"
import * as zod from 'zod'
import {zodResolver} from '@hookform/resolvers/zod'
import axios from "axios";
import { useContext, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useNavigate , Link } from "react-router-dom";
import { AuthContext } from "../../Contexts/AuthContextProvider";
import { Slide, toast } from "react-toastify";
const loginSchema = zod.object({
    email:zod.string().nonempty("Email is required").email("Please enter a valid email address (e.g., name@example.com)."),
    password:zod.string().nonempty("Password is Required").regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/ , "Password must be 8 to 15 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&)."),
})


export default function Login() {
    const {setAuthenticatedUserToken} = useContext(AuthContext)
    const [isSuccessResponse, setIsSuccessResponse] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate()
    const {handleSubmit , register , formState } = useForm({
        mode:'onBlur',
        resolver:zodResolver(loginSchema)
    })

    function handleLoginSubmit(values){
            console.log("Submitting" , values);

            setIsLoading(true)
            axios.post("https://route-posts.routemisr.com/users/signin" , values)
            .then(function(res){
                console.log("response" , res.data);
                setAuthenticatedUserToken(res.data.data.token)
                localStorage.setItem("token" , res.data.data.token)
                setIsSuccessResponse(true)
                 toast.success('Welcome Back', {
position: "top-center",
autoClose: 2000,
hideProgressBar: false,
closeOnClick: true, 
pauseOnHover: true,
draggable: true,
// progress: ,
theme: "colored",
transition: Slide,
});

                setTimeout(() => {
                    setIsSuccessResponse(false)
                    navigate('/home')
                }, 2000);
            })
            .catch(function(err){
                console.log("error" , err.response.data.errors);
                // setErrorMessage(err.response.data.errors)
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
  <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center px-4">

    {/* Brand */}
    <div className="mb-6 text-center">
      <h1 className="text-5xl font-bold text-[#1877F2] tracking-tight">meetra</h1>
      <p className="text-gray-600 mt-2 text-lg">Connect with friends and the world around you.</p>
    </div>

    {/* Card */}
    <div className="bg-white rounded-xl shadow-md w-full max-w-[400px] p-6">

      {/* {isSuccessResponse && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm text-center rounded-lg px-4 py-2 mb-4">
          Welcome Back 👋
        </div>
      )} */}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm text-center rounded-lg px-4 py-2 mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(handleLoginSubmit)} className="flex flex-col gap-3">

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

        <div className="flex flex-col gap-1">
          <input
            id="password"
            {...register("password")}
            type="password"
            placeholder="Password"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#1877F2] focus:ring-2 focus:ring-[#1877F2]/20 transition"
          />
          {formState.errors.password && formState.touchedFields.password && (
            <p className="text-red-500 text-xs">{formState.errors.password?.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#1877F2] hover:bg-[#166FE5] active:bg-[#1464D2] text-white font-semibold rounded-lg py-3 text-base transition disabled:opacity-70 cursor-pointer"
        >
          {isLoading ? <ClipLoader size={20} color="#fff" /> : "Log in"}
        </button>

        

        <hr className="border-gray-200" />

        <div className="text-center">
          <Link className="inline-block bg-[#42B72A] hover:bg-[#36A420] active:bg-[#2B9115] text-white font-semibold rounded-lg px-6 py-3 text-sm transition" to={'/register'}>Create new account</Link>
        </div>

      </form>

    </div>

    <p className="mt-6 text-xs text-gray-500">© {new Date().getFullYear()} Meetra</p>

  </div>
)
}
