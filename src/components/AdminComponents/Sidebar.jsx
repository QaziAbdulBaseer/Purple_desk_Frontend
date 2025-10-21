// Sidebar.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';

const Sidebar = ({ isOpen, activeSection, setActiveSection, onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const menuItems = [
        { id: 'Hours of Operation', label: 'Hours of Operation', icon: '📊' },
        { id: 'BirthDay packages', label: 'BirthDay packages', icon: '📈' },
        { id: 'Jump Pass', label: 'Jump Pass', icon: '👥' },
        { id: 'MemberShip', label: 'MemberShip', icon: '✅' },
        { id: 'Food Items', label: 'Food Items', icon: '📄' },
        { id: 'Item Prices', label: 'Item Prices', icon: '📄' },
        { id: 'Discount', label: 'Discount', icon: '⚙️' },
        { id: 'Promotions', label: 'Promotions', icon: '⚙️' },
        { id: 'Policy', label: 'Policy', icon: '⚙️' },
        { id: 'FAQs', label: 'FAQs', icon: '⚙️' },
    ];

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
            <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-gray-900 transform transition duration-300 ease-in-out
        lg:static lg:translate-x-0 lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
                    <Link to='/dashboard'>
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
                        {menuItems.map(item => (
                            <li key={item.id}>
                                <button
                                    className={`
                    w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors
                    ${activeSection === item.id
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-800'
                                        }
                  `}
                                    onClick={() => setActiveSection(item.id)}
                                >
                                    <span className="mr-3 text-lg">{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
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