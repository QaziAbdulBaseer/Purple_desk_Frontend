
// // // now every thing is looking good.
// // // there is just one bug is remaning.
// // // When user click on the ediot then there is no input will show
// // // that will show 
// // // Birthday & Balloon Package Associations
// // // Managing associations for: Gilroy


// // // +
// // // Add New Association
// // // Edit Association
// // // Selected: Birthday party 1

// // // ✕
// // // Selected Birthday Package
// // // Birthday party 1

// // // $40.00 • 60 minutes • 5 min jumpers

// // // Change
// // // Select Balloon Packages *(Choose one or more packages)
// // // 🎈
// // // No available balloon packages for this birthday package.

// // // Selection Summary
// // // You have selected 1 balloon package(s) to associate with the birthday package.

// // // Premium Balloon Package
// // // ← Back to Packages
// // // Cancel

// // // Update Association



// // // now i want when user click edit then so they input box ot exit code ceritd discunont etc.............


// // import React, { useState, useEffect } from 'react';
// // import { useSelector } from 'react-redux';
// // import { useParams, useNavigate } from 'react-router-dom';

// // const BirthDayAndBalloonComp = () => {
// //   const { location_id } = useParams();
// //   const navigate = useNavigate();
// //   const userData = useSelector((state) => state.auth.userData);

// //   // State declarations
// //   const [associations, setAssociations] = useState([]);
// //   const [birthdayPackages, setBirthdayPackages] = useState([]);
// //   const [balloonPackages, setBalloonPackages] = useState([]);
// //   const [availableBalloons, setAvailableBalloons] = useState([]);
// //   const [selectedBirthdayPackage, setSelectedBirthdayPackage] = useState(null);
// //   const [selectedBalloonPackages, setSelectedBalloonPackages] = useState([]);
// //   const [balloonPackageDetails, setBalloonPackageDetails] = useState({});
// //   const [location, setLocation] = useState(null);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [success, setSuccess] = useState('');
// //   const [isFormOpen, setIsFormOpen] = useState(false);
// //   const [currentStep, setCurrentStep] = useState(1);
// //   const [editingAssociation, setEditingAssociation] = useState(null);
// //   const [fieldErrors, setFieldErrors] = useState({});
// //   const [expandedAssociations, setExpandedAssociations] = useState({});

// //   // Get authentication token
// //   const getAuthToken = () => {
// //     return localStorage.getItem('accessToken') || userData?.token;
// //   };

// //   // Fetch location details
// //   const fetchLocation = async () => {
// //     try {
// //       const token = getAuthToken();
// //       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}`, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       });

// //       if (response.ok) {
// //         const data = await response.json();
// //         setLocation(data);
// //       }
// //     } catch (err) {
// //       console.error('Failed to fetch location:', err);
// //     }
// //   };

// //   // Fetch birthday packages
// //   const fetchBirthdayPackages = async () => {
// //     try {
// //       const token = getAuthToken();
// //       const response = await fetch(`${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/list/`, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       });

// //       if (response.ok) {
// //         const data = await response.json();
// //         setBirthdayPackages(data);
// //       }
// //     } catch (err) {
// //       console.error('Failed to fetch birthday packages:', err);
// //     }
// //   };

// //   // Fetch balloon packages
// //   const fetchBalloonPackages = async () => {
// //     try {
// //       const token = getAuthToken();
// //       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/party_balloon_packages/`, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       });

// //       if (response.ok) {
// //         const data = await response.json();
// //         setBalloonPackages(data);
// //       }
// //     } catch (err) {
// //       console.error('Failed to fetch balloon packages:', err);
// //     }
// //   };

// //   // Fetch available balloon packages for selected birthday package
// //   const fetchAvailableBalloons = async (birthdayPackageId) => {
// //     if (!birthdayPackageId) {
// //       setAvailableBalloons([]);
// //       return;
// //     }

// //     try {
// //       const token = getAuthToken();
// //       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_packages/${birthdayPackageId}/available_balloon_packages/`, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       });

// //       if (response.ok) {
// //         const data = await response.json();
// //         setAvailableBalloons(data);
        
// //         // Initialize balloon package details
// //         const initialDetails = {};
// //         data.forEach(balloon => {
// //           initialDetails[balloon.party_balloon_package_id] = {
// //             code: '',
// //             credit: '',
// //             discount: '',
// //             is_active: true
// //           };
// //         });
// //         setBalloonPackageDetails(initialDetails);
// //       } else {
// //         setAvailableBalloons([]);
// //         setBalloonPackageDetails({});
// //       }
// //     } catch (err) {
// //       console.error('Failed to fetch available balloons:', err);
// //       setAvailableBalloons([]);
// //       setBalloonPackageDetails({});
// //     }
// //   };

// //   // Fetch associations
// //   const fetchAssociations = async () => {
// //     if (!location_id) return;

// //     setIsLoading(true);
// //     setError('');
// //     try {
// //       const token = getAuthToken();
// //       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/`, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       });

// //       if (!response.ok) {
// //         throw new Error('Failed to fetch associations');
// //       }

// //       const data = await response.json();
// //       setAssociations(data);
// //     } catch (err) {
// //       setError(err.message);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Handle birthday package selection
// //   const handleBirthdayPackageSelect = (birthdayPackage) => {
// //     setSelectedBirthdayPackage(birthdayPackage);
// //     fetchAvailableBalloons(birthdayPackage.birthday_party_packages_id);
// //     setCurrentStep(2);
// //   };

// //   // Handle balloon package checkbox change
// //   const handleBalloonPackageToggle = (balloonPackage) => {
// //     setSelectedBalloonPackages(prev => {
// //       const isSelected = prev.some(pkg => pkg.party_balloon_package_id === balloonPackage.party_balloon_package_id);
// //       if (isSelected) {
// //         return prev.filter(pkg => pkg.party_balloon_package_id !== balloonPackage.party_balloon_package_id);
// //       } else {
// //         return [...prev, balloonPackage];
// //       }
// //     });
// //   };

// //   // Handle balloon package detail change
// //   const handleBalloonDetailChange = (balloonPackageId, field, value) => {
// //     setBalloonPackageDetails(prev => ({
// //       ...prev,
// //       [balloonPackageId]: {
// //         ...prev[balloonPackageId],
// //         [field]: value
// //       }
// //     }));
// //   };

// //   // Reset form
// //   const resetForm = () => {
// //     setSelectedBirthdayPackage(null);
// //     setSelectedBalloonPackages([]);
// //     setBalloonPackageDetails({});
// //     setAvailableBalloons([]);
// //     setCurrentStep(1);
// //     setEditingAssociation(null);
// //     setError('');
// //     setSuccess('');
// //     setFieldErrors({});
// //   };

// //   // Validate form
// //   const validateForm = () => {
// //     const errors = {};

// //     if (!selectedBirthdayPackage) {
// //       errors.birthday_party_package = 'Birthday package is required';
// //     }

// //     if (selectedBalloonPackages.length === 0) {
// //       errors.party_balloon_packages = 'At least one balloon package must be selected';
// //     }

// //     // Validate each selected balloon package details
// //     selectedBalloonPackages.forEach(balloonPkg => {
// //       const details = balloonPackageDetails[balloonPkg.party_balloon_package_id];
// //       if (details) {
// //         if (details.credit && details.credit < 0) {
// //           errors[`credit_${balloonPkg.party_balloon_package_id}`] = 'Credit cannot be negative';
// //         }
// //         if (details.discount && (details.discount < 0 || details.discount > 100)) {
// //           errors[`discount_${balloonPkg.party_balloon_package_id}`] = 'Discount must be between 0 and 100';
// //         }
// //       }
// //     });

// //     return errors;
// //   };

// //   // Handle form submission - Create multiple associations
// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     const validationErrors = validateForm();
// //     if (Object.keys(validationErrors).length > 0) {
// //       setFieldErrors(validationErrors);
// //       return;
// //     }

// //     setIsLoading(true);
// //     setError('');
// //     setSuccess('');

// //     try {
// //       const token = getAuthToken();
      
// //       // If editing, update the single association
// //       if (editingAssociation) {
// //         const url = `${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/${editingAssociation.birthday_party_balloon_id}/update/`;
        
// //         const balloonPkg = selectedBalloonPackages[0];
// //         const details = balloonPackageDetails[balloonPkg.party_balloon_package_id];
        
// //         const submitData = {
// //           birthday_party_package: selectedBirthdayPackage.birthday_party_packages_id,
// //           party_balloon_package: balloonPkg.party_balloon_package_id,
// //           code: details?.code || '',
// //           credit: details?.credit ? parseFloat(details.credit).toFixed(2) : '0.00',
// //           discount: details?.discount ? parseFloat(details.discount).toFixed(2) : '0.00',
// //           is_active: details?.is_active !== false
// //         };

// //         const response = await fetch(url, {
// //           method: 'PUT',
// //           headers: {
// //             'Authorization': `Bearer ${token}`,
// //             'Content-Type': 'application/json'
// //           },
// //           body: JSON.stringify(submitData)
// //         });

// //         const responseData = await response.json();

// //         if (!response.ok) {
// //           if (response.status === 400) {
// //             setFieldErrors(responseData);
// //             setError('Please fix the validation errors below');
// //           } else {
// //             throw new Error(responseData.error || responseData.detail || 'Failed to save association');
// //           }
// //           return;
// //         }

// //         setAssociations(prev => prev.map(assoc =>
// //           assoc.birthday_party_balloon_id === responseData.birthday_party_balloon_id ? responseData : assoc
// //         ));
// //         setSuccess('Association updated successfully!');
// //       } else {
// //         // Create multiple associations for each selected balloon package
// //         const createPromises = selectedBalloonPackages.map(balloonPkg => {
// //           const details = balloonPackageDetails[balloonPkg.party_balloon_package_id];
          
// //           const submitData = {
// //             birthday_party_package: selectedBirthdayPackage.birthday_party_packages_id,
// //             party_balloon_package: balloonPkg.party_balloon_package_id,
// //             code: details?.code || '',
// //             credit: details?.credit ? parseFloat(details.credit).toFixed(2) : '0.00',
// //             discount: details?.discount ? parseFloat(details.discount).toFixed(2) : '0.00',
// //             is_active: details?.is_active !== false
// //           };

// //           return fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/create/`, {
// //             method: 'POST',
// //             headers: {
// //               'Authorization': `Bearer ${token}`,
// //               'Content-Type': 'application/json'
// //             },
// //             body: JSON.stringify(submitData)
// //           });
// //         });

// //         const responses = await Promise.all(createPromises);
// //         const results = await Promise.all(responses.map(response => response.json()));

// //         // Check for any errors
// //         const hasError = responses.some(response => !response.ok);
// //         if (hasError) {
// //           const errorResult = results.find(result => result.error);
// //           throw new Error(errorResult?.error || 'Failed to create some associations');
// //         }

// //         setAssociations(prev => [...prev, ...results]);
// //         setSuccess(`${results.length} association(s) created successfully!`);
// //       }

// //       resetForm();
// //       setIsFormOpen(false);
// //       setTimeout(() => setSuccess(''), 5000);
// //       fetchAssociations();
// //     } catch (err) {
// //       setError(err.message);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Handle edit association
// //   const handleEdit = (association) => {
// //     const birthdayPkg = birthdayPackages.find(pkg => pkg.birthday_party_packages_id === association.birthday_party_package);
// //     const balloonPkg = balloonPackages.find(pkg => pkg.party_balloon_package_id === association.party_balloon_package);
    
