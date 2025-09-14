import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter } from 'lucide-react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import EquipmentTable from './components/EquipmentTable';
import EquipmentForm from './components/EquipmentForm';
import CategorySidebar from './components/CategorySidebar';
import { Equipment, EquipmentStats } from './types/Equipment';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
console.log('API_BASE →', API_BASE);

// Utility: fetch with token
async function apiFetch(url: string, options: RequestInit = {}) {
  // if user passed a relative path like "/equipment", prepend API_BASE
  const fullUrl = url.startsWith('/') ? `${API_BASE}${url}` : url;

  const token = localStorage.getItem('gnr_token');
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  // ensure content-type when body is present and header not already set
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(fullUrl, { ...options, headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    // try parse json if it's json
    let parsed: any;
    try {
      parsed = JSON.parse(txt || '{}');
    } catch {
      parsed = txt;
    }
    const message = parsed && parsed.message ? parsed.message : txt || res.statusText;
    throw new Error(`${res.status} ${message}`);
  }
  // if no content
  if (res.status === 204) return null;
  return res.json();
}

async function fetchEquipment(params: { category?: string; search?: string; status?: string } = {}): Promise<Equipment[]> {
  const queryParams = new URLSearchParams();
  if (params.category && params.category !== 'all') queryParams.append('category', params.category);
  if (params.search) queryParams.append('search', params.search);
  if (params.status && params.status !== 'all') queryParams.append('status', params.status);

  const path = `/equipment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiFetch(path);
}

async function fetchStats(): Promise<EquipmentStats> {
  return apiFetch('/stats/summary');
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => Boolean(localStorage.getItem('gnr_token')));
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const handleLogin = async (username: string, password: string): Promise<{ ok: boolean; message?: string }> => {
    try {
      // use relative path so apiFetch will prepend base
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { ok: false, message: body.message || `Login failed: ${res.status}` };
      }

      const data = await res.json();
      if (data.token) {
        localStorage.setItem('gnr_token', data.token);
        setIsLoggedIn(true);
        return { ok: true };
      } else {
        return { ok: false, message: 'No token received from server' };
      }
    } catch (err: any) {
      console.error('Login request failed', err);
      return { ok: false, message: err.message || 'Server unreachable' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gnr_token');
    setIsLoggedIn(false);
  };

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
      await apiFetch(`/equipment/${id}`, { method: 'DELETE' });
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
        await apiFetch(`/equipment/${editingItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(equipmentData)
        });
      } else {
        await apiFetch('/equipment', {
          method: 'POST',
          body: JSON.stringify(equipmentData)
        });
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
      await apiFetch(`/equipment/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, change })
      });
      await loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Status update failed. Check console.');
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-sm shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-6">
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
                 <h1 className="text-lg font-extrabold tracking-wide flame" style={{ letterSpacing: '1px' }}>
                   GNR-SURGICALS
                   <span style={{
                     display: 'inline-block',
                     width: 6,
                     height: 6,
                     marginLeft: 8,
                     borderRadius: 999,
                     background: 'radial-gradient(#ff6a00)'
                   }} />
                 </h1>
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
        <main className="flex-1 lg:pl-38">
          <div className="p-4 sm:p-6 lg:p-6 max-w-[1400px]">
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
