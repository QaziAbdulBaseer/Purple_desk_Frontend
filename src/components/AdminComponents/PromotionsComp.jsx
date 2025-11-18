



import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

const PromotionsComp = () => {
    const { location_id } = useParams();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const [promotions, setPromotions] = useState([]);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('table');
    
    const [showCustomEligibility, setShowCustomEligibility] = useState(false);
    const [customEligibility, setCustomEligibility] = useState('');
    const [showCustomCategory, setShowCustomCategory] = useState(false);
    const [customCategory, setCustomCategory] = useState('');
    const [showCustomSubCategory, setShowCustomSubCategory] = useState(false);
    const [customSubCategory, setCustomSubCategory] = useState('');
    const [showCustomScheduleType, setShowCustomScheduleType] = useState(false);
    const [customScheduleType, setCustomScheduleType] = useState('');

    const [formData, setFormData] = useState({
        start_date: '',
        end_date: '',
        start_day: '',
        end_day: '',
        start_time: '',
        end_time: '',
        schedule_type: 'always_active',
        promotion_code: '',
        title: '',
        details: '',
        category: '',
        sub_category: '',
        eligibility_type: 'birthday_party_purchase',
        constraint_value: '',
        instructions: '',
        is_active: true
    });

    const SCHEDULE_TYPES = [
        { value: 'recurring_weekday', label: 'Recurring Weekday' },
        { value: 'always_active', label: 'Always Active' },
        { value: 'specific_date', label: 'Specific Date' },
        { value: 'date_range', label: 'Date Range' },
        { value: 'custom', label: 'Custom' }
    ];

    const ELIGIBILITY_TYPES = [
        { value: 'birthday_party_purchase', label: 'Birthday Party Purchase' },
        { value: 'membership_required', label: 'Membership Required' },
        { value: 'glow_purchase', label: 'Glow Purchase' },
        { value: 'custom', label: 'Custom' }
    ];

    const CATEGORIES = [
        { value: 'birthday_party_package', label: 'Birthday Party Package' },
        { value: 'general', label: 'General' },
        { value: 'memberships', label: 'Memberships' },
        { value: 'jump_pass', label: 'Jump Pass' },
        { value: 'custom', label: 'Custom' }
    ];

    const SUB_CATEGORIES = [
        { value: 'all', label: 'All' },
        { value: 'glow', label: 'Glow' },
        { value: 'glow_birthday_package', label: 'Glow Birthday Package' },
        { value: 'epic_birthday_package', label: 'Epic Birthday Package' },
        { value: 'pizza', label: 'Pizza' },
        { value: 'custom', label: 'Custom' }
    ];

    const DAYS_OF_WEEK = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
        'Friday', 'Saturday', 'Sunday'
    ];

    const getAuthToken = () => {
        return localStorage.getItem('accessToken') || userData?.token;
    };

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

    const fetchPromotions = async () => {
        if (!location_id) return;

        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/promotions/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch promotions');
            }

            const data = await response.json();
            setPromotions(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : parseFloat(value)) : value)
        }));

        if (name === 'start_date' && value) {
            const date = new Date(value);
            const dayName = DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1];
            setFormData(prev => ({
                ...prev,
                start_day: prev.start_day || dayName
            }));
        }

        if (name === 'end_date' && value) {
            const date = new Date(value);
            const dayName = DAYS_OF_WEEK[date.getDay() === 0 ? 6 : date.getDay() - 1];
            setFormData(prev => ({
                ...prev,
                end_day: prev.end_day || dayName
            }));
        }

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleEligibilityChange = (e) => {
        const value = e.target.value;
        if (value === 'custom') {
            setShowCustomEligibility(true);
            setCustomEligibility('');
        } else {
            setShowCustomEligibility(false);
            setFormData(prev => ({
                ...prev,
                eligibility_type: value
            }));
        }
    };

    const handleCustomEligibilityCancel = () => {
        setShowCustomEligibility(false);
        setCustomEligibility('');
        setFormData(prev => ({
            ...prev,
            eligibility_type: 'birthday_party_purchase'
        }));
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'custom') {
            setShowCustomCategory(true);
            setCustomCategory('');
        } else {
            setShowCustomCategory(false);
            setFormData(prev => ({
                ...prev,
                category: value
            }));
        }
    };

    const handleCustomCategoryCancel = () => {
        setShowCustomCategory(false);
        setCustomCategory('');
        setFormData(prev => ({
            ...prev,
            category: 'birthday_party_package'
        }));
    };

    const handleSubCategoryChange = (e) => {
        const value = e.target.value;
        if (value === 'custom') {
            setShowCustomSubCategory(true);
            setCustomSubCategory('');
        } else {
            setShowCustomSubCategory(false);
            setFormData(prev => ({
                ...prev,
                sub_category: value
            }));
        }
    };

    const handleCustomSubCategoryCancel = () => {
        setShowCustomSubCategory(false);
        setCustomSubCategory('');
        setFormData(prev => ({
            ...prev,
            sub_category: 'all'
        }));
    };

    const handleScheduleTypeChange = (e) => {
        const value = e.target.value;
        if (value === 'custom') {
            setShowCustomScheduleType(true);
            setCustomScheduleType('');
        } else {
            setShowCustomScheduleType(false);
            setFormData(prev => ({
                ...prev,
                schedule_type: value
            }));
        }
    };

    const handleCustomScheduleTypeCancel = () => {
        setShowCustomScheduleType(false);
        setCustomScheduleType('');
        setFormData(prev => ({
            ...prev,
            schedule_type: 'always_active'
        }));
    };

    const resetForm = () => {
        setFormData({
            start_date: '',
            end_date: '',
            start_day: '',
            end_day: '',
            start_time: '',
            end_time: '',
            schedule_type: 'always_active',
            promotion_code: '',
            title: '',
            details: '',
            category: '',
            sub_category: '',
            eligibility_type: 'birthday_party_purchase',
            constraint_value: '',
            instructions: '',
            is_active: true
        });
        setEditingPromotion(null);
        setError('');
        setSuccess('');
        setFieldErrors({});
        setShowCustomEligibility(false);
        setCustomEligibility('');
        setShowCustomCategory(false);
        setCustomCategory('');
        setShowCustomSubCategory(false);
        setCustomSubCategory('');
        setShowCustomScheduleType(false);
        setCustomScheduleType('');
    };

    const validateForm = () => {
        const errors = {};
        const requiredFields = ['promotion_code', 'title', 'details', 'category'];

        requiredFields.forEach(field => {
            if (!formData[field]?.trim()) {
                errors[field] = `${field.replace(/_/g, ' ')} is required`;
            }
        });

        if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
            errors.end_date = 'End date must be after start date';
        }

        if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
            errors.end_time = 'End time must be after start time';
        }

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        await submitForm();
    };

    const submitForm = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAuthToken();
            const url = editingPromotion
                ? `${import.meta.env.VITE_BackendApi}/locations/${location_id}/promotions/${editingPromotion.promotion_id}/update/`
                : `${import.meta.env.VITE_BackendApi}/locations/${location_id}/promotions/create/`;

            const method = editingPromotion ? 'PUT' : 'POST';

            const submitData = {
                ...formData,
                promotion_code: formData.promotion_code.trim(),
                title: formData.title.trim(),
                details: formData.details.trim(),
                instructions: formData.instructions?.trim() || ''
            };

            Object.keys(submitData).forEach(key => {
                if (submitData[key] === '') {
                    submitData[key] = null;
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
                    throw new Error(responseData.error || responseData.detail || 'Failed to save promotion');
                }
                return;
            }

            const savedPromotion = responseData;

            if (editingPromotion) {
                setPromotions(prev => prev.map(promotion =>
                    promotion.promotion_id === savedPromotion.promotion_id ? savedPromotion : promotion
                ));
                setSuccess('Promotion updated successfully!');
            } else {
                setPromotions(prev => [...prev, savedPromotion]);
                setSuccess('Promotion created successfully!');
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

    const handleEdit = (promotion) => {
        const formDataUpdate = {
            start_date: promotion.start_date || '',
            end_date: promotion.end_date || '',
            start_day: promotion.start_day || '',
            end_day: promotion.end_day || '',
            start_time: promotion.start_time || '',
            end_time: promotion.end_time || '',
            schedule_type: promotion.schedule_type,
            promotion_code: promotion.promotion_code,
            title: promotion.title,
            details: promotion.details,
            category: promotion.category,
            sub_category: promotion.sub_category || '',
            eligibility_type: promotion.eligibility_type,
            constraint_value: promotion.constraint_value || '',
            instructions: promotion.instructions || '',
            is_active: promotion.is_active !== undefined ? promotion.is_active : true
        };

        setFormData(formDataUpdate);
        
        // Check if values are custom (not in predefined options)
        setShowCustomEligibility(!ELIGIBILITY_TYPES.some(opt => opt.value === promotion.eligibility_type));
        if (!ELIGIBILITY_TYPES.some(opt => opt.value === promotion.eligibility_type)) {
            setCustomEligibility(promotion.eligibility_type);
        }

        setShowCustomCategory(!CATEGORIES.some(opt => opt.value === promotion.category));
        if (!CATEGORIES.some(opt => opt.value === promotion.category)) {
            setCustomCategory(promotion.category);
        }

        setShowCustomSubCategory(!SUB_CATEGORIES.some(opt => opt.value === promotion.sub_category) && promotion.sub_category);
        if (!SUB_CATEGORIES.some(opt => opt.value === promotion.sub_category) && promotion.sub_category) {
            setCustomSubCategory(promotion.sub_category);
        }

        setShowCustomScheduleType(!SCHEDULE_TYPES.some(opt => opt.value === promotion.schedule_type));
        if (!SCHEDULE_TYPES.some(opt => opt.value === promotion.schedule_type)) {
            setCustomScheduleType(promotion.schedule_type);
        }
        
        setEditingPromotion(promotion);
        setIsFormOpen(true);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };

    const handleDelete = async (promotionId) => {
        if (!window.confirm('Are you sure you want to delete this promotion?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/promotions/${promotionId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete promotion');
            }

            setPromotions(prev => prev.filter(promotion => promotion.promotion_id !== promotionId));
            setSuccess('Promotion deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredAndSortedPromotions = () => {
        let filtered = promotions;

        if (searchTerm) {
            filtered = filtered.filter(promotion =>
                promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                promotion.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                promotion.promotion_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                promotion.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCategory !== 'all') {
            filtered = filtered.filter(promotion => promotion.category === filterCategory);
        }

        if (filterStatus !== 'all') {
            filtered = filtered.filter(promotion => {
                if (filterStatus === 'active') return promotion.is_active;
                if (filterStatus === 'inactive') return !promotion.is_active;
                return true;
            });
        }

        switch (sortBy) {
            case 'newest':
                filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                filtered = [...filtered].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'title':
                filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'code':
                filtered = [...filtered].sort((a, b) => a.promotion_code.localeCompare(b.promotion_code));
                break;
            default:
                break;
        }

        return filtered;
    };

    const getUniqueCategories = () => {
        const categories = [...new Set(promotions.map(promotion => promotion.category))];
        return categories.sort();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusBadge = (promotion) => {
        if (promotion.is_active) {
            return { color: 'bg-green-100 text-green-800', text: 'Active' };
        } else {
            return { color: 'bg-red-100 text-red-800', text: 'Inactive' };
        }
    };

    const getCategoryBadgeColor = (category) => {
        const colors = {
            'birthday_party_package': 'bg-pink-100 text-pink-800',
            'general': 'bg-blue-100 text-blue-800',
            'memberships': 'bg-purple-100 text-purple-800',
            'jump_pass': 'bg-green-100 text-green-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getScheduleIcon = (scheduleType) => {
        const icons = {
            'recurring_weekday': '🔄',
            'always_active': '✅',
            'specific_date': '📅',
            'date_range': '📆'
        };
        return icons[scheduleType] || '⏰';
    };

    const copyToClipboard = (promotion) => {
        const text = `Promotion: ${promotion.title}\nCode: ${promotion.promotion_code}\nDetails: ${promotion.details}\nInstructions: ${promotion.instructions}`;
        navigator.clipboard.writeText(text).then(() => {
            setSuccess('Promotion copied to clipboard!');
            setTimeout(() => setSuccess(''), 2000);
        });
    };

    const togglePromotionStatus = async (promotionId, currentStatus) => {
        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/promotions/${promotionId}/update/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_active: !currentStatus
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update promotion status');
            }

            const updatedPromotion = await response.json();
            setPromotions(prev => prev.map(promotion =>
                promotion.promotion_id === promotionId ? updatedPromotion : promotion
            ));
            setSuccess(`Promotion ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (location_id) {
            fetchLocation();
            fetchPromotions();
        }
    }, [location_id]);

    const filteredPromotions = getFilteredAndSortedPromotions();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Promotions Management</h2>
                    {location && (
                        <p className="text-gray-600 mt-1">
                            Managing promotions for: <span className="font-semibold">{location.location_name}</span>
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                viewMode === 'table'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span>📋</span>
                                <span>Table View</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setViewMode('card')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                viewMode === 'card'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <div className="flex items-center space-x-2">
                                <span>🎴</span>
                                <span>Card View</span>
                            </div>
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            resetForm();
                            setIsFormOpen(true);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                        <span>🎁</span>
                        <span>Add New Promotion</span>
                    </button>
                </div>
            </div>

            {!isFormOpen && promotions.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <span className="text-2xl">🎁</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Promotions</p>
                                <p className="text-2xl font-bold text-gray-900">{promotions.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {promotions.filter(p => p.is_active).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <span className="text-2xl">📊</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Categories</p>
                                <p className="text-2xl font-bold text-gray-900">{getUniqueCategories().length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <span className="text-2xl">🔄</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Recurring</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {promotions.filter(p => p.schedule_type === 'recurring_weekday').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isFormOpen && promotions.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Promotions
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by title, code, or details..."
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Category
                            </label>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            >
                                <option value="all">All Categories</option>
                                {getUniqueCategories().map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Filter by Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="title">Title A-Z</option>
                                <option value="code">Promotion Code</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                        Showing {filteredPromotions.length} of {promotions.length} promotions
                        {searchTerm && ` for "${searchTerm}"`}
                        {filterCategory !== 'all' && ` in ${filterCategory}`}
                        {filterStatus !== 'all' && ` (${filterStatus})`}
                    </div>
                </div>
            )}

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

            {!isFormOpen && location_id && viewMode === 'table' && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Code & Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Schedule
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Eligibility
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPromotions.map((promotion) => {
                                    const statusBadge = getStatusBadge(promotion);
                                    return (
                                        <tr key={promotion.promotion_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-lg">{getScheduleIcon(promotion.schedule_type)}</span>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {promotion.promotion_code}
                                                            </div>
                                                            <div className="text-sm text-gray-500 max-w-xs truncate">
                                                                {promotion.title}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div>
                                                    <div>{formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}</div>
                                                    <div className="text-xs text-gray-400">
                                                        {formatTime(promotion.start_time)} - {formatTime(promotion.end_time)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(promotion.category)}`}>
                                                    {promotion.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="capitalize">{promotion.eligibility_type.replace(/_/g, ' ')}</div>
                                                {promotion.constraint_value && (
                                                    <div className="text-xs text-gray-400">
                                                        Constraint: {promotion.constraint_value}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center space-x-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                        {statusBadge.text}
                                                    </span>
                                                    {/* <button
                                                        onClick={() => togglePromotionStatus(promotion.promotion_id, promotion.is_active)}
                                                        className={`p-1 rounded transition-colors ${
                                                            promotion.is_active 
                                                                ? 'text-red-600 hover:text-red-800' 
                                                                : 'text-green-600 hover:text-green-800'
                                                        }`}
                                                        title={promotion.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {promotion.is_active ? '❌' : '✅'}
                                                    </button> */}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => copyToClipboard(promotion)}
                                                        className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
                                                        title="Copy to clipboard"
                                                    >
                                                        📋
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(promotion)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                                        title="Edit Promotion"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(promotion.promotion_id)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                                        title="Delete Promotion"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isFormOpen && location_id && viewMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPromotions.map((promotion) => {
                        const statusBadge = getStatusBadge(promotion);
                        return (
                            <div 
                                key={promotion.promotion_id} 
                                className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-2xl">{getScheduleIcon(promotion.schedule_type)}</span>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {promotion.promotion_code}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.color}`}>
                                                        {statusBadge.text}
                                                    </span>
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(promotion.category)} mt-1`}>
                                                    {promotion.category}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => togglePromotionStatus(promotion.promotion_id, promotion.is_active)}
                                                className={`p-1 rounded transition-colors ${
                                                    promotion.is_active 
                                                        ? 'text-red-600 hover:text-red-800' 
                                                        : 'text-green-600 hover:text-green-800'
                                                }`}
                                                title={promotion.is_active ? 'Deactivate' : 'Activate'}
                                            >
                                                {promotion.is_active ? '❌' : '✅'}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(promotion)}
                                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                                title="Copy to clipboard"
                                            >
                                                📋
                                            </button>
                                            <button
                                                onClick={() => handleEdit(promotion)}
                                                className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                                title="Edit Promotion"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(promotion.promotion_id)}
                                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                                title="Delete Promotion"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                        {promotion.title}
                                    </h3>
                                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
                                        {promotion.details}
                                    </p>
                                    
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                        <div className="text-sm font-medium text-gray-900 mb-2">Schedule</div>
                                        <div className="space-y-1 text-xs text-gray-600">
                                            <div>📅 {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}</div>
                                            {promotion.start_time && (
                                                <div>⏰ {formatTime(promotion.start_time)} - {formatTime(promotion.end_time)}</div>
                                            )}
                                            {promotion.start_day && (
                                                <div>📆 {promotion.start_day} - {promotion.end_day}</div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div>
                                            <span className="font-medium">Eligibility:</span>
                                            <span className="ml-1 capitalize text-gray-600">
                                                {promotion.eligibility_type.replace(/_/g, ' ')}
                                                {promotion.constraint_value && ` (Constraint: ${promotion.constraint_value})`}
                                            </span>
                                        </div>
                                        {promotion.instructions && (
                                            <div>
                                                <span className="font-medium">Instructions:</span>
                                                <span className="ml-1 text-gray-600 line-clamp-2">
                                                    {promotion.instructions}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="px-6 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span>Created: {formatDate(promotion.created_at)}</span>
                                        <button
                                            onClick={() => handleEdit(promotion)}
                                            className="text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Quick Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!isFormOpen && location_id && promotions.length === 0 && !isLoading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🎁</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Promotions Configured</h3>
                    <p className="text-gray-500 mb-4">Create promotions to attract customers and drive business growth.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Create First Promotion
                    </button>
                </div>
            )}

            {!isFormOpen && promotions.length > 0 && filteredPromotions.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Promotions</h3>
                    <p className="text-gray-500 mb-4">
                        No promotions found matching your search criteria.
                        {searchTerm && ` Try adjusting your search term "${searchTerm}"`}
                        {filterCategory !== 'all' && ` or filter for "${filterCategory}"`}
                        {filterStatus !== 'all' && ` or status "${filterStatus}"`}
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterCategory('all');
                            setFilterStatus('all');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Clear All Filters
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
                            {editingPromotion ? 'Edit Promotion' : 'Create New Promotion'}
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Promotion Code *
                                        </label>
                                        <input
                                            type="text"
                                            name="promotion_code"
                                            value={formData.promotion_code}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                                fieldErrors.promotion_code ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="e.g., WINTER2024"
                                        />
                                        {fieldErrors.promotion_code && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.promotion_code}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Title *
                                        </label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                                fieldErrors.title ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="Promotion title"
                                        />
                                        {fieldErrors.title && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Category *
                                        </label>
                                        {!showCustomCategory ? (
                                            <select
                                                name="category"
                                                value={formData.category}
                                                onChange={handleCategoryChange}
                                                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                                    fieldErrors.category ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="">Select Category</option>
                                                {CATEGORIES.map(category => (
                                                    <option key={category.value} value={category.value}>{category.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                    placeholder="Enter custom category"
                                                />
                                                <div className="flex space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleCustomCategoryCancel}
                                                        className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        {fieldErrors.category && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sub-category
                                        </label>
                                        {!showCustomSubCategory ? (
                                            <select
                                                name="sub_category"
                                                value={formData.sub_category}
                                                onChange={handleSubCategoryChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            >
                                                <option value="">Select Sub-category</option>
                                                {SUB_CATEGORIES.map(subCategory => (
                                                    <option key={subCategory.value} value={subCategory.value}>{subCategory.label}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    name="sub_category"
                                                    value={formData.sub_category}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                    placeholder="Enter custom sub-category"
                                                />
                                                <div className="flex space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={handleCustomSubCategoryCancel}
                                                        className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Schedule Type *
                                    </label>
                                    {!showCustomScheduleType ? (
                                        <select
                                            name="schedule_type"
                                            value={formData.schedule_type}
                                            onChange={handleScheduleTypeChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        >
                                            {SCHEDULE_TYPES.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                name="schedule_type"
                                                value={formData.schedule_type}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                placeholder="Enter custom schedule type"
                                            />
                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={handleCustomScheduleTypeCancel}
                                                    className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="start_date"
                                            value={formData.start_date}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                                fieldErrors.start_date ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {fieldErrors.start_date && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.start_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="end_date"
                                            value={formData.end_date}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                                fieldErrors.end_date ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {fieldErrors.end_date && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.end_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Day
                                        </label>
                                        <select
                                            name="start_day"
                                            value={formData.start_day}
                                            onChange={handleInputChange}
                                            disabled={!!formData.start_date}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border disabled:bg-gray-100"
                                        >
                                            <option value="">Select Start Day</option>
                                            {DAYS_OF_WEEK.map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                        {formData.start_date && (
                                            <p className="mt-1 text-xs text-gray-500">Auto-filled from start date</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Day
                                        </label>
                                        <select
                                            name="end_day"
                                            value={formData.end_day}
                                            onChange={handleInputChange}
                                            disabled={!!formData.end_date}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border disabled:bg-gray-100"
                                        >
                                            <option value="">Select End Day</option>
                                            {DAYS_OF_WEEK.map(day => (
                                                <option key={day} value={day}>{day}</option>
                                            ))}
                                        </select>
                                        {formData.end_date && (
                                            <p className="mt-1 text-xs text-gray-500">Auto-filled from end date</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            name="start_time"
                                            value={formData.start_time}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                                fieldErrors.start_time ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {fieldErrors.start_time && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.start_time}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            name="end_time"
                                            value={formData.end_time}
                                            onChange={handleInputChange}
                                            className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                                fieldErrors.end_time ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {fieldErrors.end_time && (
                                            <p className="mt-1 text-sm text-red-600">{fieldErrors.end_time}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Eligibility Type *
                                    </label>
                                    {!showCustomEligibility ? (
                                        <select
                                            name="eligibility_type"
                                            value={formData.eligibility_type}
                                            onChange={handleEligibilityChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        >
                                            {ELIGIBILITY_TYPES.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                name="eligibility_type"
                                                value={formData.eligibility_type}
                                                onChange={handleInputChange}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                placeholder="Enter custom eligibility type"
                                            />
                                            <div className="flex space-x-2">
                                                <button
                                                    type="button"
                                                    onClick={handleCustomEligibilityCancel}
                                                    className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Constraint Value
                                    </label>
                                    <input
                                        type="text"
                                        name="constraint_value"
                                        value={formData.constraint_value}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                            fieldErrors.constraint_value ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter constraint value"
                                    />
                                    {fieldErrors.constraint_value && (
                                        <p className="mt-1 text-sm text-red-600">{fieldErrors.constraint_value}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        Minimum amount or count required (if applicable)
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label className="ml-2 block text-sm font-medium text-gray-700">
                                        Active Promotion
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Details *
                                    </label>
                                    <textarea
                                        name="details"
                                        value={formData.details}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                            fieldErrors.details ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Describe the promotion details, benefits, and terms..."
                                    />
                                    {fieldErrors.details && (
                                        <p className="mt-1 text-sm text-red-600">{fieldErrors.details}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.details.length}/1000 characters
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Instructions
                                    </label>
                                    <textarea
                                        name="instructions"
                                        value={formData.instructions}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="How customers can redeem this promotion..."
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.instructions.length}/500 characters
                                    </p>
                                </div>
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
                                        ? (editingPromotion ? 'Updating...' : 'Creating...')
                                        : (editingPromotion ? 'Update Promotion' : 'Create Promotion')
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

export default PromotionsComp;