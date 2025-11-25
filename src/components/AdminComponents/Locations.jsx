// // import React, { useState, useEffect } from 'react';
// // import { useSelector } from 'react-redux';
// // import { Link } from 'react-router-dom';

// // const Locations = () => {
// //     const userData = useSelector((state) => state.auth.userData);
// //     const [locations, setLocations] = useState([]);
// //     const [isLoading, setIsLoading] = useState(false);
// //     const [error, setError] = useState('');
// //     const [success, setSuccess] = useState('');
// //     const [editingLocation, setEditingLocation] = useState(null);
// //     const [isFormOpen, setIsFormOpen] = useState(false);

// //     // Form state
// //     const [formData, setFormData] = useState({
// //         location_name: '',
// //         location_address: '',
// //         location_timezone: '',
// //         location_call_number: '',
// //         location_transfer_number: '',
// //         location_google_map_link: ''
// //     });

// //     // Timezone options
// //     const timezones = [
// //         'Pacific Standard Time (PST)',
// //         'Eastern Standard Time (EST)',
// //     ];

// //     // Get auth token from Redux store
// //     const getAuthToken = () => {
// //         return localStorage.getItem('accessToken') || userData?.token;
// //     };

// //     // Fetch all locations
// //     const fetchLocations = async () => {
// //         setIsLoading(true);
// //         setError('');
// //         try {
// //             const token = getAuthToken();
// //             // console.log("Fetching locations with token:", token);
// //             const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/`, {
// //                 headers: {
// //                     'Authorization': `Bearer ${token}`,
// //                     'Content-Type': 'application/json'
// //                 }
// //             });

// //             if (!response.ok) {
// //                 throw new Error('Failed to fetch locations');
// //             }

// //             const data = await response.json();
// //             setLocations(data);
// //         } catch (err) {
// //             setError(err.message);
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };

// //     // Handle form input changes
// //     const handleInputChange = (e) => {
// //         const { name, value } = e.target;
// //         setFormData(prev => ({
// //             ...prev,
// //             [name]: value
// //         }));
// //     };

// //     // Reset form
// //     const resetForm = () => {
// //         setFormData({
// //             location_name: '',
// //             location_address: '',
// //             location_timezone: '',
// //             location_call_number: '',
// //             location_transfer_number: '',
// //             location_google_map_link: ''
// //         });
// //         setEditingLocation(null);
// //         setError('');
// //         setSuccess('');
// //     };

// //     // Submit form (create or update)
// //     const handleSubmit = async (e) => {
// //         e.preventDefault();
// //         setIsLoading(true);
// //         setError('');
// //         setSuccess('');

// //         try {
// //             const token = getAuthToken();
// //             const url = editingLocation
// //                 ? `${import.meta.env.VITE_BackendApi}/locations/update/${editingLocation.location_id}/`
// //                 : `${import.meta.env.VITE_BackendApi}/locations/create/`;

// //             const method = editingLocation ? 'PUT' : 'POST';

// //             const response = await fetch(url, {
// //                 method: method,
// //                 headers: {
// //                     'Authorization': `Bearer ${token}`,
// //                     'Content-Type': 'application/json'
// //                 },
// //                 body: JSON.stringify(formData)
// //             });

// //             // if (!response.ok) {
// //             //     const errorData = await response.json();
// //             //     throw new Error(errorData.detail || 'Failed to save location');
// //             // }
// //             if (!response.ok) {
// //                 const errorData = await response.json();

// //                 // If DRF sent a dictionary of field errors, join them into a readable message
// //                 if (typeof errorData === 'object' && !errorData.detail) {
// //                     const messages = Object.entries(errorData)
// //                         .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
// //                         .join('\n');
// //                     throw new Error(messages);
// //                 }

// //                 throw new Error(errorData.detail || 'Failed to save location');
// //             }





// //             const savedLocation = await response.json();

// //             if (editingLocation) {
// //                 setLocations(prev => prev.map(loc =>
// //                     loc.location_id === savedLocation.location_id ? savedLocation : loc
// //                 ));
// //                 setSuccess('Location updated successfully!');
// //             } else {
// //                 setLocations(prev => [...prev, savedLocation]);
// //                 setSuccess('Location created successfully!');
// //             }

// //             resetForm();
// //             setIsFormOpen(false);
// //             setTimeout(() => setSuccess(''), 3000);
// //         } catch (err) {
// //             setError(err.message);
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };

// //     // Edit location
// //     const handleEdit = (location) => {
// //         setFormData({
// //             location_name: location.location_name,
// //             location_address: location.location_address,
// //             location_timezone: location.location_timezone,
// //             location_call_number: location.location_call_number || '',
// //             location_transfer_number: location.location_transfer_number || '',
// //             location_google_map_link: location.location_google_map_link || ''
// //         });
// //         setEditingLocation(location);
// //         setIsFormOpen(true);
// //         setError('');
// //         setSuccess('');
// //     };

// //     // Delete location
// //     const handleDelete = async (locationId) => {
// //         if (!window.confirm('Are you sure you want to delete this location?')) {
// //             return;
// //         }

// //         setIsLoading(true);
// //         try {
// //             const token = getAuthToken();
// //             const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/delete/${locationId}/`, {
// //                 method: 'DELETE',
// //                 headers: {
// //                     'Authorization': `Bearer ${token}`,
// //                     'Content-Type': 'application/json'
// //                 }
// //             });

// //             if (!response.ok) {
// //                 throw new Error('Failed to delete location');
// //             }

// //             setLocations(prev => prev.filter(loc => loc.location_id !== locationId));
// //             setSuccess('Location deleted successfully!');
// //             setTimeout(() => setSuccess(''), 3000);
// //         } catch (err) {
// //             setError(err.message);
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };

// //     // Fetch locations on component mount
// //     useEffect(() => {
// //         fetchLocations();
// //     }, []);

// //     return (
// //         <div className="space-y-6">
// //             {/* Header */}
// //             <div className="flex justify-between items-center">
// //                 <h2 className="text-2xl font-bold text-gray-900">Locations Management</h2>
// //                 <button
// //                     onClick={() => {
// //                         resetForm();
// //                         setIsFormOpen(true);
// //                     }}
// //                     className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
// //                 >
// //                     <span>+</span>
// //                     <span>Add New Location</span>
// //                 </button>
// //             </div>

