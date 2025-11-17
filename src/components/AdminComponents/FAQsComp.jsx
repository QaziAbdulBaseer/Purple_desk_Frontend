



import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

const FAQsComp = () => {
    // Get location_id from URL parameters and initialize navigation
    const { location_id } = useParams();
    const navigate = useNavigate();

    // Get user data from Redux store
    const userData = useSelector((state) => state.auth.userData);

    // State declarations for component data management
    const [faqs, setFaqs] = useState([]);
    const [location, setLocation] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingFaq, setEditingFaq] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [isCustomType, setIsCustomType] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [csvPreview, setCsvPreview] = useState([]);
    const [showCsvUpload, setShowCsvUpload] = useState(false);
    
    // New state for view mode
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

    // Form data state initialization
    const [formData, setFormData] = useState({
        question_type: '',
        question: '',
        answer: ''
    });

    // Updated question types with specific categories
    const QUESTION_TYPES = [
        'General',
        'Venue & Facilities',
        'Glow Night & Little Leapers', 
        'Food & Payment',
        'Safety & Rules',
        'Attractions',
        'Gift cards purchasing'
    ];

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

    // Fetch all FAQs for the location
    const fetchFaqs = async () => {
        if (!location_id) return;

        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/faqs/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch FAQs');
            }

            const data = await response.json();
            setFaqs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle input changes in form
    const handleInputChange = (e) => {
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

    // Handle question type selection
    const handleQuestionTypeChange = (e) => {
        const value = e.target.value;
        
        if (value === 'custom') {
            setIsCustomType(true);
            setFormData(prev => ({
                ...prev,
                question_type: ''
            }));
        } else {
            setIsCustomType(false);
            setFormData(prev => ({
                ...prev,
                question_type: value
            }));
        }

        if (fieldErrors.question_type) {
            setFieldErrors(prev => ({
                ...prev,
                question_type: ''
            }));
        }
    };

    // Handle custom type input
    const handleCustomTypeChange = (e) => {
        setFormData(prev => ({
            ...prev,
            question_type: e.target.value
        }));
    };

    // Reset custom type to dropdown
    const resetToDropdown = () => {
        setIsCustomType(false);
        setFormData(prev => ({
            ...prev,
            question_type: ''
        }));
    };

    // Handle CSV file selection
    const handleCsvFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setError('Please select a valid CSV file');
            return;
        }

        setCsvFile(file);
        setError('');
        previewCsvFile(file);
    };

    // Preview CSV file content
    const previewCsvFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const csvText = e.target.result;
            const lines = csvText.split('\n').filter(line => line.trim());
            
            if (lines.length === 0) {
                setError('CSV file is empty');
                return;
            }

            try {
                // Parse CSV with proper comma and quote handling
                const parsedData = parseCsv(csvText);
                
                if (parsedData.length === 0) {
                    setError('No data found in CSV file');
                    return;
                }

                const headers = Object.keys(parsedData[0]).map(header => header.toLowerCase());
                
                // Validate headers
                const requiredHeaders = ['question_type', 'question', 'answer'];
                const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
                
                if (missingHeaders.length > 0) {
                    setError(`Missing required columns: ${missingHeaders.join(', ')}. Required columns are: question_type, question, answer`);
                    setCsvPreview([]);
                    return;
                }

                // Create preview data
                const previewData = parsedData.slice(0, 5); // Show first 5 rows
                
                setCsvPreview(previewData);
                setSuccess(`CSV file loaded successfully. ${parsedData.length} FAQs found. Previewing first ${previewData.length} rows.`);
                
            } catch (error) {
                setError(`Error parsing CSV file: ${error.message}`);
                setCsvPreview([]);
            }
        };
        reader.onerror = () => {
            setError('Error reading file');
        };
        reader.readAsText(file);
    };

    // Improved CSV parser that handles quotes and commas properly
    const parseCsv = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        // Parse headers
        const headers = parseCsvLine(lines[0]).map(header => header.trim());
        
        // Parse data rows
        const data = [];
        for (let i = 1; i < lines.length; i++) {
            const values = parseCsvLine(lines[i]);
            if (values.length >= headers.length) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] ? values[index].trim() : '';
                });
                // Only add row if it has at least one non-empty value
                if (Object.values(row).some(value => value.trim() !== '')) {
                    data.push(row);
                }
            }
        }
        
        return data;
    };

    // Robust CSV line parser
    const parseCsvLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '"';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                    quoteChar = '"';
                }
            } else if (char === "'" && !inQuotes) {
                // Start single quotes
                inQuotes = true;
                quoteChar = "'";
            } else if (char === "'" && inQuotes && quoteChar === "'") {
                // End single quotes
                inQuotes = false;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result.map(field => field.trim());
    };

    // Upload CSV file to backend
    const handleCsvUpload = async () => {
        if (!csvFile) {
            setError('Please select a CSV file first');
            return;
        }

        setIsUploading(true);
        setError('');

        try {
            const token = getAuthToken();
            const formData = new FormData();
            formData.append('csv_file', csvFile);
            // Note: location_id is already in the URL, no need to append it

            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/faqs/bulk-create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type - let browser set it with boundary
                },
                body: formData
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 400 || response.status === 207) {
                    // Handle partial success (207) or bad request
                    const errorMessage = responseData.error || responseData.message || 'Failed to upload CSV file';
                    const errorDetails = responseData.errors ? ` Errors: ${responseData.errors.slice(0, 3).join('; ')}` : '';
                    throw new Error(errorMessage + errorDetails);
                } else {
                    throw new Error(responseData.error || responseData.detail || 'Failed to upload CSV file');
                }
            }

            // Success case
            const successMessage = responseData.message || `Successfully imported ${responseData.created_count} FAQs from CSV file!`;
            setSuccess(successMessage);
            
            if (responseData.errors && responseData.errors.length > 0) {
                // Show warnings for partial errors
                setSuccess(prev => prev + ` (${responseData.errors.length} errors - check console for details)`);
                console.warn('CSV Import Errors:', responseData.errors);
            }
            
            setCsvFile(null);
            setCsvPreview([]);
            setShowCsvUpload(false);
            
            // Refresh FAQs list
            fetchFaqs();
            
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            question_type: '',
            question: '',
            answer: ''
        });
        setEditingFaq(null);
        setError('');
        setSuccess('');
        setFieldErrors({});
        setIsCustomType(false);
        setCsvFile(null);
        setCsvPreview([]);
        setShowCsvUpload(false);
    };

    // Validate form data
    const validateForm = () => {
        const errors = {};
        const requiredFields = ['question_type', 'question', 'answer'];

        requiredFields.forEach(field => {
            if (!formData[field]?.trim()) {
                errors[field] = `${field.replace(/_/g, ' ')} is required`;
            }
        });

        if (formData.question && formData.question.length < 10) {
            errors.question = 'Question should be at least 10 characters long';
        }

        if (formData.answer && formData.answer.length < 10) {
            errors.answer = 'Answer should be at least 10 characters long';
        }

        return errors;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setFieldErrors(validationErrors);
            return;
        }

        await submitForm();
    };

    // Submit form data to API
    const submitForm = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAuthToken();
            const url = editingFaq
                ? `${import.meta.env.VITE_BackendApi}/locations/${location_id}/faqs/${editingFaq.faq_id}/update/`
                : `${import.meta.env.VITE_BackendApi}/locations/${location_id}/faqs/create/`;

            const method = editingFaq ? 'PUT' : 'POST';

            const submitData = {
                ...formData,
                question: formData.question.trim(),
                answer: formData.answer.trim()
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
                    throw new Error(responseData.error || responseData.detail || 'Failed to save FAQ');
                }
                return;
            }

            const savedFaq = responseData;

            if (editingFaq) {
                setFaqs(prev => prev.map(faq =>
                    faq.faq_id === savedFaq.faq_id ? savedFaq : faq
                ));
                setSuccess('FAQ updated successfully!');
            } else {
                setFaqs(prev => [...prev, savedFaq]);
                setSuccess('FAQ created successfully!');
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

    // Handle edit FAQ - populate form with existing data
    const handleEdit = (faq) => {
        setFormData({
            question_type: faq.question_type,
            question: faq.question,
            answer: faq.answer
        });
        
        // Check if the question type is in our predefined list
        const isPredefinedType = QUESTION_TYPES.includes(faq.question_type);
        setIsCustomType(!isPredefinedType);
        
        setEditingFaq(faq);
        setIsFormOpen(true);
        setError('');
        setSuccess('');
        setFieldErrors({});
        setShowCsvUpload(false);
    };

    // Handle delete FAQ with confirmation
    const handleDelete = async (faqId) => {
        if (!window.confirm('Are you sure you want to delete this FAQ?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/faqs/${faqId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete FAQ');
            }

            setFaqs(prev => prev.filter(faq => faq.faq_id !== faqId));
            setSuccess('FAQ deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter and sort FAQs based on search and filter criteria
    const getFilteredAndSortedFaqs = () => {
        let filtered = faqs;

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(faq =>
                faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                faq.question_type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(faq => faq.question_type === filterType);
        }

        // Apply sorting
        switch (sortBy) {
            case 'newest':
                filtered = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
            case 'oldest':
                filtered = [...filtered].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'type':
                filtered = [...filtered].sort((a, b) => a.question_type.localeCompare(b.question_type));
                break;
            default:
                break;
        }

        return filtered;
    };

    // Get unique question types for filter dropdown
    const getUniqueQuestionTypes = () => {
        const types = [...new Set(faqs.map(faq => faq.question_type))];
        return types.sort();
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get type badge color
    const getTypeBadgeColor = (type) => {
        const colors = {
            'General': 'bg-blue-100 text-blue-800',
            'Venue & Facilities': 'bg-green-100 text-green-800',
            'Glow Night & Little Leapers': 'bg-purple-100 text-purple-800',
            'Food & Payment': 'bg-yellow-100 text-yellow-800',
            'Safety & Rules': 'bg-red-100 text-red-800',
            'Attractions': 'bg-indigo-100 text-indigo-800',
            'Gift cards purchasing': 'bg-teal-100 text-teal-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    // Copy FAQ to clipboard
    const copyToClipboard = (faq) => {
        const text = `Q: ${faq.question}\nA: ${faq.answer}`;
        navigator.clipboard.writeText(text).then(() => {
            setSuccess('FAQ copied to clipboard!');
            setTimeout(() => setSuccess(''), 2000);
        });
    };

    // Get type icon
    const getTypeIcon = (type) => {
        const icons = {
            'General': '💬',
            'Venue & Facilities': '🏢',
            'Glow Night & Little Leapers': '🌟',
            'Food & Payment': '💰',
            'Safety & Rules': '🛡️',
            'Attractions': '🎯',
            'Gift cards purchasing': '🎁'
        };
        return icons[type] || '❓';
    };

    // Fetch data when component mounts or location_id changes
    useEffect(() => {
        if (location_id) {
            fetchLocation();
            fetchFaqs();
        }
    }, [location_id]);

    const filteredFaqs = getFilteredAndSortedFaqs();

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                    {location && (
                        <p className="text-gray-600 mt-1">
                            Managing FAQs for: <span className="font-semibold">{location.location_name}</span>
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-4">
                    {/* View Mode Toggle */}
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
                        <span>+</span>
                        <span>Add New FAQ</span>
                    </button>
                </div>
            </div>

            {/* Search and Filter Section */}
            {!isFormOpen && faqs.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Search FAQs
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search questions or answers..."
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>

                        {/* Type Filter */}
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
                                {getUniqueQuestionTypes().map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By */}
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
                                <option value="type">Question Type</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="mt-3 text-sm text-gray-600">
                        Showing {filteredFaqs.length} of {faqs.length} FAQs
                        {searchTerm && ` for "${searchTerm}"`}
                        {filterType !== 'all' && ` in ${filterType}`}
                    </div>
                </div>
            )}

            {/* Messages */}
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

            {/* FAQs Display - Table View */}
            {!isFormOpen && location_id && viewMode === 'table' && (
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Question
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Answer
                                    </th>
                                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th> */}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredFaqs.map((faq) => (
                                    <tr key={faq.faq_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <span className="text-lg mr-2">{getTypeIcon(faq.question_type)}</span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(faq.question_type)}`}>
                                                    {faq.question_type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                {faq.question}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-500 max-w-md truncate">
                                                {faq.answer}
                                            </div>
                                        </td>
                                        {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(faq.created_at)}
                                        </td> */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => copyToClipboard(faq)}
                                                    className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
                                                    title="Copy to clipboard"
                                                >
                                                    📋
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(faq)}
                                                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                                    title="Edit FAQ"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(faq.faq_id)}
                                                    className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                                    title="Delete FAQ"
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

            {/* FAQs Display - Card View */}
            {!isFormOpen && location_id && viewMode === 'card' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFaqs.map((faq) => (
                        <div 
                            key={faq.faq_id} 
                            className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                            {/* Card Header */}
                            <div className={`px-6 py-4 border-b ${getTypeBadgeColor(faq.question_type).replace('text', 'border').replace('bg', 'border')}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-2xl">{getTypeIcon(faq.question_type)}</span>
                                        <div>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(faq.question_type)}`}>
                                                {faq.question_type}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button
                                            onClick={() => copyToClipboard(faq)}
                                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                            title="Copy to clipboard"
                                        >
                                            📋
                                        </button>
                                        <button
                                            onClick={() => handleEdit(faq)}
                                            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                            title="Edit FAQ"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleDelete(faq.faq_id)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete FAQ"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                                    {faq.question}
                                </h3>
                                <p className="text-gray-700 text-sm leading-relaxed line-clamp-4 mb-4">
                                    {faq.answer}
                                </p>
                                
                                {/* Stats */}
                                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3">
                                    <div className="flex items-center space-x-4">
                                        <span className="flex items-center space-x-1">
                                            <span>📅</span>
                                            <span>{new Date(faq.created_at).toLocaleDateString()}</span>
                                        </span>
                                        {faq.updated_at !== faq.created_at && (
                                            <span className="flex items-center space-x-1 text-blue-600">
                                                <span>🔄</span>
                                                <span>Updated</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-400">
                                            ID: {faq.faq_id}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Footer */}
                            <div className="px-6 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => {
                                            const text = `Q: ${faq.question}\nA: ${faq.answer}`;
                                            navigator.clipboard.writeText(text);
                                            setSuccess('FAQ copied to clipboard!');
                                            setTimeout(() => setSuccess(''), 2000);
                                        }}
                                        className="text-xs text-gray-600 hover:text-gray-800 flex items-center space-x-1 transition-colors"
                                    >
                                        <span>📝</span>
                                        <span>Copy Text</span>
                                    </button>
                                    <button
                                        onClick={() => handleEdit(faq)}
                                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                                    >
                                        Quick Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isFormOpen && location_id && faqs.length === 0 && !isLoading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">❓</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs Configured</h3>
                    <p className="text-gray-500 mb-4">Add frequently asked questions for this location to help your customers.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add First FAQ
                    </button>
                </div>
            )}

            {/* No Results State */}
            {!isFormOpen && faqs.length > 0 && filteredFaqs.length === 0 && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching FAQs</h3>
                    <p className="text-gray-500 mb-4">
                        No FAQs found matching your search criteria.
                        {searchTerm && ` Try adjusting your search term "${searchTerm}"`}
                        {filterType !== 'all' && ` or filter for "${filterType}"`}
                    </p>
                    <button
                        onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && !isFormOpen && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* FAQ Form */}
            {isFormOpen && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
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

                    {/* CSV Upload Toggle */}
                    <div className="mb-6">
                        <button
                            type="button"
                            onClick={() => setShowCsvUpload(!showCsvUpload)}
                            className={`w-full py-3 px-4 border-2 border-dashed rounded-lg text-center transition-colors ${
                                showCsvUpload 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <span className="text-2xl">📁</span>
                                <span className="font-medium">
                                    {showCsvUpload ? 'Hide CSV Upload' : 'Bulk Upload FAQs via CSV'}
                                </span>
                            </div>
                            {!showCsvUpload && (
                                <p className="text-sm text-gray-600 mt-1">
                                    Upload multiple FAQs at once using a CSV file
                                </p>
                            )}
                        </button>
                    </div>

                    {/* CSV Upload Section */}
                    {showCsvUpload && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h4 className="text-lg font-semibold text-blue-900 mb-3">Bulk Upload via CSV</h4>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-blue-800 mb-2">
                                        Upload CSV File
                                    </label>
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleCsvFileChange}
                                        className="block w-full text-sm text-blue-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                    />
                                    <p className="text-xs text-blue-700 mt-2">
                                        Required columns: <strong>question_type, question, answer</strong>
                                    </p>
                                </div>

                                {/* CSV Preview */}
                                {csvPreview.length > 0 && (
                                    <div>
                                        <h5 className="text-sm font-medium text-blue-800 mb-2">Preview (First {csvPreview.length} rows):</h5>
                                        <div className="bg-white rounded border border-blue-200 overflow-hidden">
                                            <table className="min-w-full divide-y divide-blue-200">
                                                <thead className="bg-blue-100">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-800 uppercase">Type</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-800 uppercase">Question</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-blue-800 uppercase">Answer</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-blue-200">
                                                    {csvPreview.map((row, index) => (
                                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                                                            <td className="px-3 py-2 text-xs text-blue-900">{row.question_type}</td>
                                                            <td className="px-3 py-2 text-xs text-blue-900">{row.question}</td>
                                                            <td className="px-3 py-2 text-xs text-blue-900">{row.answer}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Button */}
                                {csvFile && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={handleCsvUpload}
                                            disabled={isUploading}
                                            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                        >
                                            {isUploading && (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            )}
                                            <span>
                                                {isUploading ? 'Uploading...' : `Upload ${csvPreview.length}+ FAQs`}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-blue-200">
                                <p className="text-sm text-blue-700">
                                    <strong>Note:</strong> The CSV file must have exactly these columns in the header row: 
                                    <code className="bg-blue-100 px-1 mx-1 rounded">question_type</code>, 
                                    <code className="bg-blue-100 px-1 mx-1 rounded">question</code>, 
                                    <code className="bg-blue-100 px-1 mx-1 rounded">answer</code>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Individual FAQ Form */}
                    {!showCsvUpload && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                {/* Question Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Question Type *
                                    </label>
                                    
                                    {!isCustomType ? (
                                        <div className="space-y-2">
                                            <select
                                                name="question_type"
                                                value={formData.question_type}
                                                onChange={handleQuestionTypeChange}
                                                className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                                    fieldErrors.question_type ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            >
                                                <option value="">Select Question Type</option>
                                                {QUESTION_TYPES.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                                <option value="custom">+ Custom Type</option>
                                            </select>
                                            {fieldErrors.question_type && (
                                                <p className="mt-1 text-sm text-red-600">{fieldErrors.question_type}</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    name="custom_question_type"
                                                    value={formData.question_type}
                                                    onChange={handleCustomTypeChange}
                                                    placeholder="Enter custom question type..."
                                                    className={`flex-1 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                                        fieldErrors.question_type ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={resetToDropdown}
                                                    className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                            {fieldErrors.question_type && (
                                                <p className="mt-1 text-sm text-red-600">{fieldErrors.question_type}</p>
                                            )}
                                            <p className="text-xs text-gray-500">
                                                Enter a custom category for this FAQ
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Question */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Question *
                                    </label>
                                    <textarea
                                        name="question"
                                        value={formData.question}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                            fieldErrors.question ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter the frequently asked question..."
                                    />
                                    {fieldErrors.question && (
                                        <p className="mt-1 text-sm text-red-600">{fieldErrors.question}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.question.length}/500 characters
                                    </p>
                                </div>

                                {/* Answer */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Answer *
                                    </label>
                                    <textarea
                                        name="answer"
                                        value={formData.answer}
                                        onChange={handleInputChange}
                                        rows={5}
                                        className={`mt-1 block w-full rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border ${
                                            fieldErrors.answer ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter the detailed answer..."
                                    />
                                    {fieldErrors.answer && (
                                        <p className="mt-1 text-sm text-red-600">{fieldErrors.answer}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formData.answer.length}/1000 characters
                                    </p>
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
                                            ? (editingFaq ? 'Updating...' : 'Creating...')
                                            : (editingFaq ? 'Update FAQ' : 'Create FAQ')
                                        }
                                    </span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default FAQsComp;