// //     setSelectedBirthdayPackage(birthdayPkg);
// //     setSelectedBalloonPackages(balloonPkg ? [balloonPkg] : []);
    
// //     // Set details for the balloon package being edited
// //     if (balloonPkg) {
// //       setBalloonPackageDetails({
// //         [balloonPkg.party_balloon_package_id]: {
// //           code: association.code || '',
// //           credit: association.credit || '',
// //           discount: association.discount || '',
// //           is_active: association.is_active
// //         }
// //       });
// //     }
    
// //     setEditingAssociation(association);
// //     setIsFormOpen(true);
// //     setCurrentStep(2);
// //     setError('');
// //     setSuccess('');
// //     setFieldErrors({});
// //   };

// //   // Handle delete association
// //   const handleDelete = async (associationId) => {
// //     if (!window.confirm('Are you sure you want to delete this association?')) {
// //       return;
// //     }

// //     setIsLoading(true);
// //     try {
// //       const token = getAuthToken();
// //       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/${associationId}/delete/`, {
// //         method: 'DELETE',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       });

// //       if (!response.ok) {
// //         throw new Error('Failed to delete association');
// //       }

// //       setAssociations(prev => prev.filter(assoc => assoc.birthday_party_balloon_id !== associationId));
// //       setSuccess('Association deleted successfully!');
// //       setTimeout(() => setSuccess(''), 3000);
// //     } catch (err) {
// //       setError(err.message);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Toggle association status
// //   const toggleAssociationStatus = async (association) => {
// //     setIsLoading(true);
// //     try {
// //       const token = getAuthToken();
// //       const updatedData = {
// //         ...association,
// //         is_active: !association.is_active
// //       };

// //       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/${association.birthday_party_balloon_id}/update/`, {
// //         method: 'PUT',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify(updatedData)
// //       });

// //       if (!response.ok) {
// //         throw new Error('Failed to update association status');
// //       }

// //       const responseData = await response.json();
// //       setAssociations(prev => prev.map(item =>
// //         item.birthday_party_balloon_id === association.birthday_party_balloon_id ? responseData : item
// //       ));

// //       setSuccess(`Association ${!association.is_active ? 'activated' : 'deactivated'} successfully!`);
// //       setTimeout(() => setSuccess(''), 3000);
// //     } catch (err) {
// //       setError(err.message);
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Toggle association expansion
// //   const toggleAssociationExpansion = (birthdayPackageId) => {
// //     setExpandedAssociations(prev => ({
// //       ...prev,
// //       [birthdayPackageId]: !prev[birthdayPackageId]
// //     }));
// //   };

// //   // Go back to birthday package selection
// //   const handleBackToBirthdaySelection = () => {
// //     setCurrentStep(1);
// //     setSelectedBirthdayPackage(null);
// //     setSelectedBalloonPackages([]);
// //     setBalloonPackageDetails({});
// //   };

// //   // Group associations by birthday package for better display
// //   const groupedAssociations = associations.reduce((acc, association) => {
// //     const birthdayPackageId = association.birthday_party_package;
// //     if (!acc[birthdayPackageId]) {
// //       acc[birthdayPackageId] = {
// //         birthdayPackage: birthdayPackages.find(pkg => pkg.birthday_party_packages_id === birthdayPackageId),
// //         balloonAssociations: []
// //       };
// //     }
// //     acc[birthdayPackageId].balloonAssociations.push(association);
// //     return acc;
// //   }, {});

// //   // Fetch data on component mount
// //   useEffect(() => {
// //     if (location_id) {
// //       fetchLocation();
// //       fetchBirthdayPackages();
// //       fetchBalloonPackages();
// //       fetchAssociations();
// //     }
// //   }, [location_id]);

// //   return (
// //     <div className="space-y-6">
// //       <div className="flex justify-between items-center">
// //         <div>
// //           <h2 className="text-2xl font-bold text-gray-900">Birthday & Balloon Package Associations</h2>
// //           {location && (
// //             <p className="text-gray-600 mt-1">
// //               Managing associations for: <span className="font-semibold">{location.location_name}</span>
// //             </p>
// //           )}
// //         </div>
// //         <button
// //           onClick={() => {
// //             resetForm();
// //             setIsFormOpen(true);
// //             setCurrentStep(1);
// //           }}
// //           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
// //         >
// //           <span>+</span>
// //           <span>Add New Association</span>
// //         </button>
// //       </div>

// //       {error && (
// //         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
// //           {error}
// //         </div>
// //       )}
// //       {success && (
// //         <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
// //           {success}
// //         </div>
// //       )}

// //       {/* Associations List */}
// //       {!isFormOpen && location_id && (
// //         <div className="space-y-6">
// //           {Object.entries(groupedAssociations).map(([birthdayPackageId, group]) => {
// //             const birthdayPackage = group.birthdayPackage;
// //             const isExpanded = expandedAssociations[birthdayPackageId];
            
// //             // Get balloon package names for this birthday package
// //             const balloonPackageNames = group.balloonAssociations.map(association => {
// //               const balloonPkg = balloonPackages.find(pkg => pkg.party_balloon_package_id === association.party_balloon_package);
// //               return balloonPkg?.package_name || 'Unknown Balloon Package';
// //             });

// //             return (
// //               <div key={birthdayPackageId} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
// //                 {/* Birthday Package Header */}
// //                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
// //                   <div className="flex justify-between items-start">
// //                     <div className="flex-1">
// //                       <h3 className="text-xl font-bold text-gray-900 mb-2">
// //                         {birthdayPackage?.package_name || 'Unknown Package'}
// //                       </h3>
                      
// //                       {/* Balloon Package Names - Displayed under birthday package name */}
// //                       <div className="mb-3">
// //                         <p className="text-sm text-gray-600 font-medium">Balloon Packages:</p>
// //                         <div className="flex flex-wrap gap-2 mt-1">
// //                           {balloonPackageNames.map((name, index) => (
// //                             <span 
// //                               key={index}
// //                               className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
// //                             >
// //                               {name}
// //                             </span>
// //                           ))}
// //                         </div>
// //                       </div>

// //                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
// //                         <div>
// //                           <span className="text-gray-600">Base Price:</span>
// //                           <p className="font-semibold text-lg">${parseFloat(birthdayPackage?.price || 0).toFixed(2)}</p>
// //                         </div>
// //                         <div>
// //                           <span className="text-gray-600">Jump Time:</span>
// //                           <p className="font-medium">{birthdayPackage?.jump_time}</p>
// //                         </div>
// //                         <div>
// //                           <span className="text-gray-600">Party Room:</span>
// //                           <p className="font-medium">{birthdayPackage?.party_room_time}</p>
// //                         </div>
// //                         <div>
// //                           <span className="text-gray-600">Min Jumpers:</span>
// //                           <p className="font-medium">{birthdayPackage?.minimum_jumpers}</p>
// //                         </div>
// //                       </div>
// //                     </div>
// //                     <button
// //                       onClick={() => toggleAssociationExpansion(birthdayPackageId)}
// //                       className="ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors"
// //                     >
// //                       <svg
// //                         className={`w-5 h-5 text-blue-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
// //                         fill="none"
// //                         stroke="currentColor"
// //                         viewBox="0 0 24 24"
// //                       >
// //                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
// //                       </svg>
// //                     </button>
// //                   </div>
// //                 </div>

// //                 {/* Expanded Association Details */}
// //                 {isExpanded && (
// //                   <div className="p-6 bg-gray-50">
// //                     <h4 className="text-lg font-semibold text-gray-900 mb-4">Association Details</h4>
// //                     <div className="space-y-6">
// //                       {group.balloonAssociations.map((association) => {
// //                         const balloonPackage = balloonPackages.find(pkg => pkg.party_balloon_package_id === association.party_balloon_package);
                        
// //                         return (
// //                           <div key={association.birthday_party_balloon_id} className="bg-white rounded-lg border border-gray-200 p-6">
// //                             <div className="flex justify-between items-start">
// //                               <div className="flex-1">
// //                                 <div className="flex items-start justify-between">
// //                                   <div>
// //                                     <h5 className="font-semibold text-gray-900 text-lg mb-2">
// //                                       {balloonPackage?.package_name || 'Unknown Balloon Package'}
// //                                     </h5>
// //                                     <div className="flex items-center space-x-3 mb-3">
// //                                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${association.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
// //                                         {association.is_active ? 'Active' : 'Inactive'}
// //                                       </span>
// //                                       {association.code && (
// //                                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
// //                                           Code: {association.code}
// //                                         </span>
// //                                       )}
// //                                       {association.credit > 0 && (
// //                                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
// //                                           Credit: ${parseFloat(association.credit).toFixed(2)}
// //                                         </span>
// //                                       )}
// //                                       {association.discount > 0 && (
// //                                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
// //                                           Discount: {parseFloat(association.discount).toFixed(2)}%
// //                                         </span>
// //                                       )}
// //                                     </div>
// //                                   </div>
// //                                 </div>

// //                                 {/* Balloon Package Details */}
// //                                 {balloonPackage && (
// //                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
// //                                     <div>
// //                                       <span className="text-gray-600 font-medium">Price:</span>
// //                                       <p className="font-semibold text-lg">${parseFloat(balloonPackage.price).toFixed(2)}</p>
// //                                     </div>
// //                                     <div>
// //                                       <span className="text-gray-600 font-medium">Priority:</span>
// //                                       <p className="font-medium">{balloonPackage.call_flow_priority}</p>
// //                                     </div>
// //                                     <div className="md:col-span-2">
// //                                       <span className="text-gray-600 font-medium">Inclusions:</span>
// //                                       <p className="font-medium mt-1">{balloonPackage.package_inclusions}</p>
// //                                     </div>
// //                                     {balloonPackage.promotional_pitch && (
// //                                       <div className="md:col-span-2">
// //                                         <span className="text-gray-600 font-medium">Pitch:</span>
// //                                         <p className="font-medium italic mt-1">"{balloonPackage.promotional_pitch}"</p>
// //                                       </div>
// //                                     )}
// //                                   </div>
// //                                 )}
// //                               </div>
// //                               <div className="flex space-x-2 ml-4">
// //                                 <button
// //                                   onClick={() => toggleAssociationStatus(association)}
// //                                   className={`px-3 py-1 rounded-md border transition-colors ${association.is_active ? 'text-orange-600 border-orange-200 hover:border-orange-300' : 'text-green-600 border-green-200 hover:border-green-300'}`}
// //                                 >
// //                                   {association.is_active ? 'Deactivate' : 'Activate'}
// //                                 </button>
// //                                 <button
// //                                   onClick={() => handleEdit(association)}
// //                                   className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
// //                                 >
// //                                   Edit
// //                                 </button>
// //                                 <button
// //                                   onClick={() => handleDelete(association.birthday_party_balloon_id)}
// //                                   className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-200 hover:border-red-300 transition-colors"
// //                                 >
// //                                   Delete
// //                                 </button>
// //                               </div>
// //                             </div>
// //                           </div>
// //                         );
// //                       })}
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
// //             );
// //           })}
// //         </div>
// //       )}