// //             {/* Status Messages */}
// //             {error && (
// //                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
// //                     {error}
// //                 </div>
// //             )}
// //             {success && (
// //                 <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
// //                     {success}
// //                 </div>
// //             )}

// //             {/* Locations Grid */}
// //             {!isFormOpen && (
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //                     {locations.map((location) => (
// //                         <div key={location.location_id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
// //                             <div className="flex justify-between items-start mb-4">
// //                                 <Link to={`/hours-of-operation/${location.location_id}`}>
// //                                 <h3 className="text-lg font-semibold text-gray-900">{location.location_name}</h3>
// //                                 </Link>
// //                                 <div className="flex space-x-2">
// //                                     <button
// //                                         onClick={() => handleEdit(location)}
// //                                         className="text-blue-600 hover:text-blue-800 transition-colors"
// //                                     >
// //                                         Edit
// //                                     </button>
// //                                     <button
// //                                         onClick={() => handleDelete(location.location_id)}
// //                                         className="text-red-600 hover:text-red-800 transition-colors"
// //                                     >
// //                                         Delete
// //                                     </button>
// //                                 </div>
// //                             </div>

// //                             <div className="space-y-3 text-sm text-gray-600">
// //                                 <div>
// //                                     <strong className="text-gray-700">Address:</strong>
// //                                     <p className="mt-1">{location.location_address}</p>
// //                                 </div>
// //                                 <div>
// //                                     <strong className="text-gray-700">Timezone:</strong>
// //                                     <p>{location.location_timezone}</p>
// //                                 </div>
// //                                 {location.location_call_number && (
// //                                     <div>
// //                                         <strong className="text-gray-700">Call Number:</strong>
// //                                         <p>{location.location_call_number}</p>
// //                                     </div>
// //                                 )}
// //                                 {location.location_transfer_number && (
// //                                     <div>
// //                                         <strong className="text-gray-700">Transfer Number:</strong>
// //                                         <p>{location.location_transfer_number}</p>
// //                                     </div>
// //                                 )}
// //                                 {location.location_google_map_link && (
// //                                     <div>
// //                                         <strong className="text-gray-700">Google Maps:</strong>
// //                                         <a
// //                                             href={location.location_google_map_link}
// //                                             target="_blank"
// //                                             rel="noopener noreferrer"
// //                                             className="text-blue-600 hover:text-blue-800 block truncate"
// //                                         >
// //                                             View on Maps
// //                                         </a>
// //                                     </div>
// //                                 )}
// //                             </div>
// //                         </div>
// //                     ))}
// //                 </div>
// //             )}

// //             {/* Empty State */}
// //             {!isFormOpen && locations.length === 0 && !isLoading && (
// //                 <div className="bg-white rounded-lg shadow p-8 text-center">
// //                     <div className="text-gray-400 text-6xl mb-4">📍</div>
// //                     <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Found</h3>
// //                     <p className="text-gray-500 mb-4">Get started by creating your first location.</p>
// //                     <button
// //                         onClick={() => setIsFormOpen(true)}
// //                         className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
// //                     >
// //                         Add Your First Location
// //                     </button>
// //                 </div>
// //             )}

// //             {/* Loading State */}
// //             {isLoading && !isFormOpen && (
// //                 <div className="flex justify-center items-center py-12">
// //                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
// //                 </div>
// //             )}

// //             {/* Location Form Modal */}
// //             {isFormOpen && (
// //                 <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
// //                     <div className="flex justify-between items-center mb-6">
// //                         <h3 className="text-xl font-semibold text-gray-900">
// //                             {editingLocation ? 'Edit Location' : 'Add New Location'}
// //                         </h3>
// //                         <button
// //                             onClick={() => {
// //                                 setIsFormOpen(false);
// //                                 resetForm();
// //                             }}
// //                             className="text-gray-400 hover:text-gray-600 transition-colors"
// //                         >
// //                             ✕
// //                         </button>
// //                     </div>

// //                     <form onSubmit={handleSubmit} className="space-y-6">
// //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                             {/* Location Name */}
// //                             <div className="md:col-span-2">
// //                                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                                     Location Name *
// //                                 </label>
// //                                 <input
// //                                     type="text"
// //                                     name="location_name"
// //                                     value={formData.location_name}
// //                                     onChange={handleInputChange}
// //                                     required
// //                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
// //                                     placeholder="Enter location name"
// //                                 />
// //                             </div>

// //                             {/* Address */}
// //                             <div className="md:col-span-2">
// //                                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                                     Address *
// //                                 </label>
// //                                 <textarea
// //                                     name="location_address"
// //                                     value={formData.location_address}
// //                                     onChange={handleInputChange}
// //                                     required
// //                                     rows={3}
// //                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
// //                                     placeholder="Enter full address"
// //                                 />
// //                             </div>

// //                             {/* Timezone */}
// //                             <div className="md:col-span-2">
// //                                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                                     Timezone *
// //                                 </label>
// //                                 <select
// //                                     name="location_timezone"
// //                                     value={formData.location_timezone}
// //                                     onChange={handleInputChange}
// //                                     required
// //                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
// //                                 >
// //                                     <option value="">Select Timezone</option>
// //                                     {timezones.map(tz => (
// //                                         <option key={tz} value={tz}>{tz}</option>
// //                                     ))}
// //                                 </select>
// //                             </div>

// //                             {/* Call Number */}
// //                             <div>
// //                                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                                     Call Number
// //                                 </label>
// //                                 <input
// //                                     type="tel"
// //                                     name="location_call_number"
// //                                     value={formData.location_call_number}
// //                                     onChange={handleInputChange}
// //                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
// //                                     placeholder="Optional"
// //                                 />
// //                             </div>

// //                             {/* Transfer Number */}
// //                             <div>
// //                                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                                     Transfer Number
// //                                 </label>
// //                                 <input
// //                                     type="tel"
// //                                     name="location_transfer_number"
// //                                     value={formData.location_transfer_number}
// //                                     onChange={handleInputChange}
// //                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
// //                                     placeholder="Optional"
// //                                 />
// //                             </div>

