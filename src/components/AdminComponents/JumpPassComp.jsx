


// Import required React and Redux hooks
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

const JumpPassComp = () => {
    // Get location_id from URL parameters and initialize navigation
    const { location_id } = useParams();
    const navigate = useNavigate();

    // Get user data from Redux store
    const userData = useSelector((state) => state.auth.userData);

    // State declarations for component data management
    const [jumpPasses, setJumpPasses] = useState([]);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingPass, setEditingPass] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});

    // State for hours of operation and conflict management
    const [hoursOfOperation, setHoursOfOperation] = useState([]);
    const [conflicts, setConflicts] = useState([]);
    const [showConflictPopup, setShowConflictPopup] = useState(false);
    const [pendingSubmission, setPendingSubmission] = useState(null);

    // NEW: State for dynamic schedule options
    const [availableSchedules, setAvailableSchedules] = useState([]);
    const [hasSchedules, setHasSchedules] = useState(true);

    // Form data state initialization
    const [formData, setFormData] = useState({
        jump_pass_priority: '',
        schedule_with: [],
        pass_name: '',
        age_allowed: '',
        jump_time_allowed: '',
        price: '',
        tax_included: 'no',
        recommendation: '',
        jump_pass_pitch: '',
        starting_day_name: '',
        ending_day_name: '',
        comments: '',
        roller_booking_id: '',
        can_custom_take_part_in_multiple: 'no'
    });

    // State for custom jump time handling
    const [isCustomJumpTime, setIsCustomJumpTime] = useState(false);
    const [customJumpTime, setCustomJumpTime] = useState('');
    const [priorityOptions, setPriorityOptions] = useState([]);

    // Predefined jump time options
    const JUMP_TIME_OPTIONS = [
        { value: '30 minutes', label: '30 mins' },
        { value: '60 minutes', label: '60 mins' },
        { value: '90 minutes', label: '90 mins' },
        { value: '120 minutes', label: '120 mins' },
        { value: '150 minutes', label: '150 mins' },
        { value: '180 minutes', label: '180 mins' },
        { value: 'all day', label: 'All Day' }
    ];

    // REMOVED: Hardcoded SCHEDULE_WITH array - now dynamic

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

    // NEW: Function to fetch available schedules from hours of operation
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
                console.log("This is the hours of operation =-= = = = = = = = = =", data)
                setHoursOfOperation(data);

                // Extract unique schedule_with values from hours of operation
                // const uniqueSchedules = [...new Set(data.map(hour => hour.schedule_with))].filter(Boolean);
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

    // Generate priority options based on existing jump passes
    const generatePriorityOptions = (existingPasses) => {
        if (!existingPasses || existingPasses.length === 0) {
            return [1, 2, 3, 4, 999];
        }

        const existingPriorities = existingPasses
            .map(pass => pass.jump_pass_priority)
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

    // Handle jump time selection with custom time option
    const handleJumpTimeSelect = (value) => {
        if (value === 'custom') {
            setIsCustomJumpTime(true);
            setFormData(prev => ({
                ...prev,
                jump_time_allowed: customJumpTime ? `${customJumpTime} minutes` : ''
            }));
        } else {
            setIsCustomJumpTime(false);
            setFormData(prev => ({
                ...prev,
                jump_time_allowed: value
            }));
        }
    };

    // Handle custom jump time input change
    const handleCustomJumpTimeChange = (e) => {
        const value = e.target.value;
        setCustomJumpTime(value);
        setFormData(prev => ({
            ...prev,
            jump_time_allowed: value ? `${value} minutes` : ''
        }));

        if (fieldErrors.jump_time_allowed) {
            setFieldErrors(prev => ({
                ...prev,
                jump_time_allowed: ''
            }));
        }
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

    // Handle age allowed input with validation for letters only
    const handleAgeAllowedChange = (e) => {
        const value = e.target.value;
        if (/^[a-zA-Z\s]*$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                age_allowed: value
            }));

            if (fieldErrors.age_allowed) {
                setFieldErrors(prev => ({
                    ...prev,
                    age_allowed: ''
                }));
            }
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

    // Fetch jump passes for the current location
    const fetchJumpPasses = async () => {
        if (!location_id) return;

        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/jump-passes/${location_id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch jump passes');
            }

            const data = await response.json();
            setJumpPasses(data);

            const options = generatePriorityOptions(data);
            setPriorityOptions(options);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // NEW: Updated fetchHoursOfOperation to use the common function
    const fetchHoursOfOperation = async () => {
        await fetchAvailableSchedules();
    };

    // Convert time string to minutes for calculations
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    // Parse jump time string to minutes
    const parseJumpTimeToMinutes = (jumpTime) => {
        if (!jumpTime) return 0;
        if (jumpTime.toLowerCase() === 'all day') return 24 * 60;

        const timeStr = jumpTime.toLowerCase().trim();
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

    // Get all days in a range (start to end day)
    const getDaysInRange = (startDay, endDay) => {
        if (!startDay) return [];

        if (!endDay) {
            return [startDay];
        }

        const startIndex = getDayIndex(startDay);
        let endIndex = getDayIndex(endDay);

        if (endIndex < startIndex) {
            endIndex += 7;
        }

        const days = [];
        for (let i = startIndex; i <= endIndex; i++) {
            days.push(DAYS_OF_WEEK[i % 7]);
        }
        return days;
    };

    // Check if a day is within a range
    const isDayInRange = (day, startDay, endDay) => {
        if (!startDay) return false;

        if (!endDay) {
            return day === startDay;
        }

        const dayIndex = getDayIndex(day);
        const startIndex = getDayIndex(startDay);
        let endIndex = getDayIndex(endDay);

        if (endIndex < startIndex) {
            endIndex += 7;
        }

        return (dayIndex >= startIndex && dayIndex <= endIndex) ||
            (dayIndex + 7 >= startIndex && dayIndex + 7 <= endIndex);
    };

    // Detect conflicts between jump pass and hours of operation
    const detectConflicts = (newPass, existingHours) => {
        const conflicts = [];

        if (!newPass.schedule_with || newPass.schedule_with.length === 0 || !newPass.starting_day_name) {
            return conflicts;
        }

        const daysInRange = getDaysInRange(newPass.starting_day_name, newPass.ending_day_name);
        const jumpTimeMinutes = parseJumpTimeToMinutes(newPass.jump_time_allowed);
        const isAllDay = newPass.jump_time_allowed.toLowerCase() === 'all day';

        daysInRange.forEach(day => {
            const dayConflicts = [];
            let hasAtLeastOneAvailableSchedule = false;

            newPass.schedule_with.forEach(schedule => {
                let hasAvailableHours = false;
                let maxAvailableMinutes = 0;
                let availableTime = '';

                const specialHours = existingHours.filter(hour =>
                    hour.hours_type === 'special' &&
                    hour.schedule_with === schedule &&
                    getDayNameFromDate(hour.starting_date) === day
                );

                const regularHours = existingHours.filter(hour =>
                    hour.hours_type === 'regular' &&
                    hour.schedule_with === schedule &&
                    isDayInRange(day, hour.starting_day_name, hour.ending_day_name)
                );

                if (specialHours.length > 0) {
                    hasAvailableHours = true;
                    specialHours.forEach(hour => {
                        const mins = timeToMinutes(hour.end_time) - timeToMinutes(hour.start_time);
                        if (mins > maxAvailableMinutes) {
                            maxAvailableMinutes = mins;
                            availableTime = `${formatTime(hour.start_time)} - ${formatTime(hour.end_time)}`;
                        }
                    });
                }
                else if (regularHours.length > 0) {
                    hasAvailableHours = true;
                    regularHours.forEach(hour => {
                        const mins = timeToMinutes(hour.end_time) - timeToMinutes(hour.start_time);
                        if (mins > maxAvailableMinutes) {
                            maxAvailableMinutes = mins;
                            availableTime = `${formatTime(hour.start_time)} - ${formatTime(hour.end_time)}`;
                        }
                    });
                }

                if (hasAvailableHours) {
                    if (isAllDay) {
                        hasAtLeastOneAvailableSchedule = true;
                    } else if (jumpTimeMinutes <= maxAvailableMinutes) {
                        hasAtLeastOneAvailableSchedule = true;
                    } else {
                        dayConflicts.push({
                            type: 'TIME_EXCEEDS_AVAILABILITY',
                            message: `Jump time (${newPass.jump_time_allowed}) exceeds available time for ${formatScheduleWith(schedule)} on ${day}`,
                            day: day,
                            schedule: schedule,
                            availableTime: availableTime,
                            availableMinutes: maxAvailableMinutes,
                            requestedMinutes: jumpTimeMinutes,
                            severity: 'high',
                            hourType: specialHours.length > 0 ? 'special' : 'regular'
                        });
                    }
                } else {
                    dayConflicts.push({
                        type: 'SCHEDULE_NOT_AVAILABLE',
                        message: `${formatScheduleWith(schedule)} is not available on ${day}`,
                        day: day,
                        schedule: schedule,
                        severity: 'high'
                    });
                }
            });

            if (!hasAtLeastOneAvailableSchedule && dayConflicts.length > 0) {
                conflicts.push(...dayConflicts);
            }
        });

        return conflicts;
    };

    // Get day name from date string
    const getDayNameFromDate = (dateString) => {
        if (!dateString) return '';
        try {
            let date;
            if (dateString.includes('T')) {
                date = new Date(dateString);
            } else {
                date = new Date(dateString + 'T00:00:00');
            }

            if (isNaN(date.getTime())) {
                console.error('Invalid date:', dateString);
                return '';
            }

            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[date.getDay()];
        } catch (err) {
            console.error('Error parsing date:', dateString, err);
            return '';
        }
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
            jump_pass_priority: '',
            schedule_with: [],
            pass_name: '',
            age_allowed: '',
            jump_time_allowed: '',
            price: '',
            tax_included: 'yes',
            recommendation: '',
            jump_pass_pitch: '',
            starting_day_name: '',
            ending_day_name: '',
            comments: '',
            roller_booking_id: '',
            can_custom_take_part_in_multiple: 'no'
        });
        setEditingPass(null);
        setIsCustomJumpTime(false);
        setCustomJumpTime('');
        setError('');
        setSuccess('');
        setFieldErrors({});
    };

    // Validate form data and check for conflicts
    const validateFormWithConflicts = () => {
        const errors = {};
        const requiredFields = [
            'jump_pass_priority',
            'pass_name',
            'age_allowed',
            'jump_time_allowed',
            'price',
            'recommendation'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] && formData[field] !== 0) {
                errors[field] = `${field.replace(/_/g, ' ')} is required`;
            }
        });

        if (!formData.schedule_with || formData.schedule_with.length === 0) {
            errors.schedule_with = 'At least one schedule type must be selected';
        }

        if (formData.jump_pass_priority && (formData.jump_pass_priority < 0 || formData.jump_pass_priority > 1000)) {
            errors.jump_pass_priority = 'Priority must be between 0 and 1000';
        }

        if (formData.price && formData.price < 0) {
            errors.price = 'Price cannot be negative';
        }

        if (formData.age_allowed && /\d/.test(formData.age_allowed)) {
            errors.age_allowed = 'Age allowed cannot contain numbers';
        }

        const detectedConflicts = detectConflicts(formData, hoursOfOperation);
        if (detectedConflicts.length > 0) {
            errors.conflicts = detectedConflicts;
        }

        return errors;
    };

    // Handle conflict resolution popup actions
    const handleConflictResolution = async (action) => {
        if (action === 'proceed') {
            setShowConflictPopup(false);
            await submitForm(pendingSubmission);
        } else if (action === 'cancel') {
            setShowConflictPopup(false);
            setPendingSubmission(null);
            setConflicts([]);
        }
    };

    // Handle form submission with validation
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateFormWithConflicts();
        const fieldValidationErrors = { ...validationErrors };
        delete fieldValidationErrors.conflicts;

        if (Object.keys(fieldValidationErrors).length > 0) {
            setFieldErrors(fieldValidationErrors);
            return;
        }

        if (validationErrors.conflicts && validationErrors.conflicts.length > 0) {
            setConflicts(validationErrors.conflicts);
            setPendingSubmission({ formData, editingPass });
            setShowConflictPopup(true);
            return;
        }

        await submitForm({ formData, editingPass });
    };

    // Submit form data to API
    const submitForm = async (submissionData) => {
        if (!submissionData) return;

        const { formData, editingPass } = submissionData;
        setIsLoading(true);
        setError('');
        setSuccess('');
        setFieldErrors({});

        try {
            const token = getAuthToken();
            const url = editingPass
                ? `${import.meta.env.VITE_BackendApi}/jump-passes/${location_id}/${editingPass.jump_pass_id}/update/`
                : `${import.meta.env.VITE_BackendApi}/jump-passes/${location_id}/create/`;

            const method = editingPass ? 'PUT' : 'POST';

            const submitData = {
                ...formData,
                tax_included: formData.tax_included === 'yes',
                can_custom_take_part_in_multiple: formData.can_custom_take_part_in_multiple === 'yes'
            };

            const optionalFields = ['jump_pass_pitch', 'starting_day_name', 'ending_day_name', 'comments'];

            optionalFields.forEach(field => {
                if (submitData[field] === '') {
                    submitData[field] = null;
                }
            });

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
                    throw new Error(responseData.error || responseData.detail || 'Failed to save jump pass');
                }
                return;
            }

            const savedPass = responseData;

            if (editingPass) {
                setJumpPasses(prev => prev.map(pass =>
                    pass.jump_pass_id === savedPass.jump_pass_id ? savedPass : pass
                ));
                setSuccess('Jump pass updated successfully!');
            } else {
                setJumpPasses(prev => [...prev, savedPass]);
                setSuccess('Jump pass created successfully!');
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

    // Handle edit jump pass - populate form with existing data
    const handleEdit = (pass) => {
        const jumpTimeValue = pass.jump_time_allowed;
        const isCustom = !JUMP_TIME_OPTIONS.some(option => option.value === jumpTimeValue) && jumpTimeValue !== 'all day';

        if (isCustom && jumpTimeValue) {
            const timeMatch = jumpTimeValue.match(/(\d+)\s*minutes?/i);
            if (timeMatch) {
                setCustomJumpTime(timeMatch[1]);
            }
            setIsCustomJumpTime(true);
        } else {
            setIsCustomJumpTime(false);
            setCustomJumpTime('');
        }

        setFormData({
            jump_pass_priority: pass.jump_pass_priority,
            schedule_with: Array.isArray(pass.schedule_with) ? pass.schedule_with : [pass.schedule_with].filter(Boolean),
            pass_name: pass.pass_name,
            age_allowed: pass.age_allowed,
            jump_time_allowed: pass.jump_time_allowed,
            price: pass.price,
            tax_included: pass.tax_included ? 'yes' : 'no',
            recommendation: pass.recommendation,
            jump_pass_pitch: pass.jump_pass_pitch || '',
            starting_day_name: pass.starting_day_name || '',
            ending_day_name: pass.ending_day_name || '',
            comments: pass.comments || '',
            roller_booking_id: pass.roller_booking_id || '',
            can_custom_take_part_in_multiple: pass.can_custom_take_part_in_multiple ? 'yes' : 'no'
        });
        setEditingPass(pass);
        setIsFormOpen(true);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };

    // Handle delete jump pass with confirmation
    const handleDelete = async (passId) => {
        if (!window.confirm('Are you sure you want to delete this jump pass?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/jump-passes/${location_id}/${passId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete jump pass');
            }

            setJumpPasses(prev => prev.filter(pass => pass.jump_pass_id !== passId));
            setSuccess('Jump pass deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // NEW: Function to navigate to hours of operation page
    const navigateToHoursOfOperation = () => {
        navigate(`/hours-of-operation/${location_id}`);
    };

    // Fetch data when component mounts or location_id changes
    useEffect(() => {
        if (location_id) {
            fetchLocation();
            fetchJumpPasses();
            fetchHoursOfOperation();
        }
    }, [location_id]);

    // NEW: Render error state when no schedules are available
    if (!hasSchedules) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Jump Passes</h2>
                        {location && (
                            <p className="text-gray-600 mt-1">
                                Managing jump passes for: <span className="font-semibold">{location.location_name}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-md text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold mb-2">No Hours of Operation Found</h3>
                    <p className="mb-4">
                        You need to set up hours of operation before creating jump passes.
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
                    <h2 className="text-2xl font-bold text-gray-900">Jump Passes</h2>
                    {location && (
                        <p className="text-gray-600 mt-1">
                            Managing jump passes for: <span className="font-semibold">{location.location_name}</span>
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
                    <span>Add New Jump Pass</span>
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

            {showConflictPopup && (
                <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-red-600">Schedule Conflict Detected</h3>
                                <button
                                    onClick={() => handleConflictResolution('cancel')}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-700 mb-4">
                                    The jump pass you're trying to create conflicts with the available hours of operation.
                                </p>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                                    <h4 className="font-semibold text-yellow-800 mb-2">New Jump Pass:</h4>
                                    <div className="text-sm text-yellow-700">
                                        <p><strong>Schedule:</strong> {formData.schedule_with?.map(s => formatScheduleWith(s)).join(', ')}</p>
                                        <p><strong>Days:</strong> {formData.starting_day_name}{formData.ending_day_name ? ` to ${formData.ending_day_name}` : ''}</p>
                                        <p><strong>Jump Time:</strong> {formData.jump_time_allowed}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">Conflicts:</h4>
                                    {conflicts.map((conflict, index) => (
                                        <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-red-600 font-semibold">
                                                    {conflict.type === 'SCHEDULE_NOT_AVAILABLE' ? 'Schedule Not Available' : 'Time Exceeds Availability'}
                                                </span>
                                                <span className="text-xs font-medium px-2 py-1 rounded bg-red-100 text-red-800">
                                                    High Priority
                                                </span>
                                            </div>

                                            <p className="text-red-700 mb-3">{conflict.message}</p>

                                            {conflict.availableTime && (
                                                <div className="text-sm text-red-600">
                                                    <p><strong>Available Time:</strong> {conflict.availableTime}</p>
                                                    <p><strong>Available Minutes:</strong> {conflict.availableMinutes} mins</p>
                                                    <p><strong>Requested Minutes:</strong> {conflict.requestedMinutes} mins</p>
                                                    <p><strong>Type:</strong> {conflict.hourType === 'special' ? 'Special Hours' : 'Regular Hours'}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => handleConflictResolution('cancel')}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => handleConflictResolution('proceed')}
                                        className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                                    >
                                        Proceed Anyway
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isFormOpen && location_id && (
                <div className="space-y-4">
                    {jumpPasses
                        .sort((a, b) => a.jump_pass_priority - b.jump_pass_priority)
                        .map((pass) => {
                            const isTaxIncluded = pass.tax_included;
                            const finalPrice = parseFloat(pass.price).toFixed(2);

                            return (
                                <div key={pass.jump_pass_id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">{pass.pass_name}</h3>
                                            <div className="flex items-center space-x-4 mt-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {/* Priority: {pass.jump_pass_priority} */}
                                                    Priority: {pass.jump_pass_priority === 999 ? 'Do not Pitch' : pass.jump_pass_priority}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    {Array.isArray(pass.schedule_with)
                                                        ? pass.schedule_with.map(s => formatScheduleWith(s)).join(', ')
                                                        : formatScheduleWith(pass.schedule_with)
                                                    }
                                                </span>
                                                {pass.can_custom_take_part_in_multiple && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        Multiple Schedule
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(pass)}
                                                className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(pass.jump_pass_id)}
                                                className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-200 hover:border-red-300 transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Age Group:</span>
                                            <p className="font-medium">{pass.age_allowed}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Jump Time:</span>
                                            <p className="font-medium">{pass.jump_time_allowed}</p>
                                        </div>
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
                                    </div> */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-600">Age Group:</span>
                                            <p className="font-medium">{pass.age_allowed}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Jump Time:</span>
                                            <p className="font-medium">{pass.jump_time_allowed}</p>
                                        </div>
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
                                            <span className="text-gray-600">Roller Booking ID:</span>
                                            <p className="font-medium">{pass.roller_booking_id || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {pass.starting_day_name && (
                                        <div className="mt-3">
                                            <span className="text-gray-600">Valid Days:</span>
                                            <p className="font-medium">
                                                {pass.starting_day_name}
                                                {pass.ending_day_name && ` - ${pass.ending_day_name}`}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-4 space-y-2">
                                        {pass.recommendation && (
                                            <div>
                                                <span className="text-gray-600">Recommendation:</span>
                                                <p className="font-medium mt-1">{pass.recommendation}</p>
                                            </div>
                                        )}
                                        {pass.jump_pass_pitch && (
                                            <div>
                                                <span className="text-gray-600">Pitch:</span>
                                                <p className="font-medium mt-1">{pass.jump_pass_pitch}</p>
                                            </div>
                                        )}
                                        {pass.comments && (
                                            <div>
                                                <span className="text-gray-600">Comments:</span>
                                                <p className="font-medium mt-1">{pass.comments}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            )}

            {!isFormOpen && location_id && jumpPasses.length === 0 && !isLoading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🎫</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Jump Passes Configured</h3>
                    <p className="text-gray-500 mb-4">Add jump passes for this location to get started.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add Jump Pass
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
                            {editingPass ? 'Edit Jump Pass' : 'Add New Jump Pass'}
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Priority *
                                </label>
                                <select
                                    name="jump_pass_priority"
                                    value={formData.jump_pass_priority}
                                    onChange={handleInputChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.jump_pass_priority ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select Priority</option>
                                    {priorityOptions.map(option => (
                                        <option key={option} value={option}>
                                            {option === 999 ? 'Do not pitch' : option}
                                        </option>
                                    ))}
                                </select>
                                {fieldErrors.jump_pass_priority && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.jump_pass_priority}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Can Customer Take Part in Multiple Schedules
                                </label>
                                <select
                                    name="can_custom_take_part_in_multiple"
                                    value={formData.can_custom_take_part_in_multiple}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                >
                                    {YES_NO_OPTIONS.map(option => (
                                        <option key={option} value={option}>
                                            {formatYesNo(option)}
                                        </option>
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


                            <div className="md:col-span-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pass Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="pass_name"
                                            value={formData.pass_name}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.pass_name ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter pass name"
                                        />
                                        {fieldErrors.pass_name && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.pass_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Roller Booking ID
                                        </label>
                                        <input
                                            type="text"
                                            name="roller_booking_id"
                                            value={formData.roller_booking_id}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.roller_booking_id ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter roller booking ID"
                                        />
                                        {fieldErrors.roller_booking_id && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.roller_booking_id}</p>
                                        )}
                                    </div>


                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Age Allowed *
                                </label>
                                <input
                                    type="text"
                                    name="age_allowed"
                                    value={formData.age_allowed}
                                    onChange={handleAgeAllowedChange}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.age_allowed ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="e.g., All Ages, Adults Only"
                                />
                                {fieldErrors.age_allowed && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.age_allowed}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    Letters and spaces only, numbers not allowed
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jump Time Allowed *
                                </label>

                                {!isCustomJumpTime ? (
                                    <select
                                        value={formData.jump_time_allowed}
                                        onChange={(e) => handleJumpTimeSelect(e.target.value)}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.jump_time_allowed ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select Jump Time</option>
                                        {JUMP_TIME_OPTIONS.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                        <option value="custom">Custom time...</option>
                                    </select>
                                ) : (
                                    <div className="flex space-x-2">
                                        <input
                                            type="number"
                                            value={customJumpTime}
                                            onChange={handleCustomJumpTimeChange}
                                            min="1"
                                            max="1440"
                                            className={`flex-1 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.jump_time_allowed ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            placeholder="Enter minutes"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsCustomJumpTime(false);
                                                setCustomJumpTime('');
                                                setFormData(prev => ({
                                                    ...prev,
                                                    jump_time_allowed: ''
                                                }));
                                            }}
                                            className="px-3 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                                        >
                                            Back to Selection
                                        </button>
                                    </div>
                                )}

                                {fieldErrors.jump_time_allowed && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.jump_time_allowed}</p>
                                )}

                                {isCustomJumpTime && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Enter the number of minutes for the jump time
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
                                    Starting Day
                                </label>
                                <select
                                    name="starting_day_name"
                                    value={formData.starting_day_name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                >
                                    <option value="">Select Starting Day</option>
                                    {DAYS_OF_WEEK.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
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
                                    <option value="">Select Ending Day</option>
                                    {DAYS_OF_WEEK.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recommendation *
                                </label>
                                <textarea
                                    name="recommendation"
                                    value={formData.recommendation}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.recommendation ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter recommendation text..."
                                />
                                {fieldErrors.recommendation && (
                                    <p className="mt-1 text-sm text-red-600">{fieldErrors.recommendation}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jump Pass Pitch (Optional)
                                </label>
                                <textarea
                                    name="jump_pass_pitch"
                                    value={formData.jump_pass_pitch}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="Enter marketing pitch for this pass..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Comments (Optional)
                                </label>
                                <textarea
                                    name="comments"
                                    value={formData.comments}
                                    onChange={handleInputChange}
                                    rows={2}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    placeholder="Enter any additional comments..."
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
                                        ? (editingPass ? 'Updating...' : 'Creating...')
                                        : (editingPass ? 'Update Pass' : 'Create Pass')
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

export default JumpPassComp;




