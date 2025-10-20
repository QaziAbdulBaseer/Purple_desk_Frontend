// Dashboard.jsx
import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import Locations from '../../components/AdminComponents/Locations';


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const userData = useSelector((state) => state.auth.userData);

  // Sample data for demonstration
  const statsData = {
    overview: [
      { title: 'Total Users', value: '2,453', change: '+12%', positive: true },
      { title: 'Active Sessions', value: '1,234', change: '+5%', positive: true },
      { title: 'Tasks Completed', value: '876', change: '-3%', positive: false },
      { title: 'Storage Used', value: '3.2GB', change: '+8%', positive: true },
    ],
    performance: [
      { title: 'Response Time', value: '243ms', change: '+12%', positive: false },
      { title: 'Uptime', value: '99.9%', change: '+0.1%', positive: true },
      { title: 'Errors', value: '24', change: '-5%', positive: true },
      { title: 'Satisfaction', value: '4.7/5', change: '+0.2', positive: true },
    ]
  };

  const recentActivities = [
    { user: 'John Doe', action: 'created a new task', time: '2 min ago' },
    { user: 'Sarah Smith', action: 'updated documentation', time: '10 min ago' },
    { user: 'Mike Johnson', action: 'completed onboarding', time: '25 min ago' },
    { user: 'Emma Wilson', action: 'submitted a report', time: '1 hour ago' },
    { user: 'Alex Brown', action: 'resolved a ticket', time: '2 hours ago' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      // case 'overview':
      //   return (
      //     <div>
      //       <h2 className="text-2xl font-bold mb-6">Overview</h2>
      //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      //         {statsData.overview.map((stat, index) => (
      //           <div key={index} className="bg-white rounded-lg shadow p-6">
      //             <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
      //             <div className="flex items-baseline mt-2">
      //               <span className="text-2xl font-bold">{stat.value}</span>
      //               <span className={`ml-2 text-sm ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
      //                 {stat.change}
      //               </span>
      //             </div>
      //           </div>
      //         ))}
      //       </div>
            
      //       <div className="bg-white rounded-lg shadow p-6">
      //         <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
      //         <div className="space-y-4">
      //           {recentActivities.map((activity, index) => (
      //             <div key={index} className="flex items-start">
      //               <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
      //                 <span className="text-blue-600 font-medium">
      //                   {activity.user.charAt(0)}
      //                 </span>
      //               </div>
      //               <div className="ml-4">
      //                 <p className="text-gray-900">
      //                   <span className="font-medium">{activity.user}</span> {activity.action}
      //                 </p>
      //                 <p className="text-gray-500 text-sm">{activity.time}</p>
      //               </div>
      //             </div>
      //           ))}
      //         </div>
      //       </div>
      //     </div>
      //   );
      
      // case 'analytics':
      //   return (
      //     <div>
      //       <h2 className="text-2xl font-bold mb-6">Analytics</h2>
      //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      //         {statsData.performance.map((stat, index) => (
      //           <div key={index} className="bg-white rounded-lg shadow p-6">
      //             <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
      //             <div className="flex items-baseline mt-2">
      //               <span className="text-2xl font-bold">{stat.value}</span>
      //               <span className={`ml-2 text-sm ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
      //                 {stat.change}
      //               </span>
      //             </div>
      //           </div>
      //         ))}
      //       </div>
            
      //       <div className="bg-white rounded-lg shadow p-6">
      //         <h3 className="text-lg font-medium mb-4">Performance Chart</h3>
      //         <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
      //           <p className="text-gray-500">Performance chart visualization would be here</p>
      //         </div>
      //       </div>
      //     </div>
      //   );
      
      // case 'settings':
      //   return (
      //     <div>
      //       <h2 className="text-2xl font-bold mb-6">Settings</h2>
      //       <div className="bg-white rounded-lg shadow p-6">
      //         <h3 className="text-lg font-medium mb-4">Account Settings</h3>
      //         <div className="space-y-4">
      //           <div>
      //             <label className="block text-sm font-medium text-gray-700">Username</label>
      //             <input
      //               type="text"
      //               defaultValue={userData?.username || ''}
      //               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
      //             />
      //           </div>
      //           <div>
      //             <label className="block text-sm font-medium text-gray-700">Email</label>
      //             <input
      //               type="email"
      //               defaultValue={userData?.email || ''}
      //               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
      //             />
      //           </div>
      //           <div>
      //             <label className="block text-sm font-medium text-gray-700">Role</label>
      //             <input
      //               type="text"
      //               defaultValue={userData?.role || ''}
      //               disabled
      //               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 sm:text-sm p-2 border"
      //             />
      //           </div>
      //           <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
      //             Save Changes
      //           </button>
      //         </div>
      //       </div>
      //     </div>
      //   );
      


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
      <Sidebar 
        isOpen={sidebarOpen} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onClose={() => setSidebarOpen(false)}
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

export default Dashboard;