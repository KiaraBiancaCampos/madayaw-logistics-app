'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase'; // Updated import path
import { Search, Plus, Edit, Trash2, Eye } from 'lucide-react';
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

  // Safe search filtering even if database values are null
  const filteredTrucks = trucks.filter((truck) => {
    const plate = (truck.plate_number || '').toLowerCase();
    const driver = (truck.assigned_driver || '').toLowerCase();
    const status = (truck.status || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    return plate.includes(search) || driver.includes(search) || status.includes(search);
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Madayaw Gas Fleet Management</h1>
          <button 
            onClick={() => { setSelectedTruck(null); setIsFormModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded flex items-center hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Truck
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by plate number, driver, or status..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 border-b">
                <th className="p-4">Plate Number</th>
                <th className="p-4">Driver</th>
                <th className="p-4">Odometer (km)</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrucks.map((truck) => (
                <tr key={truck.id} className="border-b hover:bg-gray-50 text-gray-800">
                  <td className="p-4 font-medium">{truck.plate_number || 'N/A'}</td>
                  <td className="p-4">{truck.assigned_driver || 'Unassigned'}</td>
                  <td className="p-4">{(truck.current_odometer ?? 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                      ${truck.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' : 
                        truck.status?.includes('PM') ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {(truck.status || '').replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center space-x-2">
                    <button onClick={() => openView(truck)} className="text-blue-500 hover:text-blue-700" title="View"><Eye className="w-5 h-5"/></button>
                    <button onClick={() => openEdit(truck)} className="text-gray-500 hover:text-gray-700" title="Edit"><Edit className="w-5 h-5"/></button>
                    <button onClick={() => handleDelete(truck.id, truck.plate_number)} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 className="w-5 h-5"/></button>
                  </td>
                </tr>
              ))}
              {filteredTrucks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">No trucks found.</td>
                </tr>
              )}
            </tbody>
          </table>
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