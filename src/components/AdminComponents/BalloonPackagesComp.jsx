


// Import required React and Redux hooks
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

const PartyBalloonPackageComp = () => {
    // Get location_id from URL parameters and initialize navigation
    const { location_id } = useParams();
    const navigate = useNavigate();

    // Get user data from Redux store
    const userData = useSelector((state) => state.auth.userData);

    // State declarations for component data management
    const [packages, setPackages] = useState([]);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingPackage, setEditingPackage] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // Form data state initialization
    const [formData, setFormData] = useState({
        package_name: '',
        call_flow_priority: '',
        promotional_pitch: '',
        package_inclusions: '',
        discount: '',
        price: '',
        note: ''
    });

    // State for priority options
    const [priorityOptions, setPriorityOptions] = useState([]);

    // Function to get authentication token from localStorage or Redux store
    const getAuthToken = () => {
        return localStorage.getItem('accessToken') || userData?.token;
    };

    // Fetch location details from API
    const fetchLocation = async () => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLocation(data);
            }
        } catch (err) {
            console.error('Failed to fetch location:', err);
        }
    };

    // Fetch party balloon packages for the current location
    const fetchPackages = async () => {
        if (!location_id) return;

        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/party_balloon_packages/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch party balloon packages');
            }

            const data = await response.json();
            setPackages(data);

            // Generate priority options based on existing packages
            const options = generatePriorityOptions(data, null);
            setPriorityOptions(options);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Generate priority options based on existing packages
    const generatePriorityOptions = (existingPackages, currentEditingPackage) => {
        // Always include "Do not pitch" (999) option
        const doNotPitchOption = { value: 999, label: 'Do not pitch' };
        
        // If no packages exist, return basic options plus "Do not pitch"
        if (!existingPackages || existingPackages.length === 0) {
            return [
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
                { value: 5, label: '5' },
                doNotPitchOption
            ];
        }

        // Get all used priorities (excluding the current editing package's priority)
        const usedPriorities = new Set();
        existingPackages.forEach(pkg => {
            // If we're editing a package, exclude its current priority from used priorities
            if (currentEditingPackage && pkg.party_balloon_package_id === currentEditingPackage.party_balloon_package_id) {
                return; // Skip the current editing package
            }
            usedPriorities.add(pkg.call_flow_priority);
        });

        // Generate available priorities from 1 to 20 that are not used
        const availableOptions = [];
        for (let i = 1; i <= 20; i++) {
            if (!usedPriorities.has(i)) {
                availableOptions.push({ value: i, label: i.toString() });
            }
        }

        // If we're editing, include the current package's priority in the options
        if (currentEditingPackage) {
            const currentPriority = currentEditingPackage.call_flow_priority;
            // Only add if it's not already included (in case it's outside 1-20 range)
            if (currentPriority !== 999 && !availableOptions.some(opt => opt.value === currentPriority)) {
                availableOptions.unshift({ 
                    value: currentPriority, 
                    label: currentPriority.toString() 
                });
            }
        }

        // Sort available options by value (1, 2, 3, ...)
        availableOptions.sort((a, b) => a.value - b.value);

        // Take first 5 available options (or all if less than 5)
        const topAvailable = availableOptions.slice(0, 5);

        // Always include "Do not pitch" at the end
        return [...topAvailable, doNotPitchOption];
    };

    // Handle general input changes in form
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle textarea changes
    const handleTextareaChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            package_name: '',
            call_flow_priority: '',
            promotional_pitch: '',
            package_inclusions: '',
            discount: '',
            price: '',
            note: ''
        });
        setEditingPackage(null);
        setError('');
        setSuccess('');
        setFieldErrors({});
        
        // Reset priority options for new form
        const options = generatePriorityOptions(packages, null);
        setPriorityOptions(options);
    };

    // Validate form data
    const validateForm = () => {
        const errors = {};
        const requiredFields = [
            'package_name',
            'call_flow_priority',
            'promotional_pitch',
            'package_inclusions',
            'price'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] && formData[field] !== 0) {
                errors[field] = `${field.replace(/_/g, ' ')} is required`;
            }
        });

        if (formData.call_flow_priority && (formData.call_flow_priority < 0 || formData.call_flow_priority > 1000)) {
            errors.call_flow_priority = 'Priority must be between 0 and 1000';
        }

        if (formData.price && formData.price < 0) {
            errors.price = 'Price cannot be negative';
        }

        if (formData.discount && formData.discount < 0) {
            errors.discount = 'Discount cannot be negative';
        }

        return errors;
    };

    // Handle form submission with validation
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        await submitForm();
    };

    // Submit form data to API
    const submitForm = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        try {
            const token = getAuthToken();
            const url = editingPackage
                ? `${import.meta.env.VITE_BackendApi}/locations/${location_id}/party_balloon_packages/${editingPackage.party_balloon_package_id}/update/`
                : `${import.meta.env.VITE_BackendApi}/locations/${location_id}/party_balloon_packages/create/`;

            const method = editingPackage ? 'PUT' : 'POST';

            const submitData = {
                ...formData
            };

            // Handle empty optional fields
            if (submitData.discount === '') submitData.discount = null;
            if (submitData.note === '') submitData.note = null;

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 400) {
                    const backendErrors = formatBackendErrors(responseData);
                    setFieldErrors(backendErrors);
                    setError('Please fix the validation errors below');
                } else {
                    throw new Error(responseData.error || responseData.detail || 'Failed to save party balloon package');
                }
                return;
            }

            const savedPackage = responseData;

            if (editingPackage) {
                setPackages(prev => prev.map(pkg =>
                    pkg.party_balloon_package_id === savedPackage.party_balloon_package_id ? savedPackage : pkg
                ));
                setSuccess('Party balloon package updated successfully!');
            } else {
                setPackages(prev => [...prev, savedPackage]);
                setSuccess('Party balloon package created successfully!');
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

    // Format backend errors for display
    const formatBackendErrors = (errorData) => {
        const formattedErrors = {};
        Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
                formattedErrors[field] = errorData[field].join(', ');
            } else {
                formattedErrors[field] = errorData[field];
            }
        });
        return formattedErrors;
    };

    // Format currency values
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return `$${parseFloat(value).toFixed(2)}`;
    };

    // Handle edit package - populate form with existing data
    const handleEdit = (pkg) => {
        setFormData({
            package_name: pkg.package_name,
            call_flow_priority: pkg.call_flow_priority,
            promotional_pitch: pkg.promotional_pitch,
            package_inclusions: pkg.package_inclusions,
            discount: pkg.discount || '',
            price: pkg.price,
            note: pkg.note || ''
        });
        setEditingPackage(pkg);
        setIsFormOpen(true);
        setError('');
        setSuccess('');
        setFieldErrors({});
        
        // Generate priority options including the current package's priority
        const options = generatePriorityOptions(packages, pkg);
        setPriorityOptions(options);
    };

    // Handle delete package with confirmation
    const handleDelete = async (packageId) => {
        if (!window.confirm('Are you sure you want to delete this party balloon package?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/party_balloon_packages/${packageId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete party balloon package');
            }

            setPackages(prev => prev.filter(pkg => pkg.party_balloon_package_id !== packageId));
            setSuccess('Party balloon package deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when component mounts or location_id changes
    useEffect(() => {
        if (location_id) {
            fetchLocation();
            fetchPackages();
        }
    }, [location_id]);

    // Update priority options when packages change and form is open for new package
    useEffect(() => {
        if (isFormOpen && !editingPackage) {
            const options = generatePriorityOptions(packages, null);
            setPriorityOptions(options);
        }
    }, [packages, isFormOpen, editingPackage]);

    // Main component render
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Party Balloon Packages</h2>
                    {location && (
                        <p className="text-gray-600 mt-1">
                            Managing party balloon packages for: <span className="font-semibold">{location.location_name}</span>
                        </p>
                    )}
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setIsFormOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <span>+</span>
                    <span>Add New Package</span>
                </button>
            </div>

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

            {!isFormOpen && location_id && (
                <div className="space-y-4">
                    {packages
                        .sort((a, b) => a.call_flow_priority - b.call_flow_priority)
                        .map((pkg) => {
                            const finalPrice = parseFloat(pkg.price).toFixed(2);
                            const discountAmount = pkg.discount ? parseFloat(pkg.discount).toFixed(2) : null;

                            return (
                                <div key={pkg.party_balloon_package_id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{pkg.package_name}</h3>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Priority: {pkg.call_flow_priority === 999 ? 'Do not pitch' : pkg.call_flow_priority}
                                                </span>
                                                {discountAmount && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Discount: ${discountAmount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(pkg)}
                                                className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pkg.party_balloon_package_id)}
                                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-200 hover:border-red-300 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Price:</span>
                                            <p className="font-medium">${finalPrice}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Discount:</span>
                                            <p className="font-medium">{formatCurrency(pkg.discount)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Call Flow Priority:</span>
                                            <p className="font-medium">
                                                {pkg.call_flow_priority === 999 ? 'Do not pitch' : pkg.call_flow_priority}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <span className="text-gray-600">Promotional Pitch:</span>
                                            <p className="font-medium mt-1">{pkg.promotional_pitch}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Package Inclusions:</span>
                                            <p className="font-medium mt-1">{pkg.package_inclusions}</p>
                                        </div>
                                        {pkg.note && (
                                            <div>
                                                <span className="text-gray-600">Note:</span>
                                                <p className="font-medium mt-1">{pkg.note}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            )}

            {!isFormOpen && location_id && packages.length === 0 && !isLoading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🎈</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Party Balloon Packages Configured</h3>
                    <p className="text-gray-500 mb-4">Add party balloon packages for this location to get started.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add Package
                    </button>
                </div>
            )}

            {isLoading && !isFormOpen && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {isFormOpen && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {editingPackage ? 'Edit Party Balloon Package' : 'Add New Party Balloon Package'}
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
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Package Name *
                                </label>
                                <input
                                    type="text"
                                    name="package_name"
                                    value={formData.package_name}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.package_name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter package name"
                                />
                                {fieldErrors.package_name && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.package_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Call Flow Priority *
                                </label>
                                <select
                                    name="call_flow_priority"
                                    value={formData.call_flow_priority}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.call_flow_priority ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select Priority</option>
                                    {priorityOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors.call_flow_priority && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.call_flow_priority}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className={`mt-1 block w-full pl-7 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.price ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {fieldErrors.price && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Discount
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className={`mt-1 block w-full pl-7 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.discount ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {fieldErrors.discount && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.discount}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Promotional Pitch *
                                </label>
                                <textarea
                                    name="promotional_pitch"
                                    value={formData.promotional_pitch}
                                    onChange={handleTextareaChange}
                                    rows={3}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.promotional_pitch ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter promotional pitch for this package..."
                                />
                                {fieldErrors.promotional_pitch && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.promotional_pitch}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Package Inclusions *
                                </label>
                                <textarea
                                    name="package_inclusions"
                                    value={formData.package_inclusions}
                                    onChange={handleTextareaChange}
                                    rows={3}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.package_inclusions ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter what's included in this package (separate with commas or new lines)..."
                                />
                                {fieldErrors.package_inclusions && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.package_inclusions}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note
                                </label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleTextareaChange}
                                    rows={2}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="Additional notes about this package..."
                                />
                            </div>
                        </div>

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
                                        ? (editingPackage ? 'Updating...' : 'Creating...')
                                        : (editingPackage ? 'Update Package' : 'Create Package')
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

export default PartyBalloonPackageComp;