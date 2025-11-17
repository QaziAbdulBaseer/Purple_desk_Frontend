// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Locations from '../../components/AdminComponents/Locations';
import Sidebar from '../../components/AdminComponents/Sidebar';
import Header from '../../components/AdminComponents/Header';
import { useParams } from 'react-router-dom';
import FAQsComp from '../../components/AdminComponents/FAQsComp';


const FAQs = () => {
     const { location_id } = useParams();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('FAQs');
    const userData = useSelector((state) => state.auth.userData);


    // Sample data for demonstration

    const renderContent = () => {
        switch (activeSection) {
            case 'FAQs':
                return (
                    <div> <FAQsComp />
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
            <Sidebar
                isOpen={sidebarOpen}
                activeSection={activeSection}
                setActiveSection={setActiveSection}
                onClose={() => setSidebarOpen(false)}
                locationId={location_id} // ← PASS IT HERE
            />
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

export default FAQs;