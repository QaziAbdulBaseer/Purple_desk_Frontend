// Header.jsx
import React from 'react';

const Header = ({ onMenuClick, userData }) => {
  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button 
            className="text-gray-500 hover:text-gray-700 lg:hidden"
            onClick={onMenuClick}
          >
            ☰
          </button>
          <div className="ml-4 text-gray-800">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="mr-4 text-right">
            <p className="text-sm font-medium text-gray-800">{userData?.username || 'User'}</p>
            <p className="text-xs text-gray-500 capitalize">{userData?.role || 'User'}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-medium">
              {userData?.username?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;