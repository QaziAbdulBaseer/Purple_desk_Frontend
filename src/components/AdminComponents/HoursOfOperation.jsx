


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

    // Check for date conflicts for closed type
    const checkDateConflict = (newHour, existingHours, editingId = null) => {
        const errors = [];
        
        // Only check for closed type or when adding closed over existing hours
        if (newHour.hours_type === 'closed') {
            // Check if there are existing hours (non-closed) for the same date
            existingHours.forEach(existing => {
                // Skip the hour being edited
                if (editingId && existing.hours_of_operation_id === editingId) return;
                
                // Skip other closed hours for conflict check (we'll check duplicate closed separately)
                if (existing.hours_type === 'closed') return;

                if (newHour.starting_date && existing.starting_date) {
                    const newStartDate = new Date(newHour.starting_date);
                    const newEndDate = newHour.ending_date ? new Date(newHour.ending_date) : newStartDate;
                    const existingStartDate = new Date(existing.starting_date);
                    const existingEndDate = existing.ending_date ? new Date(existing.ending_date) : existingStartDate;

                    // Check if date ranges overlap
                    if (!(newEndDate < existingStartDate || newStartDate > existingEndDate)) {
                        errors.push(`Cannot mark as closed because there are existing ${existing.hours_type} hours from ${new Date(existing.starting_date).toLocaleDateString()}${existing.ending_date ? ` to ${new Date(existing.ending_date).toLocaleDateString()}` : ''}`);
                    }
                }
            });

            // Check for duplicate closed hours
            existingHours.forEach(existing => {
                // Skip the hour being edited
                if (editingId && existing.hours_of_operation_id === editingId) return;
                
                if (existing.hours_type === 'closed') {
                    if (newHour.starting_date && existing.starting_date) {
                        const newStartDate = new Date(newHour.starting_date);
                        const newEndDate = newHour.ending_date ? new Date(newHour.ending_date) : newStartDate;
                        const existingStartDate = new Date(existing.starting_date);
                        const existingEndDate = existing.ending_date ? new Date(existing.ending_date) : existingStartDate;

                        // Check if date ranges overlap
                        if (!(newEndDate < existingStartDate || newStartDate > existingEndDate)) {
                            errors.push(`Closed hours already exist for ${new Date(existing.starting_date).toLocaleDateString()}${existing.ending_date ? ` to ${new Date(existing.ending_date).toLocaleDateString()}` : ''}`);
                        }
                    }
                }
            });
        } else {
            // Check if new non-closed hours conflict with existing closed hours
            existingHours.forEach(existing => {
                // Skip the hour being edited
                if (editingId && existing.hours_of_operation_id === editingId) return;
                
                if (existing.hours_type === 'closed') {
                    if (newHour.starting_date && existing.starting_date) {
                        const newStartDate = new Date(newHour.starting_date);
                        const newEndDate = newHour.ending_date ? new Date(newHour.ending_date) : newStartDate;
                        const existingStartDate = new Date(existing.starting_date);
                        const existingEndDate = existing.ending_date ? new Date(existing.ending_date) : existingStartDate;

                        // Check if date ranges overlap
                        if (!(newEndDate < existingStartDate || newStartDate > existingEndDate)) {
                            errors.push(`Cannot add hours because the location is closed on ${new Date(existing.starting_date).toLocaleDateString()}${existing.ending_date ? ` to ${new Date(existing.ending_date).toLocaleDateString()}` : ''}`);
                        }
                    }
                }
            });
        }

        return errors;
    };

    // Check for time slot overlaps
    const checkTimeOverlap = (newHour, existingHours, editingId = null) => {
        const errors = [];
        
        // Don't check for closed type
        if (newHour.hours_type === 'closed') return errors;

        const newStart = newHour.start_time;
        const newEnd = newHour.end_time;
        
        // For opening types, only check start time
        if ((newHour.hours_type === 'early_opening' || newHour.hours_type === 'late_opening') && !newStart) {
            return errors;
        }
        
        // For closing types, only check end time
        if ((newHour.hours_type === 'early_closing' || newHour.hours_type === 'late_closing') && !newEnd) {
            return errors;
        }
        
        // For other types, check both times
        if ((newHour.hours_type === 'regular' || newHour.hours_type === 'special') && (!newStart || !newEnd)) {
            return errors;
        }

        // Convert time strings to minutes for easier comparison
        const timeToMinutes = (timeStr) => {
            if (!timeStr) return 0;
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours * 60 + minutes;
        };

        const newStartMinutes = timeToMinutes(newStart);
        const newEndMinutes = timeToMinutes(newEnd);

        existingHours.forEach(existing => {
            // Skip the hour being edited
            if (editingId && existing.hours_of_operation_id === editingId) return;
            
            // Skip closed hours
            if (existing.hours_type === 'closed') return;

            // For regular hours, check by day name
            if (newHour.hours_type === 'regular' && existing.hours_type === 'regular') {
                if (newHour.starting_day_name === existing.starting_day_name) {
                    const existingStartMinutes = timeToMinutes(existing.start_time);
                    const existingEndMinutes = timeToMinutes(existing.end_time);

                    // Check for overlap
                    if ((newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
                        (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
                        (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)) {
                        errors.push(`Time slot overlaps with existing ${existing.hours_type} hours on ${existing.starting_day_name} (${formatTime(existing.start_time)} - ${formatTime(existing.end_time)})`);
                    }
                }
            }

            // For special hours with dates, check by date range
            if ((newHour.hours_type === 'special' || newHour.hours_type.includes('opening') || newHour.hours_type.includes('closing')) &&
                (existing.hours_type === 'special' || existing.hours_type.includes('opening') || existing.hours_type.includes('closing'))) {
                
                if (newHour.starting_date && existing.starting_date) {
                    const newStartDate = new Date(newHour.starting_date);
                    const newEndDate = newHour.ending_date ? new Date(newHour.ending_date) : newStartDate;
                    const existingStartDate = new Date(existing.starting_date);
                    const existingEndDate = existing.ending_date ? new Date(existing.ending_date) : existingStartDate;

                    // Check if date ranges overlap
                    if (!(newEndDate < existingStartDate || newStartDate > existingEndDate)) {
                        const existingStartMinutes = timeToMinutes(existing.start_time);
                        const existingEndMinutes = timeToMinutes(existing.end_time);

                        // Special handling for different hour type combinations
                        
                        // Case 1: Special hours with closing types (early_closing, late_closing)
                        if (newHour.hours_type === 'special' && (existing.hours_type === 'early_closing' || existing.hours_type === 'late_closing')) {
                            // Special hours should be allowed with closing types as long as they don't extend beyond closing time
                            if (newEndMinutes > existingEndMinutes) {
                                const dateRange = existing.ending_date ? 
                                    `${new Date(existing.starting_date).toLocaleDateString()} to ${new Date(existing.ending_date).toLocaleDateString()}` :
                                    new Date(existing.starting_date).toLocaleDateString();
                                errors.push(`Special hours cannot extend beyond ${existing.hours_type} time (${formatTime(existing.end_time)}) on ${dateRange}`);
                            }
                        }
                        // Case 2: Closing types with special hours
                        else if ((newHour.hours_type === 'early_closing' || newHour.hours_type === 'late_closing') && existing.hours_type === 'special') {
                            // Closing types should allow special hours that end before or at closing time
                            if (existingEndMinutes > newEndMinutes) {
                                const dateRange = existing.ending_date ? 
                                    `${new Date(existing.starting_date).toLocaleDateString()} to ${new Date(existing.ending_date).toLocaleDateString()}` :
                                    new Date(existing.starting_date).toLocaleDateString();
                                errors.push(`Existing special hours (${formatTime(existing.start_time)} - ${formatTime(existing.end_time)}) extend beyond ${newHour.hours_type} time (${formatTime(newHour.end_time)}) on ${dateRange}`);
                            }
                        }
                        // Case 3: Special hours with opening types (early_opening, late_opening)
                        else if (newHour.hours_type === 'special' && (existing.hours_type === 'early_opening' || existing.hours_type === 'late_opening')) {
                            // Special hours should be allowed with opening types as long as they don't start before opening time
                            if (newStartMinutes < existingStartMinutes) {
                                const dateRange = existing.ending_date ? 
                                    `${new Date(existing.starting_date).toLocaleDateString()} to ${new Date(existing.ending_date).toLocaleDateString()}` :
                                    new Date(existing.starting_date).toLocaleDateString();
                                errors.push(`Special hours cannot start before ${existing.hours_type} time (${formatTime(existing.start_time)}) on ${dateRange}`);
                            }
                        }
                        // Case 4: Opening types with special hours
                        else if ((newHour.hours_type === 'early_opening' || newHour.hours_type === 'late_opening') && existing.hours_type === 'special') {
                            // Opening types should allow special hours that start after or at opening time
                            if (existingStartMinutes < newStartMinutes) {
                                const dateRange = existing.ending_date ? 
                                    `${new Date(existing.starting_date).toLocaleDateString()} to ${new Date(existing.ending_date).toLocaleDateString()}` :
                                    new Date(existing.starting_date).toLocaleDateString();
                                errors.push(`Existing special hours (${formatTime(existing.start_time)} - ${formatTime(existing.end_time)}) start before ${newHour.hours_type} time (${formatTime(newHour.start_time)}) on ${dateRange}`);
                            }
                        }
                        // Case 5: Same type conflicts (special vs special, closing vs closing, etc.)
                        else if (newHour.hours_type === existing.hours_type) {
                            // For same types, check full overlap
                            if ((newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
                                (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
                                (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)) {
                                const dateRange = existing.ending_date ? 
                                    `${new Date(existing.starting_date).toLocaleDateString()} to ${new Date(existing.ending_date).toLocaleDateString()}` :
                                    new Date(existing.starting_date).toLocaleDateString();
                                errors.push(`Time slot overlaps with existing ${existing.hours_type} hours on ${dateRange} (${formatTime(existing.start_time)} - ${formatTime(existing.end_time)})`);
                            }
                        }
                        // Case 6: Different special types (opening vs closing) - should generally be allowed
                        else if ((newHour.hours_type.includes('opening') && existing.hours_type.includes('closing')) ||
                                 (newHour.hours_type.includes('closing') && existing.hours_type.includes('opening'))) {
                            // Opening and closing types can coexist on the same day
                            // No conflict error for this case
                        }
                        // Default case: For all other combinations, use the original logic
                        else {
                            // For opening types, only check if start time conflicts
                            if (newHour.hours_type === 'early_opening' || newHour.hours_type === 'late_opening') {
                                if (newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) {
                                    const dateRange = existing.ending_date ? 
                                        `${new Date(existing.starting_date).toLocaleDateString()} to ${new Date(existing.ending_date).toLocaleDateString()}` :
                                        new Date(existing.starting_date).toLocaleDateString();
                                    errors.push(`Start time conflicts with existing ${existing.hours_type} hours on ${dateRange} (${formatTime(existing.start_time)} - ${formatTime(existing.end_time)})`);
                                }
                            }
                            // For closing types, only check if end time conflicts
                            else if (newHour.hours_type === 'early_closing' || newHour.hours_type === 'late_closing') {
                                if (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) {
                                    const dateRange = existing.ending_date ? 
                                        `${new Date(existing.starting_date).toLocaleDateString()} to ${new Date(existing.ending_date).toLocaleDateString()}` :
                                        new Date(existing.starting_date).toLocaleDateString();
                                    errors.push(`End time conflicts with existing ${existing.hours_type} hours on ${dateRange} (${formatTime(existing.start_time)} - ${formatTime(existing.end_time)})`);
                                }
                            }
                            // For other types, check full time range
                            else {
                                if ((newStartMinutes >= existingStartMinutes && newStartMinutes < existingEndMinutes) ||
                                    (newEndMinutes > existingStartMinutes && newEndMinutes <= existingEndMinutes) ||
                                    (newStartMinutes <= existingStartMinutes && newEndMinutes >= existingEndMinutes)) {
                                    const dateRange = existing.ending_date ? 
                                        `${new Date(existing.starting_date).toLocaleDateString()} to ${new Date(existing.ending_date).toLocaleDateString()}` :
                                        new Date(existing.starting_date).toLocaleDateString();
                                    errors.push(`Time slot overlaps with existing ${existing.hours_type} hours on ${dateRange} (${formatTime(existing.start_time)} - ${formatTime(existing.end_time)})`);
                                }
                            }
                        }
                    }
                }
            }
        });

        return errors;
    };

    // Get auth token
    const getAuthToken = () => {
        return localStorage.getItem('accessToken') || userData?.token;
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
                console.log("This is the location data =", data);
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

    // Handle form input changes with dynamic validation
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Auto-fill day names when dates are selected
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
        // If changing to closed type, clear time fields
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
        // If changing to opening/closing types, clear schedule_with and ages_allowed
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

        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
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

    // Validate form based on hours type
    const validateForm = () => {
        const requiredFields = getRequiredFields(formData.hours_type);
        const errors = {};

        requiredFields.forEach(field => {
            if (!formData[field]) {
                errors[field] = `${field.replace(/_/g, ' ')} is required`;
            }
        });

        // Time validation - only for types that require both times
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

        // Check for time slot overlaps (for non-closed types)
        if (formData.hours_type !== 'closed') {
            const overlapErrors = checkTimeOverlap(formData, hours, editingHour?.hours_of_operation_id);
            if (overlapErrors.length > 0) {
                errors.time_overlap = overlapErrors.join(', ');
            }
        }

        // Check for date conflicts (for all types)
        const dateConflictErrors = checkDateConflict(formData, hours, editingHour?.hours_of_operation_id);
        if (dateConflictErrors.length > 0) {
            errors.date_conflict = dateConflictErrors.join(', ');
        }

        return errors;
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

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

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

            // Set defaults for closed type - set time to null
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

            // Normalize dates to YYYY-MM-DD
            if (submitData.starting_date) {
                submitData.starting_date = submitData.starting_date.split('T')[0];
            }
            if (submitData.ending_date) {
                submitData.ending_date = submitData.ending_date.split('T')[0];
            }

            // Convert empty strings to null to avoid backend validation errors
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
                // Handle backend validation errors
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
        }
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

    // Get type color classes
    const getTypeColorClasses = (type) => {
        const typeConfig = HOURS_TYPES.find(t => t.value === type);
        const color = typeConfig ? typeConfig.color : 'gray';
        return COLOR_CLASSES[color] || COLOR_CLASSES.gray;
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

    // Group hours by type for better organization in specific order
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

            {/* Hours Display - Grouped by Type in specific order */}
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
                                                        {/* Don't show time for closed type */}
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

                            {/* For regular hours, show day selection (not auto-filled from dates) */}
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

                            {/* Time Overlap Error */}
                            {fieldErrors.time_overlap && (
                                <div className="md:col-span-2">
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                        <strong>Time Slot Conflict:</strong> {fieldErrors.time_overlap}
                                    </div>
                                </div>
                            )}

                            {/* Date Conflict Error */}
                            {fieldErrors.date_conflict && (
                                <div className="md:col-span-2">
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                        <strong>Date Conflict:</strong> {fieldErrors.date_conflict}
                                    </div>
                                </div>
                            )}

                            {/* Modified Flag - Only show for editing */}
                            {editingHour && (
                                <div className="md:col-span-2 flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_modified"
                                        checked={formData.is_modified}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700">
                                        Mark as modified schedule
                                    </label>
                                </div>
                            )}
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


