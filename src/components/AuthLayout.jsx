

// // import React, { useMemo } from 'react';
// // import { useDispatch, useSelector } from "react-redux";
// // import { Navigate } from "react-router-dom";
// // import { logout } from '../store/authSlice';

// // // const AuthLayout = ({ authentication, userRole, children }) => {
// // //     const dispatch = useDispatch();
// // //     console.log("This is the state", state.auth.status)
// // //     console.log("This is the state", state.auth)
// // //     console.log("This is the state", state)
// // //     const isAuthenticated = useSelector((state) => state.auth.status);
// // //     const userCurrentRole = useSelector((state) => state.auth.userRole);

// // //     // Convert userRole to array if it's not already
// // //     const allowedRoles = Array.isArray(userRole) ? userRole : [userRole];

// // //     const shouldLogout = useMemo(() => 
// // //         authentication && 
// // //         allowedRoles.length > 0 && 
// // //         !allowedRoles.includes(userCurrentRole),
// // //         [authentication, allowedRoles, userCurrentRole]
// // //     );

// // //     if (authentication && !isAuthenticated) {
// // //         console.log("this is test 1")
// // //         return <Navigate to="/login" />;
// // //     }

// // //     if (shouldLogout) {
// // //         dispatch(logout());
// // //         return <Navigate to="/" />;
// // //     }

// // //     return children;
// // // };



// // const AuthLayout = ({ authentication, userRole, children }) => {
// //     const dispatch = useDispatch();

// //     // Access parts of the state with useSelector
// //     const authState = useSelector((state) => state.auth);
// //     const isAuthenticated = authState.status;
// //     const userCurrentRole = authState.userRole;

// //     console.log("This is the auth state", authState);

// //     // Convert userRole to array if it's not already
// //     const allowedRoles = Array.isArray(userRole) ? userRole : [userRole];

// //     const shouldLogout = useMemo(() => 
// //         authentication && 
// //         allowedRoles.length > 0 && 
// //         !allowedRoles.includes(userCurrentRole),
// //         [authentication, allowedRoles, userCurrentRole]
// //     );

// //     if (authentication && !isAuthenticated) {
// //         console.log("this is test 1");
// //         return <Navigate to="/login" />;
// //     }

// //     if (shouldLogout) {
// //         dispatch(logout());
// //         return <Navigate to="/" />;
// //     }

// //     return children;
// // };

// // export default AuthLayout;



// import React, { useMemo } from 'react';
// import { useDispatch, useSelector } from "react-redux";
// import { Navigate } from "react-router-dom";
// import { logout } from '../store/authSlice';

// const AuthLayout = ({ authentication, userRole, children }) => {
//     const dispatch = useDispatch();
    
//     // Fix: Properly access the Redux state
//     const authState = useSelector((state) => state.auth);
//     const isAuthenticated = authState.status;
//     const userCurrentRole = authState.userRole;

//     // Convert userRole to array if it's not already
//     const allowedRoles = Array.isArray(userRole) ? userRole : [userRole];

//     const shouldLogout = useMemo(() => 
//         authentication && 
//         allowedRoles.length > 0 && 
//         !allowedRoles.includes(userCurrentRole),
//         [authentication, allowedRoles, userCurrentRole]
//     );

//     if (authentication && !isAuthenticated) {
//         return <Navigate to="/login" />;
//     }

//     if (shouldLogout) {
//         dispatch(logout());
//         console.log("this is test 1")
//         return <Navigate to="/" />;
//     }

//     return children;
// };

// export default AuthLayout;




import React, { useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { logout } from '../store/authSlice';

const AuthLayout = ({ authentication, userRole, children }) => {
    const dispatch = useDispatch();
    
    // Get the auth state from Redux
    const authState = useSelector((state) => state.auth);
    const isAuthenticated = authState.status;
    const userCurrentRole = authState.userRole;

    console.log("AuthLayout - isAuthenticated:", isAuthenticated, "userRole:", userCurrentRole);

    // Convert userRole to array if it's not already
    const allowedRoles = Array.isArray(userRole) ? userRole : [userRole];

    const shouldLogout = useMemo(() => 
        authentication && 
        allowedRoles.length > 0 && 
        !allowedRoles.includes(userCurrentRole),
        [authentication, allowedRoles, userCurrentRole]
    );

    // Check if we need to redirect to login
    if (authentication && !isAuthenticated) {
        console.log("Redirecting to login - not authenticated");
        return <Navigate to="/login" />;
    }

    // Check if user has the right role
    if (shouldLogout) {
        console.log("Logging out - invalid role");
        dispatch(logout());
        return <Navigate to="/" />;
    }

    // If authenticated and has the right role, show the children
    return children;
};

export default AuthLayout;