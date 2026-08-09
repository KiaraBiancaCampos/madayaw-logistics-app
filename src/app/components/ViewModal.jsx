'use client';

import { X, Truck, User, Gauge, ShieldAlert } from 'lucide-react';

export default function ViewModal({ truck, closeModal }) {
  if (!truck) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-100 overflow-hidden">
        
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Vehicle Profile</h2>
          <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3">
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400">Plate Number</span>
              <h3 className="text-xl font-bold text-slate-900">{truck.plate_number}</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-semibold uppercase mb-1">
                <User className="w-3.5 h-3.5" />
                <span>Driver</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">{truck.assigned_driver || 'Unassigned'}</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-semibold uppercase mb-1">
                <Gauge className="w-3.5 h-3.5" />
                <span>Odometer</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">{truck.current_odometer?.toLocaleString()} km</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-semibold uppercase mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Current Status</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{truck.status?.replace(/_/g, ' ')}</p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}