// //                             {/* Google Maps Link */}
// //                             <div className="md:col-span-2">
// //                                 <label className="block text-sm font-medium text-gray-700 mb-2">
// //                                     Google Maps Link
// //                                 </label>
// //                                 <input
// //                                     type="url"
// //                                     name="location_google_map_link"
// //                                     value={formData.location_google_map_link}
// //                                     onChange={handleInputChange}
// //                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
// //                                     placeholder="https://maps.google.com/..."
// //                                 />
// //                             </div>
// //                         </div>

// //                         {/* Form Actions */}
// //                         <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
// //                             <button
// //                                 type="button"
// //                                 onClick={() => {
// //                                     setIsFormOpen(false);
// //                                     resetForm();
// //                                 }}
// //                                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
// //                             >
// //                                 Cancel
// //                             </button>
// //                             <button
// //                                 type="submit"
// //                                 disabled={isLoading}
// //                                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
// //                             >
// //                                 {isLoading && (
// //                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
// //                                 )}
// //                                 <span>
// //                                     {isLoading
// //                                         ? (editingLocation ? 'Updating...' : 'Creating...')
// //                                         : (editingLocation ? 'Update Location' : 'Create Location')
// //                                     }
// //                                 </span>
// //                             </button>
// //                         </div>
// //                     </form>
// //                 </div>
// //             )}
// //         </div>
// //     );
// // };

// // export default Locations;


// // ok now i want you just update the frontend
// // i want you update the get data. 
// // i want first you show some data.
// // then give the button to hidded and unhidded the other data.








// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { Link } from 'react-router-dom';

// const Locations = () => {
//     const userData = useSelector((state) => state.auth.userData);
//     const [locations, setLocations] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');
//     const [editingLocation, setEditingLocation] = useState(null);
//     const [isFormOpen, setIsFormOpen] = useState(false);

//     // Form state with all fields
//     const [formData, setFormData] = useState({
//         location_name: '',
//         location_address: '',
//         location_timezone: '',
//         location_call_number: '',
//         location_transfer_number: '',
//         location_google_map_link: '',
//         // New fields
//         minimum_jumpers_party: 10,
//         guest_of_honor_included_in_minimum_jumpers_party: false,
//         add_additional_hour_of_jump_instruction: false,
//         add_additional_half_hour_of_jump_instruction: false,
//         party_booking_allowed_days_before_party_date: 3,
//         party_reschedule_allowed_before_party_date_days: 3,
//         add_shirts_while_booking: false,
//         elite_member_party_discount_percentage: 20,
//         membership_cancellation_days: 3,
//         little_leaper_age_bracket: 'Recommended for Kids of age 6 years old and under',
//         glow_age_bracket: 'Recommended for Kids of 3 years old and above',
//         from_email_address: 'shereen@purpledesk.ai',
//         minimum_deposit_required_for_booking: '50 percent',
//         pitch_ballons_while_booking: false,
//         is_booking_bot: false,
//         is_edit_bot: false,
//         pitch_group_rates: true,
//         pitch_rental_facility: true,
//         additional_jumper_discount: false,
//         add_party_space_sentence: false
//     });

//     // Timezone options
//     const timezones = [
//         'America/Chicago',
//         'America/New_York',
//         'America/Denver',
//         'America/Los_Angeles',
//         'Pacific Standard Time (PST)',
//         'Eastern Standard Time (EST)',
//     ];

//     // Get auth token from Redux store
//     const getAuthToken = () => {
//         return localStorage.getItem('accessToken') || userData?.token;
//     };

//     // Fetch all locations
//     const fetchLocations = async () => {
//         setIsLoading(true);
//         setError('');
//         try {
//             const token = getAuthToken();
//             const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/`, {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to fetch locations');
//             }

//             const data = await response.json();
//             console.log("This is the data = = " , data)
//             setLocations(data);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Handle form input changes
//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     // Handle number input changes
//     const handleNumberChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value === '' ? '' : Number(value)
//         }));
//     };

//     // Reset form
//     const resetForm = () => {
//         setFormData({
//             location_name: '',
//             location_address: '',
//             location_timezone: '',
//             location_call_number: '',
//             location_transfer_number: '',
//             location_google_map_link: '',
//             // New fields with defaults
//             minimum_jumpers_party: 10,
//             guest_of_honor_included_in_minimum_jumpers_party: false,
//             add_additional_hour_of_jump_instruction: false,
//             add_additional_half_hour_of_jump_instruction: false,
//             party_booking_allowed_days_before_party_date: 3,
//             party_reschedule_allowed_before_party_date_days: 3,
//             add_shirts_while_booking: false,
//             elite_member_party_discount_percentage: 20,
//             membership_cancellation_days: 3,
//             little_leaper_age_bracket: 'Recommended for Kids of age 6 years old and under',
//             glow_age_bracket: 'Recommended for Kids of 3 years old and above',
//             from_email_address: 'shereen@purpledesk.ai',
//             minimum_deposit_required_for_booking: '50 percent',
//             pitch_ballons_while_booking: false,
//             is_booking_bot: false,
//             is_edit_bot: false,
//             pitch_group_rates: true,
//             pitch_rental_facility: true,
//             additional_jumper_discount: false,
//             add_party_space_sentence: false
//         });
//         setEditingLocation(null);
//         setError('');
//         setSuccess('');
//     };

//     // Submit form (create or update)
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setError('');
//         setSuccess('');

//         try {
//             const token = getAuthToken();
//             const url = editingLocation
//                 ? `${import.meta.env.VITE_BackendApi}/locations/update/${editingLocation.location_id}/`
//                 : `${import.meta.env.VITE_BackendApi}/locations/create/`;

//             const method = editingLocation ? 'PUT' : 'POST';

