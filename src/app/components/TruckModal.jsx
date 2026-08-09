'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Truck, User, Gauge, Activity } from 'lucide-react';

export default function TruckModal({ truck, closeModal, refreshData }) {
  const [formData, setFormData] = useState({
    plate_number: '',
    assigned_driver: '',
    current_odometer: 0,
    status: 'AVAILABLE',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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

      await refreshData();
      closeModal();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save truck.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">
            {truck ? 'Edit Truck Details' : 'Add New Truck'}
          </h2>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Plate Number</label>
            <div className="relative">
              <Truck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="plate_number"
                required
                placeholder="e.g. MDY-104"
                value={formData.plate_number}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Assigned Driver</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                name="assigned_driver"
                required
                placeholder="Full Name"
                value={formData.assigned_driver}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Odometer Reading (km)</label>
            <div className="relative">
              <Gauge className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                step="0.1"
                name="current_odometer"
                required
                value={formData.current_odometer}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Fleet Status</label>
            <div className="relative">
              <Activity className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 appearance-none"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="GROUNDED">GROUNDED</option>
                <option value="IN_SHOP">IN SHOP</option>
                <option value="PM_APPROACHING">PM APPROACHING</option>
                <option value="PM_REQUIRED">PM REQUIRED</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : truck ? 'Save Changes' : 'Add Truck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}