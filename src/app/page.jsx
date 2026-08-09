'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Edit, Trash2, Eye, Truck, CheckCircle2, Wrench, XCircle } from 'lucide-react';
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

  /**
   * Automatically calculates status based on Odometer reading.
   * Standard 5,000 km PM cycle logic:
   * - Odometer >= 5,000 km -> PM_REQUIRED
   * - Odometer >= 4,500 km -> PM_APPROACHING
   * - Otherwise            -> AVAILABLE
   */
  const getComputedStatus = (truck) => {
    // Retain manual operational overrides
    if (truck.status === 'GROUNDED' || truck.status === 'IN_SHOP') {
      return truck.status;
    }

    const odo = Number(truck.current_odometer) || 0;
    const lastPm = Number(truck.last_pm_odometer) || 0;
    const interval = Number(truck.pm_interval) || 5000;

    // Distance driven since last PM (or total odometer if last_pm isn't tracked)
    const kmSinceLastPm = lastPm > 0 ? odo - lastPm : odo;

    if (kmSinceLastPm >= interval) {
      return 'PM_REQUIRED';
    } else if (kmSinceLastPm >= interval - 500) {
      return 'PM_APPROACHING';
    }

    return 'AVAILABLE';
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

  // Filter trucks using their COMPUTED status
  const filteredTrucks = trucks.filter((truck) => {
    const plate = (truck.plate_number || '').toLowerCase();
    const driver = (truck.assigned_driver || '').toLowerCase();
    const computedStatus = getComputedStatus(truck).toLowerCase();
    const search = searchTerm.toLowerCase();

    return plate.includes(search) || driver.includes(search) || computedStatus.includes(search);
  });

  // Calculate live stats based on dynamic computed status
  const totalFleet = trucks.length;
  const availableCount = trucks.filter((t) => getComputedStatus(t) === 'AVAILABLE').length;
  const maintenanceCount = trucks.filter((t) => ['IN_SHOP', 'PM_APPROACHING', 'PM_REQUIRED'].includes(getComputedStatus(t))).length;
  const groundedCount = trucks.filter((t) => getComputedStatus(t) === 'GROUNDED').length;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return { bg: 'bg-[#4A69B3]/15 text-[#4A69B3] border-[#4A69B3]/30', dot: 'bg-[#4A69B3]', label: 'Available' };
      case 'GROUNDED':
        return { bg: 'bg-[#BA3801]/15 text-[#BA3801] border-[#BA3801]/30', dot: 'bg-[#BA3801]', label: 'Grounded' };
      case 'IN_SHOP':
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500', label: 'In Shop' };
      case 'PM_APPROACHING':
        return { bg: 'bg-[#FFEC89] text-[#713F12] border-[#FFEC89]', dot: 'bg-[#BA3801]', label: 'PM Approaching' };
      case 'PM_REQUIRED':
        return { bg: 'bg-[#BA3801] text-white border-[#BA3801]', dot: 'bg-white', label: 'PM Required' };
      default:
        return { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500', label: status || 'Unknown' };
    }
  };

  return (
    <div className="min-h-screen bg-[#FFEC89]/20 text-slate-800 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-8 rounded-2xl border border-[#4A69B3]/20 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden shadow-md border-2 border-[#4A69B3]/20 flex-shrink-0 bg-white">
              <img 
                src="/logo.jpg" 
                alt="Madayaw Gas Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Madayaw Gas Fleet Management
              </h1>
              <p className="text-base font-medium text-slate-500 mt-1">
                Real-time truck monitoring & maintenance dashboard
              </p>
            </div>
          </div>
          <button 
            onClick={() => { setSelectedTruck(null); setIsFormModalOpen(true); }}
            className="w-full sm:w-auto bg-[#BA3801] hover:bg-[#a13001] text-white px-6 py-3 rounded-xl font-semibold text-base transition-all duration-200 shadow-md shadow-[#BA3801]/25 flex items-center justify-center space-x-2 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Truck</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#4A69B3]/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Fleet</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalFleet}</h3>
            </div>
            <div className="p-4 bg-[#FFEC89]/40 rounded-xl text-slate-700"><Truck className="w-6 h-6"/></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#4A69B3]/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available</p>
              <h3 className="text-3xl font-bold text-[#4A69B3] mt-1">{availableCount}</h3>
            </div>
            <div className="p-4 bg-[#4A69B3]/15 rounded-xl text-[#4A69B3]"><CheckCircle2 className="w-6 h-6"/></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#4A69B3]/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Maintenance / PM</p>
              <h3 className="text-3xl font-bold text-[#BA3801] mt-1">{maintenanceCount}</h3>
            </div>
            <div className="p-4 bg-[#FFEC89] rounded-xl text-[#BA3801]"><Wrench className="w-6 h-6"/></div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#4A69B3]/20 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Grounded</p>
              <h3 className="text-3xl font-bold text-[#BA3801] mt-1">{groundedCount}</h3>
            </div>
            <div className="p-4 bg-[#BA3801]/10 rounded-xl text-[#BA3801]"><XCircle className="w-6 h-6"/></div>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="bg-white rounded-2xl border border-[#4A69B3]/20 shadow-sm overflow-hidden">
          
          {/* Search Controls */}
          <div className="p-5 border-b border-[#4A69B3]/15 bg-[#FFEC89]/20">
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search plate, driver, status..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-[#4A69B3]/30 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#4A69B3]/30 focus:border-[#4A69B3] transition-all text-slate-800 placeholder-slate-400 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#4A69B3]/15 bg-[#FFEC89]/30 text-xs font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-4 px-6">Plate Number</th>
                  <th className="py-4 px-6">Assigned Driver</th>
                  <th className="py-4 px-6">Odometer</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4A69B3]/10 text-base">
                {filteredTrucks.map((truck) => {
                  const computedStatus = getComputedStatus(truck);
                  const badge = getStatusBadge(computedStatus);
                  return (
                    <tr key={truck.id} className="hover:bg-[#FFEC89]/15 transition-colors">
                      <td className="py-5 px-6 font-bold text-slate-900 text-lg tracking-wide">
                        {truck.plate_number || 'N/A'}
                      </td>
                      <td className="py-5 px-6 text-slate-700 font-medium text-base">
                        {truck.assigned_driver || 'Unassigned'}
                      </td>
                      <td className="py-5 px-6 text-slate-700 text-base">
                        <span className="font-mono font-semibold">{truck.current_odometer?.toLocaleString() ?? 0}</span>
                        <span className="text-sm text-slate-400 ml-1">km</span>
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-full border ${badge.bg}`}>
                          <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => openView(truck)} className="p-2.5 text-slate-400 hover:text-[#4A69B3] hover:bg-[#4A69B3]/10 rounded-xl transition-colors" title="View Details">
                            <Eye className="w-5 h-5"/>
                          </button>
                          <button onClick={() => openEdit(truck)} className="p-2.5 text-slate-400 hover:text-[#BA3801] hover:bg-[#BA3801]/10 rounded-xl transition-colors" title="Edit Truck">
                            <Edit className="w-5 h-5"/>
                          </button>
                          <button onClick={() => handleDelete(truck.id, truck.plate_number)} className="p-2.5 text-slate-400 hover:text-[#BA3801] hover:bg-[#BA3801]/10 rounded-xl transition-colors" title="Delete">
                            <Trash2 className="w-5 h-5"/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredTrucks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Truck className="w-10 h-10 stroke-1 text-slate-300" />
                        <p className="text-base font-medium">No trucks found</p>
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