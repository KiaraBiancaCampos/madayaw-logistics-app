'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Edit, Trash2, Eye, Truck, CheckCircle2, Wrench, AlertTriangle, XCircle } from 'lucide-react';
import TruckModal from './components/TruckModal';
import ViewModal from './components/ViewModal';

export default function FleetDashboard() {
  const [trucks, setTrucks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    const { data, error } = await supabase
      .from('trucks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTrucks(data);
    }
  };

  const handleDelete = async (id, plateNumber) => {
    if (window.confirm(`Are you sure you want to permanently delete truck ${plateNumber}?`)) {
      await supabase.from('trucks').delete().eq('id', id);
      fetchTrucks();
    }
  };

  const openEdit = (truck) => {
    setSelectedTruck(truck);
    setIsFormModalOpen(true);
  };

  const openView = (truck) => {
    setSelectedTruck(truck);
    setIsViewModalOpen(true);
  };

  // Safe search filtering
  const filteredTrucks = trucks.filter((truck) => {
    const plate = (truck.plate_number || '').toLowerCase();
    const driver = (truck.assigned_driver || '').toLowerCase();
    const status = (truck.status || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    return plate.includes(search) || driver.includes(search) || status.includes(search);
  });

  // Fleet Stats calculations
  const totalFleet = trucks.length;
  const availableCount = trucks.filter((t) => t.status === 'AVAILABLE').length;
  const maintenanceCount = trucks.filter((t) => ['IN_SHOP', 'PM_APPROACHING', 'PM_REQUIRED'].includes(t.status)).length;
  const groundedCount = trucks.filter((t) => t.status === 'GROUNDED').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', label: 'Available' };
      case 'GROUNDED':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500', label: 'Grounded' };
      case 'IN_SHOP':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500', label: 'In Shop' };
      case 'PM_APPROACHING':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500', label: 'PM Approaching' };
      case 'PM_REQUIRED':
        return { bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500', label: 'PM Required' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-500', label: status || 'Unknown' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Madayaw Gas Fleet Management</h1>
              <p className="text-xs font-medium text-slate-500">Real-time truck monitoring & maintenance dashboard</p>
            </div>
          </div>
          <button 
            onClick={() => { setSelectedTruck(null); setIsFormModalOpen(true); }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm shadow-blue-500/30 flex items-center justify-center space-x-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Truck</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Fleet</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalFleet}</h3>
            </div>
            <div className="p-3 bg-slate-100 rounded-xl text-slate-600"><Truck className="w-5 h-5"/></div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{availableCount}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Maintenance / PM</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{maintenanceCount}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Wrench className="w-5 h-5"/></div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Grounded</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{groundedCount}</h3>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600"><XCircle className="w-5 h-5"/></div>
          </div>
        </div>

        {/* Search & Main Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          
          {/* Search Controls */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search plate, driver, status..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Plate Number</th>
                  <th className="py-3.5 px-6">Assigned Driver</th>
                  <th className="py-3.5 px-6">Odometer</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredTrucks.map((truck) => {
                  const badge = getStatusBadge(truck.status);
                  return (
                    <tr key={truck.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900 tracking-wide">
                        {truck.plate_number || 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {truck.assigned_driver || 'Unassigned'}
                      </td>
                      <td className="py-4 px-6 text-slate-600">
                        <span className="font-mono">{truck.current_odometer?.toLocaleString() ?? 0}</span>
                        <span className="text-xs text-slate-400 ml-1">km</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${badge.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-1">
                          <button onClick={() => openView(truck)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                            <Eye className="w-4 h-4"/>
                          </button>
                          <button onClick={() => openEdit(truck)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Truck">
                            <Edit className="w-4 h-4"/>
                          </button>
                          <button onClick={() => handleDelete(truck.id, truck.plate_number)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete">
                            <Trash2 className="w-4 h-4"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredTrucks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Truck className="w-8 h-8 stroke-1 text-slate-300" />
                        <p className="text-sm font-medium">No trucks found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {isFormModalOpen && (
        <TruckModal 
          truck={selectedTruck} 
          closeModal={() => setIsFormModalOpen(false)} 
          refreshData={fetchTrucks} 
        />
      )}
      
      {isViewModalOpen && (
        <ViewModal 
          truck={selectedTruck} 
          closeModal={() => setIsViewModalOpen(false)} 
        />
      )}
    </div>
  );
}