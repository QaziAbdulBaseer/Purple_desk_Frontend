

import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';

// Custom middleware to sync localStorage changes across tabs
const storageMiddleware = (store) => (next) => (action) => {
    if (!storageMiddleware.listenerAdded) {
        const handleStorageChange = (event) => {
            const authKeys = ['accessToken', 'refreshToken', 'userData', 'userRole'];
            if (authKeys.includes(event.key)) {
                try {
                    const accessToken = localStorage.getItem('accessToken');
                    const refreshToken = localStorage.getItem('refreshToken');
                    const userDataStr = localStorage.getItem('userData');
                    const userRole = localStorage.getItem('userRole');

                    // Parse userData safely
                    let userData = null;
                    if (userDataStr) {
                        try {
                            userData = JSON.parse(userDataStr);
                        } catch (error) {
                            console.error('Error parsing userData:', error);
                        }
                    }

                    // Current state from Redux
                    const currentState = store.getState().auth;

                    // Check if any relevant data has changed
                    const isDifferent = (
                        accessToken !== currentState.accessToken ||
                        refreshToken !== currentState.refreshToken ||
                        JSON.stringify(userData) !== JSON.stringify(currentState.userData) ||
                        userRole !== currentState.userRole
                    );

                    if (isDifferent) {
                        if (accessToken) {
                            store.dispatch(authSlice.actions.login({
                                accessToken,
                                refreshToken,
                                userData,
                                userRole,
                            }));
                        } else {
                            store.dispatch(authSlice.actions.logout());
                        }
                    }
                } catch (error) {
                    console.error('Error handling storage event:', error);
                }
            }
        };

        // Add event listener for storage changes
        window.addEventListener('storage', handleStorageChange);
        storageMiddleware.listenerAdded = true;
    }

    return next(action);
};

// Configure the Redux store
const store = configureStore({
    reducer: {
        auth: authSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }).concat(storageMiddleware), // Add the custom middleware
});

export default store;