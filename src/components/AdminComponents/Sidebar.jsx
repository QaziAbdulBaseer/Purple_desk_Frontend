



// Sidebar.jsx
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { logout } from '../../store/authSlice';

const Sidebar = ({ isOpen, activeSection, setActiveSection, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { location_id } = useParams();
    const location = useLocation(); // 👈 get current route path

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    // 👇 Define menu items with paths
    const menuItems = [
        { id: 'Hours of Operation', label: 'Hours of Operation', icon: '📊', path: `/hours-of-operation/${location_id}` },
        { id: 'BirthDay packages', label: 'BirthDay packages', icon: '📈' , path: `/birthdat-party-package/${location_id}` },
        { id: 'Jump Pass', label: 'Jump Pass', icon: '👥', path: `/jump-pass/${location_id}` },
        { id: 'MemberShip', label: 'MemberShip', icon: '✅', path: `/membership/${location_id}` },
        { id: 'Food Items', label: 'Food Items', icon: '📄' },
        { id: 'Item Prices', label: 'Item Prices', icon: '📄' },
        { id: 'Discount', label: 'Discount', icon: '⚙️' },
        { id: 'Promotions', label: 'Promotions', icon: '⚙️' },
        { id: 'Policy', label: 'Policy', icon: '⚙️' },
        { id: 'FAQs', label: 'FAQs', icon: '⚙️' ,  path: `/FAQs/${location_id}` },
    ];

    // 👇 Automatically highlight based on the current URL
    useEffect(() => {
        const currentItem = menuItems.find(
            (item) => item.path && location.pathname.startsWith(item.path.split('/:')[0])
        );
        if (currentItem) {
            setActiveSection(currentItem.id);
        }
    }, [location.pathname]); // runs whenever route changes

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
                        ✕
                    </button>
                </div>

                <nav className="mt-8">
                    <ul className="px-4 space-y-">
                        {menuItems.map((item) => (
                            <li key={item.id}>
                                {item.path ? (
                                    <Link
                                        to={item.path}
                                        onClick={() => setActiveSection(item.id)}
                                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                                            ${
                                                activeSection === item.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-300 hover:bg-gray-800'
                                            }`}
                                    >
                                        <span className="mr-3 text-lg">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                ) : (
                                    <button
                                        className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                                            ${
                                                activeSection === item.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-300 hover:bg-gray-800'
                                            }`}
                                        onClick={() => setActiveSection(item.id)}
                                    >
                                        <span className="mr-3 text-lg">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
                        <button
                            className="w-full flex items-center px-4 py-3 text-left text-gray-300 hover:bg-gray-800 rounded-lg"
                            onClick={handleLogout}
                        >
                            <span className="mr-3 text-lg">🚪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
