



import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const BirthdayBalloonPackages = ({ birthdayPackage, location_id, onClose, onUpdate }) => {
  const userData = useSelector((state) => state.auth.userData);
  const [balloonPackages, setBalloonPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBalloon, setEditingBalloon] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [availablePriorities, setAvailablePriorities] = useState([]);

  const [formData, setFormData] = useState({
    package_name: '',
    call_flow_priority: '',
    promotional_pitch: '',
    package_inclusions: '',
    discount: '',
    price: '',
    note: ''
  });

  const getAuthToken = () => {
    return localStorage.getItem('accessToken') || userData?.token;
  };

  // Generate available priorities based on existing packages
  const generateAvailablePriorities = (packages, editingPackage = null) => {
    const basePriorities = [1, 2, 3, 4, 5, 6];
    const doNotPitchValue = 999;
    
    // Get all priorities currently in use (excluding the one being edited)
    const usedPriorities = packages
      .filter(pkg => !editingPackage || pkg.balloon_party_packages_id !== editingPackage.balloon_party_packages_id)
      .map(pkg => pkg.call_flow_priority)
      .filter(priority => priority !== null && priority !== undefined);
    
    // Filter base priorities to only show available ones
    const availableBasePriorities = basePriorities.filter(
      priority => !usedPriorities.includes(priority)
    );
    
    // ALWAYS include "Do not pitch" in available options - remove the condition
    const availableOptions = [...availableBasePriorities, doNotPitchValue];
    
    // Sort the options for better UX
    return availableOptions.sort((a, b) => {
      if (a === doNotPitchValue) return 1;
      if (b === doNotPitchValue) return -1;
      return a - b;
    });
  };

  // Enhanced fetch function with proper error handling
  const fetchBalloonPackages = async () => {
    if (!birthdayPackage || !location_id) return;

    setIsLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/${birthdayPackage.birthday_party_packages_id}/balloons/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || errorData?.error || `HTTP ${response.status}: Failed to fetch balloon packages`);
      }

      const data = await response.json();
      console.log("Fetched balloon packages data:", data);
      
      // FIX: Properly handle the API response structure
      // The API returns balloon_packages array directly, not balloon_packages_bridge
      const packages = data.balloon_packages || [];
      setBalloonPackages(packages);
      
      // Generate available priorities whenever packages are fetched
      setAvailablePriorities(generateAvailablePriorities(packages));
    } catch (err) {
      console.error('Error fetching balloon packages:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced reset form function
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
    setEditingBalloon(null);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  // Enhanced input change handler
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    let processedValue = value;
    
    if (type === 'number') {
      processedValue = value === '' ? '' : (name === 'price' ? parseFloat(value) : parseInt(value, 10));
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Clear field-specific errors when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Enhanced form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.package_name?.trim()) {
      errors.package_name = 'Package name is required';
    }

    if (!formData.call_flow_priority && formData.call_flow_priority !== 0) {
      errors.call_flow_priority = 'Call flow priority is required';
    } else if (formData.call_flow_priority < 0 || (formData.call_flow_priority > 1000 && formData.call_flow_priority !== 999)) {
      errors.call_flow_priority = 'Priority must be between 0 and 1000 or 999 for "Do not pitch"';
    }

    if (!formData.price && formData.price !== 0) {
      errors.price = 'Price is required';
    } else if (formData.price < 0) {
      errors.price = 'Price cannot be negative';
    }

    return errors;
  };

  // Enhanced form submission with better error handling
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
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      if (editingBalloon) {
        // FIX: Update existing balloon package with correct API endpoint
        const response = await fetch(
          `${import.meta.env.VITE_BackendApi}/balloon-packages/${location_id}/${editingBalloon.balloon_party_packages_id}/update/`,
          {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.detail || 
            responseData.error || 
            responseData.message || 
            `HTTP ${response.status}: Failed to update balloon package`
          );
        }

        setSuccess('Balloon package updated successfully!');
      } else {
        // Create new balloon package and associate with birthday package
        const createResponse = await fetch(
          `${import.meta.env.VITE_BackendApi}/balloon-packages/${location_id}/create/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
          }
        );

        const balloonData = await createResponse.json();

        if (!createResponse.ok) {
          throw new Error(
            balloonData.detail || 
            balloonData.error || 
            balloonData.message || 
            `HTTP ${createResponse.status}: Failed to create balloon package`
          );
        }

        // Associate with birthday package
        const associateResponse = await fetch(
          `${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/${birthdayPackage.birthday_party_packages_id}/balloons/add/`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              balloon_package_id: balloonData.balloon_party_packages_id || balloonData.id
            })
          }
        );

        if (!associateResponse.ok) {
          const errorData = await associateResponse.json().catch(() => null);
          throw new Error(
            errorData?.detail || 
            errorData?.error || 
            'Failed to associate balloon package with birthday package'
          );
        }

        setSuccess('Balloon package created and associated successfully!');
      }

      resetForm();
      setIsFormOpen(false);
      fetchBalloonPackages(); // Refresh the list
      
      // Auto-hide success message
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error submitting balloon package:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // FIXED: Enhanced edit handler with proper data structure
  const handleEdit = (balloonPackage) => {
    console.log("Editing balloon package:", balloonPackage);
    
    setFormData({
      package_name: balloonPackage.package_name || '',
      call_flow_priority: balloonPackage.call_flow_priority || '',
      promotional_pitch: balloonPackage.promotional_pitch || '',
      package_inclusions: balloonPackage.package_inclusions || '',
      discount: balloonPackage.discount || '',
      price: balloonPackage.price || '',
      note: balloonPackage.note || ''
    });
    
    setEditingBalloon(balloonPackage);
    
    // Generate available priorities including the current one being edited
    setAvailablePriorities(generateAvailablePriorities(balloonPackages, balloonPackage));
    
    setIsFormOpen(true);
    setError('');
    setSuccess('');
  };

  // FIXED: Enhanced delete handler with proper API calls
  const handleDelete = async (balloonPackage) => {
    if (!window.confirm(`Are you sure you want to delete the balloon package "${balloonPackage.package_name}"? This action cannot be undone.`)) {
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // First remove the association from birthday package
      const removeResponse = await fetch(
        `${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/${birthdayPackage.birthday_party_packages_id}/balloons/${balloonPackage.balloon_party_packages_id}/remove/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!removeResponse.ok) {
        const errorData = await removeResponse.json().catch(() => null);
        throw new Error(
          errorData?.detail || 
          errorData?.error || 
          'Failed to remove balloon package association'
        );
      }

      // Then delete the balloon package itself
      const deleteResponse = await fetch(
        `${import.meta.env.VITE_BackendApi}/balloon-packages/${location_id}/${balloonPackage.balloon_party_packages_id}/delete/`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json().catch(() => null);
        throw new Error(
          errorData?.detail || 
          errorData?.error || 
          'Failed to delete balloon package'
        );
      }

      setSuccess(`Balloon package "${balloonPackage.package_name}" deleted successfully!`);
      fetchBalloonPackages(); // Refresh the list
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error deleting balloon package:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced useEffect with dependency cleanup
  useEffect(() => {
    if (birthdayPackage && location_id) {
      fetchBalloonPackages();
    }
  }, [birthdayPackage, location_id]);

  // Early return if no birthday package
  if (!birthdayPackage) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Birthday Package Selected</h3>
            <p className="text-gray-600 mb-4">Please select a birthday package to manage balloon packages.</p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="flex justify-between items-start p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Balloon Packages Manager
              </h2>
            </div>
            <p className="text-gray-700">
              Managing balloon packages for: <span className="font-semibold text-blue-600">{birthdayPackage.package_name}</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Package ID: {birthdayPackage.birthday_party_packages_id}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Location: {location_id}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-2xl p-2 hover:bg-gray-100 rounded-lg"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Enhanced Messages Section */}
        {(error || success) && (
          <div className="px-6 pt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="flex-shrink-0 text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-medium">Success</p>
                  <p>{success}</p>
                </div>
                <button
                  onClick={() => setSuccess('')}
                  className="flex-shrink-0 text-green-500 hover:text-green-700"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {/* Balloon Packages List */}
          {!isFormOpen && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Balloon Packages
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {balloonPackages.length} package{balloonPackages.length !== 1 ? 's' : ''} available
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={fetchBalloonPackages}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setIsFormOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Balloon Package</span>
                  </button>
                </div>
              </div>

              {isLoading && balloonPackages.length === 0 ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : balloonPackages.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                  <div className="text-gray-400 text-7xl mb-6">🎈</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">No Balloon Packages Found</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Enhance your birthday package by adding balloon packages. They'll make the celebration even more special!
                  </p>
                  <button
                    onClick={() => setIsFormOpen(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
                  >
                    Create Your First Balloon Package
                  </button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {balloonPackages.map((balloonPackage) => (
                    <div 
                      key={balloonPackage.balloon_party_packages_id} 
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-200"
                    >
                      <div className="flex flex-col h-full">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 truncate">
                              {balloonPackage.package_name}
                            </h4>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                balloonPackage.call_flow_priority === 999 
                                  ? 'bg-gray-100 text-gray-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                Priority: {balloonPackage.call_flow_priority === 999 ? 'Do Not Pitch' : balloonPackage.call_flow_priority}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ${parseFloat(balloonPackage.price || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-3 flex-1">
                          {balloonPackage.promotional_pitch && (
                            <div>
                              <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Promotional Pitch</span>
                              <p className="text-sm text-gray-800 mt-1 line-clamp-2">{balloonPackage.promotional_pitch}</p>
                            </div>
                          )}

                          {balloonPackage.package_inclusions && (
                            <div>
                              <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Inclusions</span>
                              <p className="text-sm text-gray-800 mt-1 line-clamp-3">{balloonPackage.package_inclusions}</p>
                            </div>
                          )}

                          {balloonPackage.discount && (
                            <div>
                              <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Discount</span>
                              <p className="text-sm text-gray-800 mt-1">{balloonPackage.discount}</p>
                            </div>
                          )}

                          {balloonPackage.note && (
                            <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <span className="text-gray-600 text-xs font-medium uppercase tracking-wide">Note</span>
                              <p className="text-sm text-gray-800 mt-1">{balloonPackage.note}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-200">
                          <div className="text-xs text-gray-500">
                            ID: {balloonPackage.balloon_party_packages_id}
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(balloonPackage)}
                              className="text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-md border border-blue-200 hover:border-blue-300 transition-colors text-sm font-medium flex items-center space-x-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete(balloonPackage)}
                              disabled={isLoading}
                              className="text-red-600 hover:text-red-800 px-3 py-1.5 rounded-md border border-red-200 hover:border-red-300 transition-colors text-sm font-medium flex items-center space-x-1 disabled:opacity-50"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Enhanced Balloon Package Form */}
          {isFormOpen && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${editingBalloon ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                    {editingBalloon ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {editingBalloon ? 'Edit Balloon Package' : 'Create New Balloon Package'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {editingBalloon ? 'Update the balloon package details' : 'Add a new balloon package to enhance the birthday experience'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsFormOpen(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                  title="Close form"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Package Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Package Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="package_name"
                        value={formData.package_name}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border ${fieldErrors.package_name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} px-4 py-3 focus:outline-none focus:ring-2 transition-colors`}
                        placeholder="Enter a descriptive package name"
                      />
                      {fieldErrors.package_name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>{fieldErrors.package_name}</span>
                        </p>
                      )}
                    </div>

                    {/* Call Flow Priority - Updated to Select */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Call Flow Priority <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="call_flow_priority"
                        value={formData.call_flow_priority}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border ${fieldErrors.call_flow_priority ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} px-4 py-3 focus:outline-none focus:ring-2 transition-colors`}
                      >
                        <option value="">Select Priority</option>
                        {availablePriorities.map(priority => (
                          <option key={priority} value={priority}>
                            {priority === 999 ? 'Do Not Pitch' : `Priority ${priority}`}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.call_flow_priority && (
                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>{fieldErrors.call_flow_priority}</span>
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        "Do Not Pitch" is always available. Other priorities are only available if not already used.
                      </p>
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 font-medium">$</span>
                        </div>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          className={`w-full pl-8 rounded-lg border ${fieldErrors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'} px-4 py-3 focus:outline-none focus:ring-2 transition-colors`}
                          placeholder="0.00"
                        />
                      </div>
                      {fieldErrors.price && (
                        <p className="mt-2 text-sm text-red-600 flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>{fieldErrors.price}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Promotional Pitch */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Promotional Pitch
                      </label>
                      <textarea
                        name="promotional_pitch"
                        value={formData.promotional_pitch}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Catchy marketing description to attract customers..."
                      />
                    </div>

                    {/* Package Inclusions */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Package Inclusions
                      </label>
                      <textarea
                        name="package_inclusions"
                        value={formData.package_inclusions}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="List all items, services, and features included in this package..."
                      />
                    </div>
                  </div>
                </div>

                {/* Full Width Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Discount Information
                    </label>
                    <textarea
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Special discounts, promo codes, or seasonal offers..."
                    />
                  </div>

                  {/* Note */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Internal Notes
                    </label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      placeholder="Internal notes or special instructions for staff..."
                    />
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Fields marked with <span className="text-red-500">*</span> are required
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        resetForm();
                      }}
                      className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>
                            {editingBalloon ? 'Updating...' : 'Creating...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingBalloon ? "M5 13l4 4L19 7" : "M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3m-7 1L21 3m-3 3l3-3"} />
                          </svg>
                          <span>
                            {editingBalloon ? 'Update Package' : 'Create Package'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BirthdayBalloonPackages;