//             const response = await fetch(url, {
//                 method: method,
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify(formData)
//             });
//             console.log("This is the formData == ", formData)

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 if (typeof errorData === 'object' && !errorData.detail) {
//                     const messages = Object.entries(errorData)
//                         .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
//                         .join('\n');
//                     throw new Error(messages);
//                 }
//                 throw new Error(errorData.detail || 'Failed to save location');
//             }

//             const savedLocation = await response.json();

//             if (editingLocation) {
//                 setLocations(prev => prev.map(loc =>
//                     loc.location_id === savedLocation.location_id ? savedLocation : loc
//                 ));
//                 setSuccess('Location updated successfully!');
//             } else {
//                 setLocations(prev => [...prev, savedLocation]);
//                 setSuccess('Location created successfully!');
//             }

//             resetForm();
//             setIsFormOpen(false);
//             setTimeout(() => setSuccess(''), 3000);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Edit location
//     const handleEdit = (location) => {
//         setFormData({
//             location_name: location.location_name || '',
//             location_address: location.location_address || '',
//             location_timezone: location.location_timezone || '',
//             location_call_number: location.location_call_number || '',
//             location_transfer_number: location.location_transfer_number || '',
//             location_google_map_link: location.location_google_map_link || '',
//             // New fields
//             minimum_jumpers_party: location.minimum_jumpers_party || 10,
//             guest_of_honor_included_in_minimum_jumpers_party: location.guest_of_honor_included_in_minimum_jumpers_party || false,
//             add_additional_hour_of_jump_instruction: location.add_additional_hour_of_jump_instruction || false,
//             add_additional_half_hour_of_jump_instruction: location.add_additional_half_hour_of_jump_instruction || false,
//             party_booking_allowed_days_before_party_date: location.party_booking_allowed_days_before_party_date || 3,
//             party_reschedule_allowed_before_party_date_days: location.party_reschedule_allowed_before_party_date_days || 3,
//             add_shirts_while_booking: location.add_shirts_while_booking || false,
//             elite_member_party_discount_percentage: location.elite_member_party_discount_percentage || 20,
//             membership_cancellation_days: location.membership_cancellation_days || 3,
//             little_leaper_age_bracket: location.little_leaper_age_bracket || 'Recommended for Kids of age 6 years old and under',
//             glow_age_bracket: location.glow_age_bracket || 'Recommended for Kids of 3 years old and above',
//             from_email_address: location.from_email_address || 'shereen@purpledesk.ai',
//             minimum_deposit_required_for_booking: location.minimum_deposit_required_for_booking || '50 percent',
//             pitch_ballons_while_booking: location.pitch_ballons_while_booking || false,
//             is_booking_bot: location.is_booking_bot || false,
//             is_edit_bot: location.is_edit_bot || false,
//             pitch_group_rates: location.pitch_group_rates !== undefined ? location.pitch_group_rates : true,
//             pitch_rental_facility: location.pitch_rental_facility !== undefined ? location.pitch_rental_facility : true,
//             additional_jumper_discount: location.additional_jumper_discount || false,
//             add_party_space_sentence: location.add_party_space_sentence || false
//         });
//         setEditingLocation(location);
//         setIsFormOpen(true);
//         setError('');
//         setSuccess('');
//     };

//     // Delete location
//     const handleDelete = async (locationId) => {
//         if (!window.confirm('Are you sure you want to delete this location?')) {
//             return;
//         }

//         setIsLoading(true);
//         try {
//             const token = getAuthToken();
//             const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/delete/${locationId}/`, {
//                 method: 'DELETE',
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error('Failed to delete location');
//             }

//             setLocations(prev => prev.filter(loc => loc.location_id !== locationId));
//             setSuccess('Location deleted successfully!');
//             setTimeout(() => setSuccess(''), 3000);
//         } catch (err) {
//             setError(err.message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Fetch locations on component mount
//     useEffect(() => {
//         fetchLocations();
//     }, []);

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex justify-between items-center">
//                 <h2 className="text-2xl font-bold text-gray-900">Locations Management</h2>
//                 <button
//                     onClick={() => {
//                         resetForm();
//                         setIsFormOpen(true);
//                     }}
//                     className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
//                 >
//                     <span>+</span>
//                     <span>Add New Location</span>
//                 </button>
//             </div>

//             {/* Status Messages */}
//             {error && (
//                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
//                     {error}
//                 </div>
//             )}
//             {success && (
//                 <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
//                     {success}
//                 </div>
//             )}

//             {/* Locations Grid */}
//             {!isFormOpen && (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {locations.map((location) => (
//                         <div key={location.location_id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
//                             <div className="flex justify-between items-start mb-4">
//                                 <Link to={`/hours-of-operation/${location.location_id}`}>
//                                     <h3 className="text-lg font-semibold text-gray-900">{location.location_name}</h3>
//                                 </Link>
//                                 <div className="flex space-x-2">
//                                     <button
//                                         onClick={() => handleEdit(location)}
//                                         className="text-blue-600 hover:text-blue-800 transition-colors"
//                                     >
//                                         Edit
//                                     </button>
//                                     <button
//                                         onClick={() => handleDelete(location.location_id)}
//                                         className="text-red-600 hover:text-red-800 transition-colors"
//                                     >
//                                         Delete
//                                     </button>
//                                 </div>
//                             </div>

//                             <div className="space-y-3 text-sm text-gray-600">
//                                 <div>
//                                     <strong className="text-gray-700">Address:</strong>
//                                     <p className="mt-1">{location.location_address}</p>
//                                 </div>
//                                 <div>
//                                     <strong className="text-gray-700">Timezone:</strong>
//                                     <p>{location.location_timezone}</p>
//                                 </div>
//                                 {location.location_call_number && (
//                                     <div>
//                                         <strong className="text-gray-700">Call Number:</strong>
//                                         <p>{location.location_call_number}</p>
//                                     </div>
//                                 )}
//                                 {location.location_transfer_number && (
//                                     <div>
//                                         <strong className="text-gray-700">Transfer Number:</strong>
//                                         <p>{location.location_transfer_number}</p>
//                                     </div>
//                                 )}
//                                 {location.location_google_map_link && (
//                                     <div>
//                                         <strong className="text-gray-700">Google Maps:</strong>
//                                         <a
//                                             href={location.location_google_map_link}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="text-blue-600 hover:text-blue-800 block truncate"
//                                         >
//                                             View on Maps
//                                         </a>
//                                     </div>
//                                 )}
//                                 {/* New fields display */}
//                                 <div>
//                                     <strong className="text-gray-700">Min Jumpers for Party:</strong>
//                                     <p>{location.minimum_jumpers_party}</p>
//                                 </div>
//                                 <div>
//                                     <strong className="text-gray-700">Elite Member Discount:</strong>
//                                     <p>{location.elite_member_party_discount_percentage}%</p>
//                                 </div>
//                                 <div>
//                                     <strong className="text-gray-700">From Email:</strong>
//                                     <p>{location.from_email_address}</p>
//                                 </div>
//                                 <div>
//                                     <strong className="text-gray-700">Little Leaper Age:</strong>
//                                     <p>{location.little_leaper_age_bracket}</p>
//                                 </div>
//                                 <div>
//                                     <strong className="text-gray-700">Glow Age:</strong>
//                                     <p>{location.glow_age_bracket}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}

//             {/* Empty State */}
//             {!isFormOpen && locations.length === 0 && !isLoading && (
//                 <div className="bg-white rounded-lg shadow p-8 text-center">
//                     <div className="text-gray-400 text-6xl mb-4">📍</div>
//                     <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Found</h3>
//                     <p className="text-gray-500 mb-4">Get started by creating your first location.</p>
//                     <button
//                         onClick={() => setIsFormOpen(true)}
//                         className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
//                     >
//                         Add Your First Location
//                     </button>
//                 </div>
//             )}

//             {/* Loading State */}
//             {isLoading && !isFormOpen && (
//                 <div className="flex justify-center items-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//                 </div>
//             )}

//             {/* Location Form Modal */}
//             {isFormOpen && (
//                 <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
//                     <div className="flex justify-between items-center mb-6">
//                         <h3 className="text-xl font-semibold text-gray-900">
//                             {editingLocation ? 'Edit Location' : 'Add New Location'}
//                         </h3>
//                         <button
//                             onClick={() => {
//                                 setIsFormOpen(false);
//                                 resetForm();
//                             }}
//                             className="text-gray-400 hover:text-gray-600 transition-colors"
//                         >
//                             ✕
//                         </button>
//                     </div>

//                     <form onSubmit={handleSubmit} className="space-y-8">
//                         {/* Basic Information Section */}
//                         <div>
//                             <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div className="md:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Location Name *
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="location_name"
//                                         value={formData.location_name}
//                                         onChange={handleInputChange}
//                                         required
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                         placeholder="Enter location name"
//                                     />
//                                 </div>

//                                 <div className="md:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Address *
//                                     </label>
//                                     <textarea
//                                         name="location_address"
//                                         value={formData.location_address}
//                                         onChange={handleInputChange}
//                                         required
//                                         rows={3}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                         placeholder="Enter full address"
//                                     />
//                                 </div>

//                                 <div className="md:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Timezone *
//                                     </label>
//                                     <select
//                                         name="location_timezone"
//                                         value={formData.location_timezone}
//                                         onChange={handleInputChange}
//                                         required
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                     >
//                                         <option value="">Select Timezone</option>
//                                         {timezones.map(tz => (
//                                             <option key={tz} value={tz}>{tz}</option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Call Number
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         name="location_call_number"
//                                         value={formData.location_call_number}
//                                         onChange={handleInputChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                         placeholder="Optional"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Transfer Number
//                                     </label>
//                                     <input
//                                         type="tel"
//                                         name="location_transfer_number"
//                                         value={formData.location_transfer_number}
//                                         onChange={handleInputChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                         placeholder="Optional"
//                                     />
//                                 </div>

//                                 <div className="md:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Google Maps Link
//                                     </label>
//                                     <input
//                                         type="url"
//                                         name="location_google_map_link"
//                                         value={formData.location_google_map_link}
//                                         onChange={handleInputChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                         placeholder="https://maps.google.com/..."
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         From Email Address *
//                                     </label>
//                                     <input
//                                         type="email"
//                                         name="from_email_address"
//                                         value={formData.from_email_address}
//                                         onChange={handleInputChange}
//                                         required
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                         placeholder="Enter email address"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Party Settings Section */}
//                         <div>
//                             <h4 className="text-lg font-medium text-gray-900 mb-4">Party Settings</h4>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Minimum Jumpers for Party
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="minimum_jumpers_party"
//                                         value={formData.minimum_jumpers_party}
//                                         onChange={handleNumberChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Party Booking Allowed Days Before
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="party_booking_allowed_days_before_party_date"
//                                         value={formData.party_booking_allowed_days_before_party_date}
//                                         onChange={handleNumberChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Party Reschedule Allowed Days Before
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="party_reschedule_allowed_before_party_date_days"
//                                         value={formData.party_reschedule_allowed_before_party_date_days}
//                                         onChange={handleNumberChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Minimum Deposit Required
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="minimum_deposit_required_for_booking"
//                                         value={formData.minimum_deposit_required_for_booking}
//                                         onChange={handleInputChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                         placeholder="e.g., 50 percent"
//                                     />
//                                 </div>

