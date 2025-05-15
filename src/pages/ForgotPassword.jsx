import { Link, useNavigate, useParams } from "react-router-dom"
import { usePassword } from "../hooks/usePassword"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import {loadingOff, loadingOn} from '../store/authSlice'
import { changePassword, confirmEmail } from "../services/auth"
import logo from "../assets/logo.svg"
import mailPNG from "../assets/email.svg"
import eyePNG from "../assets/eye.svg"
import showPNG from "../assets/show.svg"
import lockPNG from "../assets/lock.svg"
import toast from "react-hot-toast"

export const ForgotPassword = () => {
  const [showPassword, showPass, hidePass] = usePassword()
  const [userInfo, setUserInfo] = useState({
    email: '',
    newPassword: ''
  })
  const [isConfirmEmail, setIsConfirmEmail] = useState(false);

  const { forgotPasswordToken } = useParams();
  console.log("forgotPasswordToken");
  console.log(forgotPasswordToken);

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

  const handleChangePassword = async () => {
    if (!userInfo.email || !userInfo.newPassword) {
      toast.error('Fields cannot be empty!');
      return;
    }
    dispatch(loadingOn())
    console.log(forgotPasswordToken);
    const res = await changePassword({
      "token": forgotPasswordToken,
      ...userInfo
    })
    
    dispatch(loadingOff())
    if (typeof res === 'string') {
      toast.error(res);
      return;
    }
    if (res.success) {
      toast.success("Password changed successfully!");
      navigate('/signin')
    }
    else{
      toast.error("Unkown Error!")
    }
  }

  const handleConfirmEmail = async () => {
    if (!userInfo.email) {
      toast.error('Email field cannot be empty!');
      return;
    }
    dispatch(loadingOn())
    console.log(forgotPasswordToken);
    const res = await confirmEmail({
      "email": userInfo.email
    })
    
    dispatch(loadingOff())
    if (typeof res === 'string') {
      toast.error(res);
      return;
    }
    if (res.success) {
      toast.success("Chnage Password URL was sent to your email address!")
    }
    else{
      toast.error("Unkown Error!")
    }
  }

  useEffect(() =>{
    if(forgotPasswordToken) setIsConfirmEmail(true);
  }, [forgotPasswordToken])

  return (
    <div className="w-[100%] h-[100vh] flex flex-col gap-6 justify-center items-center bg-cover">
      <div>
        <p className="font-[500] text-3xl text-center">Forget Password</p>
      </div>

      <div className="bg-white rounded-3xl w-[90%] p-4 md:w-[60%] md:p-10 lg:w-[35%] lg:p-16 lg:py-4">
        {/* <p className="font-[500] text-3xl text-center">Forgot Password</p> */}

        <div className="mt-4 flex flex-col gap-6">
            <div className="shadow-md rounded-2xl p-2 bg-white flex items-center gap-2">
                <div className="w-7 ml-2">

                </div>
                <input placeholder="E-mail" className="p-2 border-none w-[100%] placeholder:text-black-400 focus:outline-none" 
                  name='email' onChange={handleChange} value={userInfo.email}
                />
            </div>

            {isConfirmEmail && (
              <div className="shadow-md rounded-2xl p-1 bg-white flex items-center">
                <div className="w-14">
                <img src={lockPNG} alt="image" 
                    className="w-[100%] h-[100%]"
                />
                </div>
                <input placeholder="New Password" type={showPassword ? "text": "password"} className="p-2 border-none w-[100%] placeholder:text-black-400 focus:outline-none" 
                  name='newPassword' onChange={handleChange} value={userInfo.newPassword}
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
            )}
            
        </div>

        <div className="w-[50%] mx-auto mt-6">
          {
            isConfirmEmail ? (
              <button className="w-[100%] p-2 bg-blue-600 rounded-3xl text-white font-semibold shadow-lg"
                onClick={handleChangePassword}
              >
                Change Password
              </button>
            ) : (
              <button className="w-[100%] p-2 bg-blue-600 rounded-3xl text-white font-semibold shadow-lg"
                onClick={handleConfirmEmail}
              >
                Confirm Email
              </button>
            )
          }
        </div>

        <div className="flex justify-center gap-2 mt-5">
            <p className="text-black text-sm font-semibold cursor-pointer">
                <Link to="/signin">Sign In</Link>
            </p>
        </div>
      </div>
    </div>
  )
}
