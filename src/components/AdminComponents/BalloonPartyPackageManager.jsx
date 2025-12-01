


import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';

const BalloonPartyPackageManager = () => {
  const { location_id } = useParams();
  const userData = useSelector((state) => state.auth.userData);
  const [balloonPackages, setBalloonPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Form data state
  const [formData, setFormData] = useState({
    package_name: '',
    call_flow_priority: '',
    promotional_pitch: '',
    package_inclusions: '',
    discount: '',
    price: '',
    note: ''
  });

  // Priority options
  const PRIORITY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('accessToken') || userData?.token;
  };

  // Fetch all balloon packages for the location
  const fetchBalloonPackages = async () => {
    if (!location_id) return;

    setIsLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/balloon-packages/${location_id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balloon packages');
      }

      const data = await response.json();
      setBalloonPackages(data);
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

  // Reset form
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
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.package_name.trim()) {
      errors.package_name = 'Package name is required';
    }
    
    if (!formData.call_flow_priority) {
      errors.call_flow_priority = 'Call flow priority is required';
    }
    
    if (!formData.price || formData.price < 0) {
      errors.price = 'Valid price is required';
    }
    
    return errors;
  };

  // Get available priorities
  const getAvailablePriorities = () => {
    const usedPriorities = balloonPackages
      .filter(pkg => !editingPackage || pkg.balloon_party_packages_id !== editingPackage.balloon_party_packages_id)
      .map(pkg => pkg.call_flow_priority);

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
        ? `${import.meta.env.VITE_BackendApi}/balloon-packages/${location_id}/${editingPackage.balloon_party_packages_id}/update/`
        : `${import.meta.env.VITE_BackendApi}/balloon-packages/${location_id}/create/`;

      const method = editingPackage ? 'PUT' : 'POST';

      const submitData = {
        ...formData,
        location: location_id,
        price: parseFloat(formData.price).toFixed(2)
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
          setFieldErrors(responseData);
          setError('Please fix the validation errors below');
        } else {
          throw new Error(responseData.error || responseData.detail || 'Failed to save balloon package');
        }
        return;
      }

      if (editingPackage) {
        setBalloonPackages(prev => prev.map(pkg =>
          pkg.balloon_party_packages_id === responseData.balloon_party_packages_id ? responseData : pkg
        ));
        setSuccess('Balloon package updated successfully!');
      } else {
        setBalloonPackages(prev => [...prev, responseData]);
        setSuccess('Balloon package created successfully!');
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

  // Handle edit package
  const handleEdit = (pkg) => {
    setFormData({
      package_name: pkg.package_name || '',
      call_flow_priority: pkg.call_flow_priority || '',
      promotional_pitch: pkg.promotional_pitch || '',
      package_inclusions: pkg.package_inclusions || '',
      discount: pkg.discount || '',
      price: pkg.price || '',
      note: pkg.note || ''
    });
    setEditingPackage(pkg);
    setIsFormOpen(true);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  // Handle delete package
  const handleDelete = async (packageId) => {
    if (!window.confirm('Are you sure you want to delete this balloon package? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/balloon-packages/${location_id}/${packageId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete balloon package');
      }

      setBalloonPackages(prev => prev.filter(pkg => pkg.balloon_party_packages_id !== packageId));
      setSuccess('Balloon package deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (location_id) {
      fetchBalloonPackages();
    }
  }, [location_id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Balloon Party Packages</h2>
          <p className="text-gray-600 mt-1">
            Manage balloon decoration packages for birthday parties
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Balloon Package</span>
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

      {/* Balloon Packages List */}
      {!isFormOpen && (
        <div className="space-y grid grid-cols- gap-5">
          {balloonPackages
            .sort((a, b) => a.call_flow_priority - b.call_flow_priority)
            .map((pkg) => (
              <div key={pkg.balloon_party_packages_id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{pkg.package_name}</h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Priority: {pkg.call_flow_priority}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Price: ${parseFloat(pkg.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Package Details */}
                    <div className="mt-4 space-y-3">
                      {pkg.promotional_pitch && (
                        <div>
                          <span className="text-gray-600 text-sm ">Promotional Pitch:</span>
                          <p className="font-medium">{pkg.promotional_pitch}</p>
                        </div>
                      )}
                      {pkg.package_inclusions && (
                        <div>
                          <span className="text-gray-600 text-sm">Inclusions:</span>
                          <p className="font-medium">{pkg.package_inclusions}</p>
                        </div>
                      )}
                      {pkg.discount && (
                        <div>
                          <span className="text-gray-600 text-sm">Discount:</span>
                          <p className="font-medium">{pkg.discount}</p>
                        </div>
                      )}
                      {pkg.note && (
                        <div>
                          <span className="text-gray-600 text-sm">Note:</span>
                          <p className="font-medium">{pkg.note}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.balloon_party_packages_id)}
                      className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-200 hover:border-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {!isFormOpen && balloonPackages.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎈</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Balloon Packages Configured</h3>
          <p className="text-gray-500 mb-4">Add balloon decoration packages for this location.</p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
          >
            Add Balloon Package
          </button>
        </div>
      )}

      {isLoading && !isFormOpen && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      )}

      {/* Balloon Package Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {editingPackage ? 'Edit Balloon Package' : 'Add New Balloon Package'}
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
              {/* Package Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  name="package_name"
                  value={formData.package_name}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border ${fieldErrors.package_name ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                  placeholder="Enter balloon package name"
                />
                {fieldErrors.package_name && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.package_name}</p>
                )}
              </div>

              {/* Call Flow Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Call Flow Priority *
                </label>
                <select
                  name="call_flow_priority"
                  value={formData.call_flow_priority}
                  onChange={handleInputChange}
                  className={`w-full rounded-md border ${fieldErrors.call_flow_priority ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  <option value="">Select Priority</option>
                  {getAvailablePriorities().map(priority => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
                {fieldErrors.call_flow_priority && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.call_flow_priority}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
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
                    className={`w-full pl-7 rounded-md border ${fieldErrors.price ? 'border-red-300' : 'border-gray-300'} px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    placeholder="0.00"
                  />
                </div>
                {fieldErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
                )}
              </div>

              {/* Promotional Pitch */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Promotional Pitch
                </label>
                <textarea
                  name="promotional_pitch"
                  value={formData.promotional_pitch}
                  onChange={handleTextareaChange}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Marketing pitch for this balloon package..."
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="What's included in this balloon package..."
                />
              </div>

              {/* Discount */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Information
                </label>
                <textarea
                  name="discount"
                  value={formData.discount}
                  onChange={handleTextareaChange}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Discount details..."
                />
              </div>

              {/* Note */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleTextareaChange}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Any additional notes..."
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
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

export default BalloonPartyPackageManager;