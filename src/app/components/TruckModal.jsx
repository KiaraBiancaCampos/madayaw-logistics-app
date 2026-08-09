'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TruckModal({ truck, closeModal, refreshData }) {
  const [formData, setFormData] = useState({
    plate_number: '',
    assigned_driver: '',
    current_odometer: 0,
    status: 'AVAILABLE',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If editing an existing truck, pre-fill the form
  useEffect(() => {
    if (truck) {
      setFormData({
        plate_number: truck.plate_number || '',
        assigned_driver: truck.assigned_driver || '',
        current_odometer: truck.current_odometer || 0,
        status: truck.status || 'AVAILABLE',
      });
    }
  }, [truck]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (truck) {
        // Update existing truck
        const { error } = await supabase
          .from('trucks')
          .update({
            plate_number: formData.plate_number,
            assigned_driver: formData.assigned_driver,
            current_odometer: parseFloat(formData.current_odometer),
            status: formData.status,
          })
          .eq('id', truck.id);

        if (error) throw error;
      } else {
        // Insert new truck
        const { error } = await supabase.from('trucks').insert([
          {
            plate_number: formData.plate_number,
            assigned_driver: formData.assigned_driver,
            current_odometer: parseFloat(formData.current_odometer),
            status: formData.status,
          },
        ]);

        if (error) throw error;
      }

      // Refresh table data and close modal
      await refreshData();
      closeModal();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to save truck.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full text-gray-800">
        <h2 className="text-xl font-bold mb-4">
          {truck ? 'Edit Truck' : 'Add New Truck'}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plate Number
            </label>
            <input
              type="text"
              name="plate_number"
              required
              placeholder="e.g. MDY-104"
              value={formData.plate_number}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned Driver
            </label>
            <input
              type="text"
              name="assigned_driver"
              required
              placeholder="Driver's Full Name"
              value={formData.assigned_driver}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Odometer (km)
            </label>
            <input
              type="number"
              step="0.1"
              name="current_odometer"
              required
              value={formData.current_odometer}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="GROUNDED">GROUNDED</option>
              <option value="IN_SHOP">IN SHOP</option>
              <option value="PM_APPROACHING">PM APPROACHING</option>
              <option value="PM_REQUIRED">PM REQUIRED</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeModal}
              disabled={loading}
              className="px-4 py-2 border text-gray-600 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : truck ? 'Update Truck' : 'Add Truck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}