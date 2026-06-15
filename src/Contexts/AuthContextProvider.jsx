import { createContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode';
export const AuthContext = createContext()
export default function AuthContextProvider({children}) {


    const [token, setToken] = useState(function(){ //Lazy Initialization -> function will only run once (intitial render)
      return localStorage.getItem("token")
    })
    const [userId, setUserId] = useState(null)
    // console.log("token", token);
    
    function setAuthenticatedUserToken(tkn){
        setToken(tkn)
        
    }

    function clearUserToken(){
      setToken(null)
    }

  //   useEffect(()=>{
  //   const localStorageValue = localStorage.getItem("token")
  //   if(localStorageValue !== null){
  //     setToken(localStorageValue)
  //   }
  // },[])

  function decodeUserToken(){
    const decodedTokenValue = jwtDecode(token)
    // console.log(decodedTokenValue.user);
    setUserId(decodedTokenValue.user)
    
  }
  useEffect(()=>{
    if (token) {
      decodeUserToken()
    }
  },[token])

  return <>
  <AuthContext.Provider value={{token , setAuthenticatedUserToken , clearUserToken , userId}}>
    {children}
  </AuthContext.Provider>
  </>
}
