import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter } from 'lucide-react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import EquipmentTable from './components/EquipmentTable';
import EquipmentForm from './components/EquipmentForm';
import CategorySidebar from './components/CategorySidebar';
import { Equipment, EquipmentStats } from './types/Equipment';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';


async function fetchEquipment(params: { category?: string; search?: string; status?: string } = {}): Promise<Equipment[]> {
  const queryParams = new URLSearchParams();
  if (params.category && params.category !== 'all') queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);
  if (params.status && params.status !== 'all') queryParams.append('status', params.status);

  const url = `${API_BASE}/equipment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch equipment: ${res.status} ${txt}`);
  }
  return res.json();
}

async function fetchStats(): Promise<EquipmentStats> {
  const res = await fetch(`${API_BASE}/stats/summary`);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to fetch stats: ${res.status} ${txt}`);
  }
  return res.json();
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    // quick persistence: if there's a saved username, treat as logged in
    return Boolean(localStorage.getItem('gnr_user'));
  });
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // --- auth: send credentials to backend and return a result object for LoginPage
  const handleLogin = async (username: string, password: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { ok: false, message: body.message || 'Invalid credentials' };
      }

      // success -> keep simple session by storing username
      localStorage.setItem('gnr_user', username);
      setIsLoggedIn(true);
      return { ok: true };
    } catch (err) {
      console.error('Login request failed', err);
      return { ok: false, message: 'Server unreachable' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gnr_user');
    setIsLoggedIn(false);
  };

  // Load data when filters change (only when logged in)
  useEffect(() => {
    if (!isLoggedIn) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedStatus, searchTerm, isLoggedIn]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [equipmentData, statsData] = await Promise.all([
        fetchEquipment({ category: selectedCategory, search: searchTerm, status: selectedStatus }),
        fetchStats()
      ]);
      setEquipment(equipmentData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setEquipment([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditEquipment = (item: Equipment) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      const res = await fetch(`${API_BASE}/equipment/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to delete: ${res.status} ${txt}`);
      }
      setEquipment(prev => prev.filter(item => item._id !== id));
      await loadData();
    } catch (error) {
      console.error('Error deleting equipment:', error);
      alert('Delete failed. Check console.');
    }
  };

  const handleSaveEquipment = async (equipmentData: Partial<Equipment>) => {
    try {
      if (editingItem) {
        const res = await fetch(`${API_BASE}/equipment/${editingItem._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(equipmentData)
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to update: ${res.status} ${txt}`);
        }
      } else {
        const res = await fetch(`${API_BASE}/equipment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(equipmentData)
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`Failed to create: ${res.status} ${txt}`);
        }
      }
      setShowForm(false);
      setEditingItem(null);
      await loadData();
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert('Save failed. Check console.');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'available' | 'in_use' | 'maintenance', change: number) => {
    try {
      const res = await fetch(`${API_BASE}/equipment/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, change })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to update status: ${res.status} ${txt}`);
      }
      await loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Status update failed. Check console.');
    }
  };

  // Show login page if not authenticated
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Filter className="h-6 w-6" />
              </button>
              <div className="flex items-center ml-2 lg:ml-0">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <h1 className="text-xl font-bold text-gray-900">Gnr Surgicals</h1>
                  <p className="text-sm text-gray-500">Inventory Management</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddEquipment}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <CategorySidebar
          categories={stats?.categoryTotals || {}}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          onCategoryChange={setSelectedCategory}
          onStatusChange={setSelectedStatus}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Mobile Search */}
            <div className="sm:hidden mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search equipment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Dashboard */}
            {stats && <Dashboard stats={stats} />}

            {/* Equipment Table */}
            <div className="mt-8">
              <EquipmentTable
                equipment={equipment}
                onEdit={handleEditEquipment}
                onDelete={handleDeleteEquipment}
                onUpdateStatus={handleUpdateStatus}
                loading={loading}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Equipment Form Modal */}
      {showForm && (
        <EquipmentForm
          equipment={editingItem}
          onSave={handleSaveEquipment}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}


export default App;
