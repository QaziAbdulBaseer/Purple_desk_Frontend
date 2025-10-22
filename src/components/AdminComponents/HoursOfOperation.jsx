
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const HoursOfOperation = () => {
    const { location_id } = useParams();
    const userData = useSelector((state) => state.auth.userData);
    const [hours, setHours] = useState([]);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingHour, setEditingHour] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    
    // New state for conflict management
    const [conflicts, setConflicts] = useState([]);
    const [showConflictPopup, setShowConflictPopup] = useState(false);
    const [pendingSubmission, setPendingSubmission] = useState(null);
    const [conflictResolved, setConflictResolved] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        hours_type: 'regular',
        schedule_with: '',
        ages_allowed: '',
        starting_date: '',
        ending_date: '',
        starting_day_name: '',
        ending_day_name: '',
        start_time: '',
        end_time: '',
        reason: '',
        is_modified: false
    });

    // Constants - Updated with proper colors and order
    const HOURS_TYPES = [
        { value: 'regular', label: 'Regular Hours', color: 'green' },
        { value: 'special', label: 'Special Hours', color: 'blue' },
        { value: 'closed', label: 'Closed', color: 'red' },
        { value: 'early_closing', label: 'Early Closing', color: 'orange' },
        { value: 'late_closing', label: 'Late Closing', color: 'yellow' },
        { value: 'early_opening', label: 'Early Opening', color: 'purple' },
        { value: 'late_opening', label: 'Late Opening', color: 'indigo' }
    ];

    // Define color mapping for Tailwind
    const COLOR_CLASSES = {
        green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
        blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
        red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
        orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
        yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
        purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
        indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' }
    };

    const DAYS_OF_WEEK = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday',
        'Friday', 'Saturday', 'Sunday'
    ];

    // Updated AGES_ALLOWED as requested
    const AGES_ALLOWED = ['All Ages', '4+', '3+', '5+', 'Family Only', 'Adults Only'];
    const SCHEDULE_WITH = ['little_leaper', 'open_jump', 'sensory_hour', 'glow'];

    // Get day name from date
    const getDayNameFromDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    };

    // Reset date and day fields
    const resetDateFields = (fieldType) => {
        if (fieldType === 'starting') {
            setFormData(prev => ({
                ...prev,
                starting_date: '',
                starting_day_name: ''
            }));
        } else if (fieldType === 'ending') {
            setFormData(prev => ({
                ...prev,
                ending_date: '',
                ending_day_name: ''
            }));
        }
    };

    // Enhanced conflict detection function
    const detectConflicts = (newHour, existingHours, editingId = null) => {
        const conflicts = [];
        
        const newStartDate = newHour.starting_date ? new Date(newHour.starting_date) : null;
        const newEndDate = newHour.ending_date ? new Date(newHour.ending_date) : newStartDate;
        
        existingHours.forEach(existing => {
            // Skip the hour being edited
            if (editingId && existing.hours_of_operation_id === editingId) return;
            
            const existingStartDate = existing.starting_date ? new Date(existing.starting_date) : null;
            const existingEndDate = existing.ending_date ? new Date(existing.ending_date) : existingStartDate;

            // Check if date ranges overlap
            const datesOverlap = newStartDate && existingStartDate && 
                !(newEndDate < existingStartDate || newStartDate > existingEndDate);

            if (datesOverlap) {
                // Conflict: Trying to close when special hours exist
                if (newHour.hours_type === 'closed' && existing.hours_type !== 'closed') {
                    conflicts.push({
                        type: 'CLOSED_WITH_SPECIAL_HOURS',
                        message: `Cannot mark as closed because there are existing ${existing.hours_type} hours`,
                        conflictingHour: existing,
                        severity: 'high'
                    });
                }
                
                // Conflict: Trying to add hours when closed
                if (newHour.hours_type !== 'closed' && existing.hours_type === 'closed') {
                    conflicts.push({
                        type: 'HOURS_WHEN_CLOSED',
                        message: `Cannot add hours because the location is closed`,
                        conflictingHour: existing,
                        severity: 'high'
                    });
                }

                // Time-based conflicts for non-closed types
                if (newHour.hours_type !== 'closed' && existing.hours_type !== 'closed') {
                    const timeConflict = checkTimeConflict(newHour, existing);
                    if (timeConflict) {
                        conflicts.push({
                            type: 'TIME_OVERLAP',
                            message: timeConflict,
                            conflictingHour: existing,
                            severity: 'medium'
                        });
                    }
                }

                // Same type conflicts (duplicate closed, etc.)
                if (newHour.hours_type === existing.hours_type && newHour.hours_type === 'closed') {
                    conflicts.push({
                        type: 'DUPLICATE_CLOSED',
                        message: `Closed hours already exist for this date range`,
                        conflictingHour: existing,
                        severity: 'high'
                    });
                }
            }
        });

        return conflicts;
    };

    // Check time conflicts between two hours
    const checkTimeConflict = (hour1, hour2) => {
        if (!hour1.start_time || !hour1.end_time || !hour2.start_time || !hour2.end_time) {
            return null;
        }

        const timeToMinutes = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const start1 = timeToMinutes(hour1.start_time);
        const end1 = timeToMinutes(hour1.end_time);
        const start2 = timeToMinutes(hour2.start_time);
        const end2 = timeToMinutes(hour2.end_time);

        if ((start1 >= start2 && start1 < end2) ||
            (end1 > start2 && end1 <= end2) ||
            (start1 <= start2 && end1 >= end2)) {
            return `Time overlap: ${formatTime(hour2.start_time)} - ${formatTime(hour2.end_time)}`;
        }

        return null;
    };

    // Enhanced validation with conflict detection
    const validateFormWithConflicts = () => {
        const requiredFields = getRequiredFields(formData.hours_type);
        const errors = {};

        requiredFields.forEach(field => {
            if (!formData[field]) {
                errors[field] = `${field.replace(/_/g, ' ')} is required`;
            }
        });

        // Time validation
        if ((formData.hours_type === 'regular' || formData.hours_type === 'special') && formData.start_time && formData.end_time) {
            if (formData.start_time >= formData.end_time) {
                errors.end_time = 'End time must be after start time';
            }
        }

        // Date validation
        if (formData.starting_date && formData.ending_date) {
            if (new Date(formData.starting_date) > new Date(formData.ending_date)) {
                errors.ending_date = 'Ending date must be after starting date';
            }
        }

        // Check for conflicts
        const detectedConflicts = detectConflicts(formData, hours, editingHour?.hours_of_operation_id);
        if (detectedConflicts.length > 0) {
            errors.conflicts = detectedConflicts;
        }

        return errors;
    };

    // Recheck conflicts after edits or deletions
    const recheckConflicts = () => {
        if (!pendingSubmission) return [];
        
        const { formData, editingHour } = pendingSubmission;
        return detectConflicts(formData, hours, editingHour?.hours_of_operation_id);
    };

    // Enhanced conflict resolution handler
    const handleConflictResolution = async (action, conflictHour = null) => {
        if (action === 'proceed') {
            // User wants to proceed despite conflicts
            setShowConflictPopup(false);
            setConflictResolved(false);
            await submitForm(pendingSubmission);
        } else if (action === 'edit' && conflictHour) {
            // User wants to edit the conflicting hour
            setShowConflictPopup(false);
            setConflictResolved(false);
            handleEdit(conflictHour);
        } else if (action === 'delete' && conflictHour) {
            // User wants to delete the conflicting hour
            await handleDelete(conflictHour.hours_of_operation_id);
            
            // After deletion, recheck conflicts
            const remainingConflicts = recheckConflicts();
            if (remainingConflicts.length === 0) {
                setConflictResolved(true);
                setConflicts([]);
            } else {
                setConflicts(remainingConflicts);
                setConflictResolved(false);
            }
        } else if (action === 'close') {
            // User manually closes the popup
            setShowConflictPopup(false);
            setPendingSubmission(null);
            setConflicts([]);
            setConflictResolved(false);
        } else {
            // User canceled
            setShowConflictPopup(false);
            setPendingSubmission(null);
            setConflicts([]);
            setConflictResolved(false);
        }
    };

    // Enhanced submit handler with conflict checking
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateFormWithConflicts();
        const fieldValidationErrors = { ...validationErrors };
        delete fieldValidationErrors.conflicts;

        if (Object.keys(fieldValidationErrors).length > 0) {
            setFieldErrors(fieldValidationErrors);
            return;
        }

        // Check if there are conflicts
        if (validationErrors.conflicts && validationErrors.conflicts.length > 0) {
            setConflicts(validationErrors.conflicts);
            setPendingSubmission({ formData, editingHour });
            setShowConflictPopup(true);
            setConflictResolved(false);
            return;
        }

        // No conflicts, proceed with submission
        await submitForm({ formData, editingHour });
    };

    // Separate form submission logic
    const submitForm = async (submissionData) => {
        if (!submissionData) return;

        const { formData, editingHour } = submissionData;
        setIsLoading(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        try {
            const token = getAuthToken();
            const url = editingHour
                ? `${import.meta.env.VITE_BackendApi}/hours/${location_id}/${editingHour.hours_of_operation_id}/update/`
                : `${import.meta.env.VITE_BackendApi}/hours/${location_id}/create/`;

            const method = editingHour ? 'PUT' : 'POST';

            // Prepare data based on hours type
            const submitData = { ...formData };

            // Set defaults for closed type
            if (formData.hours_type === 'closed') {
                submitData.start_time = "00:00:00";
                submitData.end_time = "00:00:00";
                submitData.schedule_with = 'closed';
                submitData.ages_allowed = 'closed';
            }

            // For opening/closing types, set schedule_with and ages_allowed to empty
            if (formData.hours_type === 'early_closing' || formData.hours_type === 'late_closing' || 
                formData.hours_type === 'early_opening' || formData.hours_type === 'late_opening') {
                submitData.schedule_with = '';
                submitData.ages_allowed = '';
            }

            // Normalize dates
            if (submitData.starting_date) {
                submitData.starting_date = submitData.starting_date.split('T')[0];
            }
            if (submitData.ending_date) {
                submitData.ending_date = submitData.ending_date.split('T')[0];
            }

            // Convert empty strings to null
            Object.keys(submitData).forEach(key => {
                if (submitData[key] === '') submitData[key] = null;
            });

            // For update requests, set is_modified to true
            if (editingHour) {
                submitData.is_modified = true;
            }

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
                    throw new Error(responseData.error || responseData.detail || 'Failed to save hours');
                }
                return;
            }

            const savedHour = responseData;

            if (editingHour) {
                setHours(prev => prev.map(hour =>
                    hour.hours_of_operation_id === savedHour.hours_of_operation_id ? savedHour : hour
                ));
                setSuccess('Hours updated successfully!');
            } else {
                setHours(prev => [...prev, savedHour]);
                setSuccess('Hours created successfully!');
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

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem('accessToken') || userData?.token;
    };

    // Format backend errors
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

    // Format time for display
    const formatTime = (time) => {
        if (!time) return 'N/A';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Format schedule_with for display
    const formatScheduleWith = (schedule) => {
        if (!schedule) return 'N/A';
        return schedule.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Get type color classes
    const getTypeColorClasses = (type) => {
        const typeConfig = HOURS_TYPES.find(t => t.value === type);
        const color = typeConfig ? typeConfig.color : 'gray';
        return COLOR_CLASSES[color] || COLOR_CLASSES.gray;
    };

    // Dynamic field requirements based on hours type
    const getRequiredFields = (hoursType) => {
        switch (hoursType) {
            case 'regular':
                return ['starting_day_name', 'start_time', 'end_time', 'schedule_with', 'ages_allowed'];
            case 'special':
                return ['starting_day_name', 'start_time', 'end_time', 'starting_date', 'schedule_with', 'ages_allowed'];
            case 'early_closing':
            case 'late_closing':
                return ['starting_day_name', 'end_time', 'starting_date', 'reason'];
            case 'early_opening':
            case 'late_opening':
                return ['starting_day_name', 'start_time', 'starting_date', 'reason'];
            case 'closed':
                return ['starting_date', 'reason'];
            default:
                return ['starting_day_name', 'start_time', 'end_time'];
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            hours_type: 'regular',
            schedule_with: '',
            ages_allowed: '',
            starting_date: '',
            ending_date: '',
            starting_day_name: '',
            ending_day_name: '',
            start_time: '',
            end_time: '',
            reason: '',
            is_modified: false
        });
        setEditingHour(null);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };

    // Edit hour
    const handleEdit = (hour) => {
        setFormData({
            hours_type: hour.hours_type,
            schedule_with: hour.schedule_with || '',
            ages_allowed: hour.ages_allowed || '',
            starting_date: hour.starting_date ? hour.starting_date.split('T')[0] : '',
            ending_date: hour.ending_date ? hour.ending_date.split('T')[0] : '',
            starting_day_name: hour.starting_day_name,
            ending_day_name: hour.ending_day_name || '',
            start_time: hour.start_time,
            end_time: hour.end_time,
            reason: hour.reason || '',
            is_modified: hour.is_modified || false
        });
        setEditingHour(hour);
        setIsFormOpen(true);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };

    // Delete hour
    const handleDelete = async (hourId) => {
        if (!window.confirm('Are you sure you want to delete these hours?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/hours/${location_id}/${hourId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete hours');
            }

            setHours(prev => prev.filter(hour => hour.hours_of_operation_id !== hourId));
            setSuccess('Hours deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch location details
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

    // Fetch hours of operation
    const fetchHours = async () => {
        if (!location_id) return;

        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/hours/${location_id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch hours of operation');
            }

            const data = await response.json();
            setHours(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'starting_date' && value) {
            const dayName = getDayNameFromDate(value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                starting_day_name: dayName
            }));
        } else if (name === 'ending_date' && value) {
            const dayName = getDayNameFromDate(value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                ending_day_name: dayName
            }));
        }
        else if (name === 'hours_type' && value === 'closed') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                start_time: '',
                end_time: '',
                schedule_with: '',
                ages_allowed: ''
            }));
        }
        else if (name === 'hours_type' && (value === 'early_closing' || value === 'late_closing' || value === 'early_opening' || value === 'late_opening')) {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                schedule_with: '',
                ages_allowed: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    // Handle returning from edit form back to conflict popup
    useEffect(() => {
        if (!isFormOpen && pendingSubmission && !conflictResolved) {
            // User finished editing, recheck conflicts
            const remainingConflicts = recheckConflicts();
            if (remainingConflicts.length === 0) {
                setConflictResolved(true);
                setConflicts([]);
            } else {
                setConflicts(remainingConflicts);
            }
            setShowConflictPopup(true);
        }
    }, [isFormOpen, pendingSubmission]);

    // Group hours by type for better organization
    const groupedHours = hours.reduce((acc, hour) => {
        if (!acc[hour.hours_type]) {
            acc[hour.hours_type] = [];
        }
        acc[hour.hours_type].push(hour);
        return acc;
    }, {});

    // Define the display order
    const DISPLAY_ORDER = ['regular', 'special', 'closed', 'early_closing', 'late_closing', 'early_opening', 'late_opening'];

    // Fetch data on component mount
    useEffect(() => {
        if (location_id) {
            fetchLocation();
            fetchHours();
        }
    }, [location_id]);

    return (
        <div className="space-y-6">
            {/* Header with Location Info */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hours of Operation</h2>
                    {location && (
                        <p className="text-gray-600 mt-1">
                            Managing hours for: <span className="font-semibold">{location.location_name}</span>
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
                    <span>Add New Hours</span>
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

            {/* Enhanced Conflict Resolution Popup with Glass Effect */}
            {showConflictPopup && (
                <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-red-600">Schedule Conflict Detected</h3>
                                <button
                                    onClick={() => handleConflictResolution('close')}
                                    className="text-gray-500 hover:text-gray-700 transition-colors text-2xl"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            {/* Conflict Resolved Success Message */}
                            {conflictResolved && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center">
                                        <div className="text-green-500 text-xl mr-3">✓</div>
                                        <div>
                                            <h4 className="font-semibold text-green-800">Conflict Resolved!</h4>
                                            <p className="text-green-700 text-sm">
                                                The conflict has been resolved. You can now submit your form.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-6">
                                <p className="text-gray-700 mb-4 text-lg">
                                    The hours you're trying to create conflict with existing schedule entries. 
                                    Please resolve the conflicts below to continue.
                                </p>
                                
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
                                    <h4 className="font-semibold text-blue-800 mb-3 text-lg">New Schedule Entry:</h4>
                                    <div className="text-sm text-blue-700 space-y-2">
                                        <p><strong>Type:</strong> {HOURS_TYPES.find(t => t.value === pendingSubmission?.formData.hours_type)?.label}</p>
                                        <p><strong>Date:</strong> {pendingSubmission?.formData.starting_date ? new Date(pendingSubmission.formData.starting_date).toLocaleDateString() : 'N/A'}</p>
                                        {pendingSubmission?.formData.start_time && (
                                            <p><strong>Time:</strong> {formatTime(pendingSubmission.formData.start_time)} - {formatTime(pendingSubmission.formData.end_time)}</p>
                                        )}
                                        {pendingSubmission?.formData.reason && (
                                            <p><strong>Reason:</strong> {pendingSubmission.formData.reason}</p>
                                        )}
                                    </div>
                                </div>

                                {conflicts.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900 text-lg">Conflicting Entries:</h4>
                                        {conflicts.map((conflict, index) => {
                                            const hour = conflict.conflictingHour;
                                            const colorClasses = getTypeColorClasses(hour.hours_type);
                                            return (
                                                <div key={index} className="border border-gray-300 rounded-xl p-5 bg-white shadow-sm">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses.bg} ${colorClasses.text}`}>
                                                            {HOURS_TYPES.find(t => t.value === hour.hours_type)?.label}
                                                        </span>
                                                        <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                                                            conflict.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                                                        }`}>
                                                            {conflict.severity === 'high' ? 'High Priority' : 'Medium Priority'}
                                                        </span>
                                                    </div>
                                                    
                                                    <p className="text-red-600 mb-4 font-medium">{conflict.message}</p>
                                                    
                                                    <div className="text-sm text-gray-600 space-y-2 mb-4">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-500">Date:</span>
                                                            <span className="font-medium">
                                                                {hour.starting_date ? new Date(hour.starting_date).toLocaleDateString() : 'N/A'}
                                                                {hour.ending_date && ` to ${new Date(hour.ending_date).toLocaleDateString()}`}
                                                            </span>
                                                        </div>
                                                        {hour.start_time && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Time:</span>
                                                                <span className="font-medium">
                                                                    {formatTime(hour.start_time)} - {formatTime(hour.end_time)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {hour.reason && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Reason:</span>
                                                                <span className="font-medium text-right">{hour.reason}</span>
                                                            </div>
                                                        )}
                                                        {hour.schedule_with && hour.schedule_with !== 'closed' && hour.schedule_with !== '' && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Schedule With:</span>
                                                                <span className="font-medium">{formatScheduleWith(hour.schedule_with)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => handleConflictResolution('edit', hour)}
                                                            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                                                        >
                                                            <span>✏️</span>
                                                            <span>Edit This Entry</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleConflictResolution('delete', hour)}
                                                            className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
                                                        >
                                                            <span>🗑️</span>
                                                            <span>Delete This Entry</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => handleConflictResolution('close')}
                                    className="px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleConflictResolution('proceed')}
                                        className="px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Proceed Anyway
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hours Display */}
            {!isFormOpen && location_id && (
                <div className="space-y-6">
                    {DISPLAY_ORDER.map(type => {
                        if (!groupedHours[type]) return null;
                        
                        const typeHours = groupedHours[type];
                        const colorClasses = getTypeColorClasses(type);
                        const typeConfig = HOURS_TYPES.find(t => t.value === type);
                        
                        return (
                            <div key={type} className="bg-white rounded-lg shadow-md border border-gray-200">
                                <div className={`${colorClasses.bg} ${colorClasses.border} border-b px-6 py-4`}>
                                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                        {typeConfig?.label || type}
                                        <span className="ml-2 text-sm text-gray-600">({typeHours.length})</span>
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {typeHours.map((hour) => {
                                            const hourColorClasses = getTypeColorClasses(hour.hours_type);
                                            return (
                                                <div key={hour.hours_of_operation_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${hourColorClasses.bg} ${hourColorClasses.text}`}>
                                                            {HOURS_TYPES.find(t => t.value === hour.hours_type)?.label}
                                                        </span>
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(hour)}
                                                                className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(hour.hours_of_operation_id)}
                                                                className="text-red-600 hover:text-red-800 text-sm transition-colors"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600">Days:</span>
                                                            <span className="font-medium">
                                                                {hour.starting_day_name}
                                                                {hour.ending_day_name && ` - ${hour.ending_day_name}`}
                                                            </span>
                                                        </div>
                                                        {hour.hours_type !== 'closed' && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Time:</span>
                                                                <span className="font-medium">
                                                                    {formatTime(hour.start_time)} - {formatTime(hour.end_time)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {hour.starting_date && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Date:</span>
                                                                <span className="font-medium">
                                                                    {new Date(hour.starting_date).toLocaleDateString()}
                                                                    {hour.ending_date && ` to ${new Date(hour.ending_date).toLocaleDateString()}`}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {hour.schedule_with && hour.schedule_with !== 'closed' && hour.schedule_with !== '' && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Schedule With:</span>
                                                                <span className="font-medium">{formatScheduleWith(hour.schedule_with)}</span>
                                                            </div>
                                                        )}
                                                        {hour.ages_allowed && hour.ages_allowed !== 'closed' && hour.ages_allowed !== '' && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Ages:</span>
                                                                <span className="font-medium">{hour.ages_allowed}</span>
                                                            </div>
                                                        )}
                                                        {hour.reason && (
                                                            <div>
                                                                <span className="text-gray-600">Reason:</span>
                                                                <p className="font-medium text-sm mt-1">{hour.reason}</p>
                                                            </div>
                                                        )}
                                                        {hour.is_modified && (
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-600">Modified:</span>
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                    Modified
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Empty State */}
            {!isFormOpen && location_id && hours.length === 0 && !isLoading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">⏰</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Hours Configured</h3>
                    <p className="text-gray-500 mb-4">Add operating hours for this location to get started.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add Operating Hours
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && !isFormOpen && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Hours Form Modal */}
            {isFormOpen && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {editingHour ? 'Edit Hours' : 'Add New Hours'}
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
                            {/* Hours Type */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Hours Type *
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {HOURS_TYPES.map(type => {
                                        const colorClasses = getTypeColorClasses(type.value);
                                        return (
                                            <label key={type.value} className="relative flex cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="hours_type"
                                                    value={type.value}
                                                    checked={formData.hours_type === type.value}
                                                    onChange={handleInputChange}
                                                    className="sr-only"
                                                />
                                                <div className={`
                                                    w-full text-center py-2 px-3 rounded-md border text-sm font-medium transition-colors
                                                    ${formData.hours_type === type.value
                                                        ? `${colorClasses.bg} border-${type.color}-500 ${colorClasses.text}`
                                                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                    }
                                                `}>
                                                    {type.label}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* For regular hours, show day selection */}
                            {formData.hours_type === 'regular' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Starting Day {getRequiredFields(formData.hours_type).includes('starting_day_name') && '*'}
                                        </label>
                                        <select
                                            name="starting_day_name"
                                            value={formData.starting_day_name}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.starting_day_name ? 'border-red-300' : 'border-gray-300'}`}
                                        >
                                            <option value="">Select Day</option>
                                            {DAYS_OF_WEEK.map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                        {fieldErrors.starting_day_name && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.starting_day_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ending Day
                                        </label>
                                        <select
                                            name="ending_day_name"
                                            value={formData.ending_day_name}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        >
                                            <option value="">Same Day</option>
                                            {DAYS_OF_WEEK.map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* For non-regular hours, show dates and auto-filled day names */}
                            {formData.hours_type !== 'regular' && (
                                <>
                                    {/* Starting Date with Reset Button */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Starting Date {getRequiredFields(formData.hours_type).includes('starting_date') && '*'}
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="date"
                                                name="starting_date"
                                                value={formData.starting_date}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.starting_date ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => resetDateFields('starting')}
                                                className="mt-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                        {fieldErrors.starting_date && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.starting_date}</p>
                                        )}
                                    </div>

                                    {/* Ending Date with Reset Button */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ending Date
                                        </label>
                                        <div className="flex space-x-2">
                                            <input
                                                type="date"
                                                name="ending_date"
                                                value={formData.ending_date}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.ending_date ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => resetDateFields('ending')}
                                                className="mt-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
                                            >
                                                Reset
                                            </button>
                                        </div>
                                        {fieldErrors.ending_date && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.ending_date}</p>
                                        )}
                                    </div>

                                    {/* Auto-filled Day Names - Read only for non-regular hours */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Starting Day {getRequiredFields(formData.hours_type).includes('starting_day_name') && '*'}
                                        </label>
                                        <input
                                            type="text"
                                            name="starting_day_name"
                                            value={formData.starting_day_name}
                                            readOnly
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-gray-50 ${fieldErrors.starting_day_name ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="Auto-filled from starting date"
                                        />
                                        {fieldErrors.starting_day_name && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.starting_day_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ending Day
                                        </label>
                                        <input
                                            type="text"
                                            name="ending_day_name"
                                            value={formData.ending_day_name}
                                            readOnly
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-gray-50"
                                            placeholder="Auto-filled from ending date"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Times - Hide for closed type */}
                            {formData.hours_type !== 'closed' && (
                                <>
                                    {/* Start Time - Show for all except closing types */}
                                    {(formData.hours_type !== 'early_closing' && formData.hours_type !== 'late_closing') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Time {getRequiredFields(formData.hours_type).includes('start_time') && '*'}
                                            </label>
                                            <input
                                                type="time"
                                                name="start_time"
                                                value={formData.start_time}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.start_time ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            />
                                            {fieldErrors.start_time && (
                                                <p className="mt-1 text-sm text-red-600">{fieldErrors.start_time}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* End Time - Show for all except opening types */}
                                    {(formData.hours_type !== 'early_opening' && formData.hours_type !== 'late_opening') && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Time {getRequiredFields(formData.hours_type).includes('end_time') && '*'}
                                            </label>
                                            <input
                                                type="time"
                                                name="end_time"
                                                value={formData.end_time}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.end_time ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            />
                                            {fieldErrors.end_time && (
                                                <p className="mt-1 text-sm text-red-600">{fieldErrors.end_time}</p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Schedule With - Show only for regular and special hours */}
                            {(formData.hours_type === 'regular' || formData.hours_type === 'special') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Schedule With {getRequiredFields(formData.hours_type).includes('schedule_with') && '*'}
                                    </label>
                                    <select
                                        name="schedule_with"
                                        value={formData.schedule_with}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.schedule_with ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Schedule Type</option>
                                        {SCHEDULE_WITH.map(option => (
                                            <option key={option} value={option}>
                                                {formatScheduleWith(option)}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.schedule_with && (
                                        <p className="mt-1 text-sm text-red-600">{fieldErrors.schedule_with}</p>
                                    )}
                                </div>
                            )}

                            {/* Ages Allowed - Show only for regular and special hours */}
                            {(formData.hours_type === 'regular' || formData.hours_type === 'special') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ages Allowed {getRequiredFields(formData.hours_type).includes('ages_allowed') && '*'}
                                    </label>
                                    <select
                                        name="ages_allowed"
                                        value={formData.ages_allowed}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.ages_allowed ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Age Group</option>
                                        {AGES_ALLOWED.map(age => (
                                            <option key={age} value={age}>{age}</option>
                                        ))}
                                    </select>
                                    {fieldErrors.ages_allowed && (
                                        <p className="mt-1 text-sm text-red-600">{fieldErrors.ages_allowed}</p>
                                    )}
                                </div>
                            )}

                            {/* Reason */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason {getRequiredFields(formData.hours_type).includes('reason') && '*'}
                                </label>
                                <textarea
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.reason ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter reason for these hours..."
                                />
                                {fieldErrors.reason && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.reason}</p>
                                )}
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
                                        ? (editingHour ? 'Updating...' : 'Creating...')
                                        : (editingHour ? 'Update Hours' : 'Create Hours')
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

export default HoursOfOperation;