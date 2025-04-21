import { Navigate } from "react-router-dom";

// eslint-disable-next-line react/prop-types
export const PrivateRouter = ({children}) => {
    const token = localStorage.getItem('access_token');
    //console.log("token: ", token)
    if (!token) {
        return <Navigate to='/signin' />
    }

    return children;
}
