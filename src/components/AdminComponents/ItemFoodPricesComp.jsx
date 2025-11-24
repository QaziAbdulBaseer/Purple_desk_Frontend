





import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

const ItemFoodPricesComp = () => {
    const { location_id } = useParams();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    const [items, setItems] = useState([]);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingItem, setEditingItem] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('category');
    const [viewMode, setViewMode] = useState('table');
    const [dataEntryMode, setDataEntryMode] = useState('category'); // 'category' or 'tshirt'

    // Custom input states
    const [showCustomCategoryType, setShowCustomCategoryType] = useState(false);
    const [showCustomOptionsType, setShowCustomOptionsType] = useState(false);
    const [showCustomTShirtType, setShowCustomTShirtType] = useState(false);
    const [customCategoryType, setCustomCategoryType] = useState('');
    const [customOptionsType, setCustomOptionsType] = useState('');
    const [customTShirtType, setCustomTShirtType] = useState('');

    // Form data state
    const [formData, setFormData] = useState({
        // Common fields
        category: '',
        category_priority: 0,
        category_type: '',
        options_type_per_category: '',
        additional_instructions: '',
        item: '',
        price: '',
        // T-shirt specific fields
        t_shirt_sizes: '',
        t_shirt_type: '',
        pitch_in_party_package: false
    });

    // Predefined options
    const CATEGORY_TYPES = [
        { value: 'included_in_package', label: 'Included in Package' },
        { value: 'additional_purchase', label: 'Additional Purchase' },
        { value: 'merchandise', label: 'Merchandise' },
        { value: 'beverages', label: 'Beverages' },
        { value: 'snacks', label: 'Snacks' }
    ];

    const OPTIONS_TYPES = [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'size_options', label: 'Size Options' },
        { value: 'flavor_options', label: 'Flavor Options' },
        { value: 'topping_options', label: 'Topping Options' }
    ];

    const T_SHIRT_TYPES = [
        { value: 'cotton', label: 'Cotton' },
        { value: 'premium_cotton', label: 'Premium Cotton' },
        { value: 'dry_fit', label: 'Dry Fit' },
        { value: 'glow', label: 'Glow' },
        { value: 'premium', label: 'Premium' }
    ];

    const T_SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

    // Check if a value is in predefined options
    const isValueInPredefined = (value, options) => {
        return options.some(option => option.value === value);
    };

    // Custom input handlers
    const handleCustomCategoryTypeChange = (e) => {
        const value = e.target.value;
        setCustomCategoryType(value);
        setFormData(prev => ({ ...prev, category_type: value }));
    };

    const handleCustomCategoryTypeCancel = () => {
        setShowCustomCategoryType(false);
        setCustomCategoryType('');
        setFormData(prev => ({ ...prev, category_type: '' }));
    };

    const handleCustomOptionsTypeChange = (e) => {
        const value = e.target.value;
        setCustomOptionsType(value);
        setFormData(prev => ({ ...prev, options_type_per_category: value }));
    };

    const handleCustomOptionsTypeCancel = () => {
        setShowCustomOptionsType(false);
        setCustomOptionsType('');
        setFormData(prev => ({ ...prev, options_type_per_category: '' }));
    };

    const handleCustomTShirtTypeChange = (e) => {
        const value = e.target.value;
        setCustomTShirtType(value);
        setFormData(prev => ({ ...prev, t_shirt_type: value }));
    };

    const handleCustomTShirtTypeCancel = () => {
        setShowCustomTShirtType(false);
        setCustomTShirtType('');
        setFormData(prev => ({ ...prev, t_shirt_type: '' }));
    };

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

    const fetchItems = async () => {
        if (!location_id) return;

        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/food-drink-items/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }

            const data = await response.json();
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            category: '',
            category_priority: 0,
            category_type: '',
            options_type_per_category: '',
            additional_instructions: '',
            item: '',
            price: '',
            t_shirt_sizes: '',
            t_shirt_type: '',
            pitch_in_party_package: false
        });
        setEditingItem(null);
        setError('');
        setSuccess('');
        setFieldErrors({});
        // Reset custom input states
        setShowCustomCategoryType(false);
        setShowCustomOptionsType(false);
        setShowCustomTShirtType(false);
        setCustomCategoryType('');
        setCustomOptionsType('');
        setCustomTShirtType('');
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? (value === '' ? '' : parseFloat(value)) :
                    value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleTShirtSizeChange = (size) => {
        const currentSizes = formData.t_shirt_sizes ? formData.t_shirt_sizes.split(',') : [];
        let newSizes;

        if (currentSizes.includes(size)) {
            newSizes = currentSizes.filter(s => s !== size);
        } else {
            newSizes = [...currentSizes, size];
        }

        setFormData(prev => ({
            ...prev,
            t_shirt_sizes: newSizes.join(',')
        }));
    };

    const validateForm = () => {
        const errors = {};

        // Common validations
        if (!formData.item?.trim()) {
            errors.item = 'Item name is required';
        }

        if (!formData.price || formData.price <= 0) {
            errors.price = 'Valid price is required';
        }

        // Mode-specific validations
        if (dataEntryMode === 'category') {
            if (!formData.category?.trim()) {
                errors.category = 'Category is required';
            }
            if (formData.category_priority < 0) {
                errors.category_priority = 'Category priority cannot be negative';
            }
        } else {
            // T-shirt mode validations
            if (!formData.t_shirt_type) {
                errors.t_shirt_type = 'T-shirt type is required';
            }
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
            const url = editingItem
                ? `${import.meta.env.VITE_BackendApi}/locations/${location_id}/food-drink-items/${editingItem.item_id}/update/`
                : `${import.meta.env.VITE_BackendApi}/locations/${location_id}/food-drink-items/create/`;

            const method = editingItem ? 'PUT' : 'POST';

            const submitData = {
                ...formData,
                item: formData.item.trim(),
                additional_instructions: formData.additional_instructions?.trim() || ''
            };

            // Clean up data based on mode
            if (dataEntryMode === 'category') {
                submitData.t_shirt_sizes = '';
                submitData.t_shirt_type = '';
                submitData.pitch_in_party_package = false;
            } else {
                submitData.category = 'Merchandise';
                submitData.category_priority = 0;
                submitData.category_type = '';
                submitData.options_type_per_category = '';
                submitData.additional_instructions = '';
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
                    setFieldErrors(responseData);
                    setError('Please fix the validation errors below');
                } else {
                    throw new Error(responseData.error || responseData.detail || 'Failed to save item');
                }
                return;
            }

            const savedItem = responseData;

            if (editingItem) {
                setItems(prev => prev.map(item =>
                    item.item_id === savedItem.item_id ? savedItem : item
                ));
                setSuccess('Item updated successfully!');
            } else {
                setItems(prev => [...prev, savedItem]);
                setSuccess('Item created successfully!');
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

    const handleEdit = (item) => {
        // Determine the mode based on the item data
        const isTShirtItem = item.t_shirt_type || item.t_shirt_sizes;
        setDataEntryMode(isTShirtItem ? 'tshirt' : 'category');

        // Set form data
        setFormData({
            category: item.category || '',
            category_priority: item.category_priority || 0,
            category_type: item.category_type || '',
            options_type_per_category: item.options_type_per_category || '',
            additional_instructions: item.additional_instructions || '',
            item: item.item || '',
            price: item.price || '',
            t_shirt_sizes: item.t_shirt_sizes || '',
            t_shirt_type: item.t_shirt_type || '',
            pitch_in_party_package: item.pitch_in_party_package || false
        });

        // Check for custom values and show custom inputs if needed
        if (item.category_type && !isValueInPredefined(item.category_type, CATEGORY_TYPES)) {
            setShowCustomCategoryType(true);
            setCustomCategoryType(item.category_type);
        }

        if (item.options_type_per_category && !isValueInPredefined(item.options_type_per_category, OPTIONS_TYPES)) {
            setShowCustomOptionsType(true);
            setCustomOptionsType(item.options_type_per_category);
        }

        if (item.t_shirt_type && !isValueInPredefined(item.t_shirt_type, T_SHIRT_TYPES)) {
            setShowCustomTShirtType(true);
            setCustomTShirtType(item.t_shirt_type);
        }

        setEditingItem(item);
        setIsFormOpen(true);
        setError('');
        setSuccess('');
        setFieldErrors({});
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm('Are you sure you want to delete this item?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/food-drink-items/${itemId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            setItems(prev => prev.filter(item => item.item_id !== itemId));
            setSuccess('Item deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredAndSortedItems = () => {
        let filtered = items;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.additional_instructions && item.additional_instructions.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        if (filterCategory !== 'all') {
            filtered = filtered.filter(item => item.category === filterCategory);
        }

        if (filterType !== 'all') {
            if (filterType === 'merchandise') {
                filtered = filtered.filter(item => item.t_shirt_type);
            } else if (filterType === 'food_drink') {
                filtered = filtered.filter(item => !item.t_shirt_type);
            }
        }

        switch (sortBy) {
            case 'category':
                filtered = [...filtered].sort((a, b) => {
                    if (a.category_priority !== b.category_priority) {
                        return a.category_priority - b.category_priority;
                    }
                    return a.item.localeCompare(b.item);
                });
                break;
            case 'name':
                filtered = [...filtered].sort((a, b) => a.item.localeCompare(b.item));
                break;
            case 'price_low':
                filtered = [...filtered].sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                filtered = [...filtered].sort((a, b) => b.price - a.price);
                break;
            default:
                break;
        }

        return filtered;
    };

    const getUniqueCategories = () => {
        const categories = [...new Set(items.map(item => item.category))];
        return categories.sort();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    };

    const getCategoryBadgeColor = (category) => {
        const colors = {
            'Pizza': 'bg-red-100 text-red-800',
            'Drinks': 'bg-blue-100 text-blue-800',
            'Merchandise': 'bg-purple-100 text-purple-800',
            'Snacks': 'bg-yellow-100 text-yellow-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    const getItemIcon = (item) => {
        if (item.t_shirt_type) return '👕';
        if (item.category === 'Pizza') return '🍕';
        if (item.category === 'Drinks') return '🥤';
        if (item.category === 'Snacks') return '🍟';
        return '📦';
    };

    const bulkCreateFromCSV = async (file) => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append('csv_file', file);

            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/food-drink-items/bulk-create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to bulk create items');
            }

            if (result.errors && result.errors.length > 0) {
                setError(`Bulk create completed with ${result.errors.length} errors. Created: ${result.created_count} items`);
            } else {
                setSuccess(`Successfully created ${result.created_count} items from CSV!`);
            }

            fetchItems(); // Refresh the list
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            bulkCreateFromCSV(file);
        }
    };

    useEffect(() => {
        if (location_id) {
            fetchLocation();
            fetchItems();
        }
    }, [location_id]);

    const filteredItems = getFilteredAndSortedItems();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Food, Drinks & Merchandise</h2>
                    {location && (
                        <p className="text-gray-600 mt-1">
                            Managing items for: <span className="font-semibold">{location.location_name}</span>
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'table'
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
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${viewMode === 'card'
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
                        <span>➕</span>
                        <span>Add New Item</span>
                    </button>
                </div>
            </div>

            {!isFormOpen && items.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <span className="text-2xl">📦</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Items</p>
                                <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <span className="text-2xl">🍕</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Food & Drinks</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {items.filter(item => !item.t_shirt_type).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <span className="text-2xl">👕</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Merchandise</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {items.filter(item => item.t_shirt_type).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center">
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <span className="text-2xl">🎉</span>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Party Package</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {items.filter(item => item.pitch_in_party_package).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isFormOpen && items.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search Items
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, category..."
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
                                Filter by Type
                            </label>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            >
                                <option value="all">All Types</option>
                                <option value="food_drink">Food & Drinks</option>
                                <option value="merchandise">Merchandise</option>
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
                                <option value="category">Category & Priority</option>
                                <option value="name">Name A-Z</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                            </select>
                        </div>
{/* 
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Bulk Import
                            </label>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div> */}
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                        Showing {filteredItems.length} of {items.length} items
                        {searchTerm && ` for "${searchTerm}"`}
                        {filterCategory !== 'all' && ` in ${filterCategory}`}
                        {filterType !== 'all' && ` (${filterType === 'merchandise' ? 'Merchandise' : 'Food & Drinks'})`}
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
                                        Item
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type & Options
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Additional Info
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredItems.map((item) => (
                                    <tr key={item.item_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg">{getItemIcon(item)}</span>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {item.item}
                                                    </div>
                                                    {item.t_shirt_type && (
                                                        <div className="text-sm text-gray-500">
                                                            {item.t_shirt_type} • Sizes: {item.t_shirt_sizes || 'N/A'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(item.category)}`}>
                                                    {item.category}
                                                </span>
                                                {item.category_priority > 0 && (
                                                    <span className="text-xs text-gray-500">
                                                        Priority: {item.category_priority}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <div>{item.category_type || 'N/A'}</div>
                                            <div className="text-xs text-gray-400">
                                                {item.options_type_per_category || 'No options'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            {formatPrice(item.price)}
                                            {item.pitch_in_party_package && (
                                                <div className="text-xs text-green-600 font-normal">In Party Package</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                                            {item.additional_instructions ? (
                                                <div className="truncate" title={item.additional_instructions}>
                                                    {item.additional_instructions}
                                                </div>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                                    title="Edit Item"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.item_id)}
                                                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                                    title="Delete Item"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!isFormOpen && location_id && viewMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                        <div
                            key={item.item_id}
                            className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            <div className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{getItemIcon(item)}</span>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {item.item}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryBadgeColor(item.category)} mt-1`}>
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-gray-900">
                                            {formatPrice(item.price)}
                                        </div>
                                        {item.pitch_in_party_package && (
                                            <div className="text-xs text-green-600 font-medium">Party Package</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {item.t_shirt_type && (
                                    <div className="mb-4">
                                        <div className="text-sm font-medium text-gray-900 mb-2">Merchandise Details</div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <div>Type: {item.t_shirt_type}</div>
                                            <div>Sizes: {item.t_shirt_sizes || 'Not specified'}</div>
                                        </div>
                                    </div>
                                )}

                                {item.category_type && (
                                    <div className="mb-4">
                                        <div className="text-sm font-medium text-gray-900 mb-1">Category Type</div>
                                        <div className="text-sm text-gray-600">{item.category_type}</div>
                                    </div>
                                )}

                                {item.options_type_per_category && (
                                    <div className="mb-4">
                                        <div className="text-sm font-medium text-gray-900 mb-1">Options</div>
                                        <div className="text-sm text-gray-600">{item.options_type_per_category}</div>
                                    </div>
                                )}

                                {item.additional_instructions && (
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 mb-1">Instructions</div>
                                        <div className="text-sm text-gray-600 leading-relaxed">
                                            {item.additional_instructions}
                                        </div>
                                    </div>
                                )}

                                {item.category_priority > 0 && (
                                    <div className="mt-4 text-xs text-gray-500">
                                        Category Priority: {item.category_priority}
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">
                                        Updated: {new Date(item.updated_at).toLocaleDateString()}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.item_id)}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isFormOpen && location_id && items.length === 0 && !isLoading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📦</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Configured</h3>
                    <p className="text-gray-500 mb-4">Start by adding food, drinks, or merchandise items for your location.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add First Item
                    </button>
                </div>
            )}

            {!isFormOpen && items.length > 0 && filteredItems.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Items</h3>
                    <p className="text-gray-500 mb-4">
                        No items found matching your search criteria.
                        {searchTerm && ` Try adjusting your search term "${searchTerm}"`}
                        {filterCategory !== 'all' && ` or filter for "${filterCategory}"`}
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterCategory('all');
                            setFilterType('all');
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
                            {editingItem ? 'Edit Item' : 'Create New Item'}
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

                    {/* Data Entry Mode Toggle */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Data Entry Mode
                        </label>
                        <div className="flex space-x-4">
                            <button
                                type="button"
                                onClick={() => setDataEntryMode('category')}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${dataEntryMode === 'category'
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <span>🍕</span>
                                    <span>Food & Drinks</span>
                                </div>
                                <div className="text-xs mt-1 opacity-75">
                                    Category, priority, type, options
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setDataEntryMode('tshirt')}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${dataEntryMode === 'tshirt'
                                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <span>👕</span>
                                    <span>Merchandise</span>
                                </div>
                                <div className="text-xs mt-1 opacity-75">
                                    T-shirts, sizes, party package
                                </div>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column - Common Fields */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Item Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="item"
                                        value={formData.item}
                                        onChange={handleInputChange}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.item ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter item name"
                                    />
                                    {fieldErrors.item && (
                                        <p className="mt-1 text-sm text-red-600">{fieldErrors.item}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        step="0.01"
                                        min="0"
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.price ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        placeholder="0.00"
                                    />
                                    {fieldErrors.price && (
                                        <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
                                    )}
                                </div>

                                {/* Category Mode Specific Fields */}
                                {dataEntryMode === 'category' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category *
                                            </label>
                                            <input
                                                type="text"
                                                name="category"
                                                value={formData.category}
                                                onChange={handleInputChange}
                                                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.category ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                placeholder="e.g., Pizza, Drinks, Snacks"
                                            />
                                            {fieldErrors.category && (
                                                <p className="mt-1 text-sm text-red-600">{fieldErrors.category}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category Priority
                                            </label>
                                            <input
                                                type="number"
                                                name="category_priority"
                                                value={formData.category_priority}
                                                onChange={handleInputChange}
                                                min="0"
                                                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.category_priority ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                placeholder="0"
                                            />
                                            {fieldErrors.category_priority && (
                                                <p className="mt-1 text-sm text-red-600">{fieldErrors.category_priority}</p>
                                            )}
                                            <p className="mt-1 text-xs text-gray-500">
                                                Lower numbers appear first in category lists
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category Type
                                            </label>
                                            {showCustomCategoryType ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={customCategoryType}
                                                        onChange={handleCustomCategoryTypeChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                        placeholder="Enter custom category type"
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleCustomCategoryTypeCancel}
                                                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <select
                                                    name="category_type"
                                                    value={formData.category_type}
                                                    onChange={(e) => {
                                                        if (e.target.value === 'custom') {
                                                            setShowCustomCategoryType(true);
                                                            setCustomCategoryType('');
                                                            setFormData(prev => ({ ...prev, category_type: '' }));
                                                        } else {
                                                            handleInputChange(e);
                                                        }
                                                    }}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                >
                                                    <option value="">Select Category Type</option>
                                                    {CATEGORY_TYPES.map(type => (
                                                        <option key={type.value} value={type.value}>{type.label}</option>
                                                    ))}
                                                    <option value="custom">Custom Type...</option>
                                                </select>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Options Type
                                            </label>
                                            {showCustomOptionsType ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={customOptionsType}
                                                        onChange={handleCustomOptionsTypeChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                        placeholder="Enter custom options type"
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleCustomOptionsTypeCancel}
                                                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <select
                                                    name="options_type_per_category"
                                                    value={formData.options_type_per_category}
                                                    onChange={(e) => {
                                                        if (e.target.value === 'custom') {
                                                            setShowCustomOptionsType(true);
                                                            setCustomOptionsType('');
                                                            setFormData(prev => ({ ...prev, options_type_per_category: '' }));
                                                        } else {
                                                            handleInputChange(e);
                                                        }
                                                    }}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                >
                                                    <option value="">Select Options Type</option>
                                                    {OPTIONS_TYPES.map(option => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                    <option value="custom">Custom Type...</option>
                                                </select>
                                            )}
                                        </div>
                                    </>
                                )}

                                {/* T-shirt Mode Specific Fields */}
                                {dataEntryMode === 'tshirt' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                T-Shirt Type *
                                            </label>
                                            {showCustomTShirtType ? (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={customTShirtType}
                                                        onChange={handleCustomTShirtTypeChange}
                                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.t_shirt_type ? 'border-red-300' : 'border-gray-300'
                                                            }`}
                                                        placeholder="Enter custom T-shirt type"
                                                    />
                                                    <div className="flex space-x-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleCustomTShirtTypeCancel}
                                                            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <select
                                                    name="t_shirt_type"
                                                    value={formData.t_shirt_type}
                                                    onChange={(e) => {
                                                        if (e.target.value === 'custom') {
                                                            setShowCustomTShirtType(true);
                                                            setCustomTShirtType('');
                                                            setFormData(prev => ({ ...prev, t_shirt_type: '' }));
                                                        } else {
                                                            handleInputChange(e);
                                                        }
                                                    }}
                                                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${fieldErrors.t_shirt_type ? 'border-red-300' : 'border-gray-300'
                                                        }`}
                                                >
                                                    <option value="">Select T-Shirt Type</option>
                                                    {T_SHIRT_TYPES.map(type => (
                                                        <option key={type.value} value={type.value}>{type.label}</option>
                                                    ))}
                                                    <option value="custom">Custom Type...</option>
                                                </select>
                                            )}
                                            {fieldErrors.t_shirt_type && (
                                                <p className="mt-1 text-sm text-red-600">{fieldErrors.t_shirt_type}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Available Sizes
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {T_SHIRT_SIZES.map(size => {
                                                    const isSelected = formData.t_shirt_sizes.includes(size);
                                                    return (
                                                        <button
                                                            key={size}
                                                            type="button"
                                                            onClick={() => handleTShirtSizeChange(size)}
                                                            className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${isSelected
                                                                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                                                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                                }`}
                                                        >
                                                            {size}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <p className="mt-2 text-xs text-gray-500">
                                                Selected: {formData.t_shirt_sizes || 'None'}
                                            </p>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="pitch_in_party_package"
                                                checked={formData.pitch_in_party_package}
                                                onChange={handleInputChange}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label className="ml-2 block text-sm font-medium text-gray-700">
                                                Include in Party Package
                                            </label>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right Column - Additional Instructions */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Instructions
                                    </label>
                                    <textarea
                                        name="additional_instructions"
                                        value={formData.additional_instructions}
                                        onChange={handleInputChange}
                                        rows={dataEntryMode === 'category' ? 10 : 6}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder={
                                            dataEntryMode === 'category'
                                                ? "Enter serving instructions, preparation details, or special notes..."
                                                : "Enter any special instructions or notes about this merchandise..."
                                        }
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.additional_instructions.length}/500 characters
                                    </p>
                                </div>

                                {/* Preview Section */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Item Preview</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Name:</strong> {formData.item || 'Not set'}</div>
                                        <div><strong>Price:</strong> {formData.price ? formatPrice(formData.price) : 'Not set'}</div>
                                        {dataEntryMode === 'category' && (
                                            <>
                                                <div><strong>Category:</strong> {formData.category || 'Not set'}</div>
                                                <div><strong>Priority:</strong> {formData.category_priority}</div>
                                                <div><strong>Type:</strong> {formData.category_type || 'Not set'}</div>
                                                <div><strong>Options:</strong> {formData.options_type_per_category || 'Not set'}</div>
                                            </>
                                        )}
                                        {dataEntryMode === 'tshirt' && (
                                            <>
                                                <div><strong>Type:</strong> {formData.t_shirt_type || 'Not set'}</div>
                                                <div><strong>Sizes:</strong> {formData.t_shirt_sizes || 'Not set'}</div>
                                                <div><strong>Party Package:</strong> {formData.pitch_in_party_package ? 'Yes' : 'No'}</div>
                                            </>
                                        )}
                                    </div>
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
                                        ? (editingItem ? 'Updating...' : 'Creating...')
                                        : (editingItem ? 'Update Item' : 'Create Item')
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

export default ItemFoodPricesComp;