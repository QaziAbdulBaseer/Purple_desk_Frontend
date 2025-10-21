// Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import Locations from '../../components/AdminComponents/Locations';


const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('Location');
  const userData = useSelector((state) => state.auth.userData);





  const renderContent = () => {
    switch (activeSection) {

      case 'Location':
        return (
        <div> <Locations />
        </div>)
      
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <p>Select a section from the sidebar to view content.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* <Sidebar 
        isOpen={sidebarOpen} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onClose={() => setSidebarOpen(false)}
      /> */}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          userData={userData}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;