//                                 <div className="md:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Little Leaper Age Bracket
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="little_leaper_age_bracket"
//                                         value={formData.little_leaper_age_bracket}
//                                         onChange={handleInputChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                     />
//                                 </div>

//                                 <div className="md:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Glow Age Bracket
//                                     </label>
//                                     <input
//                                         type="text"
//                                         name="glow_age_bracket"
//                                         value={formData.glow_age_bracket}
//                                         onChange={handleInputChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Membership & Discounts Section */}
//                         <div>
//                             <h4 className="text-lg font-medium text-gray-900 mb-4">Membership & Discounts</h4>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Elite Member Party Discount (%)
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="elite_member_party_discount_percentage"
//                                         value={formData.elite_member_party_discount_percentage}
//                                         onChange={handleNumberChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Membership Cancellation Days
//                                     </label>
//                                     <input
//                                         type="number"
//                                         name="membership_cancellation_days"
//                                         value={formData.membership_cancellation_days}
//                                         onChange={handleNumberChange}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Features & Options Section */}
//                         <div>
//                             <h4 className="text-lg font-medium text-gray-900 mb-4">Features & Options</h4>
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 {/* Checkbox options */}
//                                 {[
//                                     { name: 'guest_of_honor_included_in_minimum_jumpers_party', label: 'Guest of Honor Included in Minimum Jumpers' },
//                                     { name: 'add_additional_hour_of_jump_instruction', label: 'Add Additional Hour of Jump Instruction' },
//                                     { name: 'add_additional_half_hour_of_jump_instruction', label: 'Add Additional Half Hour of Jump Instruction' },
//                                     { name: 'add_shirts_while_booking', label: 'Add Shirts While Booking' },
//                                     { name: 'pitch_ballons_while_booking', label: 'Pitch Balloons While Booking' },
//                                     { name: 'is_booking_bot', label: 'Enable Booking Bot' },
//                                     { name: 'is_edit_bot', label: 'Enable Edit Bot' },
//                                     { name: 'pitch_group_rates', label: 'Pitch Group Rates' },
//                                     { name: 'pitch_rental_facility', label: 'Pitch Rental Facility' },
//                                     { name: 'additional_jumper_discount', label: 'Additional Jumper Discount' },
//                                     { name: 'add_party_space_sentence', label: 'Add Party Space Sentence' }
//                                 ].map((field) => (
//                                     <div key={field.name} className="flex items-center">
//                                         <input
//                                             type="checkbox"
//                                             name={field.name}
//                                             checked={formData[field.name]}
//                                             onChange={handleInputChange}
//                                             className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                                         />
//                                         <label className="ml-2 block text-sm text-gray-700">
//                                             {field.label}
//                                         </label>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>

