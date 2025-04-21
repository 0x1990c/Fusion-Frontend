import { useSelector } from "react-redux"
import { Loading } from "../components/common/Loading"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import { Toaster } from "react-hot-toast"

export const Layout = () => {
  const isLoading = useSelector(store => store.auth.isLoading)
  const {pathname} = useLocation();
  const navigate = useNavigate()
 
  useEffect(() => {
    if (pathname === "/") {
      navigate('/')
    }
  }, [])

  return (
    <div>
        {isLoading && <Loading />}
        <Toaster />
        <Outlet />
    </div>
  )
}
