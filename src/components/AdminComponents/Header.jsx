// Header.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const Header = ({ onMenuClick, userData }) => {
    const { location_id } = useParams();
    console.log("this is the arg = = ", location_id)
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [Error, setError] = useState();

    const getAuthToken = () => {
        return localStorage.getItem('accessToken') || userData?.token;
    };

    const fetchLocations = async () => {
        setIsLoading(true);
        setError('');
        try {
            console.log("Inside fetchLocations, location_id =", location_id);
            const token = getAuthToken();
            // console.log("Fetching locations with token:", token);
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch locations');
            }

            const data = await response.json();
            setLocations(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (location_id) fetchLocations();
    }, [location_id]);

    return (
        <header className="bg-white shadow">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center">
                    <button
                        className="text-gray-500 hover:text-gray-700 lg:hidden"
                        onClick={onMenuClick}
                    >
                        ☰
                    </button>
                    <div className="ml-4 text-gray-800">
                        <h1 className="text-xl font-semibold">{locations.location_name}</h1>
                    </div>
                </div>

                <div className="flex items-center">
                    <div className="mr-4 text-right">
                        <p className="text-sm font-medium text-gray-800">{userData?.username || 'User'}</p>
                        <p className="text-xs text-gray-500 capitalize">{userData?.role || 'User'}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                            {userData?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;