// //       {!isFormOpen && location_id && associations.length === 0 && !isLoading && (
// //         <div className="bg-white rounded-lg shadow p-8 text-center">
// //           <div className="text-gray-400 text-6xl mb-4">🎈</div>
// //           <h3 className="text-lg font-medium text-gray-900 mb-2">No Associations Configured</h3>
// //           <p className="text-gray-500 mb-4">Connect birthday packages with balloon packages to get started.</p>
// //           <button
// //             onClick={() => {
// //               setIsFormOpen(true);
// //               setCurrentStep(1);
// //             }}
// //             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
// //           >
// //             Add Association
// //           </button>
// //         </div>
// //       )}

// //       {isLoading && !isFormOpen && (
// //         <div className="flex justify-center items-center py-12">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
// //         </div>
// //       )}

// //       {/* Association Form */}
// //       {isFormOpen && (
// //         <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
// //           <div className="flex justify-between items-center mb-6">
// //             <div>
// //               <h3 className="text-xl font-semibold text-gray-900">
// //                 {editingAssociation ? 'Edit Association' : 'Add New Association'}
// //               </h3>
// //               {currentStep === 2 && selectedBirthdayPackage && (
// //                 <p className="text-gray-600 mt-1">
// //                   Selected: <span className="font-semibold">{selectedBirthdayPackage.package_name}</span>
// //                 </p>
// //               )}
// //             </div>
// //             <button
// //               onClick={() => {
// //                 setIsFormOpen(false);
// //                 resetForm();
// //               }}
// //               className="text-gray-400 hover:text-gray-600 transition-colors"
// //             >
// //               ✕
// //             </button>
// //           </div>

// //           {/* Step 1: Birthday Package Selection */}
// //           {currentStep === 1 && (
// //             <div className="space-y-6">
// //               <h4 className="text-lg font-medium text-gray-900 text-center mb-6">Select a Birthday Party Package</h4>
              
// //               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //                 {birthdayPackages.map((pkg) => (
// //                   <div
// //                     key={pkg.birthday_party_packages_id}
// //                     className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
// //                     onClick={() => handleBirthdayPackageSelect(pkg)}
// //                   >
// //                     <h5 className="font-semibold text-lg text-gray-900 mb-2">{pkg.package_name}</h5>
                    
// //                     <div className="space-y-2 text-sm">
// //                       <div className="flex justify-between">
// //                         <span className="text-gray-600">Price:</span>
// //                         <span className="font-semibold">${parseFloat(pkg.price).toFixed(2)}</span>
// //                       </div>
// //                       <div className="flex justify-between">
// //                         <span className="text-gray-600">Jump Time:</span>
// //                         <span className="font-medium">{pkg.jump_time}</span>
// //                       </div>
// //                       <div className="flex justify-between">
// //                         <span className="text-gray-600">Party Room:</span>
// //                         <span className="font-medium">{pkg.party_room_time}</span>
// //                       </div>
// //                       <div className="flex justify-between">
// //                         <span className="text-gray-600">Min Jumpers:</span>
// //                         <span className="font-medium">{pkg.minimum_jumpers}</span>
// //                       </div>
// //                       <div className="flex justify-between">
// //                         <span className="text-gray-600">Priority:</span>
// //                         <span className="font-medium">{pkg.birthday_party_priority === 999 ? 'Do not Pitch' : pkg.birthday_party_priority}</span>
// //                       </div>
// //                     </div>

// //                     {pkg.birthday_party_pitch && (
// //                       <p className="mt-3 text-gray-700 text-sm italic">"{pkg.birthday_party_pitch}"</p>
// //                     )}

// //                     <div className="mt-4 flex justify-between items-center">
// //                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
// //                         {pkg.is_available ? 'Available' : 'Unavailable'}
// //                       </span>
// //                       <button className="text-blue-600 hover:text-blue-800 font-medium">
// //                         Select →
// //                       </button>
// //                     </div>
// //                   </div>
// //                 ))}
// //               </div>

// //               {birthdayPackages.length === 0 && (
// //                 <div className="text-center py-8">
// //                   <div className="text-gray-400 text-6xl mb-4">🎂</div>
// //                   <p className="text-gray-500">No birthday packages available.</p>
// //                 </div>
// //               )}
// //             </div>
// //           )}

// //           {/* Step 2: Balloon Package Selection with Individual Details */}
// //           {currentStep === 2 && (
// //             <form onSubmit={handleSubmit} className="space-y-6">
// //               {/* Selected Birthday Package Summary */}
// //               {selectedBirthdayPackage && (
// //                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
// //                   <h4 className="font-semibold text-blue-900 mb-2">Selected Birthday Package</h4>
// //                   <div className="flex justify-between items-center">
// //                     <div>
// //                       <p className="text-blue-800 font-medium">{selectedBirthdayPackage.package_name}</p>
// //                       <p className="text-blue-700 text-sm">
// //                         ${parseFloat(selectedBirthdayPackage.price).toFixed(2)} • {selectedBirthdayPackage.jump_time} • {selectedBirthdayPackage.minimum_jumpers} min jumpers
// //                       </p>
// //                     </div>
// //                     <button
// //                       type="button"
// //                       onClick={handleBackToBirthdaySelection}
// //                       className="text-blue-600 hover:text-blue-800 text-sm font-medium"
// //                     >
// //                       Change
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}

// //               {/* Balloon Package Selection */}
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-3">
// //                   Select Balloon Packages *
// //                   <span className="text-xs text-gray-500 ml-2">(Choose one or more packages)</span>
// //                 </label>
                
// //                 {fieldErrors.party_balloon_packages && (
// //                   <p className="text-red-600 text-sm mb-3">{fieldErrors.party_balloon_packages}</p>
// //                 )}

// //                 <div className="space-y-4">
// //                   {availableBalloons.map((balloonPkg) => {
// //                     const isSelected = selectedBalloonPackages.some(
// //                       pkg => pkg.party_balloon_package_id === balloonPkg.party_balloon_package_id
// //                     );
// //                     const details = balloonPackageDetails[balloonPkg.party_balloon_package_id] || {};

// //                     return (
// //                       <div
// //                         key={balloonPkg.party_balloon_package_id}
// //                         className={`border-2 rounded-lg p-4 transition-all duration-200 ${
// //                           isSelected 
// //                             ? 'border-blue-500 bg-blue-50' 
// //                             : 'border-gray-200 bg-white'
// //                         }`}
// //                       >
// //                         <div className="flex items-start space-x-3">
// //                           <input
// //                             type="checkbox"
// //                             checked={isSelected}
// //                             onChange={() => handleBalloonPackageToggle(balloonPkg)}
// //                             className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
// //                           />
// //                           <div className="flex-1">
// //                             <div className="flex justify-between items-start">
// //                               <div className="flex-1">
// //                                 <h5 className="font-semibold text-gray-900">{balloonPkg.package_name}</h5>
// //                                 <p className="text-lg font-bold text-green-600 mt-1">
// //                                   ${parseFloat(balloonPkg.price).toFixed(2)}
// //                                 </p>
// //                                 <p className="text-sm text-gray-600 mt-1">
// //                                   <span className="font-medium">Priority:</span> {balloonPkg.call_flow_priority}
// //                                 </p>
// //                                 <p className="text-sm text-gray-700 mt-2">
// //                                   {balloonPkg.package_inclusions}
// //                                 </p>
// //                                 {balloonPkg.promotional_pitch && (
// //                                   <p className="text-sm text-gray-600 italic mt-2">
// //                                     "{balloonPkg.promotional_pitch}"
// //                                   </p>
// //                                 )}
// //                               </div>
// //                             </div>

// //                             {/* Individual Details for Each Balloon Package */}
// //                             {isSelected && (
// //                               <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
// //                                 <h6 className="font-medium text-gray-900 mb-3">Association Details for {balloonPkg.package_name}</h6>
// //                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// //                                   {/* Code */}
// //                                   <div>
// //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                       Code
// //                                     </label>
// //                                     <input
// //                                       type="text"
// //                                       value={details.code || ''}
// //                                       onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'code', e.target.value)}
// //                                       className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
// //                                       placeholder="Enter code"
// //                                     />
// //                                   </div>

// //                                   {/* Credit */}
// //                                   <div>
// //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                       Credit ($)
// //                                     </label>
// //                                     <div className="relative">
// //                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //                                         <span className="text-gray-500 text-sm">$</span>
// //                                       </div>
// //                                       <input
// //                                         type="number"
// //                                         value={details.credit || ''}
// //                                         onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'credit', e.target.value)}
// //                                         step="0.01"
// //                                         min="0"
// //                                         className={`w-full pl-7 rounded-md border ${fieldErrors[`credit_${balloonPkg.party_balloon_package_id}`] ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
// //                                         placeholder="0.00"
// //                                       />
// //                                     </div>
// //                                     {fieldErrors[`credit_${balloonPkg.party_balloon_package_id}`] && (
// //                                       <p className="mt-1 text-xs text-red-600">{fieldErrors[`credit_${balloonPkg.party_balloon_package_id}`]}</p>
// //                                     )}
// //                                   </div>

// //                                   {/* Discount */}
// //                                   <div>
// //                                     <label className="block text-sm font-medium text-gray-700 mb-1">
// //                                       Discount (%)
// //                                     </label>
// //                                     <div className="relative">
// //                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
// //                                         <span className="text-gray-500 text-sm">%</span>
// //                                       </div>
// //                                       <input
// //                                         type="number"
// //                                         value={details.discount || ''}
// //                                         onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'discount', e.target.value)}
// //                                         step="0.01"
// //                                         min="0"
// //                                         max="100"
// //                                         className={`w-full pl-7 rounded-md border ${fieldErrors[`discount_${balloonPkg.party_balloon_package_id}`] ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
// //                                         placeholder="0.00"
// //                                       />
// //                                     </div>
// //                                     {fieldErrors[`discount_${balloonPkg.party_balloon_package_id}`] && (
// //                                       <p className="mt-1 text-xs text-red-600">{fieldErrors[`discount_${balloonPkg.party_balloon_package_id}`]}</p>
// //                                     )}
// //                                   </div>
// //                                 </div>

// //                                 {/* Active Status for Individual Package */}
// //                                 <div className="flex items-center space-x-2 mt-3">
// //                                   <input
// //                                     type="checkbox"
// //                                     checked={details.is_active !== false}
// //                                     onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'is_active', e.target.checked)}
// //                                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
// //                                   />
// //                                   <label className="block text-sm font-medium text-gray-700">
// //                                     This association active
// //                                   </label>
// //                                 </div>
// //                               </div>
// //                             )}
// //                           </div>
// //                         </div>
// //                       </div>
// //                     );
// //                   })}
// //                 </div>

// //                 {availableBalloons.length === 0 && (
// //                   <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
// //                     <div className="text-gray-400 text-6xl mb-4">🎈</div>
// //                     <p className="text-gray-500">No available balloon packages for this birthday package.</p>
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Selection Summary */}
// //               {selectedBalloonPackages.length > 0 && (
// //                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
// //                   <h4 className="font-semibold text-green-900 mb-2">Selection Summary</h4>
// //                   <p className="text-green-800">
// //                     You have selected <span className="font-bold">{selectedBalloonPackages.length}</span> balloon package(s) to associate with the birthday package.
// //                   </p>
// //                   <div className="mt-2 flex flex-wrap gap-2">
// //                     {selectedBalloonPackages.map(pkg => (
// //                       <span key={pkg.party_balloon_package_id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
// //                         {pkg.package_name}
// //                       </span>
// //                     ))}
// //                   </div>
// //                 </div>
// //               )}

