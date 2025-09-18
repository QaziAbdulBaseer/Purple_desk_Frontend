



import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { createAsyncThunk } from "@reduxjs/toolkit";
// import AuthService from "ApiClass/auth";




const getUserDataFromLocalStorage = (key) => {
    const storedData = localStorage.getItem(key);
    try {
        return storedData ? JSON.parse(storedData) : null;
    } catch (error) {
        console.error(`Error parsing ${key}:`, error);
        return null;
    }
};
const initialState = {
    status: !!localStorage.getItem("accessToken"), // True if token exists in localStorage
    userData: getUserDataFromLocalStorage("userData"),
    userRole: localStorage.getItem("userRole"), // userRole can be stored as a simple string
    accessToken: localStorage.getItem("accessToken") || Cookies.get("accessToken") // Include the token in the state for easy access
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload.userData;
            state.userRole = action.payload.userRole;
            state.accessToken = action.payload.accessToken; // Store token in the state
            state.refreshToken = action.payload.refreshToken; // Store token in the state


            // Save to localStorage
            localStorage.setItem("accessToken", action.payload.accessToken);
            localStorage.setItem("refreshToken", action.payload.refreshToken);
            localStorage.setItem("userData", JSON.stringify(action.payload.userData));
            localStorage.setItem("userRole", action.payload.userRole);
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
            state.userRole = null;
            state.accessToken = null;
            state.refreshToken = null;

            // Clear localStorage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userData");
            localStorage.removeItem("userRole");
        },
        updateUserData:(state, action) => {
            state.userData = action.payload.userData;

            localStorage.setItem("userData", JSON.stringify(action.payload.userData));
        }
    }
});

export const { login, logout , updateUserData } = authSlice.actions;
export default authSlice.reducer;