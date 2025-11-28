




// Import required React and Redux hooks
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

const MembershipComp = () => {
    // Get location_id from URL parameters and initialize navigation
    const { location_id } = useParams();
    const navigate = useNavigate();

    // Get user data from Redux store
    const userData = useSelector((state) => state.auth.userData);

    // State declarations for component data management
    const [memberships, setMemberships] = useState([]);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingMembership, setEditingMembership] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // State for hours of operation and conflict management
    const [hoursOfOperation, setHoursOfOperation] = useState([]);
    const [conflicts, setConflicts] = useState([]);
    const [showConflictPopup, setShowConflictPopup] = useState(false);
    const [pendingSubmission, setPendingSubmission] = useState(null);

    // State for dynamic schedule options
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [hasSchedules, setHasSchedules] = useState(true);

    // Form data state initialization
    const [formData, setFormData] = useState({
        title: '',
        schedule_with: [],
        pitch_priority: '',
        pitch_introduction: '',
        activity_time: '',
        features: '',
        valid_until: '',
        party_discount: '',
        price: '',
        parent_addon_price: '',
        subscription: '',
        tax_included: 'no'
    });

    // Subscription options
    const SUBSCRIPTION_OPTIONS = [
        'Monthly',
        'Quarterly',
        'Annual',
        'One-time',
        'Custom'
    ];

    // Yes/No options for form fields
    const YES_NO_OPTIONS = ['yes', 'no'];

    // Days of week for date selection
    const DAYS_OF_WEEK = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday'
    ];

    // Function to get authentication token from localStorage or Redux store
    const getAuthToken = () => {
        return localStorage.getItem('accessToken') || userData?.token;
    };

    // Function to fetch available schedules from hours of operation
    const fetchAvailableSchedules = async () => {
        if (!location_id) return;

        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/hours/${location_id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log("This is the hours of operation for memberships:", data);
                setHoursOfOperation(data);

                // Extract unique schedule_with values from hours of operation
                const uniqueSchedules = [...new Set(data.map(hour => hour.schedule_with))]
                    .filter(schedule => schedule && schedule !== 'closed');

                setAvailableSchedules(uniqueSchedules);
                setHasSchedules(uniqueSchedules.length > 0);

                return uniqueSchedules;
            } else {
                setHasSchedules(false);
                return [];
            }
        } catch (err) {
            console.error('Failed to fetch schedules:', err);
            setHasSchedules(false);
            return [];
        }
    };

    // Generate priority options based on existing memberships
    const generatePriorityOptions = (existingMemberships) => {
        if (!existingMemberships || existingMemberships.length === 0) {
            return [1, 2, 3, 4, 999];
        }

        const existingPriorities = existingMemberships
            .map(membership => membership.pitch_priority)
            .filter(priority => priority !== 999)
            .sort((a, b) => a - b);

        const usedPriorities = new Set(existingPriorities);
        const availableOptions = [];

        for (let i = 1; i <= 20; i++) {
            if (!usedPriorities.has(i)) {
                availableOptions.push(i);
            }
        }

        const topAvailable = availableOptions.slice(0, 4);
        return [...topAvailable, 999];
    };

    // Handle schedule selection with checkboxes
    const handleScheduleWithChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentSelection = Array.isArray(prev.schedule_with) ? prev.schedule_with : [];

            if (checked) {
                return {
                    ...prev,
                    schedule_with: [...currentSelection, value]
                };
            } else {
                return {
                    ...prev,
                    schedule_with: currentSelection.filter(item => item !== value)
                };
            }
        });

        if (fieldErrors.schedule_with) {
            setFieldErrors(prev => ({
                ...prev,
                schedule_with: ''
            }));
        }
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

    // Fetch memberships for the current location
    const fetchMemberships = async () => {
        if (!location_id) return;

        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/memberships/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch memberships');
            }

            const data = await response.json();
            setMemberships(data);

            const options = generatePriorityOptions(data);
            setPriorityOptions(options);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch hours of operation
    const fetchHoursOfOperation = async () => {
        await fetchAvailableSchedules();
    };

    // Convert time string to minutes for calculations
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Parse activity time string to minutes
    const parseActivityTimeToMinutes = (activityTime) => {
        if (!activityTime) return 0;
        if (activityTime.toLowerCase() === 'all day') return 24 * 60;

        const timeStr = activityTime.toLowerCase().trim();
        const numbers = timeStr.match(/\d+(\.\d+)?/g);
        if (!numbers || numbers.length === 0) return 0;

        const value = parseFloat(numbers[0]);

        if (timeStr.includes('hour')) {
            return Math.round(value * 60);
        } else if (timeStr.includes('min')) {
            return Math.round(value);
        } else {
            return Math.round(value);
        }
    };

    // Get index of day in week array
    const getDayIndex = (dayName) => {
        return DAYS_OF_WEEK.indexOf(dayName);
    };

    // Format time string to readable format
    const formatTime = (time) => {
        if (!time) return 'N/A';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
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

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            title: '',
            schedule_with: [],
            pitch_priority: '',
            pitch_introduction: '',
            activity_time: '',
            features: '',
            valid_until: '',
            party_discount: '',
            price: '',
            parent_addon_price: '',
            subscription: '',
            tax_included: 'no'
        });
        setEditingMembership(null);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };

    // Validate form data
    const validateForm = () => {
        const errors = {};
        const requiredFields = [
            'title',
            'pitch_priority',
            'price'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] && formData[field] !== 0) {
                errors[field] = `${field.replace(/_/g, ' ')} is required`;
            }
        });

        if (!formData.schedule_with || formData.schedule_with.length === 0) {
            errors.schedule_with = 'At least one schedule type must be selected';
        }

        if (formData.pitch_priority && (formData.pitch_priority < 0 || formData.pitch_priority > 1000)) {
            errors.pitch_priority = 'Priority must be between 0 and 1000';
        }

        if (formData.price && formData.price < 0) {
            errors.price = 'Price cannot be negative';
        }

        if (formData.party_discount && formData.party_discount < 0) {
            errors.party_discount = 'Party discount cannot be negative';
        }

        // if (formData.parent_addon_price ) {
        //     errors.parent_addon_price = 'Parent addon price cannot be negative';
        // }

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

        await submitForm({ formData, editingMembership });
    };

    // Submit form data to API
    const submitForm = async (submissionData) => {
        if (!submissionData) return;

        const { formData, editingMembership } = submissionData;
        setIsLoading(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        try {
            const token = getAuthToken();
            const url = editingMembership
                ? `${import.meta.env.VITE_BackendApi}/locations/${location_id}/memberships/${editingMembership.membership_id}/update/`
                : `${import.meta.env.VITE_BackendApi}/locations/${location_id}/memberships/create/`;

            const method = editingMembership ? 'PUT' : 'POST';

            const submitData = {
                ...formData,
                tax_included: formData.tax_included === 'yes'
            };

            // Handle empty optional fields
            const optionalFields = [
                'pitch_introduction',
                'activity_time',
                'features',
                'valid_until',
                'party_discount',
                'parent_addon_price',
                'subscription'
            ];

            optionalFields.forEach(field => {
                if (submitData[field] === '') {
                    submitData[field] = null;
                }
            });

            // Convert empty string to null for numeric fields
            if (submitData.party_discount === '') submitData.party_discount = null;
            if (submitData.parent_addon_price === '') submitData.parent_addon_price = null;

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
                    throw new Error(responseData.error || responseData.detail || 'Failed to save membership');
                }
                return;
            }

            const savedMembership = responseData;

            if (editingMembership) {
                setMemberships(prev => prev.map(membership =>
                    membership.membership_id === savedMembership.membership_id ? savedMembership : membership
                ));
                setSuccess('Membership updated successfully!');
            } else {
                setMemberships(prev => [...prev, savedMembership]);
                setSuccess('Membership created successfully!');
            }

            resetForm();
            setIsFormOpen(false);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
            setPendingSubmission(null);
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

    // Format schedule name for display
    const formatScheduleWith = (schedule) => {
        if (!schedule) return 'N/A';
        return schedule.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Format yes/no values for display
    const formatYesNo = (value) => {
        return value === 'yes' ? 'Yes' : 'No';
    };

    // Format currency values
    const formatCurrency = (value) => {
        if (value === null || value === undefined) return 'N/A';
        return `$${parseFloat(value).toFixed(2)}`;
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Handle edit membership - populate form with existing data
    const handleEdit = (membership) => {
        setFormData({
            title: membership.title,
            schedule_with: Array.isArray(membership.schedule_with) ? membership.schedule_with : [membership.schedule_with].filter(Boolean),
            pitch_priority: membership.pitch_priority,
            pitch_introduction: membership.pitch_introduction || '',
            activity_time: membership.activity_time || '',
            features: membership.features || '',
            valid_until: membership.valid_until || '',
            party_discount: membership.party_discount || '',
            price: membership.price,
            parent_addon_price: membership.parent_addon_price || '',
            subscription: membership.subscription || '',
            tax_included: membership.tax_included ? 'yes' : 'no'
        });
        setEditingMembership(membership);
        setIsFormOpen(true);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };

    // Handle delete membership with confirmation
    const handleDelete = async (membershipId) => {
        if (!window.confirm('Are you sure you want to delete this membership?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/memberships/${membershipId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete membership');
            }

            setMemberships(prev => prev.filter(membership => membership.membership_id !== membershipId));
            setSuccess('Membership deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Function to navigate to hours of operation page
    const navigateToHoursOfOperation = () => {
        navigate(`/hours-of-operation/${location_id}`);
    };

    // State for priority options
    const [priorityOptions, setPriorityOptions] = useState([]);

    // Fetch data when component mounts or location_id changes
    useEffect(() => {
        if (location_id) {
            fetchLocation();
            fetchMemberships();
            fetchHoursOfOperation();
        }
    }, [location_id]);

    // Render error state when no schedules are available
    if (!hasSchedules) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Memberships</h2>
                        {location && (
                            <p className="text-gray-600 mt-1">
                                Managing memberships for: <span className="font-semibold">{location.location_name}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-md text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold mb-2">No Hours of Operation Found</h3>
                    <p className="mb-4">
                        You need to set up hours of operation before creating memberships.
                        Please add operating hours for at least one schedule type.
                    </p>
                    <button
                        onClick={navigateToHoursOfOperation}
                        className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
                    >
                        Go to Hours of Operation
                    </button>
                </div>
            </div>
        );
    }

    // Main component render
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Memberships</h2>
                    {location && (
                        <p className="text-gray-600 mt-1">
                            Managing memberships for: <span className="font-semibold">{location.location_name}</span>
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
                    <span>Add New Membership</span>
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
                    {memberships
                        .sort((a, b) => a.pitch_priority - b.pitch_priority)
                        .map((membership) => {
                            const isTaxIncluded = membership.tax_included;
                            const finalPrice = parseFloat(membership.price).toFixed(2);

                            return (
                                <div key={membership.membership_id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{membership.title}</h3>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    Priority: {membership.pitch_priority === 999 ? 'Do not Pitch' : membership.pitch_priority}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {Array.isArray(membership.schedule_with)
                                                        ? membership.schedule_with.map(s => formatScheduleWith(s)).join(', ')
                                                        : formatScheduleWith(membership.schedule_with)
                                                    }
                                                </span>
                                                {membership.subscription && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {membership.subscription}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(membership)}
                                                className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(membership.membership_id)}
                                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-200 hover:border-red-300 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Price:</span>
                                            <p className="font-medium">${finalPrice}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Tax Included:</span>
                                            <p className="font-medium">
                                                {isTaxIncluded ? (
                                                    <span className="text-green-600">Yes</span>
                                                ) : (
                                                    <span className="text-orange-600">No</span>
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Party Discount:</span>
                                            <p className="font-medium">{formatCurrency(membership.party_discount)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Parent Addon:</span>
                                            <p className="font-medium">{membership.parent_addon_price}</p>
                                        </div>
                                    </div>

                                    {membership.activity_time && (
                                        <div className="mt-3">
                                            <span className="text-gray-600">Activity Time:</span>
                                            <p className="font-medium">{membership.activity_time}</p>
                                        </div>
                                    )}

                                    {membership.valid_until && (
                                        <div className="mt-3">
                                            <span className="text-gray-600">Valid Until:</span>
                                            <p className="font-medium">{formatDate(membership.valid_until)}</p>
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-2">
                                        {membership.pitch_introduction && (
                                            <div>
                                                <span className="text-gray-600">Pitch Introduction:</span>
                                                <p className="font-medium mt-1">{membership.pitch_introduction}</p>
                                            </div>
                                        )}
                                        {membership.features && (
                                            <div>
                                                <span className="text-gray-600">Features:</span>
                                                <p className="font-medium mt-1">{membership.features}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            )}

            {!isFormOpen && location_id && memberships.length === 0 && !isLoading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🏢</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Memberships Configured</h3>
                    <p className="text-gray-500 mb-4">Add memberships for this location to get started.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add Membership
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
                            {editingMembership ? 'Edit Membership' : 'Add New Membership'}
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
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.title ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter membership title"
                                />
                                {fieldErrors.title && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority *
                                </label>
                                <select
                                    name="pitch_priority"
                                    value={formData.pitch_priority}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.pitch_priority ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select Priority</option>
                                    {priorityOptions.map(option => (
                                        <option key={option} value={option}>
                                            {option === 999 ? 'Do not pitch' : option}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors.pitch_priority && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.pitch_priority}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subscription Type
                                </label>
                                <select
                                    name="subscription"
                                    value={formData.subscription}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                >
                                    <option value="">Select Subscription</option>
                                    {SUBSCRIPTION_OPTIONS.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Schedule With *
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                    {availableSchedules.map(option => (
                                        <label key={option} className="relative flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                                            <div className="flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    value={option}
                                                    checked={formData.schedule_with?.includes(option) || false}
                                                    onChange={handleScheduleWithChange}
                                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2"
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <span className="font-medium text-gray-900 text-base">{formatScheduleWith(option)}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                                {fieldErrors.schedule_with && (
                                    <p className="mt-2 text-sm text-red-600">{fieldErrors.schedule_with}</p>
                                )}
                                {availableSchedules.length === 0 && (
                                    <p className="mt-2 text-sm text-yellow-600">
                                        No schedule types available. Please add hours of operation first.
                                    </p>
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
                                    Tax Included (In Price) *
                                </label>
                                <select
                                    name="tax_included"
                                    value={formData.tax_included}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.tax_included ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select Tax Option</option>
                                    {YES_NO_OPTIONS.map(option => (
                                        <option key={option} value={option}>
                                            {formatYesNo(option)}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors.tax_included && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.tax_included}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Party Discount
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        name="party_discount"
                                        value={formData.party_discount}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className={`mt-1 block w-full pl-7 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.party_discount ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {fieldErrors.party_discount && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.party_discount}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Parent Addon Price
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="parent_addon_price"
                                        value={formData.parent_addon_price}
                                        onChange={handleInputChange}
                                    
                                        
                                        className={`mt-1 block w-full pl-2 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.parent_addon_price ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="10 dollers per month"
                                    />
                                </div>
                                {fieldErrors.parent_addon_price && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.parent_addon_price}</p>
                                )}
                            </div>


                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Valid Until
                                </label>
                                <input
                                    type="date"
                                    name="valid_until"
                                    value={formData.valid_until}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                />
                            </div>




                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Activity Time
                                </label>
                                <textarea
                                    type="text"
                                    name="activity_time"
                                    value={formData.activity_time}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="e.g., 60 minutes, All Day"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pitch Introduction
                                </label>
                                <textarea
                                    name="pitch_introduction"
                                    value={formData.pitch_introduction}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="Enter marketing pitch for this membership..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Features
                                </label>
                                <textarea
                                    name="features"
                                    value={formData.features}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="Enter membership features (separate with commas or new lines)..."
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
                                        ? (editingMembership ? 'Updating...' : 'Creating...')
                                        : (editingMembership ? 'Update Membership' : 'Create Membership')
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

export default MembershipComp;