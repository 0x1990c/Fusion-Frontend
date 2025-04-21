import { Link, useNavigate } from "react-router-dom"
import { usePassword } from "../hooks/usePassword"
import { useState } from "react"
import { useDispatch } from "react-redux"
import {loadingOff, loadingOn} from '../store/authSlice'
import { signupUser } from "../services/auth"
import logo from "../assets/logo.svg"
import mailPNG from "../assets/email.svg"
import eyePNG from "../assets/eye.svg"
import showPNG from "../assets/show.svg"
import lockSvg from "../assets/lock.svg"
import toast from "react-hot-toast"

export const Signup = () => {
  const [showPassword, showPass, hidePass] = usePassword()
  const [showConfirmPassword, showConfirmPass, hideConfirmPass] = usePassword()
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
    confirmPassword: ''
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

  const handleSignup = async () => {
    if (!userInfo.email || !userInfo.password || !userInfo.confirmPassword) {
      toast.error('Signup fields cannot be empty!');
      return;
    }
    dispatch(loadingOn())
    const res = await signupUser({...userInfo})
    
    dispatch(loadingOff())
    if (typeof res === 'string') {
      toast.error(res);
      return;
    }
    if (res) {
      toast.success("You signed up successfully. Please wait for approval.");
      navigate('/signin')
    }
  }

  return (
    <div className="w-[100%] h-[100vh] flex flex-col gap-6 justify-center items-center bg-cover">
      <div>
        <p className="font-[500] text-3xl text-center">Sign Up</p>
      </div>

      <div className="bg-white rounded-3xl w-[90%] p-4 md:w-[60%] md:p-10 lg:w-[35%] lg:p-16 lg:py-4">
        {/* <p className="font-[500] text-3xl text-center">Sign Up</p> */}

        <div className="mt-4 flex flex-col gap-6">
            <div className="shadow-md rounded-2xl p-2 bg-white flex items-center gap-2">
                <div className="w-7 ml-2">
                  
                </div>
                <input placeholder="E-mail" className="p-2 border-none w-[100%] placeholder:text-black focus:outline-none" 
                  name='email' onChange={handleChange} value={userInfo.email}
                />
            </div>

            <div className="shadow-md rounded-2xl p-1 bg-white flex items-center">
                <div className="w-14">
                 
                </div>
                <input placeholder="Password" type={showPassword ? "text": "password"} className="p-2 border-none w-[100%] placeholder:text-black focus:outline-none" 
                  name='password' onChange={handleChange} value={userInfo.password}
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

            <div className="shadow-md rounded-2xl p-1 bg-white flex items-center">
                <div className="w-14">
                    
                </div>
                <input placeholder="Confirm password" type={showConfirmPassword ? "text": "password"} className="p-2 border-none w-[100%] placeholder:text-black focus:outline-none" 
                  name='confirmPassword' onChange={handleChange} value={userInfo.confirmPassword}
                />
                <div className="w-10">
                    { showConfirmPassword ? <img src={showPNG} alt="image" 
                        className="w-[100%] h-[100%] cursor-pointer"  onClick={hideConfirmPass}
                    /> :
                    <img src={eyePNG} alt="image" 
                        className="w-[100%] h-[100%] cursor-pointer" onClick={showConfirmPass}
                    /> }
                </div>
            </div>
        </div>

        <div className="w-[50%] mx-auto mt-6">
          <button className="w-[100%] p-2 bg-blue-600 rounded-3xl text-white font-semibold shadow-lg"
            onClick={handleSignup}
          >
            SIGN UP
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-5">
            <p className="text-black text-sm">Already have an account?</p>
            <p className="text-black text-sm font-semibold cursor-pointer">
                <Link to="/signin">Sign In</Link>
            </p>
        </div>
      </div>
    </div>
  )
}
