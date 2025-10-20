import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const Locations = () => {
    const userData = useSelector((state) => state.auth.userData);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingLocation, setEditingLocation] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        location_name: '',
        location_address: '',
        location_timezone: '',
        location_call_number: '',
        location_transfer_number: '',
        location_google_map_link: ''
    });

    // Timezone options
    const timezones = [
        'Pacific Standard Time (PST)',
        'Eastern Standard Time (EST)',
    ];

    // Get auth token from Redux store
    const getAuthToken = () => {
        return localStorage.getItem('accessToken') || userData?.token;
    };

    // Fetch all locations
    const fetchLocations = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            // console.log("Fetching locations with token:", token);
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/`, {
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

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            location_name: '',
            location_address: '',
            location_timezone: '',
            location_call_number: '',
            location_transfer_number: '',
            location_google_map_link: ''
        });
        setEditingLocation(null);
        setError('');
        setSuccess('');
    };

    // Submit form (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAuthToken();
            const url = editingLocation
                ? `${import.meta.env.VITE_BackendApi}/locations/update/${editingLocation.location_id}/`
                : `${import.meta.env.VITE_BackendApi}/locations/create/`;

            const method = editingLocation ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(errorData.detail || 'Failed to save location');
            // }
            if (!response.ok) {
                const errorData = await response.json();

                // If DRF sent a dictionary of field errors, join them into a readable message
                if (typeof errorData === 'object' && !errorData.detail) {
                    const messages = Object.entries(errorData)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join('\n');
                    throw new Error(messages);
                }

                throw new Error(errorData.detail || 'Failed to save location');
            }





            const savedLocation = await response.json();

            if (editingLocation) {
                setLocations(prev => prev.map(loc =>
                    loc.location_id === savedLocation.location_id ? savedLocation : loc
                ));
                setSuccess('Location updated successfully!');
            } else {
                setLocations(prev => [...prev, savedLocation]);
                setSuccess('Location created successfully!');
            }

            resetForm();
            setIsFormOpen(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Edit location
    const handleEdit = (location) => {
        setFormData({
            location_name: location.location_name,
            location_address: location.location_address,
            location_timezone: location.location_timezone,
            location_call_number: location.location_call_number || '',
            location_transfer_number: location.location_transfer_number || '',
            location_google_map_link: location.location_google_map_link || ''
        });
        setEditingLocation(location);
        setIsFormOpen(true);
        setError('');
        setSuccess('');
    };

    // Delete location
    const handleDelete = async (locationId) => {
        if (!window.confirm('Are you sure you want to delete this location?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/delete/${locationId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete location');
            }

            setLocations(prev => prev.filter(loc => loc.location_id !== locationId));
            setSuccess('Location deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch locations on component mount
    useEffect(() => {
        fetchLocations();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Locations Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setIsFormOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <span>+</span>
                    <span>Add New Location</span>
                </button>
            </div>

            {/* Status Messages */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                    {success}
                </div>
            )}

            {/* Locations Grid */}
            {!isFormOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locations.map((location) => (
                        <div key={location.location_id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{location.location_name}</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(location)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(location.location_id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div>
                                    <strong className="text-gray-700">Address:</strong>
                                    <p className="mt-1">{location.location_address}</p>
                                </div>
                                <div>
                                    <strong className="text-gray-700">Timezone:</strong>
                                    <p>{location.location_timezone}</p>
                                </div>
                                {location.location_call_number && (
                                    <div>
                                        <strong className="text-gray-700">Call Number:</strong>
                                        <p>{location.location_call_number}</p>
                                    </div>
                                )}
                                {location.location_transfer_number && (
                                    <div>
                                        <strong className="text-gray-700">Transfer Number:</strong>
                                        <p>{location.location_transfer_number}</p>
                                    </div>
                                )}
                                {location.location_google_map_link && (
                                    <div>
                                        <strong className="text-gray-700">Google Maps:</strong>
                                        <a
                                            href={location.location_google_map_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 block truncate"
                                        >
                                            View on Maps
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isFormOpen && locations.length === 0 && !isLoading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Found</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first location.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add Your First Location
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && !isFormOpen && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Location Form Modal */}
            {isFormOpen && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {editingLocation ? 'Edit Location' : 'Add New Location'}
                        </h3>
                        <button
                            onClick={() => {
                                setIsFormOpen(false);
                                resetForm();
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Location Name */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Location Name *
                                </label>
                                <input
                                    type="text"
                                    name="location_name"
                                    value={formData.location_name}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="Enter location name"
                                />
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Address *
                                </label>
                                <textarea
                                    name="location_address"
                                    value={formData.location_address}
                                    onChange={handleInputChange}
                                    required
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="Enter full address"
                                />
                            </div>

                            {/* Timezone */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Timezone *
                                </label>
                                <select
                                    name="location_timezone"
                                    value={formData.location_timezone}
                                    onChange={handleInputChange}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                >
                                    <option value="">Select Timezone</option>
                                    {timezones.map(tz => (
                                        <option key={tz} value={tz}>{tz}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Call Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Call Number
                                </label>
                                <input
                                    type="tel"
                                    name="location_call_number"
                                    value={formData.location_call_number}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="Optional"
                                />
                            </div>

                            {/* Transfer Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transfer Number
                                </label>
                                <input
                                    type="tel"
                                    name="location_transfer_number"
                                    value={formData.location_transfer_number}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="Optional"
                                />
                            </div>

                            {/* Google Maps Link */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Google Maps Link
                                </label>
                                <input
                                    type="url"
                                    name="location_google_map_link"
                                    value={formData.location_google_map_link}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="https://maps.google.com/..."
                                />
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsFormOpen(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {isLoading && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                )}
                                <span>
                                    {isLoading
                                        ? (editingLocation ? 'Updating...' : 'Creating...')
                                        : (editingLocation ? 'Update Location' : 'Create Location')
                                    }
                                </span>
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Locations;