// //               <div className="flex justify-between space-x-3 pt-6 border-t border-gray-200">
// //                 <button
// //                   type="button"
// //                   onClick={handleBackToBirthdaySelection}
// //                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
// //                 >
// //                   ← Back to Packages
// //                 </button>
// //                 <div className="flex space-x-3">
// //                   <button
// //                     type="button"
// //                     onClick={() => {
// //                       setIsFormOpen(false);
// //                       resetForm();
// //                     }}
// //                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
// //                   >
// //                     Cancel
// //                   </button>
// //                   <button
// //                     type="submit"
// //                     disabled={isLoading}
// //                     className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
// //                   >
// //                     {isLoading && (
// //                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
// //                     )}
// //                     <span>
// //                       {isLoading
// //                         ? (editingAssociation ? 'Updating...' : 'Creating...')
// //                         : (editingAssociation ? 'Update Association' : `Create ${selectedBalloonPackages.length} Association(s)`)
// //                       }
// //                     </span>
// //                   </button>
// //                 </div>
// //               </div>
// //             </form>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default BirthDayAndBalloonComp;




// // Kindly write the compleat code. line by line word by word 
// // Now just one bug is remaning
// // When user click the edit button then the code , credit and discount valuse are not showing.
// // and properly show that that (code is already exist = )
// // {
// //     "code": [
// //         "birthday balloon package association with this code already exists."
// //     ]
// // }
// // for not its just show that == =Failed to create some associations

// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useParams, useNavigate } from 'react-router-dom';

// const BirthDayAndBalloonComp = () => {
//   const { location_id } = useParams();
//   const navigate = useNavigate();
//   const userData = useSelector((state) => state.auth.userData);

//   // State declarations
//   const [associations, setAssociations] = useState([]);
//   const [birthdayPackages, setBirthdayPackages] = useState([]);
//   const [balloonPackages, setBalloonPackages] = useState([]);
//   const [availableBalloons, setAvailableBalloons] = useState([]);
//   const [selectedBirthdayPackage, setSelectedBirthdayPackage] = useState(null);
//   const [selectedBalloonPackages, setSelectedBalloonPackages] = useState([]);
//   const [balloonPackageDetails, setBalloonPackageDetails] = useState({});
//   const [location, setLocation] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(1);
//   const [editingAssociation, setEditingAssociation] = useState(null);
//   const [fieldErrors, setFieldErrors] = useState({});
//   const [expandedAssociations, setExpandedAssociations] = useState({});

//   // Get authentication token
//   const getAuthToken = () => {
//     return localStorage.getItem('accessToken') || userData?.token;
//   };

//   // Fetch location details
//   const fetchLocation = async () => {
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setLocation(data);
//       }
//     } catch (err) {
//       console.error('Failed to fetch location:', err);
//     }
//   };

//   // Fetch birthday packages
//   const fetchBirthdayPackages = async () => {
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/list/`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setBirthdayPackages(data);
//       }
//     } catch (err) {
//       console.error('Failed to fetch birthday packages:', err);
//     }
//   };

//   // Fetch balloon packages
//   const fetchBalloonPackages = async () => {
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/party_balloon_packages/`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setBalloonPackages(data);
//       }
//     } catch (err) {
//       console.error('Failed to fetch balloon packages:', err);
//     }
//   };

//   // Fetch available balloon packages for selected birthday package
//   const fetchAvailableBalloons = async (birthdayPackageId) => {
//     if (!birthdayPackageId) {
//       setAvailableBalloons([]);
//       return;
//     }

//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_packages/${birthdayPackageId}/available_balloon_packages/`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setAvailableBalloons(data);
        
//         // Initialize balloon package details
//         const initialDetails = {};
//         data.forEach(balloon => {
//           initialDetails[balloon.party_balloon_package_id] = {
//             code: '',
//             credit: '',
//             discount: '',
//             is_active: true
//           };
//         });
//         setBalloonPackageDetails(initialDetails);
//       } else {
//         setAvailableBalloons([]);
//         setBalloonPackageDetails({});
//       }
//     } catch (err) {
//       console.error('Failed to fetch available balloons:', err);
//       setAvailableBalloons([]);
//       setBalloonPackageDetails({});
//     }
//   };

//   // Fetch ALL balloon packages for a location (for edit mode)
//   const fetchAllBalloonPackagesForEdit = async (birthdayPackageId, editingBalloonPackageId) => {
//     if (!birthdayPackageId) {
//       setAvailableBalloons([]);
//       return;
//     }

//     try {
//       const token = getAuthToken();
//       // First get available balloons
//       const availableResponse = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_packages/${birthdayPackageId}/available_balloon_packages/`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       let availableBalloonsData = [];
//       if (availableResponse.ok) {
//         availableBalloonsData = await availableResponse.json();
//       }

//       // Then get the specific balloon package being edited
//       const allBalloonsResponse = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/party_balloon_packages/`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (allBalloonsResponse.ok) {
//         const allBalloons = await allBalloonsResponse.json();
//         const editingBalloonPackage = allBalloons.find(pkg => pkg.party_balloon_package_id === editingBalloonPackageId);
        
//         // Combine available balloons with the editing balloon package
//         const combinedBalloons = [...availableBalloonsData];
//         if (editingBalloonPackage && !availableBalloonsData.some(pkg => pkg.party_balloon_package_id === editingBalloonPackageId)) {
//           combinedBalloons.push(editingBalloonPackage);
//         }
        
//         setAvailableBalloons(combinedBalloons);
        
//         // Initialize balloon package details
//         const initialDetails = {};
//         combinedBalloons.forEach(balloon => {
//           initialDetails[balloon.party_balloon_package_id] = {
//             code: '',
//             credit: '',
//             discount: '',
//             is_active: true
//           };
//         });
//         setBalloonPackageDetails(initialDetails);
//       }
//     } catch (err) {
//       console.error('Failed to fetch balloons for edit:', err);
//       setAvailableBalloons([]);
//       setBalloonPackageDetails({});
//     }
//   };

//   // Fetch associations
//   const fetchAssociations = async () => {
//     if (!location_id) return;

//     setIsLoading(true);
//     setError('');
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch associations');
//       }

//       const data = await response.json();
//       setAssociations(data);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle birthday package selection
//   const handleBirthdayPackageSelect = (birthdayPackage) => {
//     setSelectedBirthdayPackage(birthdayPackage);
//     if (editingAssociation) {
//       // If editing, fetch all balloons including the one being edited
//       fetchAllBalloonPackagesForEdit(birthdayPackage.birthday_party_packages_id, editingAssociation.party_balloon_package);
//     } else {
//       // If creating new, fetch only available balloons
//       fetchAvailableBalloons(birthdayPackage.birthday_party_packages_id);
//     }
//     setCurrentStep(2);
//   };

//   // Handle balloon package checkbox change
//   const handleBalloonPackageToggle = (balloonPackage) => {
//     setSelectedBalloonPackages(prev => {
//       const isSelected = prev.some(pkg => pkg.party_balloon_package_id === balloonPackage.party_balloon_package_id);
//       if (isSelected) {
//         return prev.filter(pkg => pkg.party_balloon_package_id !== balloonPackage.party_balloon_package_id);
//       } else {
//         return [...prev, balloonPackage];
//       }
//     });
//   };

//   // Handle balloon package detail change
//   const handleBalloonDetailChange = (balloonPackageId, field, value) => {
//     setBalloonPackageDetails(prev => ({
//       ...prev,
//       [balloonPackageId]: {
//         ...prev[balloonPackageId],
//         [field]: value
//       }
//     }));
//   };

//   // Reset form
//   const resetForm = () => {
//     setSelectedBirthdayPackage(null);
//     setSelectedBalloonPackages([]);
//     setBalloonPackageDetails({});
//     setAvailableBalloons([]);
//     setCurrentStep(1);
//     setEditingAssociation(null);
//     setError('');
//     setSuccess('');
//     setFieldErrors({});
//   };

//   // Validate form
//   const validateForm = () => {
//     const errors = {};

//     if (!selectedBirthdayPackage) {
//       errors.birthday_party_package = 'Birthday package is required';
//     }

//     if (selectedBalloonPackages.length === 0) {
//       errors.party_balloon_packages = 'At least one balloon package must be selected';
//     }

//     // Validate each selected balloon package details
//     selectedBalloonPackages.forEach(balloonPkg => {
//       const details = balloonPackageDetails[balloonPkg.party_balloon_package_id];
//       if (details) {
//         if (details.credit && details.credit < 0) {
//           errors[`credit_${balloonPkg.party_balloon_package_id}`] = 'Credit cannot be negative';
//         }
//         if (details.discount && (details.discount < 0 || details.discount > 100)) {
//           errors[`discount_${balloonPkg.party_balloon_package_id}`] = 'Discount must be between 0 and 100';
//         }
//       }
//     });

//     return errors;
//   };

//   // Handle form submission - Create multiple associations
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const validationErrors = validateForm();
//     if (Object.keys(validationErrors).length > 0) {
//       setFieldErrors(validationErrors);
//       return;
//     }

//     setIsLoading(true);
//     setError('');
//     setSuccess('');

//     try {
//       const token = getAuthToken();
      
//       // If editing, update the single association
//       if (editingAssociation) {
//         const url = `${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/${editingAssociation.birthday_party_balloon_id}/update/`;
        
//         const balloonPkg = selectedBalloonPackages[0];
//         const details = balloonPackageDetails[balloonPkg.party_balloon_package_id];
        
//         const submitData = {
//           birthday_party_package: selectedBirthdayPackage.birthday_party_packages_id,
//           party_balloon_package: balloonPkg.party_balloon_package_id,
//           code: details?.code || '',
//           credit: details?.credit ? parseFloat(details.credit).toFixed(2) : '0.00',
//           discount: details?.discount ? parseFloat(details.discount).toFixed(2) : '0.00',
//           is_active: details?.is_active !== false
//         };

//         const response = await fetch(url, {
//           method: 'PUT',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(submitData)
//         });

//         const responseData = await response.json();

//         if (!response.ok) {
//           if (response.status === 400) {
//             setFieldErrors(responseData);
//             setError('Please fix the validation errors below');
//           } else {
//             throw new Error(responseData.error || responseData.detail || 'Failed to save association');
//           }
//           return;
//         }

//         setAssociations(prev => prev.map(assoc =>
//           assoc.birthday_party_balloon_id === responseData.birthday_party_balloon_id ? responseData : assoc
//         ));
//         setSuccess('Association updated successfully!');
//       } else {
//         // Create multiple associations for each selected balloon package
//         const createPromises = selectedBalloonPackages.map(balloonPkg => {
//           const details = balloonPackageDetails[balloonPkg.party_balloon_package_id];
          
//           const submitData = {
//             birthday_party_package: selectedBirthdayPackage.birthday_party_packages_id,
//             party_balloon_package: balloonPkg.party_balloon_package_id,
//             code: details?.code || '',
//             credit: details?.credit ? parseFloat(details.credit).toFixed(2) : '0.00',
//             discount: details?.discount ? parseFloat(details.discount).toFixed(2) : '0.00',
//             is_active: details?.is_active !== false
//           };

//           return fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/create/`, {
//             method: 'POST',
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(submitData)
//           });
//         });

//         const responses = await Promise.all(createPromises);
//         const results = await Promise.all(responses.map(response => response.json()));

