import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Layout from "./Components/Layout/Layout"
import Home from "./Components/Home/Home"
import Register from "./Components/Register/Register"
import Login from "./Components/Login/Login"
import NotFound from "./Components/NotFound/NotFound"
import {HeroUIProvider} from "@heroui/react";
import AuthContextProvider from "./Contexts/AuthContextProvider"
import Profile from "./Components/Profile/Profile"
import ProtectedRouting from "./Components/ProtectedRouting/ProtectedRouting"
import AntiProtectedRoute from "./Components/AntiProtectedRoute/AntiProtectedRoute"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import PostDetails from "./Components/PostDetails/PostDetails"
import { Slide, ToastContainer } from "react-toastify"
import { Offline } from "react-detect-offline"
import ChangePassword from "./Components/ChangePassword/ChangePassword"
import Bookmarks from "./Components/Bookmarks/Bookmarks"

let routes = createBrowserRouter([
  {path:'' , element:<Layout/> , children:[
    {index:true , element:<ProtectedRouting><Home/></ProtectedRouting>},
    {path:"home" , element:<ProtectedRouting><Home/></ProtectedRouting>},
    {path:"profile" , element:<ProtectedRouting><Profile/></ProtectedRouting>},
    {path:"postDetails/:id" , element:<ProtectedRouting><PostDetails/></ProtectedRouting>},
    {path:"register" , element:<AntiProtectedRoute><Register/></AntiProtectedRoute>},
    {path:"login" , element:<AntiProtectedRoute><Login/></AntiProtectedRoute>},
    {path:"changepassword" , element:<ProtectedRouting><ChangePassword/></ProtectedRouting>},
    {path:"saved", element:<ProtectedRouting><Bookmarks/></ProtectedRouting>},
    {path:"*" , element:<NotFound/>},
  ] },
])


const queryClientConfig = new QueryClient()


export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClientConfig}>
        <AuthContextProvider>
          <HeroUIProvider>
            <RouterProvider router={routes} />
            <ToastContainer
              position="top-center"
              autoClose={2000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
              transition={Slide}
            />
          </HeroUIProvider>
        </AuthContextProvider>
      </QueryClientProvider>

      <Offline>
  <div className="fixed  bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 bg-gray-900 text-white px-4 py-2.5 rounded-full shadow-lg">
    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
    <p className="text-sm font-medium whitespace-nowrap">You're offline — some features may not work</p>
  </div>
</Offline>
    </>
  );
}
