// frontend/src/App.tsx
import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter } from 'lucide-react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import EquipmentTable from './components/EquipmentTable';
import EquipmentForm from './components/EquipmentForm';
import CategorySidebar from './components/CategorySidebar';
import { Equipment, EquipmentStats } from './types/Equipment';

// ==========================
// API BASE URL
// ==========================
const API_BASE =
  import.meta.env.VITE_API_BASE ||
  `http://${window.location.hostname}:5000/api`;

console.log("ENV:", import.meta.env);
console.log("🌐 API_BASE =", API_BASE);

// ==========================
// HTTP Helper
// ==========================
async function apiFetch(url: string, options: RequestInit = {}) {
  const fullUrl = url.startsWith("/") ? `${API_BASE}${url}` : url;

  const token = localStorage.getItem("gnr_token");
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(fullUrl, { ...options, headers });

  if (!res.ok) {
    const txt = await res.text();
    let parsed: any = txt;
    try {
      parsed = JSON.parse(txt);
    } catch {}

    const message = parsed?.message || txt || res.statusText;
    throw new Error(`${res.status} ${message}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

// ==========================
// Fetch helpers
// ==========================
async function fetchEquipment(params: {
  category?: string;
  search?: string;
  status?: string;
} = {}): Promise<Equipment[]> {
  const q = new URLSearchParams();
  if (params.category && params.category !== "all")
    q.append("category", params.category);
  if (params.search) q.append("search", params.search);
  if (params.status && params.status !== "all")
    q.append("status", params.status);

  return apiFetch(`/equipment?${q.toString()}`);
}

async function fetchStats(): Promise<EquipmentStats> {
  return apiFetch("/stats/summary");
}

// ==========================
// Status helper functions
// ==========================
function readStatusCounts(item: any) {
  if (item?.counts) {
    return {
      available: Number(item.counts.available || 0),
      in_use: Number(item.counts.in_use || 0),
      maintenance: Number(item.counts.maintenance || 0),
    };
  }
  return {
    available: Number(item.available || 0),
    in_use: Number(item.in_use || 0),
    maintenance: Number(item.maintenance || 0),
  };
}

function applyChangeToCounts(
  counts: any,
  status: "available" | "in_use" | "maintenance",
  change: number
) {
  return { ...counts, [status]: counts[status] + change };
}

function sumCounts(obj: any) {
  return Object.values(obj).reduce((a: number, b: number) => a + Number(b), 0);
}

// ==========================
// MAIN APP
// ==========================
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() =>
    Boolean(localStorage.getItem("gnr_token"))
  );
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<EquipmentStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // ==========================
  // LOGIN
  // ==========================
  const handleLogin = async (username: string, password: string) => {
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (res?.token) {
        localStorage.setItem("gnr_token", res.token);
        setIsLoggedIn(true);
        return { ok: true };
      }
      return { ok: false, message: "No token received" };
    } catch (err: any) {
      return { ok: false, message: err.message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("gnr_token");
    setIsLoggedIn(false);
  };

  // ==========================
  // LOAD DATA
  // ==========================
  useEffect(() => {
    if (!isLoggedIn) return;
    loadData();
  }, [selectedCategory, selectedStatus, searchTerm, isLoggedIn]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eq, st] = await Promise.all([
        fetchEquipment({
          category: selectedCategory,
          search: searchTerm,
          status: selectedStatus,
        }),
        fetchStats(),
      ]);
      setEquipment(eq);
      setStats(st);
    } catch (err) {
      setEquipment([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // CRUD ACTIONS
  // ==========================
  const handleAddEquipment = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEditEquipment = (item: Equipment) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!window.confirm("Delete this item?")) return;
    await apiFetch(`/equipment/${id}`, { method: "DELETE" });
    await loadData();
  };

  const handleSaveEquipment = async (data: Partial<Equipment>) => {
    if (editingItem) {
      await apiFetch(`/equipment/${editingItem._id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    } else {
      await apiFetch("/equipment", {
        method: "POST",
        body: JSON.stringify(data),
      });
    }
    setShowForm(false);
    setEditingItem(null);
    await loadData();
  };

  // ==========================
  // STATUS UPDATE
  // ==========================
  const handleUpdateStatus = async (id, status, change) => {
    await apiFetch(`/equipment/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, change }),
    });
    await loadData();
  };

  // ==========================
  // AUTH / LOADING UI
  // ==========================
  if (!isLoggedIn) return <LoginPage onLogin={handleLogin} />;

  if (loading && !stats)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );

  // ==========================
  // MAIN UI
  // ==========================
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="p-4 flex justify-between">
          <h1 className="font-bold text-xl flex items-center gap-2">
            <Package className="text-blue-600" /> GNR SURGICALS
          </h1>

          <div className="flex gap-3">
            <input
              type="text"
              className="border px-3 py-1 rounded"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button
              onClick={() => handleAddEquipment()}
              className="bg-blue-600 text-white px-3 py-1 rounded flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1 border rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <CategorySidebar
          categories={stats?.categoryTotals || {}}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          onCategoryChange={setSelectedCategory}
          onStatusChange={setSelectedStatus}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4">
          {stats && <Dashboard stats={stats} />}

          <EquipmentTable
            equipment={equipment}
            onEdit={handleEditEquipment}
            onDelete={handleDeleteEquipment}
            onUpdateStatus={handleUpdateStatus}
            loading={loading}
          />
        </main>
      </div>

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