//         // Check for any errors
//         const hasError = responses.some(response => !response.ok);
//         if (hasError) {
//           const errorResult = results.find(result => result.error);
//           throw new Error(errorResult?.error || 'Failed to create some associations');
//         }

//         setAssociations(prev => [...prev, ...results]);
//         setSuccess(`${results.length} association(s) created successfully!`);
//       }

//       resetForm();
//       setIsFormOpen(false);
//       setTimeout(() => setSuccess(''), 5000);
//       fetchAssociations();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Handle edit association
//   const handleEdit = (association) => {
//     const birthdayPkg = birthdayPackages.find(pkg => pkg.birthday_party_packages_id === association.birthday_party_package);
//     const balloonPkg = balloonPackages.find(pkg => pkg.party_balloon_package_id === association.party_balloon_package);
    
//     setSelectedBirthdayPackage(birthdayPkg);
//     setSelectedBalloonPackages(balloonPkg ? [balloonPkg] : []);
    
//     // Set details for the balloon package being edited
//     if (balloonPkg) {
//       setBalloonPackageDetails({
//         [balloonPkg.party_balloon_package_id]: {
//           code: association.code || '',
//           credit: association.credit || '',
//           discount: association.discount || '',
//           is_active: association.is_active
//         }
//       });
//     }
    
//     setEditingAssociation(association);
//     setIsFormOpen(true);
//     setCurrentStep(2);
//     setError('');
//     setSuccess('');
//     setFieldErrors({});
    
//     // Fetch balloons including the one being edited
//     if (birthdayPkg) {
//       fetchAllBalloonPackagesForEdit(birthdayPkg.birthday_party_packages_id, association.party_balloon_package);
//     }
//   };

//   // Handle delete association
//   const handleDelete = async (associationId) => {
//     if (!window.confirm('Are you sure you want to delete this association?')) {
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const token = getAuthToken();
//       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/${associationId}/delete/`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         throw new Error('Failed to delete association');
//       }

//       setAssociations(prev => prev.filter(assoc => assoc.birthday_party_balloon_id !== associationId));
//       setSuccess('Association deleted successfully!');
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Toggle association status
//   const toggleAssociationStatus = async (association) => {
//     setIsLoading(true);
//     try {
//       const token = getAuthToken();
//       const updatedData = {
//         ...association,
//         is_active: !association.is_active
//       };

//       const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/${association.birthday_party_balloon_id}/update/`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(updatedData)
//       });

//       if (!response.ok) {
//         throw new Error('Failed to update association status');
//       }

//       const responseData = await response.json();
//       setAssociations(prev => prev.map(item =>
//         item.birthday_party_balloon_id === association.birthday_party_balloon_id ? responseData : item
//       ));

//       setSuccess(`Association ${!association.is_active ? 'activated' : 'deactivated'} successfully!`);
//       setTimeout(() => setSuccess(''), 3000);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Toggle association expansion
//   const toggleAssociationExpansion = (birthdayPackageId) => {
//     setExpandedAssociations(prev => ({
//       ...prev,
//       [birthdayPackageId]: !prev[birthdayPackageId]
//     }));
//   };

//   // Go back to birthday package selection
//   const handleBackToBirthdaySelection = () => {
//     setCurrentStep(1);
//     setSelectedBirthdayPackage(null);
//     setSelectedBalloonPackages([]);
//     setBalloonPackageDetails({});
//   };

//   // Group associations by birthday package for better display
//   const groupedAssociations = associations.reduce((acc, association) => {
//     const birthdayPackageId = association.birthday_party_package;
//     if (!acc[birthdayPackageId]) {
//       acc[birthdayPackageId] = {
//         birthdayPackage: birthdayPackages.find(pkg => pkg.birthday_party_packages_id === birthdayPackageId),
//         balloonAssociations: []
//       };
//     }
//     acc[birthdayPackageId].balloonAssociations.push(association);
//     return acc;
//   }, {});

//   // Fetch data on component mount
//   useEffect(() => {
//     if (location_id) {
//       fetchLocation();
//       fetchBirthdayPackages();
//       fetchBalloonPackages();
//       fetchAssociations();
//     }
//   }, [location_id]);

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Birthday & Balloon Package Associations</h2>
//           {location && (
//             <p className="text-gray-600 mt-1">
//               Managing associations for: <span className="font-semibold">{location.location_name}</span>
//             </p>
//           )}
//         </div>
//         <button
//           onClick={() => {
//             resetForm();
//             setIsFormOpen(true);
//             setCurrentStep(1);
//           }}
//           className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
//         >
//           <span>+</span>
//           <span>Add New Association</span>
//         </button>
//       </div>

//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
//           {error}
//         </div>
//       )}
//       {success && (
//         <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
//           {success}
//         </div>
//       )}

//       {/* Associations List */}
//       {!isFormOpen && location_id && (
//         <div className="space-y-6">
//           {Object.entries(groupedAssociations).map(([birthdayPackageId, group]) => {
//             const birthdayPackage = group.birthdayPackage;
//             const isExpanded = expandedAssociations[birthdayPackageId];
            
//             // Get balloon package names for this birthday package
//             const balloonPackageNames = group.balloonAssociations.map(association => {
//               const balloonPkg = balloonPackages.find(pkg => pkg.party_balloon_package_id === association.party_balloon_package);
//               return balloonPkg?.package_name || 'Unknown Balloon Package';
//             });

//             return (
//               <div key={birthdayPackageId} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
//                 {/* Birthday Package Header */}
//                 <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
//                   <div className="flex justify-between items-start">
//                     <div className="flex-1">
//                       <h3 className="text-xl font-bold text-gray-900 mb-2">
//                         {birthdayPackage?.package_name || 'Unknown Package'}
//                       </h3>
                      
//                       {/* Balloon Package Names - Displayed under birthday package name */}
//                       <div className="mb-3">
//                         <p className="text-sm text-gray-600 font-medium">Balloon Packages:</p>
//                         <div className="flex flex-wrap gap-2 mt-1">
//                           {balloonPackageNames.map((name, index) => (
//                             <span 
//                               key={index}
//                               className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
//                             >
//                               {name}
//                             </span>
//                           ))}
//                         </div>
//                       </div>

//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                         <div>
//                           <span className="text-gray-600">Base Price:</span>
//                           <p className="font-semibold text-lg">${parseFloat(birthdayPackage?.price || 0).toFixed(2)}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Jump Time:</span>
//                           <p className="font-medium">{birthdayPackage?.jump_time}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Party Room:</span>
//                           <p className="font-medium">{birthdayPackage?.party_room_time}</p>
//                         </div>
//                         <div>
//                           <span className="text-gray-600">Min Jumpers:</span>
//                           <p className="font-medium">{birthdayPackage?.minimum_jumpers}</p>
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => toggleAssociationExpansion(birthdayPackageId)}
//                       className="ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors"
//                     >
//                       <svg
//                         className={`w-5 h-5 text-blue-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>

//                 {/* Expanded Association Details */}
//                 {isExpanded && (
//                   <div className="p-6 bg-gray-50">
//                     <h4 className="text-lg font-semibold text-gray-900 mb-4">Association Details</h4>
//                     <div className="space-y-6">
//                       {group.balloonAssociations.map((association) => {
//                         const balloonPackage = balloonPackages.find(pkg => pkg.party_balloon_package_id === association.party_balloon_package);
                        
//                         return (
//                           <div key={association.birthday_party_balloon_id} className="bg-white rounded-lg border border-gray-200 p-6">
//                             <div className="flex justify-between items-start">
//                               <div className="flex-1">
//                                 <div className="flex items-start justify-between">
//                                   <div>
//                                     <h5 className="font-semibold text-gray-900 text-lg mb-2">
//                                       {balloonPackage?.package_name || 'Unknown Balloon Package'}
//                                     </h5>
//                                     <div className="flex items-center space-x-3 mb-3">
//                                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${association.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                                         {association.is_active ? 'Active' : 'Inactive'}
//                                       </span>
//                                       {association.code && (
//                                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                                           Code: {association.code}
//                                         </span>
//                                       )}
//                                       {association.credit > 0 && (
//                                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
//                                           Credit: ${parseFloat(association.credit).toFixed(2)}
//                                         </span>
//                                       )}
//                                       {association.discount > 0 && (
//                                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
//                                           Discount: {parseFloat(association.discount).toFixed(2)}%
//                                         </span>
//                                       )}
//                                     </div>
//                                   </div>
//                                 </div>