//                         {/* Form Actions */}
//                         <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
//                             <button
//                                 type="button"
//                                 onClick={() => {
//                                     setIsFormOpen(false);
//                                     resetForm();
//                                 }}
//                                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={isLoading}
//                                 className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
//                             >
//                                 {isLoading && (
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                                 )}
//                                 <span>
//                                     {isLoading
//                                         ? (editingLocation ? 'Updating...' : 'Creating...')
//                                         : (editingLocation ? 'Update Location' : 'Create Location')
//                                     }
//                                 </span>
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default Locations;














import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Locations = () => {
    const userData = useSelector((state) => state.auth.userData);
    const [locations, setLocations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingLocation, setEditingLocation] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [expandedLocations, setExpandedLocations] = useState({});

    // Form state with all fields
    const [formData, setFormData] = useState({
        location_name: '',
        location_address: '',
        location_timezone: '',
        location_call_number: '',
        location_transfer_number: '',
        location_google_map_link: '',
        // New fields
        minimum_jumpers_party: 10,
        guest_of_honor_included_in_minimum_jumpers_party: false,
        add_additional_hour_of_jump_instruction: false,
        add_additional_half_hour_of_jump_instruction: false,
        party_booking_allowed_days_before_party_date: 3,
        party_reschedule_allowed_before_party_date_days: 3,
        add_shirts_while_booking: false,
        elite_member_party_discount_percentage: 20,
        membership_cancellation_days: 3,
        little_leaper_age_bracket: 'Recommended for Kids of age 6 years old and under',
        glow_age_bracket: 'Recommended for Kids of 3 years old and above',
        from_email_address: 'shereen@purpledesk.ai',
        minimum_deposit_required_for_booking: '50 percent',
        pitch_ballons_while_booking: false,
        is_booking_bot: false,
        is_edit_bot: false,
        pitch_group_rates: true,
        pitch_rental_facility: true,
        additional_jumper_discount: false,
        add_party_space_sentence: false
    });

    // Timezone options
    const timezones = [
        'America/Chicago',
        'America/New_York',
        'America/Denver',
        'America/Los_Angeles',
        'Pacific Standard Time (PST)',
        'Eastern Standard Time (EST)',
    ];

    // Get auth token from Redux store
    const getAuthToken = () => {
        return localStorage.getItem('accessToken') || userData?.token;
    };

    // Toggle expanded view for a location
    const toggleExpanded = (locationId) => {
        setExpandedLocations(prev => ({
            ...prev,
            [locationId]: !prev[locationId]
        }));
    };

    // Fetch all locations
    const fetchLocations = async () => {
        setIsLoading(true);
        setError('');
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch locations');
            }

            const data = await response.json();
            setLocations(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle number input changes
    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value === '' ? '' : Number(value)
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            location_name: '',
            location_address: '',
            location_timezone: '',
            location_call_number: '',
            location_transfer_number: '',
            location_google_map_link: '',
            // New fields with defaults
            minimum_jumpers_party: 10,
            guest_of_honor_included_in_minimum_jumpers_party: false,
            add_additional_hour_of_jump_instruction: false,
            add_additional_half_hour_of_jump_instruction: false,
            party_booking_allowed_days_before_party_date: 3,
            party_reschedule_allowed_before_party_date_days: 3,
            add_shirts_while_booking: false,
            elite_member_party_discount_percentage: 20,
            membership_cancellation_days: 3,
            little_leaper_age_bracket: 'Recommended for Kids of age 6 years old and under',
            glow_age_bracket: 'Recommended for Kids of 3 years old and above',
            from_email_address: 'shereen@purpledesk.ai',
            minimum_deposit_required_for_booking: '50 percent',
            pitch_ballons_while_booking: false,
            is_booking_bot: false,
            is_edit_bot: false,
            pitch_group_rates: true,
            pitch_rental_facility: true,
            additional_jumper_discount: false,
            add_party_space_sentence: false
        });
        setEditingLocation(null);
        setError('');
        setSuccess('');
    };

    // Submit form (create or update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const token = getAuthToken();
            const url = editingLocation
                ? `${import.meta.env.VITE_BackendApi}/locations/update/${editingLocation.location_id}/`
                : `${import.meta.env.VITE_BackendApi}/locations/create/`;

            const method = editingLocation ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (typeof errorData === 'object' && !errorData.detail) {
                    const messages = Object.entries(errorData)
                        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
                        .join('\n');
                    throw new Error(messages);
                }
                throw new Error(errorData.detail || 'Failed to save location');
            }

            const savedLocation = await response.json();

            if (editingLocation) {
                setLocations(prev => prev.map(loc =>
                    loc.location_id === savedLocation.location_id ? savedLocation : loc
                ));
                setSuccess('Location updated successfully!');
            } else {
                setLocations(prev => [...prev, savedLocation]);
                setSuccess('Location created successfully!');
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

    // Edit location
    const handleEdit = (location) => {
        setFormData({
            location_name: location.location_name || '',
            location_address: location.location_address || '',
            location_timezone: location.location_timezone || '',
            location_call_number: location.location_call_number || '',
            location_transfer_number: location.location_transfer_number || '',
            location_google_map_link: location.location_google_map_link || '',
            // New fields
            minimum_jumpers_party: location.minimum_jumpers_party || 10,
            guest_of_honor_included_in_minimum_jumpers_party: location.guest_of_honor_included_in_minimum_jumpers_party || false,
            add_additional_hour_of_jump_instruction: location.add_additional_hour_of_jump_instruction || false,
            add_additional_half_hour_of_jump_instruction: location.add_additional_half_hour_of_jump_instruction || false,
            party_booking_allowed_days_before_party_date: location.party_booking_allowed_days_before_party_date || 3,
            party_reschedule_allowed_before_party_date_days: location.party_reschedule_allowed_before_party_date_days || 3,
            add_shirts_while_booking: location.add_shirts_while_booking || false,
            elite_member_party_discount_percentage: location.elite_member_party_discount_percentage || 20,
            membership_cancellation_days: location.membership_cancellation_days || 3,
            little_leaper_age_bracket: location.little_leaper_age_bracket || 'Recommended for Kids of age 6 years old and under',
            glow_age_bracket: location.glow_age_bracket || 'Recommended for Kids of 3 years old and above',
            from_email_address: location.from_email_address || 'shereen@purpledesk.ai',
            minimum_deposit_required_for_booking: location.minimum_deposit_required_for_booking || '50 percent',
            pitch_ballons_while_booking: location.pitch_ballons_while_booking || false,
            is_booking_bot: location.is_booking_bot || false,
            is_edit_bot: location.is_edit_bot || false,
            pitch_group_rates: location.pitch_group_rates !== undefined ? location.pitch_group_rates : true,
            pitch_rental_facility: location.pitch_rental_facility !== undefined ? location.pitch_rental_facility : true,
            additional_jumper_discount: location.additional_jumper_discount || false,
            add_party_space_sentence: location.add_party_space_sentence || false
        });
        setEditingLocation(location);
        setIsFormOpen(true);
        setError('');
        setSuccess('');
    };

    // Delete location
    const handleDelete = async (locationId) => {
        if (!window.confirm('Are you sure you want to delete this location?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_BackendApi}/locations/delete/${locationId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete location');
            }

            setLocations(prev => prev.filter(loc => loc.location_id !== locationId));
            setSuccess('Location deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch locations on component mount
    useEffect(() => {
        fetchLocations();
    }, []);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Locations Management</h2>
                <button
                    onClick={() => {
                        resetForm();
                        setIsFormOpen(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                    <span>+</span>
                    <span>Add New Location</span>
                </button>
            </div>

            {/* Status Messages */}
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

            {/* Locations Grid */}
            {!isFormOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locations.map((location) => (
                        <div key={location.location_id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <Link to={`/hours-of-operation/${location.location_id}`}>
                                    <h3 className="text-lg font-semibold text-gray-900">{location.location_name}</h3>
                                </Link>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(location)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(location.location_id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                {/* Basic Information - Always Visible */}
                                <div>
                                    <strong className="text-gray-700">Address:</strong>
                                    <p className="mt-1">{location.location_address}</p>
                                </div>
                                <div>
                                    <strong className="text-gray-700">Timezone:</strong>
                                    <p>{location.location_timezone}</p>
                                </div>
                                {location.location_call_number && (
                                    <div>
                                        <strong className="text-gray-700">Call Number:</strong>
                                        <p>{location.location_call_number}</p>
                                    </div>
                                )}
                                {location.location_transfer_number && (
                                    <div>
                                        <strong className="text-gray-700">Transfer Number:</strong>
                                        <p>{location.location_transfer_number}</p>
                                    </div>
                                )}
                                {location.location_google_map_link && (
                                    <div>
                                        <strong className="text-gray-700">Google Maps:</strong>
                                        <a
                                            href={location.location_google_map_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 block truncate"
                                        >
                                            View on Maps
                                        </a>
                                    </div>
                                )}

                                {/* Additional Information - Conditionally Visible */}
                                {expandedLocations[location.location_id] && (
                                    <div className="border-t pt-3 mt-3 space-y-3">
                                        <div>
                                            <strong className="text-gray-700">Min Jumpers for Party:</strong>
                                            <p>{location.minimum_jumpers_party}</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Elite Member Discount:</strong>
                                            <p>{location.elite_member_party_discount_percentage}%</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">From Email:</strong>
                                            <p>{location.from_email_address}</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Little Leaper Age:</strong>
                                            <p>{location.little_leaper_age_bracket}</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Glow Age:</strong>
                                            <p>{location.glow_age_bracket}</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Party Booking Days Before:</strong>
                                            <p>{location.party_booking_allowed_days_before_party_date} days</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Reschedule Days Before:</strong>
                                            <p>{location.party_reschedule_allowed_before_party_date_days} days</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Membership Cancellation Days:</strong>
                                            <p>{location.membership_cancellation_days} days</p>
                                        </div>
                                        <div>
                                            <strong className="text-gray-700">Minimum Deposit:</strong>
                                            <p>{location.minimum_deposit_required_for_booking}</p>
                                        </div>
                                        
                                        {/* Boolean Fields */}
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className={`px-2 py-1 rounded ${location.guest_of_honor_included_in_minimum_jumpers_party ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Guest of Honor Included: {location.guest_of_honor_included_in_minimum_jumpers_party ? 'Yes' : 'No'}
                                            </div>
                                            <div className={`px-2 py-1 rounded ${location.add_additional_hour_of_jump_instruction ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Extra Hour: {location.add_additional_hour_of_jump_instruction ? 'Yes' : 'No'}
                                            </div>
                                            <div className={`px-2 py-1 rounded ${location.add_additional_half_hour_of_jump_instruction ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Extra Half Hour: {location.add_additional_half_hour_of_jump_instruction ? 'Yes' : 'No'}
                                            </div>
                                            <div className={`px-2 py-1 rounded ${location.add_shirts_while_booking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Add Shirts: {location.add_shirts_while_booking ? 'Yes' : 'No'}
                                            </div>
                                            <div className={`px-2 py-1 rounded ${location.pitch_ballons_while_booking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Pitch Balloons: {location.pitch_ballons_while_booking ? 'Yes' : 'No'}
                                            </div>
                                            <div className={`px-2 py-1 rounded ${location.is_booking_bot ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Booking Bot: {location.is_booking_bot ? 'Yes' : 'No'}
                                            </div>
                                            <div className={`px-2 py-1 rounded ${location.is_edit_bot ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Edit Bot: {location.is_edit_bot ? 'Yes' : 'No'}
                                            </div>
                                            <div className={`px-2 py-1 rounded ${location.pitch_group_rates ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Group Rates: {location.pitch_group_rates ? 'Yes' : 'No'}
                                            </div>
                                            <div className={`px-2 py-1 rounded ${location.pitch_rental_facility ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Rental Facility: {location.pitch_rental_facility ? 'Yes' : 'No'}
                                            </div>
                                            <div className={`px-2 py-1 rounded ${location.additional_jumper_discount ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Jumper Discount: {location.additional_jumper_discount ? 'Yes' : 'No'}
                                            </div>
                                            <div className={`px-2 py-1 rounded ${location.add_party_space_sentence ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                                Party Space: {location.add_party_space_sentence ? 'Yes' : 'No'}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Toggle Button */}
                                <div className="pt-2">
                                    <button
                                        onClick={() => toggleExpanded(location.location_id)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                                    >
                                        {expandedLocations[location.location_id] ? '▲ Show Less' : '▼ Show More Details'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isFormOpen && locations.length === 0 && !isLoading && (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Locations Found</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first location.</p>
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Add Your First Location
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && !isFormOpen && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Location Form Modal */}
            {isFormOpen && (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {editingLocation ? 'Edit Location' : 'Add New Location'}
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

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Information Section */}
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="location_name"
                                        value={formData.location_name}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="Enter location name"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address *
                                    </label>
                                    <textarea
                                        name="location_address"
                                        value={formData.location_address}
                                        onChange={handleInputChange}
                                        required
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="Enter full address"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timezone *
                                    </label>
                                    <select
                                        name="location_timezone"
                                        value={formData.location_timezone}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    >
                                        <option value="">Select Timezone</option>
                                        {timezones.map(tz => (
                                            <option key={tz} value={tz}>{tz}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Call Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="location_call_number"
                                        value={formData.location_call_number}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="Optional"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transfer Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="location_transfer_number"
                                        value={formData.location_transfer_number}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="Optional"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Google Maps Link
                                    </label>
                                    <input
                                        type="url"
                                        name="location_google_map_link"
                                        value={formData.location_google_map_link}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="https://maps.google.com/..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        From Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="from_email_address"
                                        value={formData.from_email_address}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="Enter email address"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Party Settings Section */}
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Party Settings</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Jumpers for Party
                                    </label>
                                    <input
                                        type="number"
                                        name="minimum_jumpers_party"
                                        value={formData.minimum_jumpers_party}
                                        onChange={handleNumberChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Party Booking Allowed Days Before
                                    </label>
                                    <input
                                        type="number"
                                        name="party_booking_allowed_days_before_party_date"
                                        value={formData.party_booking_allowed_days_before_party_date}
                                        onChange={handleNumberChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Party Reschedule Allowed Days Before
                                    </label>
                                    <input
                                        type="number"
                                        name="party_reschedule_allowed_before_party_date_days"
                                        value={formData.party_reschedule_allowed_before_party_date_days}
                                        onChange={handleNumberChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Deposit Required
                                    </label>
                                    <input
                                        type="text"
                                        name="minimum_deposit_required_for_booking"
                                        value={formData.minimum_deposit_required_for_booking}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="e.g., 50 percent"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Little Leaper Age Bracket
                                    </label>
                                    <input
                                        type="text"
                                        name="little_leaper_age_bracket"
                                        value={formData.little_leaper_age_bracket}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Glow Age Bracket
                                    </label>
                                    <input
                                        type="text"
                                        name="glow_age_bracket"
                                        value={formData.glow_age_bracket}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Membership & Discounts Section */}
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Membership & Discounts</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Elite Member Party Discount (%)
                                    </label>
                                    <input
                                        type="number"
                                        name="elite_member_party_discount_percentage"
                                        value={formData.elite_member_party_discount_percentage}
                                        onChange={handleNumberChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Membership Cancellation Days
                                    </label>
                                    <input
                                        type="number"
                                        name="membership_cancellation_days"
                                        value={formData.membership_cancellation_days}
                                        onChange={handleNumberChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Features & Options Section */}
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Features & Options</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Checkbox options */}
                                {[
                                    { name: 'guest_of_honor_included_in_minimum_jumpers_party', label: 'Guest of Honor Included in Minimum Jumpers' },
                                    { name: 'add_additional_hour_of_jump_instruction', label: 'Add Additional Hour of Jump Instruction' },
                                    { name: 'add_additional_half_hour_of_jump_instruction', label: 'Add Additional Half Hour of Jump Instruction' },
                                    { name: 'add_shirts_while_booking', label: 'Add Shirts While Booking' },
                                    { name: 'pitch_ballons_while_booking', label: 'Pitch Balloons While Booking' },
                                    { name: 'is_booking_bot', label: 'Enable Booking Bot' },
                                    { name: 'is_edit_bot', label: 'Enable Edit Bot' },
                                    { name: 'pitch_group_rates', label: 'Pitch Group Rates' },
                                    { name: 'pitch_rental_facility', label: 'Pitch Rental Facility' },
                                    { name: 'additional_jumper_discount', label: 'Additional Jumper Discount' },
                                    { name: 'add_party_space_sentence', label: 'Add Party Space Sentence' }
                                ].map((field) => (
                                    <div key={field.name} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name={field.name}
                                            checked={formData[field.name]}
                                            onChange={handleInputChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-700">
                                            {field.label}
                                        </label>
                                    </div>
                                ))}
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
                                        ? (editingLocation ? 'Updating...' : 'Creating...')
                                        : (editingLocation ? 'Update Location' : 'Create Location')
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

export default Locations;