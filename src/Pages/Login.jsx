// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import AuthService from "../ApiClass/auth";
// // // import AuthService from "../api/AuthService"; // adjust path if different
// // import { useDispatch } from "react-redux";
// // import { login } from "../store/authSlice";


// // // AuthService
// // const LoginPage = () => {
// //   const [username, setUsername] = useState("");
// //   const [password, setPassword] = useState("");
// //   const [error, setError] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const navigate = useNavigate();

// //   const dispatch = useDispatch();

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setError(null);
// //     setLoading(true);

// //     try {
// //       const res = await AuthService.AuthLogin({ username, password });

// //       // Save tokens (you can use Cookies if you prefer)
// //       localStorage.setItem("accessToken", res.access);
// //       localStorage.setItem("refreshToken", res.refresh);
// //       const userData = await AuthService.GetCurrentUserForApp(() => { });
// //       localStorage.setItem("userData", JSON.stringify(userData));
// //       localStorage.setItem("userRole", userData.role);

// //       console.log("Login success:", res);

// //       dispatch(login({
// //         accessToken: res.access,
// //         refreshToken: res.refresh,
// //         userData,
// //         userRole: userData.role,
// //       }));

// //       // Navigate to dashboard or home
// //       navigate("/dashboard");
// //     } catch (err) {
// //       console.error("Login error:", err);
// //       setError("Invalid username or password");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };



// // In LoginPage.jsx - update to use Redux
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { login } from "../store/authSlice"; // Import your Redux action
// import AuthService from "../ApiClass/auth";

// const LoginPage = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const dispatch = useDispatch(); // Get dispatch function

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     try {
//       const res = await AuthService.AuthLogin({ username, password });

//       // Dispatch to Redux store
//       dispatch(login({
//         accessToken: res.access,
//         refreshToken: res.refresh,
//         userData: res.userData, // This should now be available
//         userRole: res.userRole  // This should now be available
//       }));

//       console.log("Login success:", res);
//       navigate("/dashboard");
//     } catch (err) {
//       console.error("Login error:", err);
//       setError("Invalid username or password");
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6">
//         <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
//           Login
//         </h1>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Username
//             </label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//               className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter username"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">
//               Password
//             </label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter password"
//             />
//           </div>

//           {error && <p className="text-red-500 text-sm">{error}</p>}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;






import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice"; // Import the login action
import AuthService from "../ApiClass/auth";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Get the dispatch function

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await AuthService.AuthLogin({ username, password });

      // Dispatch to Redux store
      dispatch(login({
        accessToken: res.access,
        refreshToken: res.refresh,
        userData: res.userData,
        userRole: res.userRole
      }));

      console.log("Login success:", res);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter password"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;