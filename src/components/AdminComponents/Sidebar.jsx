


// Sidebar.jsx
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { logout } from '../../store/authSlice';

const Sidebar = ({ isOpen, activeSection, setActiveSection, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { location_id } = useParams();
    const location = useLocation();
    const activeItemRef = useRef(null);
    const navRef = useRef(null);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    // Updated menu items with better icons
    const menuItems = [
        { id: 'Hours of Operation', label: 'Hours of Operation', icon: '🕒', path: `/hours-of-operation/${location_id}` },
        { id: 'Balloon Packages', label: 'Balloon Packages', icon: '🎈', path: `/balloon-party-package/${location_id}` },
        { id: 'BirthDay packages', label: 'BirthDay Packages', icon: '🎂', path: `/birthdat-party-package/${location_id}` },
        { id: 'Jump Pass', label: 'Jump Pass', icon: '🎫', path: `/jump-pass/${location_id}` },
        { id: 'MemberShip', label: 'MemberShip', icon: '👑', path: `/membership/${location_id}` },
        { id: 'ItemFoodPrices', label: 'Item Food Prices', icon: '🍕', path: `/item-food-prices/${location_id}` },
        { id: 'Rental Facilities', label: 'Rental Facilities', icon: '🏢', path: `/rental-facilities/${location_id}` },
        { id: 'Group Booking', label: 'Group Booking', icon: '👥', path: `/group-booking/${location_id}` },
        { id: 'Promotions', label: 'Promotions', icon: '🎁', path: `/promotions/${location_id}` },
        { id: 'Policy', label: 'Policy', icon: '📜', path: `/policy/${location_id}` },
        { id: 'FAQs', label: 'FAQs', icon: '❓', path: `/FAQs/${location_id}` },
    ];

    // Automatically highlight based on the current URL
    useEffect(() => {
        const currentItem = menuItems.find(
            (item) => item.path && location.pathname.startsWith(item.path.split('/:')[0])
        );
        if (currentItem) {
            setActiveSection(currentItem.id);
        }
    }, [location.pathname]);

    // Scroll active item into view when activeSection changes
    useEffect(() => {
        if (activeItemRef.current && navRef.current) {
            // Small delay to ensure the DOM has updated
            setTimeout(() => {
                const activeElement = activeItemRef.current;
                const navContainer = navRef.current;
                
                if (activeElement && navContainer) {
                    // Calculate position to scroll to
                    const elementTop = activeElement.offsetTop;
                    const elementHeight = activeElement.offsetHeight;
                    const containerHeight = navContainer.clientHeight;
                    
                    // Scroll to center the active item
                    const scrollTo = elementTop - (containerHeight / 2) + (elementHeight / 2);
                    
                    navContainer.scrollTo({
                        top: scrollTo,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [activeSection]);

    // Handle menu item click
    const handleMenuItemClick = (itemId, path) => {
        setActiveSection(itemId);
        if (window.innerWidth < 1024) {
            onClose();
        }
        
        // If it's a link, the navigation will happen automatically
        // If it's a button, you might want to handle the action here
    };

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform transition duration-300 ease-in-out
                lg:static lg:translate-x-0 lg:z-auto
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
                    <Link to="/dashboard">
                        <h1 className="text-white text-xl font-semibold">Admin Panel</h1>
                    </Link>
                    <button
                        className="text-gray-400 hover:text-white lg:hidden"
                        onClick={onClose}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Menu Container */}
                <div className="flex flex-col h-[calc(100vh-4rem)]">
                    {/* Scrollable Menu Items - Scrollbar always hidden */}
                    <nav 
                        ref={navRef}
                        className="flex-1 overflow-y-auto 
                                  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                        <ul className="px-4 space-y-2 py-4">
                            {menuItems.map((item) => (
                                <li 
                                    key={item.id}
                                    ref={activeSection === item.id ? activeItemRef : null}
                                >
                                    {item.path ? (
                                        <Link
                                            to={item.path}
                                            onClick={() => handleMenuItemClick(item.id, item.path)}
                                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 relative
                                                ${
                                                    activeSection === item.id
                                                        ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02] border-l-4 border-blue-400'
                                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                                                }`}
                                        >
                                            {/* Active indicator dot */}
                                            {activeSection === item.id && (
                                                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
                                            )}
                                            <span className="mr-3 text-lg w-6 text-center">{item.icon}</span>
                                            <span className="font-medium">{item.label}</span>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={() => handleMenuItemClick(item.id)}
                                            className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 relative
                                                ${
                                                    activeSection === item.id
                                                        ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02] border-l-4 border-blue-400'
                                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white hover:translate-x-1'
                                                }`}
                                        >
                                            {/* Active indicator dot */}
                                            {activeSection === item.id && (
                                                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
                                            )}
                                            <span className="mr-3 text-lg w-6 text-center">{item.icon}</span>
                                            <span className="font-medium">{item.label}</span>
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Fixed Logout Button */}
                    <div className="flex-shrink-0 border-t border-gray-700 p-4">
                        <button
                            className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 group hover:translate-x-1"
                            onClick={handleLogout}
                        >
                            <span className="mr-3 text-lg w-6 text-center group-hover:scale-110 transition-transform">🚪</span>
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;

