import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

export default function Layout() {
  const location = useLocation();
  const hideFooter =
    location.pathname === "/login" || location.pathname === "/register" || location.pathname === "/profile" || location.pathname.startsWith("/postDetails/"); 
  return <>
  
  <Navbar/>
  
  
  <Outlet/>


 {!hideFooter &&  <Footer/>}
  
  </>
}
