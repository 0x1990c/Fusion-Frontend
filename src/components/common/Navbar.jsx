import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export const Navbar = () => {

    const navigate = useNavigate()

    const handleLogout = async () => {
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_email');

        localStorage.clear();
        navigate('/signin')
      }

    return (
        <>
            <div className="flex justify-end items-center pl-8 pt-8">
                <div className="flex items-center mr-12 cursor-pointer" onClick={handleLogout}>
                    <img src="log-out.png" alt="Logout" className="w-12 h-12" />
                </div>
            </div>

            <div className="pt-16" >
                <div className="flex items-center gap-1">
                    <div className={`py-2 px-4 ${window.location.pathname === '/messages' ? 'bg-red-700' : 'bg-yellow-400 hover:bg-yellow-500'} inline-block cursor-pointer`}>
                        <Link to="/messages"><p className="text-xl font-semibold text-white">Main</p></Link>
                    </div>
                    <div className={`py-2 px-4 ${window.location.pathname === '/clients' ? 'bg-red-700' : 'bg-green-700 hover:bg-green-800'} inline-block cursor-pointer`}>
                        <Link to="/clients"><p className="text-xl font-semibold text-white">LIST</p></Link>
                    </div>
                    <div className={`py-2 px-4 ${window.location.pathname === '/phones' ? 'bg-red-700' : 'bg-blue-700 hover:bg-blue-800'} inline-block cursor-pointer`}>
                        <Link to="/phones"><p className="text-xl font-semibold text-white">Mail Merge</p></Link>
                    </div>
                </div>
            </div>
        </>
    )
}