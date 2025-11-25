



import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const GroupBookingComp = () => {
  const { location_id } = useParams();
  const userData = useSelector((state) => state.auth.userData);
  
  // State declarations
  const [groupBookings, setGroupBookings] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingBooking, setEditingBooking] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    group_packages: '',
    call_flow_priority: '',
    flat_fee_jumper_price: '',
    minimum_jumpers: '',
    instruction: '',
    package_inclusions: ''
  });

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

  // Fetch group bookings for the current location
  const fetchGroupBookings = async () => {
    if (!location_id) return;

    setIsLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/group-bookings/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch group bookings');
      }

      const data = await response.json();
      console.log("Fetched group bookings:", data);
      setGroupBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));

    // Clear field errors when user starts typing
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
      group_packages: '',
      call_flow_priority: '',
      flat_fee_jumper_price: '',
      minimum_jumpers: '',
      instruction: '',
      package_inclusions: ''
    });
    setEditingBooking(null);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};
    const requiredFields = [
      'group_packages',
      'call_flow_priority',
      'flat_fee_jumper_price',
      'minimum_jumpers'
    ];

    requiredFields.forEach(field => {
      if (!formData[field] && formData[field] !== 0) {
        errors[field] = `${field.replace(/_/g, ' ')} is required`;
      }
    });

    if (formData.call_flow_priority && (formData.call_flow_priority < 1)) {
      errors.call_flow_priority = 'Call flow priority must be at least 1';
    }

    if (formData.flat_fee_jumper_price && formData.flat_fee_jumper_price < 0) {
      errors.flat_fee_jumper_price = 'Flat fee jumper price cannot be negative';
    }

    if (formData.minimum_jumpers && formData.minimum_jumpers < 1) {
      errors.minimum_jumpers = 'Minimum jumpers must be at least 1';
    }

    return errors;
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
      const url = editingBooking
        ? `${import.meta.env.VITE_BackendApi}/locations/${location_id}/group-bookings/${editingBooking.group_booking_id}/update/`
        : `${import.meta.env.VITE_BackendApi}/locations/${location_id}/group-bookings/create/`;

      const method = editingBooking ? 'PUT' : 'POST';

      // Prepare data for submission
      const submitData = {
        ...formData,
        // Ensure numeric fields are properly formatted
        flat_fee_jumper_price: parseFloat(formData.flat_fee_jumper_price).toFixed(2),
        call_flow_priority: parseInt(formData.call_flow_priority),
        minimum_jumpers: parseInt(formData.minimum_jumpers)
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
          throw new Error(responseData.error || responseData.detail || 'Failed to save group booking');
        }
        return;
      }

      const savedBooking = responseData;

      if (editingBooking) {
        setGroupBookings(prev => prev.map(booking =>
          booking.group_booking_id === savedBooking.group_booking_id ? savedBooking : booking
        ));
        setSuccess('Group booking updated successfully!');
      } else {
        setGroupBookings(prev => [...prev, savedBooking]);
        setSuccess('Group booking created successfully!');
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

  // Handle edit booking - populate form with existing data
  const handleEdit = (booking) => {
    console.log('Editing booking:', booking);

    setFormData({
      group_packages: booking.group_packages || '',
      call_flow_priority: booking.call_flow_priority || '',
      flat_fee_jumper_price: booking.flat_fee_jumper_price || '',
      minimum_jumpers: booking.minimum_jumpers || '',
      instruction: booking.instruction || '',
      package_inclusions: booking.package_inclusions || ''
    });

    setEditingBooking(booking);
    setIsFormOpen(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  // Handle delete booking with confirmation
  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this group booking? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/group-bookings/${bookingId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete group booking');
      }

      setGroupBookings(prev => prev.filter(booking => booking.group_booking_id !== bookingId));
      setSuccess('Group booking deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle bulk upload
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('csv_file', file);

      const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/group-bookings/bulk-create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to upload CSV file');
      }

      if (responseData.errors && responseData.errors.length > 0) {
        setError(`Upload completed with ${responseData.errors.length} errors. Created: ${responseData.created_count}`);
        console.log('Upload errors:', responseData.errors);
      } else {
        setSuccess(`Successfully created ${responseData.created_count} group bookings!`);
      }

      // Refresh the list
      fetchGroupBookings();
      
      // Clear file input
      e.target.value = '';
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
      fetchGroupBookings();
    }
  }, [location_id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Group Bookings</h2>
          {location && (
            <p className="text-gray-600 mt-1">
              Managing group bookings for: <span className="font-semibold">{location.location_name}</span>
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          {/* Bulk Upload */}
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleBulkUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              id="bulk-upload"
            />
            <label
              htmlFor="bulk-upload"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <span>📁</span>
              <span>Bulk Upload CSV</span>
            </label>
          </div>
          
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add New Booking</span>
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

      {/* Group Bookings List */}
      {!isFormOpen && location_id && (
        <div className="space-y-4">
          {groupBookings
            .sort((a, b) => a.call_flow_priority - b.call_flow_priority)
            .map((booking) => {
              const flatFeePrice = parseFloat(booking.flat_fee_jumper_price || 0).toFixed(2);

              return (
                <div key={booking.group_booking_id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{booking.group_packages}</h3>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Priority: {booking.call_flow_priority}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ${flatFeePrice} flat fee
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Min. {booking.minimum_jumpers} jumpers
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Summary Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                          {booking.instruction && (
                            <div>
                              <span className="text-gray-600 text-xs">Instructions:</span>
                              <p className="font-medium mt-1">{booking.instruction}</p>
                            </div>
                          )}
                          {booking.package_inclusions && (
                            <div>
                              <span className="text-gray-600 text-xs">Package Inclusions:</span>
                              <p className="font-medium mt-1">{booking.package_inclusions}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(booking)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(booking.group_booking_id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-200 hover:border-red-300 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {!isFormOpen && location_id && groupBookings.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Group Bookings Configured</h3>
          <p className="text-gray-500 mb-4">Add group bookings for this location to get started.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Group Booking
          </button>
        </div>
      )}

      {isLoading && !isFormOpen && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Group Booking Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingBooking ? 'Edit Group Booking' : 'Add New Group Booking'}
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
              {/* Group Packages */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Packages *
                </label>
                <input
                  type="text"
                  name="group_packages"
                  value={formData.group_packages}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border ${fieldErrors.group_packages ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="e.g., Small Groups 60 minutes group package"
                />
                {fieldErrors.group_packages && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.group_packages}</p>
                )}
              </div>

              {/* Call Flow Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Flow Priority *
                </label>
                <input
                  type="number"
                  name="call_flow_priority"
                  value={formData.call_flow_priority}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full rounded-md border ${fieldErrors.call_flow_priority ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Priority number"
                />
                {fieldErrors.call_flow_priority && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.call_flow_priority}</p>
                )}
              </div>

              {/* Flat Fee Jumper Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flat Fee Jumper Price ($) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    name="flat_fee_jumper_price"
                    value={formData.flat_fee_jumper_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className={`w-full pl-7 rounded-md border ${fieldErrors.flat_fee_jumper_price ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="0.00"
                  />
                </div>
                {fieldErrors.flat_fee_jumper_price && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.flat_fee_jumper_price}</p>
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
                  placeholder="Minimum jumpers required"
                />
                {fieldErrors.minimum_jumpers && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.minimum_jumpers}</p>
                )}
              </div>

              {/* Instruction */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instructions
                </label>
                <textarea
                  name="instruction"
                  value={formData.instruction}
                  onChange={handleTextareaChange}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Instructions for this group booking..."
                />
              </div>

              {/* Package Inclusions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Inclusions
                </label>
                <textarea
                  name="package_inclusions"
                  value={formData.package_inclusions}
                  onChange={handleTextareaChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's included in this package..."
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
                    ? (editingBooking ? 'Updating...' : 'Creating...')
                    : (editingBooking ? 'Update Booking' : 'Create Booking')
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

export default GroupBookingComp;