



import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

const BirthDayPackagesComp = () => {
  // Get location_id from URL parameters and initialize navigation
  const { location_id } = useParams();
  const navigate = useNavigate();

  // Get user data from Redux store
  const userData = useSelector((state) => state.auth.userData);

  // State declarations for component data management
  const [birthdayPackages, setBirthdayPackages] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingPackage, setEditingPackage] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // State for dynamic schedule options
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [hasSchedules, setHasSchedules] = useState(true);

  // Form data state initialization
  const [formData, setFormData] = useState({
    package_name: '',
    birthday_party_priority: '',
    availability_days: [],
    schedule_with: [],
    minimum_jumpers: '',
    jump_time: '',
    party_room_time: '',
    food_and_drinks: '',
    paper_goods: '',
    skysocks: 'SkySocks Not Included',
    dessert_policy: '',
    other_perks: '',
    outside_food_drinks_fee: '',
    price: '',
    guest_of_honour_included_in_total_jumpers: false,
    tax_included: false,
    birthday_party_booking_lead_allowed_days: '',
    birthday_party_reschedule_allowed_days: '',
    each_additional_jumper_price: '',
    is_available: true,
    // Optional fields
    birthday_party_pitch: '',
    Is_additional_jumpers_allowed: true, // NEW: Default true
    each_additional_jump_hour_after_room_time: '',
    additional_instructions: '',
    birthday_party_discount_code: '',
    birthday_party_discount_percentage: '',
    roller_birthday_party_search_id: '',
    roller_additional_jumper_price_search_id: '',
    roller_birthday_party_booking_id: '',
    each_additional_jump_half_hour_after_room_time: ''
  });

  // State for custom SkySocks input
  const [isCustomSkySocks, setIsCustomSkySocks] = useState(false);
  const [customSkySocks, setCustomSkySocks] = useState('');

  // Predefined options
  const DAYS_OPTIONS = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
  ];

  const JUMP_TIME_OPTIONS = [
    '60 minutes', '90 minutes', '120 minutes', '150 minutes', '180 minutes'
  ];

  const PARTY_ROOM_TIME_OPTIONS = [
    '30 minutes', '45 minutes', '60 minutes', '75 minutes', '90 minutes'
  ];

  const SKYSOCKS_OPTIONS = [
    'SkySocks Included',
    'SkySocks Not Included',
    'custom'
  ];

  // NEW: Priority options
  const PRIORITY_OPTIONS = [1, 2, 3, 4, 5, 6, 999];

  // Function to get authentication token
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
        setLocation(data);
      }
    } catch (err) {
      console.error('Failed to fetch location:', err);
    }
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

  // Fetch birthday packages for the current location
  const fetchBirthdayPackages = async () => {
    if (!location_id) return;

    setIsLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/list/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch birthday packages');
      }

      const data = await response.json();
      setBirthdayPackages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Handle input changes with special logic for Is_additional_jumpers_allowed
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If Is_additional_jumpers_allowed is being unchecked, clear the additional jump time fields
    if (name === 'Is_additional_jumpers_allowed' && !checked) {
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        each_additional_jump_hour_after_room_time: '',
        each_additional_jump_half_hour_after_room_time: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked :
          type === 'number' ? (value === '' ? '' : parseFloat(value)) :
            value
      }));
    }

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle multi-select changes for availability days
  const handleAvailabilityDaysChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentSelection = Array.isArray(prev.availability_days) ? prev.availability_days : [];

      if (checked) {
        return {
          ...prev,
          availability_days: [...currentSelection, value]
        };
      } else {
        return {
          ...prev,
          availability_days: currentSelection.filter(item => item !== value)
        };
      }
    });

    if (fieldErrors.availability_days) {
      setFieldErrors(prev => ({
        ...prev,
        availability_days: ''
      }));
    }
  };

  // Handle multi-select changes for schedule with
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

  // Handle SkySocks selection
  const handleSkySocksSelect = (value) => {
    if (value === 'custom') {
      setIsCustomSkySocks(true);
      setFormData(prev => ({
        ...prev,
        skysocks: customSkySocks || ''
      }));
    } else {
      setIsCustomSkySocks(false);
      setFormData(prev => ({
        ...prev,
        skysocks: value
      }));
    }
  };

  // Handle custom SkySocks input change
  const handleCustomSkySocksChange = (e) => {
    const value = e.target.value;
    setCustomSkySocks(value);
    setFormData(prev => ({
      ...prev,
      skysocks: value
    }));
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      package_name: '',
      birthday_party_priority: '',
      availability_days: [],
      schedule_with: [],
      minimum_jumpers: '',
      jump_time: '',
      party_room_time: '',
      food_and_drinks: '',
      paper_goods: '',
      skysocks: 'SkySocks Not Included',
      dessert_policy: '',
      other_perks: '',
      outside_food_drinks_fee: '',
      price: '',
      guest_of_honour_included_in_total_jumpers: false,
      tax_included: false,
      birthday_party_booking_lead_allowed_days: '',
      birthday_party_reschedule_allowed_days: '',
      each_additional_jumper_price: '',
      is_available: true,
      birthday_party_pitch: '',
      Is_additional_jumpers_allowed: true, // NEW: Default true
      each_additional_jump_hour_after_room_time: '',
      additional_instructions: '',
      birthday_party_discount_code: '',
      birthday_party_discount_percentage: '',
      roller_birthday_party_search_id: '',
      roller_additional_jumper_price_search_id: '',
      roller_birthday_party_booking_id: '',
      each_additional_jump_half_hour_after_room_time: ''
    });
    setEditingPackage(null);
    setIsCustomSkySocks(false);
    setCustomSkySocks('');
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      'package_name',
      'birthday_party_priority',
      'minimum_jumpers',
      'jump_time',
      'party_room_time',
      'price',
      'birthday_party_booking_lead_allowed_days',
      'birthday_party_reschedule_allowed_days',
      'each_additional_jumper_price'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] && formData[field] !== 0) {
        errors[field] = `${field.replace(/_/g, ' ')} is required`;
      }
    });

    if (!formData.availability_days || formData.availability_days.length === 0) {
      errors.availability_days = 'At least one availability day must be selected';
    }

    if (!formData.schedule_with || formData.schedule_with.length === 0) {
      errors.schedule_with = 'At least one schedule type must be selected';
    }

    if (formData.birthday_party_priority && (formData.birthday_party_priority < 0 || formData.birthday_party_priority > 1000)) {
      errors.birthday_party_priority = 'Priority must be between 0 and 1000';
    }

    if (formData.price && formData.price < 0) {
      errors.price = 'Price cannot be negative';
    }

    if (formData.each_additional_jumper_price && formData.each_additional_jumper_price < 0) {
      errors.each_additional_jumper_price = 'Additional jumper price cannot be negative';
    }

    if (formData.minimum_jumpers && formData.minimum_jumpers < 1) {
      errors.minimum_jumpers = 'Minimum jumpers must be at least 1';
    }

    return errors;
  };

  // NEW: Get available priorities for dropdown
  const getAvailablePriorities = () => {
    const usedPriorities = birthdayPackages
      .filter(pkg => !editingPackage || pkg.birthday_party_packages_id !== editingPackage.birthday_party_packages_id)
      .map(pkg => pkg.birthday_party_priority);

    return PRIORITY_OPTIONS.filter(priority => !usedPriorities.includes(priority));
  };

  // Handle form submission
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

    try {
      const token = getAuthToken();
      const url = editingPackage
        ? `${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/${editingPackage.birthday_party_packages_id}/update/`
        : `${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/create/`;

      const method = editingPackage ? 'PUT' : 'POST';

      // NEW: If additional jumpers are not allowed, ensure the price fields are empty
      const submitData = {
        ...formData,
        availability_days: formData.availability_days.join(', '),
        schedule_with: formData.schedule_with.join(', '),
        tax_included: formData.tax_included ? 10.00 : 0.00, // Set to 10% if included, 0% if not
        // NEW: Clear additional jump time fields if additional jumpers are not allowed
        ...(!formData.Is_additional_jumpers_allowed && {
          each_additional_jump_hour_after_room_time: '',
          each_additional_jump_half_hour_after_room_time: ''
        })
      };

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
          throw new Error(responseData.error || responseData.detail || 'Failed to save birthday package');
        }
        return;
      }

      const savedPackage = responseData;

      if (editingPackage) {
        setBirthdayPackages(prev => prev.map(pkg =>
          pkg.birthday_party_packages_id === savedPackage.birthday_party_packages_id ? savedPackage : pkg
        ));
        setSuccess('Birthday package updated successfully!');
      } else {
        setBirthdayPackages(prev => [...prev, savedPackage]);
        setSuccess('Birthday package created successfully!');
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

  // Format schedule name for display
  const formatScheduleWith = (schedule) => {
    if (!schedule) return 'N/A';
    return schedule.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Format availability days for display
  const formatAvailabilityDays = (days) => {
    if (!days) return 'N/A';
    if (Array.isArray(days)) {
      return days.join(', ');
    }
    return days.split(',').map(day => day.trim()).join(', ');
  };

  // Handle edit package - populate form with existing data
  const handleEdit = (pkg) => {
    // Convert string fields to arrays for multi-select
    const availabilityDaysArray = pkg.availability_days ?
      (Array.isArray(pkg.availability_days) ? pkg.availability_days : pkg.availability_days.split(',').map(day => day.trim())) : [];

    const scheduleWithArray = pkg.schedule_with ?
      (Array.isArray(pkg.schedule_with) ? pkg.schedule_with : pkg.schedule_with.split(',').map(schedule => schedule.trim())) : [];

    // Check if SkySocks value is custom
    const isSkySocksCustom = !SKYSOCKS_OPTIONS.includes(pkg.skysocks) && pkg.skysocks !== 'SkySocks Included' && pkg.skysocks !== 'SkySocks Not Included';

    if (isSkySocksCustom) {
      setIsCustomSkySocks(true);
      setCustomSkySocks(pkg.skysocks);
    } else {
      setIsCustomSkySocks(false);
      setCustomSkySocks('');
    }

    setFormData({
      package_name: pkg.package_name,
      birthday_party_priority: pkg.birthday_party_priority,
      availability_days: availabilityDaysArray,
      schedule_with: scheduleWithArray,
      minimum_jumpers: pkg.minimum_jumpers,
      jump_time: pkg.jump_time,
      party_room_time: pkg.party_room_time,
      food_and_drinks: pkg.food_and_drinks || '',
      paper_goods: pkg.paper_goods || '',
      skysocks: isSkySocksCustom ? pkg.skysocks : (pkg.skysocks || 'SkySocks Not Included'),
      dessert_policy: pkg.dessert_policy || '',
      other_perks: pkg.other_perks || '',
      outside_food_drinks_fee: pkg.outside_food_drinks_fee || '',
      price: pkg.price,
      guest_of_honour_included_in_total_jumpers: pkg.guest_of_honour_included_in_total_jumpers,
      tax_included: pkg.tax_included > 0,
      birthday_party_booking_lead_allowed_days: pkg.birthday_party_booking_lead_allowed_days,
      birthday_party_reschedule_allowed_days: pkg.birthday_party_reschedule_allowed_days,
      each_additional_jumper_price: pkg.each_additional_jumper_price,
      is_available: pkg.is_available,
      birthday_party_pitch: pkg.birthday_party_pitch || '',
      Is_additional_jumpers_allowed: pkg.Is_additional_jumpers_allowed !== undefined ? pkg.Is_additional_jumpers_allowed : true, // NEW: Set from database
      each_additional_jump_hour_after_room_time: pkg.each_additional_jump_hour_after_room_time || '',
      additional_instructions: pkg.additional_instructions || '',
      birthday_party_discount_code: pkg.birthday_party_discount_code || '',
      birthday_party_discount_percentage: pkg.birthday_party_discount_percentage || '',
      roller_birthday_party_search_id: pkg.roller_birthday_party_search_id || '',
      roller_additional_jumper_price_search_id: pkg.roller_additional_jumper_price_search_id || '',
      roller_birthday_party_booking_id: pkg.roller_birthday_party_booking_id || '',
      each_additional_jump_half_hour_after_room_time: pkg.each_additional_jump_half_hour_after_room_time || ''
    });
    setEditingPackage(pkg);
    setIsFormOpen(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  // Handle delete package with confirmation
  const handleDelete = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this birthday package?')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/${packageId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete birthday package');
      }

      setBirthdayPackages(prev => prev.filter(pkg => pkg.birthday_party_packages_id !== packageId));
      setSuccess('Birthday package deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle package availability
  const toggleAvailability = async (pkg) => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const updatedPackage = { ...pkg, is_available: !pkg.is_available };

      const response = await fetch(`${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/${pkg.birthday_party_packages_id}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedPackage)
      });

      if (!response.ok) {
        throw new Error('Failed to update package availability');
      }

      const responseData = await response.json();
      setBirthdayPackages(prev => prev.map(item =>
        item.birthday_party_packages_id === pkg.birthday_party_packages_id ? responseData : item
      ));

      setSuccess(`Package ${!pkg.is_available ? 'activated' : 'deactivated'} successfully!`);
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
      fetchBirthdayPackages();
      fetchAvailableSchedules();
    }
  }, [location_id]);

  // NEW: Render error state when no schedules are available
  if (!hasSchedules) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Birthday Party Packages</h2>
            {location && (
              <p className="text-gray-600 mt-1">
                Managing birthday packages for: <span className="font-semibold">{location.location_name}</span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">No Hours of Operation Found</h3>
          <p className="mb-4">
            You need to set up hours of operation before creating birthday packages.
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Birthday Party Packages</h2>
          {location && (
            <p className="text-gray-600 mt-1">
              Managing birthday packages for: <span className="font-semibold">{location.location_name}</span>
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
          {birthdayPackages
            .sort((a, b) => a.birthday_party_priority - b.birthday_party_priority)
            .map((pkg) => {
              const finalPrice = parseFloat(pkg.price).toFixed(2);
              const additionalJumperPrice = parseFloat(pkg.each_additional_jumper_price).toFixed(2);
              const taxIncluded = parseFloat(pkg.tax_included) > 0;
              // NEW: Format additional jump prices
              const additionalJumpHourPrice = pkg.each_additional_jump_hour_after_room_time ?
                parseFloat(pkg.each_additional_jump_hour_after_room_time).toFixed(2) : null;
              const additionalJumpHalfHourPrice = pkg.each_additional_jump_half_hour_after_room_time ?
                parseFloat(pkg.each_additional_jump_half_hour_after_room_time).toFixed(2) : null;

              return (
                <div key={pkg.birthday_party_packages_id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start space-x-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{pkg.package_name}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {pkg.is_available ? 'Active' : 'Inactive'}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Priority: {pkg.birthday_party_priority === 999 ? 'Do not Pitch' : pkg.birthday_party_priority}
                          </span>
                          {taxIncluded && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Tax Included
                            </span>
                          )}
                          {/* UPDATED: Display additional jumpers allowed status - show "Not Allowed" when false */}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.Is_additional_jumpers_allowed ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                            Additional Jumpers: {pkg.Is_additional_jumpers_allowed ? 'Allowed' : 'Not Allowed'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleAvailability(pkg)}
                        className={`px-3 py-1 rounded-md border transition-colors ${pkg.is_available ? 'text-orange-600 border-orange-200 hover:border-orange-300' : 'text-green-600 border-green-200 hover:border-green-300'}`}
                      >
                        {pkg.is_available ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.birthday_party_packages_id)}
                        className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-200 hover:border-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Availability:</span>
                      <p className="font-medium">{formatAvailabilityDays(pkg.availability_days)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Schedule:</span>
                      <p className="font-medium">
                        {Array.isArray(pkg.schedule_with)
                          ? pkg.schedule_with.map(s => formatScheduleWith(s)).join(', ')
                          : formatScheduleWith(pkg.schedule_with)
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">SkySocks:</span>
                      <p className="font-medium">{pkg.skysocks || 'SkySocks Not Included'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Jump Time:</span>
                      <p className="font-medium">{pkg.jump_time}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Party Room:</span>
                      <p className="font-medium">{pkg.party_room_time}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Minimum Jumpers:</span>
                      <p className="font-medium">{pkg.minimum_jumpers}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Base Price:</span>
                      <p className="font-medium text-lg">${finalPrice}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Additional Jumper:</span>
                      <p className="font-medium">${additionalJumperPrice}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Guest of Honour Included in Jumpers:</span>
                      <p className="font-medium">{pkg.guest_of_honour_included_in_total_jumpers ? 'Yes' : 'No'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-600">Booking Lead Days:</span>
                      <p className="font-medium">{pkg.birthday_party_booking_lead_allowed_days} days</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Reschedule Days:</span>
                      <p className="font-medium">{pkg.birthday_party_reschedule_allowed_days} days</p>
                    </div>
                  </div>

                  {/* UPDATED: Display additional jump time fields as dollar amounts if additional jumpers are allowed */}
                  {pkg.Is_additional_jumpers_allowed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      {additionalJumpHourPrice && (
                        <div>
                          <span className="text-gray-600">Additional Jump Hour After Room Price:</span>
                          <p className="font-medium">${additionalJumpHourPrice}</p>
                        </div>
                      )}
                      {additionalJumpHalfHourPrice && (
                        <div>
                          <span className="text-gray-600">Additional Jump Half Hour After Room Price:</span>
                          <p className="font-medium">${additionalJumpHalfHourPrice}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {pkg.food_and_drinks && (
                    <div className="mb-3">
                      <span className="text-gray-600">Food & Drinks:</span>
                      <p className="font-medium">{pkg.food_and_drinks}</p>
                    </div>
                  )}

                  {pkg.birthday_party_pitch && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <span className="text-gray-600 block mb-1">Pitch:</span>
                      <p className="font-medium">{pkg.birthday_party_pitch}</p>
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )}

      {!isFormOpen && location_id && birthdayPackages.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎂</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Birthday Packages Configured</h3>
          <p className="text-gray-500 mb-4">Add birthday packages for this location to get started.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Birthday Package
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
              {editingPackage ? 'Edit Birthday Package' : 'Add New Birthday Package'}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Package Name */}
              <div className="md:col-span-3">
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

              {/* UPDATED: Priority - Changed to dropdown select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  name="birthday_party_priority"
                  value={formData.birthday_party_priority}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.birthday_party_priority ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Priority</option>
                  {getAvailablePriorities().map(priority => (
                    <option key={priority} value={priority}>
                      {priority === 999 ? 'Do not Pitch' : priority}
                    </option>
                  ))}
                </select>
                {fieldErrors.birthday_party_priority && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.birthday_party_priority}</p>
                )}
              </div>

              {/* Minimum Jumpers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Jumpers *
                </label>
                <input
                  type="number"
                  name="minimum_jumpers"
                  value={formData.minimum_jumpers}
                  onChange={handleInputChange}
                  min="1"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.minimum_jumpers ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Minimum jumpers"
                />
                {fieldErrors.minimum_jumpers && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.minimum_jumpers}</p>
                )}
              </div>

              {/* Jump Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jump Time *
                </label>
                <select
                  name="jump_time"
                  value={formData.jump_time}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.jump_time ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Jump Time</option>
                  {JUMP_TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {fieldErrors.jump_time && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.jump_time}</p>
                )}
              </div>

              {/* Party Room Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Party Room Time *
                </label>
                <select
                  name="party_room_time"
                  value={formData.party_room_time}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.party_room_time ? 'border-red-300' : 'border-gray-300'
                    }`}
                >
                  <option value="">Select Party Room Time</option>
                  {PARTY_ROOM_TIME_OPTIONS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                {fieldErrors.party_room_time && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.party_room_time}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price *
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

              {/* Additional Jumper Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Jumper Price *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="each_additional_jumper_price"
                    value={formData.each_additional_jumper_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`mt-1 block w-full pl-7 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.each_additional_jumper_price ? 'border-red-300' : 'border-gray-300'
                      }`}
                    placeholder="0.00"
                  />
                </div>
                {fieldErrors.each_additional_jumper_price && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.each_additional_jumper_price}</p>
                )}
              </div>

              {/* Booking Lead Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Lead Days *
                </label>
                <input
                  type="number"
                  name="birthday_party_booking_lead_allowed_days"
                  value={formData.birthday_party_booking_lead_allowed_days}
                  onChange={handleInputChange}
                  min="0"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.birthday_party_booking_lead_allowed_days ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Days in advance"
                />
                {fieldErrors.birthday_party_booking_lead_allowed_days && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.birthday_party_booking_lead_allowed_days}</p>
                )}
              </div>

              {/* Reschedule Days */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reschedule Days *
                </label>
                <input
                  type="number"
                  name="birthday_party_reschedule_allowed_days"
                  value={formData.birthday_party_reschedule_allowed_days}
                  onChange={handleInputChange}
                  min="0"
                  className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.birthday_party_reschedule_allowed_days ? 'border-red-300' : 'border-gray-300'
                    }`}
                  placeholder="Days before event"
                />
                {fieldErrors.birthday_party_reschedule_allowed_days && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.birthday_party_reschedule_allowed_days}</p>
                )}
              </div>

              {/* SkySocks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SkySocks
                </label>
                {!isCustomSkySocks ? (
                  <select
                    value={formData.skysocks}
                    onChange={(e) => handleSkySocksSelect(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  >
                    {SKYSOCKS_OPTIONS.map(option => (
                      <option key={option} value={option}>
                        {option === 'custom' ? 'Custom...' : option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customSkySocks}
                      onChange={handleCustomSkySocksChange}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                      placeholder="Enter custom SkySocks value"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSkySocks(false);
                        setCustomSkySocks('');
                        setFormData(prev => ({
                          ...prev,
                          skysocks: 'SkySocks Not Included'
                        }));
                      }}
                      className="px-3 py-2 text-sm text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Back to Selection
                    </button>
                  </div>
                )}
              </div>

              {/* Four Big Checkboxes in One Row - UPDATED: Added new checkbox */}
              <div className="md:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="tax_included"
                      checked={formData.tax_included}
                      onChange={handleInputChange}
                      className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="block text-lg font-medium text-gray-700">
                      Tax Included
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="guest_of_honour_included_in_total_jumpers"
                      checked={formData.guest_of_honour_included_in_total_jumpers}
                      onChange={handleInputChange}
                      className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="block text-lg font-medium text-gray-700">
                      Guest of Honour Included in Total Jumpers
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleInputChange}
                      className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="block text-lg font-medium text-gray-700">
                      Package is Available
                    </label>
                  </div>

                  {/* UPDATED: Additional Jumpers Allowed Checkbox - now clears fields when unchecked */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="Is_additional_jumpers_allowed"
                      checked={formData.Is_additional_jumpers_allowed}
                      onChange={handleInputChange}
                      className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="block text-lg font-medium text-gray-700">
                      Additional Jumpers Allowed
                    </label>
                  </div>
                </div>
              </div>

              {/* Availability Days - Multi Select */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Availability Days *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                  {DAYS_OPTIONS.map(day => (
                    <label key={day} className="relative flex items-start p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          value={day}
                          checked={formData.availability_days?.includes(day) || false}
                          onChange={handleAvailabilityDaysChange}
                          className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <span className="font-medium text-gray-900 text-base">{day}</span>
                      </div>
                    </label>
                  ))}
                </div>
                {fieldErrors.availability_days && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.availability_days}</p>
                )}
              </div>

              {/* Schedule With - Dynamic Multi Select */}
              <div className="md:col-span-3">
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

              {/* UPDATED: Conditional fields for additional jump prices - only show if additional jumpers are allowed */}
              {formData.Is_additional_jumpers_allowed && (
                <>
                  <div className='md:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Jump Hour After Room Price ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="each_additional_jump_hour_after_room_time"
                        value={formData.each_additional_jump_hour_after_room_time}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className='md:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Jump Half Hour After Room Price ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="each_additional_jump_half_hour_after_room_time"
                        value={formData.each_additional_jump_half_hour_after_room_time}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="mt-1 block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Food & Drinks */}
              <div className="md:col-span-">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food & Drinks
                </label>
                <textarea
                  name="food_and_drinks"
                  value={formData.food_and_drinks}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Describe food and drinks included..."
                />
              </div>

              {/* Paper Goods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Goods
                </label>
                <textarea
                  type="text"
                  name="paper_goods"
                  value={formData.paper_goods}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Paper goods included"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outside Food/Drinks Fee
                </label>
                <textarea
                  type="text"
                  name="outside_food_drinks_fee"
                  value={formData.outside_food_drinks_fee}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Fee for outside food/drinks"
                />
              </div>

              {/* Dessert Policy */}
              <div className="md:col-span-">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dessert Policy
                </label>
                <textarea
                  name="dessert_policy"
                  value={formData.dessert_policy}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Dessert policy details..."
                />
              </div>

              {/* Other Perks */}
              <div className="md:col-span-">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Perks
                </label>
                <textarea
                  name="other_perks"
                  value={formData.other_perks}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Other perks and benefits..."
                />
              </div>

              {/* Birthday Party Pitch */}
              <div className="md:col-span-">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birthday Party Pitch (Optional)
                </label>
                <textarea
                  name="birthday_party_pitch"
                  value={formData.birthday_party_pitch}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Marketing pitch for this package..."
                />
              </div>

              {/* Additional Instructions */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  name="additional_instructions"
                  value={formData.additional_instructions}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Any additional instructions..."
                />
              </div>

              {/* Roller IDs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roller Search ID
                </label>
                <input
                  type="text"
                  name="roller_birthday_party_search_id"
                  value={formData.roller_birthday_party_search_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Roller search ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roller Booking ID
                </label>
                <input
                  type="text"
                  name="roller_birthday_party_booking_id"
                  value={formData.roller_birthday_party_booking_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="Roller booking ID"
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

export default BirthDayPackagesComp;

