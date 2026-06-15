import { useContext } from 'react'
import { AuthContext } from '../../Contexts/AuthContextProvider'
import { Navigate } from 'react-router-dom'

export default function ProtectedRouting({children}) {
    const {token} = useContext(AuthContext)
    if(token === null){
        return <Navigate to='/login'/>
    }
  return <>
  {children}
  </>
}
