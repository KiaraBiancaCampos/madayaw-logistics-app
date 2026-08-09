'use client';

export default function ViewModal({ truck, closeModal }) {
  if (!truck) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">Truck Details</h2>
        
        <div className="space-y-3 text-gray-700">
          <p><span className="font-semibold w-32 inline-block">ID:</span> <span className="text-xs">{truck.id}</span></p>
          <p><span className="font-semibold w-32 inline-block">Plate Number:</span> {truck.plate_number}</p>
          <p><span className="font-semibold w-32 inline-block">Driver:</span> {truck.assigned_driver}</p>
          <p><span className="font-semibold w-32 inline-block">Odometer:</span> {truck.current_odometer.toLocaleString()} km</p>
          <p><span className="font-semibold w-32 inline-block">Last PM:</span> {truck.last_pm_odometer.toLocaleString()} km</p>
          <p>
            <span className="font-semibold w-32 inline-block">Status:</span> 
            <span className="font-bold text-blue-600">{truck.status.replace('_', ' ')}</span>
          </p>
          <p><span className="font-semibold w-32 inline-block">Date Added:</span> {new Date(truck.created_at).toLocaleDateString()}</p>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">Close</button>
        </div>
      </div>
    </div>
  );
}