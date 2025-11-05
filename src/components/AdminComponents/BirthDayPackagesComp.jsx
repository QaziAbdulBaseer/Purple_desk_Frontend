
// assocate_balloon_packages ,  




// BirthdayPackagesUpdate.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

const BirthdayPackagesUpdate = () => {
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

  // State for dynamic schedule options and hours of operation data
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [hoursOfOperationData, setHoursOfOperationData] = useState([]);
  const [hasSchedules, setHasSchedules] = useState(true);

  // State for expanded packages (collapsible functionality)
  const [expandedPackages, setExpandedPackages] = useState({});

  // Form data state initialization with ALL fields from database
  const [formData, setFormData] = useState({
    package_name: '',
    birthday_party_priority: '',
    birthday_party_pitch: '',
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
    tax_included: 'False',
    birthday_party_booking_lead_allowed_days: '',
    birthday_party_reschedule_allowed_days: '',
    birthday_party_discount_code: '',
    birthday_party_discount_percentage: '',
    roller_birthday_party_search_id: '',
    each_additional_jumper_price: '',
    roller_additional_jumper_price_search_id: '',
    roller_birthday_party_booking_id: '',
    each_additional_jump_hour_after_room_time: '',
    each_additional_jump_half_hour_after_room_time: '',
    additional_instructions: '',
    is_available: true,
    Is_additional_jumpers_allowed: true
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

  // Priority options including 999 for "Do not Pitch" - ALWAYS AVAILABLE
  const PRIORITY_OPTIONS = [1, 2, 3, 4, 5, 6, 999];

  // Function to get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken') || userData?.token;
  };

  // Toggle package expansion
  const togglePackageExpansion = (packageId) => {
    setExpandedPackages(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  // Collapse all packages
  const collapseAllPackages = () => {
    setExpandedPackages({});
  };

  // Expand all packages
  const expandAllPackages = () => {
    const allExpanded = {};
    birthdayPackages.forEach(pkg => {
      allExpanded[pkg.birthday_party_packages_id] = true;
    });
    setExpandedPackages(allExpanded);
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

  // Function to fetch hours of operation data
  const fetchHoursOfOperation = async () => {
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
        setHoursOfOperationData(data);

        // Extract unique schedule_with values from hours of operation
        const uniqueSchedules = [...new Set(data.map(hour => hour.schedule_with))]
          .filter(schedule => schedule && schedule !== 'closed');

        setAvailableSchedules(uniqueSchedules);
        setHasSchedules(uniqueSchedules.length > 0);

        return data;
      } else {
        setHasSchedules(false);
        return [];
      }
    } catch (err) {
      console.error('Failed to fetch hours of operation:', err);
      setHasSchedules(false);
      return [];
    }
  };

  // Function to calculate availability days based on selected schedule_with
  const calculateAvailabilityDays = (selectedSchedules) => {
    if (!selectedSchedules || selectedSchedules.length === 0) {
      return [];
    }

    const allDays = new Set();

    selectedSchedules.forEach(schedule => {
      // Find all hours of operation entries for this schedule
      const scheduleEntries = hoursOfOperationData.filter(entry =>
        entry.schedule_with === schedule && entry.hours_type === 'regular'
      );

      scheduleEntries.forEach(entry => {
        const startDay = entry.starting_day_name;
        const endDay = entry.ending_day_name;

        if (startDay && endDay) {
          // Handle day range (e.g., Monday to Thursday)
          const startIndex = DAYS_OPTIONS.indexOf(startDay);
          const endIndex = DAYS_OPTIONS.indexOf(endDay);

          if (startIndex !== -1 && endIndex !== -1) {
            for (let i = startIndex; i <= endIndex; i++) {
              allDays.add(DAYS_OPTIONS[i]);
            }
          }
        } else if (startDay) {
          // Handle single day (ending_day_name is null)
          allDays.add(startDay);
        }
      });
    });

    return Array.from(allDays).sort((a, b) =>
      DAYS_OPTIONS.indexOf(a) - DAYS_OPTIONS.indexOf(b)
    );
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
      console.log("Fetched birthday packages:", data);
      setBirthdayPackages(data);

      // Collapse all packages by default when data loads
      collapseAllPackages();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes for all field types
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Special handling for boolean fields
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

    // Clear field errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle multi-select changes for schedule with - with dynamic availability days calculation
  const handleScheduleWithChange = (e) => {
    const { value, checked } = e.target;

    setFormData(prev => {
      const currentSelection = Array.isArray(prev.schedule_with) ? prev.schedule_with : [];

      let newSelection;
      if (checked) {
        newSelection = [...currentSelection, value];
      } else {
        newSelection = currentSelection.filter(item => item !== value);
      }

      // Calculate availability days based on the new schedule selection
      const calculatedDays = calculateAvailabilityDays(newSelection);

      // When schedules change, we need to update availability days
      // But preserve any manually removed days if they still exist in the new calculation
      let newAvailabilityDays;

      if (checked) {
        // When adding a new schedule, merge existing selected days with newly calculated days
        // This allows users to keep their manual selections while adding new available days
        const mergedDays = [...new Set([...prev.availability_days, ...calculatedDays])];
        newAvailabilityDays = mergedDays.filter(day => calculatedDays.includes(day));
      } else {
        // When removing a schedule, only keep days that are still in the new calculation
        newAvailabilityDays = prev.availability_days.filter(day => calculatedDays.includes(day));
      }

      return {
        ...prev,
        schedule_with: newSelection,
        availability_days: newAvailabilityDays.sort((a, b) =>
          DAYS_OPTIONS.indexOf(a) - DAYS_OPTIONS.indexOf(b)
        )
      };
    });

    if (fieldErrors.schedule_with) {
      setFieldErrors(prev => ({
        ...prev,
        schedule_with: ''
      }));
    }
  };

  // Handle availability days selection/deselection
  const handleAvailabilityDaysChange = (e) => {
    const { value, checked } = e.target;

    setFormData(prev => {
      const currentSelection = Array.isArray(prev.availability_days) ? prev.availability_days : [];
      const calculatedDays = calculateAvailabilityDays(prev.schedule_with);

      let newSelection;
      if (checked) {
        // Only allow adding days that are in the calculated availability
        if (calculatedDays.includes(value)) {
          newSelection = [...currentSelection, value];
        } else {
          // If trying to add a day not in calculated days, don't change selection
          newSelection = currentSelection;
        }
      } else {
        // Allow removing any day
        newSelection = currentSelection.filter(item => item !== value);
      }

      return {
        ...prev,
        availability_days: newSelection.sort((a, b) =>
          DAYS_OPTIONS.indexOf(a) - DAYS_OPTIONS.indexOf(b)
        )
      };
    });

    if (fieldErrors.availability_days) {
      setFieldErrors(prev => ({
        ...prev,
        availability_days: ''
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
      birthday_party_pitch: '',
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
      tax_included: 'False',
      birthday_party_booking_lead_allowed_days: '',
      birthday_party_reschedule_allowed_days: '',
      birthday_party_discount_code: '',
      birthday_party_discount_percentage: '',
      roller_birthday_party_search_id: '',
      each_additional_jumper_price: '',
      roller_additional_jumper_price_search_id: '',
      roller_birthday_party_booking_id: '',
      each_additional_jump_hour_after_room_time: '',
      each_additional_jump_half_hour_after_room_time: '',
      additional_instructions: '',
      is_available: true,
      Is_additional_jumpers_allowed: true
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

    if (formData.birthday_party_discount_percentage && (formData.birthday_party_discount_percentage < 0 || formData.birthday_party_discount_percentage > 100)) {
      errors.birthday_party_discount_percentage = 'Discount percentage must be between 0 and 100';
    }

    return errors;
  };

  // Get available priorities for dropdown (exclude already used ones, but ALWAYS include 999 - "Do not Pitch")
  const getAvailablePriorities = () => {
    const usedPriorities = birthdayPackages
      .filter(pkg => !editingPackage || pkg.birthday_party_packages_id !== editingPackage.birthday_party_packages_id)
      .map(pkg => pkg.birthday_party_priority);

    // Always include 999 ("Do not Pitch") even if it's used
    const availablePriorities = PRIORITY_OPTIONS.filter(priority =>
      priority === 999 || !usedPriorities.includes(priority)
    );

    return availablePriorities;
  };

  // Helper function to check if tax is included
  const isTaxIncluded = (taxValue) => {
    if (taxValue === true || taxValue === 'True' || taxValue === 'true' || taxValue === '10.00' || taxValue === 1 || taxValue === '1') {
      return true;
    }
    return false;
  };

  // Handle form submission for both create and update
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
      console.log("this is the form data -= ", formData);

      // Prepare data for submission
      const submitData = {
        ...formData,
        availability_days: formData.availability_days.join(', '),
        schedule_with: formData.schedule_with.join(', '),
        // Handle tax_included - convert to boolean based on string value
        tax_included: formData.tax_included === 'True',
        // Clear additional jump time fields if additional jumpers are not allowed
        ...(!formData.Is_additional_jumpers_allowed && {
          each_additional_jump_hour_after_room_time: '',
          each_additional_jump_half_hour_after_room_time: ''
        }),
        // Ensure numeric fields are properly formatted
        price: parseFloat(formData.price).toFixed(2),
        each_additional_jumper_price: parseFloat(formData.each_additional_jumper_price).toFixed(2),
        birthday_party_discount_percentage: formData.birthday_party_discount_percentage ? parseFloat(formData.birthday_party_discount_percentage) : null
      };

      console.log('Submitting data:', submitData);

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

  // Handle edit package - populate form with ALL existing data
  const handleEdit = (pkg) => {
    console.log('Editing package:', pkg);

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

    // Handle tax_included conversion - convert string/boolean to the correct form value
    let taxIncludedValue = 'False'; // Default to "Not Included"
    if (isTaxIncluded(pkg.tax_included)) {
      taxIncludedValue = 'True';
    } else {
      taxIncludedValue = 'False';
    }

    // Populate ALL fields from the database
    setFormData({
      package_name: pkg.package_name || '',
      birthday_party_priority: pkg.birthday_party_priority || '',
      birthday_party_pitch: pkg.birthday_party_pitch || '',
      availability_days: availabilityDaysArray,
      schedule_with: scheduleWithArray,
      minimum_jumpers: pkg.minimum_jumpers || '',
      jump_time: pkg.jump_time || '',
      party_room_time: pkg.party_room_time || '',
      food_and_drinks: pkg.food_and_drinks || '',
      paper_goods: pkg.paper_goods || '',
      skysocks: isSkySocksCustom ? pkg.skysocks : (pkg.skysocks || 'SkySocks Not Included'),
      dessert_policy: pkg.dessert_policy || '',
      other_perks: pkg.other_perks || '',
      outside_food_drinks_fee: pkg.outside_food_drinks_fee || '',
      price: pkg.price || '',
      guest_of_honour_included_in_total_jumpers: pkg.guest_of_honour_included_in_total_jumpers || false,
      tax_included: taxIncludedValue,
      birthday_party_booking_lead_allowed_days: pkg.birthday_party_booking_lead_allowed_days || '',
      birthday_party_reschedule_allowed_days: pkg.birthday_party_reschedule_allowed_days || '',
      birthday_party_discount_code: pkg.birthday_party_discount_code || '',
      birthday_party_discount_percentage: pkg.birthday_party_discount_percentage || '',
      roller_birthday_party_search_id: pkg.roller_birthday_party_search_id || '',
      each_additional_jumper_price: pkg.each_additional_jumper_price || '',
      roller_additional_jumper_price_search_id: pkg.roller_additional_jumper_price_search_id || '',
      roller_birthday_party_booking_id: pkg.roller_birthday_party_booking_id || '',
      each_additional_jump_hour_after_room_time: pkg.each_additional_jump_hour_after_room_time || '',
      each_additional_jump_half_hour_after_room_time: pkg.each_additional_jump_half_hour_after_room_time || '',
      additional_instructions: pkg.additional_instructions || '',
      is_available: pkg.is_available !== undefined ? pkg.is_available : true,
      Is_additional_jumpers_allowed: pkg.Is_additional_jumpers_allowed !== undefined ? pkg.Is_additional_jumpers_allowed : true
    });

    setEditingPackage(pkg);
    setIsFormOpen(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  // Handle delete package with confirmation
  const handleDelete = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this birthday package? This action cannot be undone.')) {
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
      const updatedPackage = {
        ...pkg,
        is_available: !pkg.is_available,
        // Include all required fields for the update
        availability_days: Array.isArray(pkg.availability_days) ? pkg.availability_days.join(', ') : pkg.availability_days,
        schedule_with: Array.isArray(pkg.schedule_with) ? pkg.schedule_with.join(', ') : pkg.schedule_with
      };

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

  // Function to navigate to hours of operation page
  const navigateToHoursOfOperation = () => {
    navigate(`/hours-of-operation/${location_id}`);
  };

  // Fetch data when component mounts or location_id changes
  useEffect(() => {
    if (location_id) {
      fetchLocation();
      fetchBirthdayPackages();
      fetchHoursOfOperation();
    }
  }, [location_id]);

  // Render error state when no schedules are available
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
        <div className="flex space-x-2">
          {birthdayPackages.length > 0 && (
            <>
              <button
                onClick={expandAllPackages}
                className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <span>Expand All</span>
              </button>
              <button
                onClick={collapseAllPackages}
                className="bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <span>Collapse All</span>
              </button>
            </>
          )}
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
              const finalPrice = parseFloat(pkg.price || 0).toFixed(2);
              const additionalJumperPrice = parseFloat(pkg.each_additional_jumper_price || 0).toFixed(2);
              const taxIncluded = isTaxIncluded(pkg.tax_included);
              const additionalJumpHourPrice = pkg.each_additional_jump_hour_after_room_time ?
                parseFloat(pkg.each_additional_jump_hour_after_room_time).toFixed(2) : null;
              const additionalJumpHalfHourPrice = pkg.each_additional_jump_half_hour_after_room_time ?
                parseFloat(pkg.each_additional_jump_half_hour_after_room_time).toFixed(2) : null;
              const isExpanded = expandedPackages[pkg.birthday_party_packages_id];

              return (
                <div key={pkg.birthday_party_packages_id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  {/* Summary Section - Always Visible */}
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-4 flex-1">
                        <button
                          onClick={() => togglePackageExpansion(pkg.birthday_party_packages_id)}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors mt-1"
                        >
                          <svg
                            className={`w-5 h-5 text-gray-500 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
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
                                    Tax Included: Yes
                                  </span>
                                )}
                                {!taxIncluded && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Tax Included: No
                                  </span>
                                )}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.Is_additional_jumpers_allowed ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                  Additional Jumpers: {pkg.Is_additional_jumpers_allowed ? 'Allowed' : 'Not Allowed'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Summary Info */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                            <div>
                              <span className="text-gray-600 text-xs">Base Price:</span>
                              <p className="font-semibold text-lg">${finalPrice}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 text-xs">Additional Jumper:</span>
                              <p className="font-semibold text-lg">${additionalJumperPrice}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 text-xs">Jump Time:</span>
                              <p className="font-medium">{pkg.jump_time}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 text-xs">Minimum Jumpers:</span>
                              <p className="font-medium">{pkg.minimum_jumpers}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 ml-4">
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
                  </div>

                  {/* Expandable Details Section */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
                      <div className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Jump Time:</span>
                            <p className="font-medium">{pkg.jump_time}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Party Room Time:</span>
                            <p className="font-medium">{pkg.party_room_time}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Minimum Jumpers:</span>
                            <p className="font-medium">{pkg.minimum_jumpers}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Base Price:</span>
                            <p className="font-medium text-lg">${finalPrice}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Additional Jumper:</span>
                            <p className="font-medium text-lg">${additionalJumperPrice}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Guest of Honour Included:</span>
                            <p className="font-medium">{pkg.guest_of_honour_included_in_total_jumpers ? 'Yes' : 'No'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Booking Lead Days:</span>
                            <p className="font-medium">{pkg.birthday_party_booking_lead_allowed_days} days</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Reschedule Days:</span>
                            <p className="font-medium">{pkg.birthday_party_reschedule_allowed_days} days</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Tax Included:</span>
                            <p className="font-medium">{taxIncluded ? 'Yes' : 'No'}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Discount Code:</span>
                            <p className="font-medium">{pkg.birthday_party_discount_code || 'None'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Discount Percentage:</span>
                            <p className="font-medium">{pkg.birthday_party_discount_percentage || 'None'} %</p>
                          </div>
                        </div>


                        {/* Additional Jump Time Prices */}
                        {pkg.Is_additional_jumpers_allowed && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {additionalJumpHourPrice && (
                              <div>
                                <span className="text-gray-600">Additional Jump Hour Price:</span>
                                <p className="font-medium text-lg">${additionalJumpHourPrice}</p>
                              </div>
                            )}
                            {additionalJumpHalfHourPrice && (
                              <div>
                                <span className="text-gray-600">Additional Jump Half Hour Price:</span>
                                <p className="font-medium text-lg">${additionalJumpHalfHourPrice}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Pitch */}


                        {/* Additional Details */}
                        {(pkg.food_and_drinks || pkg.paper_goods || pkg.dessert_policy || pkg.other_perks || pkg.outside_food_drinks_fee) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {pkg.food_and_drinks && (
                              <div>
                                <span className="text-gray-600">Food & Drinks:</span>
                                <p className="font-medium">{pkg.food_and_drinks}</p>
                              </div>
                            )}
                            {pkg.paper_goods && (
                              <div>
                                <span className="text-gray-600">Paper Goods:</span>
                                <p className="font-medium">{pkg.paper_goods}</p>
                              </div>
                            )}
                            {pkg.dessert_policy && (
                              <div>
                                <span className="text-gray-600">Dessert Policy:</span>
                                <p className="font-medium">{pkg.dessert_policy}</p>
                              </div>
                            )}
                            {pkg.other_perks && (
                              <div>
                                <span className="text-gray-600">Other Perks:</span>
                                <p className="font-medium">{pkg.other_perks}</p>
                              </div>
                            )}
                            {pkg.outside_food_drinks_fee && (
                              <div>
                                <span className="text-gray-600">Outside Food/Drinks Fee:</span>
                                <p className="font-medium">{pkg.outside_food_drinks_fee}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Additional Information */}
                        {(pkg.additional_instructions || pkg.roller_birthday_party_search_id || pkg.roller_birthday_party_booking_id) && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            {pkg.additional_instructions && (
                              <div className="md:col-span-3">
                                <span className="text-gray-600">Additional Instructions:</span>
                                <p className="font-medium">{pkg.additional_instructions}</p>
                              </div>
                            )}
                            {pkg.roller_birthday_party_search_id && (
                              <div>
                                <span className="text-gray-600">Roller Search ID:</span>
                                <p className="font-medium">{pkg.roller_birthday_party_search_id}</p>
                              </div>
                            )}
                            {pkg.roller_birthday_party_booking_id && (
                              <div>
                                <span className="text-gray-600">Roller Booking ID:</span>
                                <p className="font-medium">{pkg.roller_birthday_party_booking_id}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {pkg.birthday_party_pitch && (
                        <div className="p-3 bg-white rounded-md border mt-4 border-gray-200">
                          <span className="text-gray-600 block mb-1">Pitch:</span>
                          <p className="font-medium">{pkg.birthday_party_pitch}</p>
                        </div>
                      )}

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
                  className={`w-full rounded-md border ${fieldErrors.package_name ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Enter package name"
                />
                {fieldErrors.package_name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.package_name}</p>
                )}
              </div>

              {/* Priority - ALWAYS include "Do not Pitch" (999) option */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  name="birthday_party_priority"
                  value={formData.birthday_party_priority}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border ${fieldErrors.birthday_party_priority ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  className={`w-full rounded-md border ${fieldErrors.minimum_jumpers ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  className={`w-full rounded-md border ${fieldErrors.jump_time ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  className={`w-full rounded-md border ${fieldErrors.party_room_time ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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

              {/* Base Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Price *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full pl-7 rounded-md border ${fieldErrors.price ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="each_additional_jumper_price"
                    value={formData.each_additional_jumper_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full pl-7 rounded-md border ${fieldErrors.each_additional_jumper_price ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  className={`w-full rounded-md border ${fieldErrors.birthday_party_booking_lead_allowed_days ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                  className={`w-full rounded-md border ${fieldErrors.birthday_party_reschedule_allowed_days ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Days before event"
                />
                {fieldErrors.birthday_party_reschedule_allowed_days && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.birthday_party_reschedule_allowed_days}</p>
                )}
              </div>

              {/* Tax Included */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Included
                </label>
                <select
                  name="tax_included"
                  value={formData.tax_included}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="False">No</option>
                  <option value="True">Yes</option>
                </select>
              </div>

              {/* Four Big Checkboxes */}
              <div className="md:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="guest_of_honour_included_in_total_jumpers"
                      checked={formData.guest_of_honour_included_in_total_jumpers}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="block text-sm font-medium text-gray-700">
                      Guest of Honour Included
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={formData.is_available}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="block text-sm font-medium text-gray-700">
                      Package Available
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="Is_additional_jumpers_allowed"
                      checked={formData.Is_additional_jumpers_allowed}
                      onChange={handleInputChange}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Jumpers Allowed
                    </label>
                  </div>
                </div>
              </div>

              {/* Additional Jump Time Prices - Conditionally Rendered */}
              {formData.Is_additional_jumpers_allowed && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Jump Hour Price ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        name="each_additional_jump_hour_after_room_time"
                        value={formData.each_additional_jump_hour_after_room_time}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-7 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Jump Half Hour Price ($)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        name="each_additional_jump_half_hour_after_room_time"
                        value={formData.each_additional_jump_half_hour_after_room_time}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-7 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* SkySocks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SkySocks
                </label>
                {!isCustomSkySocks ? (
                  <select
                    value={formData.skysocks}
                    onChange={(e) => handleSkySocksSelect(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      Back
                    </button>
                  </div>
                )}
              </div>

              {/* Discount Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Code
                </label>
                <input
                  type="text"
                  name="birthday_party_discount_code"
                  value={formData.birthday_party_discount_code}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Discount code"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">%</span>
                  </div>
                  <input
                    type="number"
                    name="birthday_party_discount_percentage"
                    value={formData.birthday_party_discount_percentage}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full pl-7 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                {fieldErrors.birthday_party_discount_percentage && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.birthday_party_discount_percentage}</p>
                )}
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Roller booking ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Roller Additional Jumper Search ID
                </label>
                <input
                  type="text"
                  name="roller_additional_jumper_price_search_id"
                  value={formData.roller_additional_jumper_price_search_id}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Roller additional jumper search ID"
                />
              </div>

              {/* Text Areas for Descriptions */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birthday Party Pitch (Optional)
                </label>
                <textarea
                  name="birthday_party_pitch"
                  value={formData.birthday_party_pitch}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Marketing pitch for this package..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food & Drinks
                </label>
                <textarea
                  name="food_and_drinks"
                  value={formData.food_and_drinks}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Food and drinks included..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paper Goods
                </label>
                <textarea
                  name="paper_goods"
                  value={formData.paper_goods}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Paper goods included..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dessert Policy
                </label>
                <textarea
                  name="dessert_policy"
                  value={formData.dessert_policy}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dessert policy details..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Perks
                </label>
                <textarea
                  name="other_perks"
                  value={formData.other_perks}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Other perks and benefits..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outside Food/Drinks Fee
                </label>
                <textarea
                  name="outside_food_drinks_fee"
                  value={formData.outside_food_drinks_fee}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Fee for outside food/drinks..."
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Instructions (Optional)
                </label>
                <textarea
                  name="additional_instructions"
                  value={formData.additional_instructions}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional instructions..."
                />
              </div>

              {/* Schedule With - Dynamic Multi Select - This controls base availability days */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Schedule With *
                  <span className="text-xs text-gray-500 ml-2">(Base availability days will be automatically calculated based on your selection)</span>
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
              </div>

              {/* Interactive Availability Days Selection - Users can manually remove days */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Availability Days *
                  <span className="text-xs text-gray-500 ml-2">(Based on selected schedules. You can manually remove days by unchecking them)</span>
                </label>

                {/* Display calculated base days info */}
                <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Available days from schedules:</strong> {calculateAvailabilityDays(formData.schedule_with).join(', ') || 'None'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    You can uncheck any days you don't want to include in this package.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                  {calculateAvailabilityDays(formData.schedule_with).map(day => (
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

                {formData.schedule_with.length > 0 && calculateAvailabilityDays(formData.schedule_with).length === 0 && (
                  <div className="mt-2 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                    <p className="text-sm text-yellow-700">
                      No availability days found for the selected schedules. Please check the hours of operation for these schedule types.
                    </p>
                  </div>
                )}

                {formData.schedule_with.length === 0 && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-500 italic">
                      Please select schedule types above to see available days.
                    </p>
                  </div>
                )}

                {/* Display current selection summary */}
                {formData.availability_days && formData.availability_days.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
                    <p className="text-sm text-green-700">
                      <strong>Selected days for this package:</strong> {formData.availability_days.join(', ')}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {formData.availability_days.length} day(s) selected
                    </p>
                  </div>
                )}

                {fieldErrors.availability_days && (
                  <p className="mt-2 text-sm text-red-600">{fieldErrors.availability_days}</p>
                )}
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

export default BirthdayPackagesUpdate;