'use client';

export default function ViewModal({ truck, closeModal }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full text-gray-800">
        <h2 className="text-xl font-bold mb-4">Truck Details</h2>
        <p><strong>Plate:</strong> {truck?.plate_number}</p>
        <p><strong>Driver:</strong> {truck?.assigned_driver}</p>
        <p><strong>Odometer:</strong> {truck?.current_odometer} km</p>
        <p><strong>Status:</strong> {truck?.status}</p>
        <div className="flex justify-end mt-4">
          <button 
            onClick={closeModal} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}