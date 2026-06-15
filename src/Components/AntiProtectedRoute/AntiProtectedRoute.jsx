import { useContext } from 'react'
import { AuthContext } from '../../Contexts/AuthContextProvider'
import { Navigate } from 'react-router-dom'

export default function AntiProtectedRoute({children}) {
    let {token} = useContext(AuthContext)
    if (token !== null ) {
        return <Navigate to='/home' />
    }
  return <>
  {children}
  </>
}
