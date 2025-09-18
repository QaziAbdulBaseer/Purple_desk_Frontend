
import axios from 'axios'
import Cookies from 'js-cookie';
import { logout } from '../store/authSlice';
// import { logout } from 'store/authSlice.js';



export class AuthServiceClass {

    // async AuthLogin({ email, password }) {
    //     try {
    //         const response = await axios.post(`${import.meta.env.VITE_BackendApi}/login`, {
    //             email: email,
    //             password: password
    //         });
    //         return response.data; // Return actual response if needed
    //     } catch (error) {
    //         console.log("ApiClass auth AuthServicesClass :: AuthLogin :: error", error);
    //         throw error; // Optional: re-throw the error for higher-level handling
    //     }
    // }

    // async AuthLogin({ username, password }) {
    //     try {
    //         const response = await axios.post(
    //             `${import.meta.env.VITE_BackendApi}/login/`, // note: ensure trailing slash
    //             {
    //                 username: username,
    //                 password: password,
    //             }
    //         );
    //         console.log("this is the response data = ", response.data)
    //         return response.data;
    //     } catch (error) {
    //         console.log("AuthLogin error:", error);
    //         throw error;
    //     }
    // }



    // In AuthServiceClass - update the AuthLogin method
async AuthLogin({ username, password }) {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BackendApi}/login/`,
            { username, password }
        );
        
        // Store tokens
        localStorage.setItem("accessToken", response.data.access);
        localStorage.setItem("refreshToken", response.data.refresh);
        
        // Now get user profile data
        try {
            const profileResponse = await axios.get(
                `${import.meta.env.VITE_BackendApi}/profile/`,
                {
                    headers: {
                        Authorization: `Bearer ${response.data.access}`,
                    },
                }
            );
            
            // Return both tokens and user data
            return {
                ...response.data,
                userData: profileResponse.data,
                userRole: profileResponse.data.role
            };
        } catch (profileError) {
            console.error("Failed to fetch user profile:", profileError);
            // Still return tokens even if profile fetch fails
            return response.data;
        }
    } catch (error) {
        console.log("AuthLogin error:", error);
        throw error;
    }
}

    async GetCurrentUser() {

        try {
            const accessToken = Cookies.get("accessToken");
            const response = await axios.get(`${import.meta.env.VITE_BackendApi}/profile`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`, // Add token here
                        // 'Content-Type': 'multipart/form-data' // Adjust this if your file upload requires it
                    }
                }
            );
            console.log("This import to see = ", response.data)
            return response.data; // Return actual response if needed
        } catch (error) {
            console.log("ApiClass auth AuthServicesClass :: GetCurrentUser :: error", error);
            throw error; // Optional: re-throw the error for higher-level handling
        }
    }


    // In AuthServiceClass
    async GetCurrentUserForApp(dispatch) {
        console.log("Fetching user information");
        const accessToken = localStorage.getItem("accessToken"); // Changed from Cookies.get()

        if (!accessToken) {
            console.info("No access token found");
            dispatch(logout());
            return null;
        }

        try {
            const response = await axios.get(`${import.meta.env.VITE_BackendApi}/profile`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log("User information fetched: ", response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching user info:", error);
            if (error.response?.status === 401) {
                console.warn("Token expired or invalid");
                dispatch(logout());
            }
            throw error;
        }
    }


    async AuthSignUp({ name, email, phone, password, userRole }) {
        try {
            const response = await axios.post(`${import.meta.env.VITE_BackendApi}/signup`, {
                fullName: name,
                userRole: userRole,
                phone: phone,
                email: email,
                password: password,
                avatar: "",
            });
            return response.data; // Return actual response if needed
        } catch (error) {
            console.log(error)
            const errorMessage = error.response?.data?.message || "An unexpected error occurred";
            console.error("AuthSignUp Error:", errorMessage);
            return errorMessage; // Return a string message to avoid rendering issues
        }
    }




    // async AuthAvatarChange({ avatar }) {
    //     try {
    //         const accessToken = Cookies.get("accessToken");
    //         const response = await axios.patch(`${import.meta.env.VITE_BackendApi}/users/avatar`,
    //             avatar,// file data goes in the request body
    //             {
    //                 headers: {
    //                     'Authorization': `Bearer ${accessToken}`, // Add token here
    //                     // 'Content-Type': 'multipart/form-data' // Adjust this if your file upload requires it
    //                 }
    //             }
    //         );
    //         return response.data;
    //     } catch (error) {
    //         console.log(error)
    //         const errorMessage = error.response?.data?.message || "An unexpected error occurred";
    //         console.error("AuthSignUp Error:", errorMessage);
    //         return errorMessage; // Return a string message to avoid rendering issues
    //     }
    // }
}


const AuthService = new AuthServiceClass()
export default AuthService