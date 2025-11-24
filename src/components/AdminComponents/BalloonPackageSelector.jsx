import React from 'react';

const BalloonPackageSelector = ({ balloonPackages, onClose, onSelect }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Balloon Package</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {balloonPackages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎈</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Balloon Packages Available</h3>
              <p className="text-gray-500">No balloon packages found for this location.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {balloonPackages
                .sort((a, b) => a.call_flow_priority - b.call_flow_priority)
                .map((pkg) => (
                  <div key={pkg.balloon_party_packages_id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.package_name}</h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><span className="font-medium">Priority:</span> {pkg.call_flow_priority}</p>
                      <p><span className="font-medium">Price:</span> ${parseFloat(pkg.price || 0).toFixed(2)}</p>
                      {pkg.promotional_pitch && (
                        <p><span className="font-medium">Pitch:</span> {pkg.promotional_pitch}</p>
                      )}
                      {pkg.package_inclusions && (
                        <p><span className="font-medium">Inclusions:</span> {pkg.package_inclusions}</p>
                      )}
                      {pkg.discount && (
                        <p><span className="font-medium">Discount:</span> {pkg.discount}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onSelect(pkg)}
                      className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition-colors"
                    >
                      Select Package
                    </button>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BalloonPackageSelector;