//                                 {/* Balloon Package Details */}
//                                 {balloonPackage && (
//                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
//                                     <div>
//                                       <span className="text-gray-600 font-medium">Price:</span>
//                                       <p className="font-semibold text-lg">${parseFloat(balloonPackage.price).toFixed(2)}</p>
//                                     </div>
//                                     <div>
//                                       <span className="text-gray-600 font-medium">Priority:</span>
//                                       <p className="font-medium">{balloonPackage.call_flow_priority}</p>
//                                     </div>
//                                     <div className="md:col-span-2">
//                                       <span className="text-gray-600 font-medium">Inclusions:</span>
//                                       <p className="font-medium mt-1">{balloonPackage.package_inclusions}</p>
//                                     </div>
//                                     {balloonPackage.promotional_pitch && (
//                                       <div className="md:col-span-2">
//                                         <span className="text-gray-600 font-medium">Pitch:</span>
//                                         <p className="font-medium italic mt-1">"{balloonPackage.promotional_pitch}"</p>
//                                       </div>
//                                     )}
//                                   </div>
//                                 )}
//                               </div>
//                               <div className="flex space-x-2 ml-4">
//                                 <button
//                                   onClick={() => toggleAssociationStatus(association)}
//                                   className={`px-3 py-1 rounded-md border transition-colors ${association.is_active ? 'text-orange-600 border-orange-200 hover:border-orange-300' : 'text-green-600 border-green-200 hover:border-green-300'}`}
//                                 >
//                                   {association.is_active ? 'Deactivate' : 'Activate'}
//                                 </button>
//                                 <button
//                                   onClick={() => handleEdit(association)}
//                                   className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
//                                 >
//                                   Edit
//                                 </button>
//                                 <button
//                                   onClick={() => handleDelete(association.birthday_party_balloon_id)}
//                                   className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-200 hover:border-red-300 transition-colors"
//                                 >
//                                   Delete
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {!isFormOpen && location_id && associations.length === 0 && !isLoading && (
//         <div className="bg-white rounded-lg shadow p-8 text-center">
//           <div className="text-gray-400 text-6xl mb-4">🎈</div>
//           <h3 className="text-lg font-medium text-gray-900 mb-2">No Associations Configured</h3>
//           <p className="text-gray-500 mb-4">Connect birthday packages with balloon packages to get started.</p>
//           <button
//             onClick={() => {
//               setIsFormOpen(true);
//               setCurrentStep(1);
//             }}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//           >
//             Add Association
//           </button>
//         </div>
//       )}

//       {isLoading && !isFormOpen && (
//         <div className="flex justify-center items-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//       )}

//       {/* Association Form */}
//       {isFormOpen && (
//         <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
//           <div className="flex justify-between items-center mb-6">
//             <div>
//               <h3 className="text-xl font-semibold text-gray-900">
//                 {editingAssociation ? 'Edit Association' : 'Add New Association'}
//               </h3>
//               {currentStep === 2 && selectedBirthdayPackage && (
//                 <p className="text-gray-600 mt-1">
//                   Selected: <span className="font-semibold">{selectedBirthdayPackage.package_name}</span>
//                 </p>
//               )}
//             </div>
//             <button
//               onClick={() => {
//                 setIsFormOpen(false);
//                 resetForm();
//               }}
//               className="text-gray-400 hover:text-gray-600 transition-colors"
//             >
//               ✕
//             </button>
//           </div>

//           {/* Step 1: Birthday Package Selection */}
//           {currentStep === 1 && (
//             <div className="space-y-6">
//               <h4 className="text-lg font-medium text-gray-900 text-center mb-6">Select a Birthday Party Package</h4>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {birthdayPackages.map((pkg) => (
//                   <div
//                     key={pkg.birthday_party_packages_id}
//                     className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
//                     onClick={() => handleBirthdayPackageSelect(pkg)}
//                   >
//                     <h5 className="font-semibold text-lg text-gray-900 mb-2">{pkg.package_name}</h5>
                    
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Price:</span>
//                         <span className="font-semibold">${parseFloat(pkg.price).toFixed(2)}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Jump Time:</span>
//                         <span className="font-medium">{pkg.jump_time}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Party Room:</span>
//                         <span className="font-medium">{pkg.party_room_time}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Min Jumpers:</span>
//                         <span className="font-medium">{pkg.minimum_jumpers}</span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Priority:</span>
//                         <span className="font-medium">{pkg.birthday_party_priority === 999 ? 'Do not Pitch' : pkg.birthday_party_priority}</span>
//                       </div>
//                     </div>

//                     {pkg.birthday_party_pitch && (
//                       <p className="mt-3 text-gray-700 text-sm italic">"{pkg.birthday_party_pitch}"</p>
//                     )}

//                     <div className="mt-4 flex justify-between items-center">
//                       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
//                         {pkg.is_available ? 'Available' : 'Unavailable'}
//                       </span>
//                       <button className="text-blue-600 hover:text-blue-800 font-medium">
//                         Select →
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {birthdayPackages.length === 0 && (
//                 <div className="text-center py-8">
//                   <div className="text-gray-400 text-6xl mb-4">🎂</div>
//                   <p className="text-gray-500">No birthday packages available.</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* Step 2: Balloon Package Selection with Individual Details */}
//           {currentStep === 2 && (
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Selected Birthday Package Summary */}
//               {selectedBirthdayPackage && (
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                   <h4 className="font-semibold text-blue-900 mb-2">Selected Birthday Package</h4>
//                   <div className="flex justify-between items-center">
//                     <div>
//                       <p className="text-blue-800 font-medium">{selectedBirthdayPackage.package_name}</p>
//                       <p className="text-blue-700 text-sm">
//                         ${parseFloat(selectedBirthdayPackage.price).toFixed(2)} • {selectedBirthdayPackage.jump_time} • {selectedBirthdayPackage.minimum_jumpers} min jumpers
//                       </p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={handleBackToBirthdaySelection}
//                       className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//                     >
//                       Change
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* Balloon Package Selection */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-3">
//                   Select Balloon Packages *
//                   <span className="text-xs text-gray-500 ml-2">(Choose one or more packages)</span>
//                 </label>
                
//                 {fieldErrors.party_balloon_packages && (
//                   <p className="text-red-600 text-sm mb-3">{fieldErrors.party_balloon_packages}</p>
//                 )}

//                 <div className="space-y-4">
//                   {availableBalloons.map((balloonPkg) => {
//                     const isSelected = selectedBalloonPackages.some(
//                       pkg => pkg.party_balloon_package_id === balloonPkg.party_balloon_package_id
//                     );
//                     const details = balloonPackageDetails[balloonPkg.party_balloon_package_id] || {};

//                     return (
//                       <div
//                         key={balloonPkg.party_balloon_package_id}
//                         className={`border-2 rounded-lg p-4 transition-all duration-200 ${
//                           isSelected 
//                             ? 'border-blue-500 bg-blue-50' 
//                             : 'border-gray-200 bg-white'
//                         }`}
//                       >
//                         <div className="flex items-start space-x-3">
//                           <input
//                             type="checkbox"
//                             checked={isSelected}
//                             onChange={() => handleBalloonPackageToggle(balloonPkg)}
//                             className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                           />
//                           <div className="flex-1">
//                             <div className="flex justify-between items-start">
//                               <div className="flex-1">
//                                 <h5 className="font-semibold text-gray-900">{balloonPkg.package_name}</h5>
//                                 <p className="text-lg font-bold text-green-600 mt-1">
//                                   ${parseFloat(balloonPkg.price).toFixed(2)}
//                                 </p>
//                                 <p className="text-sm text-gray-600 mt-1">
//                                   <span className="font-medium">Priority:</span> {balloonPkg.call_flow_priority}
//                                 </p>
//                                 <p className="text-sm text-gray-700 mt-2">
//                                   {balloonPkg.package_inclusions}
//                                 </p>
//                                 {balloonPkg.promotional_pitch && (
//                                   <p className="text-sm text-gray-600 italic mt-2">
//                                     "{balloonPkg.promotional_pitch}"
//                                   </p>
//                                 )}
//                               </div>
//                             </div>

//                             {/* Individual Details for Each Balloon Package */}
//                             {isSelected && (
//                               <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
//                                 <h6 className="font-medium text-gray-900 mb-3">Association Details for {balloonPkg.package_name}</h6>
//                                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                   {/* Code */}
//                                   <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                       Code
//                                     </label>
//                                     <input
//                                       type="text"
//                                       value={details.code || ''}
//                                       onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'code', e.target.value)}
//                                       className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                       placeholder="Enter code"
//                                     />
//                                   </div>

//                                   {/* Credit */}
//                                   <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                       Credit ($)
//                                     </label>
//                                     <div className="relative">
//                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                         <span className="text-gray-500 text-sm">$</span>
//                                       </div>
//                                       <input
//                                         type="number"
//                                         value={details.credit || ''}
//                                         onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'credit', e.target.value)}
//                                         step="0.01"
//                                         min="0"
//                                         className={`w-full pl-7 rounded-md border ${fieldErrors[`credit_${balloonPkg.party_balloon_package_id}`] ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
//                                         placeholder="0.00"
//                                       />
//                                     </div>
//                                     {fieldErrors[`credit_${balloonPkg.party_balloon_package_id}`] && (
//                                       <p className="mt-1 text-xs text-red-600">{fieldErrors[`credit_${balloonPkg.party_balloon_package_id}`]}</p>
//                                     )}
//                                   </div>

//                                   {/* Discount */}
//                                   <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                       Discount (%)
//                                     </label>
//                                     <div className="relative">
//                                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                         <span className="text-gray-500 text-sm">%</span>
//                                       </div>
//                                       <input
//                                         type="number"
//                                         value={details.discount || ''}
//                                         onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'discount', e.target.value)}
//                                         step="0.01"
//                                         min="0"
//                                         max="100"
//                                         className={`w-full pl-7 rounded-md border ${fieldErrors[`discount_${balloonPkg.party_balloon_package_id}`] ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
//                                         placeholder="0.00"
//                                       />
//                                     </div>
//                                     {fieldErrors[`discount_${balloonPkg.party_balloon_package_id}`] && (
//                                       <p className="mt-1 text-xs text-red-600">{fieldErrors[`discount_${balloonPkg.party_balloon_package_id}`]}</p>
//                                     )}
//                                   </div>
//                                 </div>

//                                 {/* Active Status for Individual Package */}
//                                 <div className="flex items-center space-x-2 mt-3">
//                                   <input
//                                     type="checkbox"
//                                     checked={details.is_active !== false}
//                                     onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'is_active', e.target.checked)}
//                                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                                   />
//                                   <label className="block text-sm font-medium text-gray-700">
//                                     This association active
//                                   </label>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {availableBalloons.length === 0 && !editingAssociation && (
//                   <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
//                     <div className="text-gray-400 text-6xl mb-4">🎈</div>
//                     <p className="text-gray-500">No available balloon packages for this birthday package.</p>
//                   </div>
//                 )}

//                 {availableBalloons.length === 0 && editingAssociation && (
//                   <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
//                     <div className="text-gray-400 text-6xl mb-4">🎈</div>
//                     <p className="text-gray-500">Loading balloon package details...</p>
//                   </div>
//                 )}
//               </div>

//               {/* Selection Summary */}
//               {selectedBalloonPackages.length > 0 && (
//                 <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//                   <h4 className="font-semibold text-green-900 mb-2">Selection Summary</h4>
//                   <p className="text-green-800">
//                     You have selected <span className="font-bold">{selectedBalloonPackages.length}</span> balloon package(s) to associate with the birthday package.
//                   </p>
//                   <div className="mt-2 flex flex-wrap gap-2">
//                     {selectedBalloonPackages.map(pkg => (
//                       <span key={pkg.party_balloon_package_id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//                         {pkg.package_name}
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="flex justify-between space-x-3 pt-6 border-t border-gray-200">
//                 <button
//                   type="button"
//                   onClick={handleBackToBirthdaySelection}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//                 >
//                   ← Back to Packages
//                 </button>
//                 <div className="flex space-x-3">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setIsFormOpen(false);
//                       resetForm();
//                     }}
//                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={isLoading}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                   >
//                     {isLoading && (
//                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                     )}
//                     <span>
//                       {isLoading
//                         ? (editingAssociation ? 'Updating...' : 'Creating...')
//                         : (editingAssociation ? 'Update Association' : `Create ${selectedBalloonPackages.length} Association(s)`)
//                       }
//                     </span>
//                   </button>
//                 </div>
//               </div>
//             </form>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default BirthDayAndBalloonComp;





import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';

const BirthDayAndBalloonComp = () => {
  const { location_id } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  // State declarations
  const [associations, setAssociations] = useState([]);
  const [birthdayPackages, setBirthdayPackages] = useState([]);
  const [balloonPackages, setBalloonPackages] = useState([]);
  const [availableBalloons, setAvailableBalloons] = useState([]);
  const [selectedBirthdayPackage, setSelectedBirthdayPackage] = useState(null);
  const [selectedBalloonPackages, setSelectedBalloonPackages] = useState([]);
  const [balloonPackageDetails, setBalloonPackageDetails] = useState({});
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingAssociation, setEditingAssociation] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [expandedAssociations, setExpandedAssociations] = useState({});

  // Get authentication token
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

  // Fetch birthday packages
  const fetchBirthdayPackages = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/birthday-packages/${location_id}/list/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBirthdayPackages(data);
      }
    } catch (err) {
      console.error('Failed to fetch birthday packages:', err);
    }
  };

  // Fetch balloon packages
  const fetchBalloonPackages = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/party_balloon_packages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBalloonPackages(data);
      }
    } catch (err) {
      console.error('Failed to fetch balloon packages:', err);
    }
  };

  // Fetch available balloon packages for selected birthday package
  const fetchAvailableBalloons = async (birthdayPackageId) => {
    if (!birthdayPackageId) {
      setAvailableBalloons([]);
      return;
    }

    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_packages/${birthdayPackageId}/available_balloon_packages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableBalloons(data);
        
        // Initialize balloon package details
        const initialDetails = {};
        data.forEach(balloon => {
          initialDetails[balloon.party_balloon_package_id] = {
            code: '',
            credit: '',
            discount: '',
            is_active: true
          };
        });
        setBalloonPackageDetails(initialDetails);
      } else {
        setAvailableBalloons([]);
        setBalloonPackageDetails({});
      }
    } catch (err) {
      console.error('Failed to fetch available balloons:', err);
      setAvailableBalloons([]);
      setBalloonPackageDetails({});
    }
  };

  // Fetch ALL balloon packages for a location (for edit mode)
  const fetchAllBalloonPackagesForEdit = async (birthdayPackageId, editingBalloonPackageId, associationData) => {
    if (!birthdayPackageId) {
      setAvailableBalloons([]);
      return;
    }

    try {
      const token = getAuthToken();
      
      // First get available balloons
      const availableResponse = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_packages/${birthdayPackageId}/available_balloon_packages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let availableBalloonsData = [];
      if (availableResponse.ok) {
        availableBalloonsData = await availableResponse.json();
      }

      // Then get the specific balloon package being edited
      const allBalloonsResponse = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/party_balloon_packages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (allBalloonsResponse.ok) {
        const allBalloons = await allBalloonsResponse.json();
        const editingBalloonPackage = allBalloons.find(pkg => pkg.party_balloon_package_id === editingBalloonPackageId);
        
        // Combine available balloons with the editing balloon package
        const combinedBalloons = [...availableBalloonsData];
        if (editingBalloonPackage && !availableBalloonsData.some(pkg => pkg.party_balloon_package_id === editingBalloonPackageId)) {
          combinedBalloons.push(editingBalloonPackage);
        }
        
        setAvailableBalloons(combinedBalloons);
        
        // Initialize balloon package details with the association data
        const initialDetails = {};
        combinedBalloons.forEach(balloon => {
          if (balloon.party_balloon_package_id === editingBalloonPackageId && associationData) {
            // Set the existing values for the balloon package being edited
            initialDetails[balloon.party_balloon_package_id] = {
              code: associationData.code || '',
              credit: associationData.credit || '',
              discount: associationData.discount || '',
              is_active: associationData.is_active !== false
            };
          } else {
            // Set empty values for other packages
            initialDetails[balloon.party_balloon_package_id] = {
              code: '',
              credit: '',
              discount: '',
              is_active: true
            };
          }
        });
        setBalloonPackageDetails(initialDetails);
      }
    } catch (err) {
      console.error('Failed to fetch balloons for edit:', err);
      setAvailableBalloons([]);
      setBalloonPackageDetails({});
    }
  };

  // Fetch associations
  const fetchAssociations = async () => {
    if (!location_id) return;

    setIsLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch associations');
      }

      const data = await response.json();
      setAssociations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle birthday package selection
  const handleBirthdayPackageSelect = (birthdayPackage) => {
    setSelectedBirthdayPackage(birthdayPackage);
    if (editingAssociation) {
      // If editing, fetch all balloons including the one being edited with association data
      fetchAllBalloonPackagesForEdit(
        birthdayPackage.birthday_party_packages_id, 
        editingAssociation.party_balloon_package,
        editingAssociation
      );
    } else {
      // If creating new, fetch only available balloons
      fetchAvailableBalloons(birthdayPackage.birthday_party_packages_id);
    }
    setCurrentStep(2);
  };

  // Handle balloon package checkbox change
  const handleBalloonPackageToggle = (balloonPackage) => {
    setSelectedBalloonPackages(prev => {
      const isSelected = prev.some(pkg => pkg.party_balloon_package_id === balloonPackage.party_balloon_package_id);
      if (isSelected) {
        return prev.filter(pkg => pkg.party_balloon_package_id !== balloonPackage.party_balloon_package_id);
      } else {
        return [...prev, balloonPackage];
      }
    });
  };

  // Handle balloon package detail change
  const handleBalloonDetailChange = (balloonPackageId, field, value) => {
    setBalloonPackageDetails(prev => ({
      ...prev,
      [balloonPackageId]: {
        ...prev[balloonPackageId],
        [field]: value
      }
    }));
  };

  // Reset form
  const resetForm = () => {
    setSelectedBirthdayPackage(null);
    setSelectedBalloonPackages([]);
    setBalloonPackageDetails({});
    setAvailableBalloons([]);
    setCurrentStep(1);
    setEditingAssociation(null);
    setError('');
    setSuccess('');
    setFieldErrors({});
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!selectedBirthdayPackage) {
      errors.birthday_party_package = 'Birthday package is required';
    }

    if (selectedBalloonPackages.length === 0) {
      errors.party_balloon_packages = 'At least one balloon package must be selected';
    }

    // Validate each selected balloon package details
    selectedBalloonPackages.forEach(balloonPkg => {
      const details = balloonPackageDetails[balloonPkg.party_balloon_package_id];
      if (details) {
        if (details.credit && details.credit < 0) {
          errors[`credit_${balloonPkg.party_balloon_package_id}`] = 'Credit cannot be negative';
        }
        if (details.discount && (details.discount < 0 || details.discount > 100)) {
          errors[`discount_${balloonPkg.party_balloon_package_id}`] = 'Discount must be between 0 and 100';
        }
      }
    });

    return errors;
  };

  // Handle form submission - Create multiple associations
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
      
      // If editing, update the single association
      if (editingAssociation) {
        const url = `${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/${editingAssociation.birthday_party_balloon_id}/update/`;
        
        const balloonPkg = selectedBalloonPackages[0];
        const details = balloonPackageDetails[balloonPkg.party_balloon_package_id];
        
        const submitData = {
          birthday_party_package: selectedBirthdayPackage.birthday_party_packages_id,
          party_balloon_package: balloonPkg.party_balloon_package_id,
          code: details?.code || '',
          credit: details?.credit ? parseFloat(details.credit).toFixed(2) : '0.00',
          discount: details?.discount ? parseFloat(details.discount).toFixed(2) : '0.00',
          is_active: details?.is_active !== false
        };

        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submitData)
        });

        const responseData = await response.json();

        if (!response.ok) {
          if (response.status === 400) {
            // Handle the specific error case for duplicate code
            if (responseData.code && responseData.code.includes('already exists')) {
              setFieldErrors({ 
                code: 'This code is already associated with another birthday balloon package.' 
              });
              setError('This code is already in use. Please use a different code.');
            } else {
              setFieldErrors(responseData);
              setError('Please fix the validation errors below');
            }
          } else {
            throw new Error(responseData.error || responseData.detail || 'Failed to save association');
          }
          return;
        }

        setAssociations(prev => prev.map(assoc =>
          assoc.birthday_party_balloon_id === responseData.birthday_party_balloon_id ? responseData : assoc
        ));
        setSuccess('Association updated successfully!');
      } else {
        // Create multiple associations for each selected balloon package
        const createPromises = selectedBalloonPackages.map(balloonPkg => {
          const details = balloonPackageDetails[balloonPkg.party_balloon_package_id];
          
          const submitData = {
            birthday_party_package: selectedBirthdayPackage.birthday_party_packages_id,
            party_balloon_package: balloonPkg.party_balloon_package_id,
            code: details?.code || '',
            credit: details?.credit ? parseFloat(details.credit).toFixed(2) : '0.00',
            discount: details?.discount ? parseFloat(details.discount).toFixed(2) : '0.00',
            is_active: details?.is_active !== false
          };

          return fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/create/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(submitData)
          });
        });

        const responses = await Promise.all(createPromises);
        const results = await Promise.all(responses.map(async (response, index) => {
          const data = await response.json();
          return { response, data, index };
        }));

        // Check for any errors and handle them specifically
        const errorResults = results.filter(result => !result.response.ok);
        if (errorResults.length > 0) {
          const errorResult = errorResults[0];
          if (errorResult.response.status === 400) {
            // Handle duplicate code error specifically
            if (errorResult.data.code && errorResult.data.code.includes('already exists')) {
              const balloonPkgName = selectedBalloonPackages[errorResult.index]?.package_name || 'Balloon Package';
              setFieldErrors({ 
                code: `The code "${balloonPackageDetails[selectedBalloonPackages[errorResult.index]?.party_balloon_package_id]?.code}" is already associated with another birthday balloon package.` 
              });
              setError(`Failed to create association for ${balloonPkgName}: This code is already in use.`);
            } else {
              setFieldErrors(errorResult.data);
              setError('Please fix the validation errors below');
            }
          } else {
            throw new Error(errorResult.data?.error || errorResult.data?.detail || 'Failed to create some associations');
          }
          return;
        }

        // If no errors, add all successful associations
        const successfulAssociations = results.map(result => result.data);
        setAssociations(prev => [...prev, ...successfulAssociations]);
        setSuccess(`${successfulAssociations.length} association(s) created successfully!`);
      }

      resetForm();
      setIsFormOpen(false);
      setTimeout(() => setSuccess(''), 5000);
      fetchAssociations();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle edit association
  const handleEdit = (association) => {
    const birthdayPkg = birthdayPackages.find(pkg => pkg.birthday_party_packages_id === association.birthday_party_package);
    const balloonPkg = balloonPackages.find(pkg => pkg.party_balloon_package_id === association.party_balloon_package);
    
    setSelectedBirthdayPackage(birthdayPkg);
    setSelectedBalloonPackages(balloonPkg ? [balloonPkg] : []);
    
    // Set the editing association
    setEditingAssociation(association);
    setIsFormOpen(true);
    setCurrentStep(2);
    setError('');
    setSuccess('');
    setFieldErrors({});
    
    // Fetch balloons including the one being edited with association data
    if (birthdayPkg) {
      fetchAllBalloonPackagesForEdit(
        birthdayPkg.birthday_party_packages_id, 
        association.party_balloon_package,
        association
      );
    }
  };

  // Handle delete association
  const handleDelete = async (associationId) => {
    if (!window.confirm('Are you sure you want to delete this association?')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/${associationId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete association');
      }

      setAssociations(prev => prev.filter(assoc => assoc.birthday_party_balloon_id !== associationId));
      setSuccess('Association deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle association status
  const toggleAssociationStatus = async (association) => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      const updatedData = {
        ...association,
        is_active: !association.is_active
      };

      const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/${location_id}/birthday_balloon_associations/${association.birthday_party_balloon_id}/update/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        throw new Error('Failed to update association status');
      }

      const responseData = await response.json();
      setAssociations(prev => prev.map(item =>
        item.birthday_party_balloon_id === association.birthday_party_balloon_id ? responseData : item
      ));

      setSuccess(`Association ${!association.is_active ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle association expansion
  const toggleAssociationExpansion = (birthdayPackageId) => {
    setExpandedAssociations(prev => ({
      ...prev,
      [birthdayPackageId]: !prev[birthdayPackageId]
    }));
  };

  // Go back to birthday package selection
  const handleBackToBirthdaySelection = () => {
    setCurrentStep(1);
    setSelectedBirthdayPackage(null);
    setSelectedBalloonPackages([]);
    setBalloonPackageDetails({});
  };

  // Group associations by birthday package for better display
  const groupedAssociations = associations.reduce((acc, association) => {
    const birthdayPackageId = association.birthday_party_package;
    if (!acc[birthdayPackageId]) {
      acc[birthdayPackageId] = {
        birthdayPackage: birthdayPackages.find(pkg => pkg.birthday_party_packages_id === birthdayPackageId),
        balloonAssociations: []
      };
    }
    acc[birthdayPackageId].balloonAssociations.push(association);
    return acc;
  }, {});

  // Fetch data on component mount
  useEffect(() => {
    if (location_id) {
      fetchLocation();
      fetchBirthdayPackages();
      fetchBalloonPackages();
      fetchAssociations();
    }
  }, [location_id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Birthday & Balloon Package Associations</h2>
          {location && (
            <p className="text-gray-600 mt-1">
              Managing associations for: <span className="font-semibold">{location.location_name}</span>
            </p>
          )}
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsFormOpen(true);
            setCurrentStep(1);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add New Association</span>
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

      {/* Associations List */}
      {!isFormOpen && location_id && (
        <div className="space-y-6">
          {Object.entries(groupedAssociations).map(([birthdayPackageId, group]) => {
            const birthdayPackage = group.birthdayPackage;
            const isExpanded = expandedAssociations[birthdayPackageId];
            
            // Get balloon package names for this birthday package
            const balloonPackageNames = group.balloonAssociations.map(association => {
              const balloonPkg = balloonPackages.find(pkg => pkg.party_balloon_package_id === association.party_balloon_package);
              return balloonPkg?.package_name || 'Unknown Balloon Package';
            });

            return (
              <div key={birthdayPackageId} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                {/* Birthday Package Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {birthdayPackage?.package_name || 'Unknown Package'}
                      </h3>
                      
                      {/* Balloon Package Names - Displayed under birthday package name */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 font-medium">Balloon Packages:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {balloonPackageNames.map((name, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Base Price:</span>
                          <p className="font-semibold text-lg">${parseFloat(birthdayPackage?.price || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Jump Time:</span>
                          <p className="font-medium">{birthdayPackage?.jump_time}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Party Room:</span>
                          <p className="font-medium">{birthdayPackage?.party_room_time}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Min Jumpers:</span>
                          <p className="font-medium">{birthdayPackage?.minimum_jumpers}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleAssociationExpansion(birthdayPackageId)}
                      className="ml-4 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 text-blue-600 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Association Details */}
                {isExpanded && (
                  <div className="p-6 bg-gray-50">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Association Details</h4>
                    <div className="space-y-6">
                      {group.balloonAssociations.map((association) => {
                        const balloonPackage = balloonPackages.find(pkg => pkg.party_balloon_package_id === association.party_balloon_package);
                        
                        return (
                          <div key={association.birthday_party_balloon_id} className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h5 className="font-semibold text-gray-900 text-lg mb-2">
                                      {balloonPackage?.package_name || 'Unknown Balloon Package'}
                                    </h5>
                                    <div className="flex items-center space-x-3 mb-3">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${association.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {association.is_active ? 'Active' : 'Inactive'}
                                      </span>
                                      {association.code && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          Code: {association.code}
                                        </span>
                                      )}
                                      {association.credit > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                          Credit: ${parseFloat(association.credit).toFixed(2)}
                                        </span>
                                      )}
                                      {association.discount > 0 && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                          Discount: {parseFloat(association.discount).toFixed(2)}%
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Balloon Package Details */}
                                {balloonPackage && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-gray-600 font-medium">Price:</span>
                                      <p className="font-semibold text-lg">${parseFloat(balloonPackage.price).toFixed(2)}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-600 font-medium">Priority:</span>
                                      <p className="font-medium">{balloonPackage.call_flow_priority}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                      <span className="text-gray-600 font-medium">Inclusions:</span>
                                      <p className="font-medium mt-1">{balloonPackage.package_inclusions}</p>
                                    </div>
                                    {balloonPackage.promotional_pitch && (
                                      <div className="md:col-span-2">
                                        <span className="text-gray-600 font-medium">Pitch:</span>
                                        <p className="font-medium italic mt-1">"{balloonPackage.promotional_pitch}"</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={() => toggleAssociationStatus(association)}
                                  className={`px-3 py-1 rounded-md border transition-colors ${association.is_active ? 'text-orange-600 border-orange-200 hover:border-orange-300' : 'text-green-600 border-green-200 hover:border-green-300'}`}
                                >
                                  {association.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleEdit(association)}
                                  className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(association.birthday_party_balloon_id)}
                                  className="text-red-600 hover:text-red-800 px-3 py-1 rounded-md border border-red-200 hover:border-red-300 transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!isFormOpen && location_id && associations.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">🎈</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Associations Configured</h3>
          <p className="text-gray-500 mb-4">Connect birthday packages with balloon packages to get started.</p>
          <button
            onClick={() => {
              setIsFormOpen(true);
              setCurrentStep(1);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Association
          </button>
        </div>
      )}

      {isLoading && !isFormOpen && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Association Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {editingAssociation ? 'Edit Association' : 'Add New Association'}
              </h3>
              {currentStep === 2 && selectedBirthdayPackage && (
                <p className="text-gray-600 mt-1">
                  Selected: <span className="font-semibold">{selectedBirthdayPackage.package_name}</span>
                </p>
              )}
            </div>
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

          {/* Step 1: Birthday Package Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h4 className="text-lg font-medium text-gray-900 text-center mb-6">Select a Birthday Party Package</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {birthdayPackages.map((pkg) => (
                  <div
                    key={pkg.birthday_party_packages_id}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleBirthdayPackageSelect(pkg)}
                  >
                    <h5 className="font-semibold text-lg text-gray-900 mb-2">{pkg.package_name}</h5>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-semibold">${parseFloat(pkg.price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jump Time:</span>
                        <span className="font-medium">{pkg.jump_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Party Room:</span>
                        <span className="font-medium">{pkg.party_room_time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Jumpers:</span>
                        <span className="font-medium">{pkg.minimum_jumpers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        <span className="font-medium">{pkg.birthday_party_priority === 999 ? 'Do not Pitch' : pkg.birthday_party_priority}</span>
                      </div>
                    </div>

                    {pkg.birthday_party_pitch && (
                      <p className="mt-3 text-gray-700 text-sm italic">"{pkg.birthday_party_pitch}"</p>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {pkg.is_available ? 'Available' : 'Unavailable'}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 font-medium">
                        Select →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {birthdayPackages.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">🎂</div>
                  <p className="text-gray-500">No birthday packages available.</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Balloon Package Selection with Individual Details */}
          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Birthday Package Summary */}
              {selectedBirthdayPackage && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Selected Birthday Package</h4>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-blue-800 font-medium">{selectedBirthdayPackage.package_name}</p>
                      <p className="text-blue-700 text-sm">
                        ${parseFloat(selectedBirthdayPackage.price).toFixed(2)} • {selectedBirthdayPackage.jump_time} • {selectedBirthdayPackage.minimum_jumpers} min jumpers
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleBackToBirthdaySelection}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}

              {/* Balloon Package Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Balloon Packages *
                  <span className="text-xs text-gray-500 ml-2">(Choose one or more packages)</span>
                </label>
                
                {fieldErrors.party_balloon_packages && (
                  <p className="text-red-600 text-sm mb-3">{fieldErrors.party_balloon_packages}</p>
                )}

                <div className="space-y-4">
                  {availableBalloons.map((balloonPkg) => {
                    const isSelected = selectedBalloonPackages.some(
                      pkg => pkg.party_balloon_package_id === balloonPkg.party_balloon_package_id
                    );
                    const details = balloonPackageDetails[balloonPkg.party_balloon_package_id] || {};

                    return (
                      <div
                        key={balloonPkg.party_balloon_package_id}
                        className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleBalloonPackageToggle(balloonPkg)}
                            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h5 className="font-semibold text-gray-900">{balloonPkg.package_name}</h5>
                                <p className="text-lg font-bold text-green-600 mt-1">
                                  ${parseFloat(balloonPkg.price).toFixed(2)}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="font-medium">Priority:</span> {balloonPkg.call_flow_priority}
                                </p>
                                <p className="text-sm text-gray-700 mt-2">
                                  {balloonPkg.package_inclusions}
                                </p>
                                {balloonPkg.promotional_pitch && (
                                  <p className="text-sm text-gray-600 italic mt-2">
                                    "{balloonPkg.promotional_pitch}"
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Individual Details for Each Balloon Package */}
                            {isSelected && (
                              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                                <h6 className="font-medium text-gray-900 mb-3">Association Details for {balloonPkg.package_name}</h6>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Code */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Code
                                    </label>
                                    <input
                                      type="text"
                                      value={details.code || ''}
                                      onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'code', e.target.value)}
                                      className={`w-full rounded-md border ${fieldErrors.code ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                      placeholder="Enter code"
                                    />
                                    {fieldErrors.code && (
                                      <p className="mt-1 text-xs text-red-600">{fieldErrors.code}</p>
                                    )}
                                  </div>

                                  {/* Credit */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Credit ($)
                                    </label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">$</span>
                                      </div>
                                      <input
                                        type="number"
                                        value={details.credit || ''}
                                        onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'credit', e.target.value)}
                                        step="0.01"
                                        min="0"
                                        className={`w-full pl-7 rounded-md border ${fieldErrors[`credit_${balloonPkg.party_balloon_package_id}`] ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="0.00"
                                      />
                                    </div>
                                    {fieldErrors[`credit_${balloonPkg.party_balloon_package_id}`] && (
                                      <p className="mt-1 text-xs text-red-600">{fieldErrors[`credit_${balloonPkg.party_balloon_package_id}`]}</p>
                                    )}
                                  </div>

                                  {/* Discount */}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Discount (%)
                                    </label>
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">%</span>
                                      </div>
                                      <input
                                        type="number"
                                        value={details.discount || ''}
                                        onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'discount', e.target.value)}
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        className={`w-full pl-7 rounded-md border ${fieldErrors[`discount_${balloonPkg.party_balloon_package_id}`] ? 'border-red-300' : 'border-gray-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="0.00"
                                      />
                                    </div>
                                    {fieldErrors[`discount_${balloonPkg.party_balloon_package_id}`] && (
                                      <p className="mt-1 text-xs text-red-600">{fieldErrors[`discount_${balloonPkg.party_balloon_package_id}`]}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Active Status for Individual Package */}
                                <div className="flex items-center space-x-2 mt-3">
                                  <input
                                    type="checkbox"
                                    checked={details.is_active !== false}
                                    onChange={(e) => handleBalloonDetailChange(balloonPkg.party_balloon_package_id, 'is_active', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <label className="block text-sm font-medium text-gray-700">
                                    This association active
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {availableBalloons.length === 0 && !editingAssociation && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 text-6xl mb-4">🎈</div>
                    <p className="text-gray-500">No available balloon packages for this birthday package.</p>
                  </div>
                )}

                {availableBalloons.length === 0 && editingAssociation && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-gray-400 text-6xl mb-4">🎈</div>
                    <p className="text-gray-500">Loading balloon package details...</p>
                  </div>
                )}
              </div>

              {/* Selection Summary */}
              {selectedBalloonPackages.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Selection Summary</h4>
                  <p className="text-green-800">
                    You have selected <span className="font-bold">{selectedBalloonPackages.length}</span> balloon package(s) to associate with the birthday package.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedBalloonPackages.map(pkg => (
                      <span key={pkg.party_balloon_package_id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {pkg.package_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBackToBirthdaySelection}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  ← Back to Packages
                </button>
                <div className="flex space-x-3">
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
                        ? (editingAssociation ? 'Updating...' : 'Creating...')
                        : (editingAssociation ? 'Update Association' : `Create ${selectedBalloonPackages.length} Association(s)`)
                      }
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default BirthDayAndBalloonComp;





