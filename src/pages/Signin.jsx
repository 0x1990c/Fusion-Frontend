import { Link, useNavigate } from "react-router-dom"
import { usePassword } from "../hooks/usePassword"
import { useState } from "react"
import { useDispatch } from "react-redux"
import { loadingOff, loadingOn } from "../store/authSlice"
import { signinUser } from "../services/auth"
import logo from "../assets/logo.svg"
import mailPNG from "../assets/email.svg"
import eyePNG from "../assets/eye.svg"
import showPNG from "../assets/show.svg"
import lockSvg from "../assets/lock.svg"
import toast from "react-hot-toast"

export const Signin = () => {
  const [showPassword, showPass, hidePass] = usePassword()
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
  })

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setUserInfo({
      ...userInfo,
      [name]: value
    })
  }

  const handleSignin = async () => {
    if (!userInfo.email || !userInfo.password) {
      toast.error('Signin fields cannot be empty!');
      return;
    }
    
    dispatch(loadingOn())
    const res = await signinUser({...userInfo})

    dispatch(loadingOff())
    if (res['detail']) {
      toast.error(res.detail);
      return;
    }
    if (res['access_token']) {
      toast.success("You signed in successfully");
      localStorage.setItem('access_token', res.access_token)
      localStorage.setItem('user_email', userInfo.email)

      localStorage.setItem('user_type', res.user.user_type)

      navigate('/main')
    }
    else{
      toast.error(res.message);
    }
  }

  const handleForgotPassword = async() => {
      navigate('/forgot-password');
  }

  return (
    <div className="w-[100%] h-[100vh] flex flex-col gap-6 justify-center items-center bg-cover">
      <div>
        <p className="font-[500] text-3xl text-center">Sign In</p>
      </div>

      <div className="bg-white rounded-3xl w-[90%] p-4 md:w-[60%] md:p-10 lg:w-[35%] lg:p-16 lg:py-4">
        <div className="mt-4 flex flex-col gap-6">
          <div className="shadow-md rounded-2xl p-2 bg-white flex items-center gap-2">
            <div className="w-7 ml-2">
              
            </div>
            <input placeholder="E-mail" className="p-2 border-none w-[100%] placeholder:text-black focus:outline-none" 
              name="email" onChange={handleChange} value={userInfo.email}
            />
          </div>

          <div className="shadow-md rounded-2xl p-1 bg-white flex items-center">
            <div className="w-14">
              
            </div>
            <input placeholder="Password" type={showPassword ? "text": "password"} className="p-2 border-none w-[100%] placeholder:text-black focus:outline-none" 
              name="password" onChange={handleChange} value={userInfo.password}
            />
            <div className="w-10">
              { showPassword ? <img src={showPNG} alt="image" 
                className="w-[100%] h-[100%] cursor-pointer"  onClick={hidePass}
              /> :
              <img src={eyePNG} alt="image" 
                className="w-[100%] h-[100%] cursor-pointer" onClick={showPass}
              /> }
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-3 w-[90%] mx-auto">
          <div className="flex items-center gap-2">
            <input type='checkbox' className="accent-red-500" />
            <p className="text-black text-sm">Remember me</p>
          </div>
          <div>
            <p className="text-black text-sm cursor-pointer" onClick={handleForgotPassword}>Forgot password?</p>
          </div>
        </div>
        <div className="w-[50%] mx-auto mt-6">
          <button className="w-[100%] p-2 bg-blue-600 rounded-3xl text-white font-semibold shadow-lg" onClick={handleSignin}>
            SIGN IN
          </button>
        </div>
        <div className="flex justify-center gap-2 mt-5">
            <p className="text-black text-sm">Don't have an account?</p>
            <p className="text-black text-sm font-semibold cursor-pointer">
              <Link to="/signup">Create</Link>
            </p>
        </div>
      </div>
    </div>
  )
}