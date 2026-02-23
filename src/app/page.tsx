"use client";

import { useState, useEffect, useCallback } from "react";

type Module = "dashboard" | "companies" | "accounts" | "journal" | "thirdparties" | "periods" | "reports" | "users";

interface MenuItem {
  id: Module;
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "companies", label: "Empresas", icon: "🏢" },
  { id: "accounts", label: "Plan de Cuentas", icon: "📒" },
  { id: "journal", label: "Asientos Contables", icon: "📝" },
  { id: "thirdparties", label: "Terceros", icon: "👥" },
  { id: "periods", label: "Períodos", icon: "📅" },
  { id: "reports", label: "Reportes", icon: "📈" },
  { id: "users", label: "Usuarios", icon: "🔐" },
];

export default function Home() {
  const [activeModule, setActiveModule] = useState<Module>("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Company selection state
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [showCompanySelector, setShowCompanySelector] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username: username, Password: password }),
      });

      const data = await res.json();

      if (data.Success) {
        setIsLoggedIn(true);
        // Fetch companies after successful login
        fetchCompanies();
      } else {
        setError(data.Message || "Error al iniciar sesión");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      if (data.Success && data.Data && data.Data.length > 0) {
        setCompanies(data.Data);
        // Auto-select first company if none selected
        if (!selectedCompany) {
          setSelectedCompany(data.Data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleSelectCompany = (company: any) => {
    setSelectedCompany(company);
    setShowCompanySelector(false);
  };

  const renderContent = () => {
    switch (activeModule) {
      case "dashboard":
        return <DashboardView />;
      case "companies":
        return <CompaniesView />;
      case "accounts":
        return <AccountsView />;
      case "journal":
        return <JournalView />;
      case "thirdparties":
        return <ThirdPartiesView />;
      case "periods":
        return <PeriodsView />;
      case "reports":
        return <ReportsView />;
      case "users":
        return <UsersView />;
      default:
        return <DashboardView />;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Contabilidad VE</h1>
            <p className="text-gray-500 mt-2">Sistema Contable Multiempresa</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese su usuario"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingrese su contraseña"
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Versión 1.0.0</p>
            <p className="mt-1">Venezuela - 2024</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        {/* Company Selector */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-800">Contabilidad VE</h1>
          <p className="text-xs text-gray-500">Sistema Contable</p>
          
          {/* Company Selection Button */}
          <div className="mt-3 relative">
            <button
              onClick={() => setShowCompanySelector(!showCompanySelector)}
              className="w-full flex items-center justify-between px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="text-lg">🏢</span>
                <span className="text-sm font-medium text-blue-800 truncate">
                  {selectedCompany ? selectedCompany.LegalName : "Seleccionar Empresa"}
                </span>
              </div>
              <span className="text-blue-600 text-xs">▼</span>
            </button>
            
            {/* Company Dropdown */}
            {showCompanySelector && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                {loadingCompanies ? (
                  <div className="p-3 text-sm text-gray-500 text-center">Cargando...</div>
                ) : companies.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">No hay empresas</div>
                ) : (
                  companies.map((company) => (
                    <button
                      key={company.CompanyId}
                      onClick={() => handleSelectCompany(company)}
                      className={`w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left ${
                        selectedCompany?.CompanyId === company.CompanyId ? "bg-blue-50" : ""
                      }`}
                    >
                      <span>🏢</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{company.LegalName}</p>
                        <p className="text-xs text-gray-500 truncate">{company.RIF}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeModule === item.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* Company Header Bar */}
        {selectedCompany && (
          <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <h2 className="text-lg font-bold">{selectedCompany.LegalName}</h2>
                  <p className="text-sm text-blue-100">{selectedCompany.RIF} • {selectedCompany.FunctionalCurrency}</p>
                </div>
              </div>
              <button
                onClick={() => setShowCompanySelector(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition flex items-center gap-2"
              >
                <span>Cambiar</span>
                <span>🔄</span>
              </button>
            </div>
          </div>
        )}
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// ==================== DASHBOARD VIEW ====================
function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500">Resumen general del sistema</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Empresas Activas</p>
              <p className="text-3xl font-bold text-gray-800">3</p>
            </div>
            <div className="text-4xl">🏢</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Asientos del Mes</p>
              <p className="text-3xl font-bold text-gray-800">156</p>
            </div>
            <div className="text-4xl">📝</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Terceros</p>
              <p className="text-3xl font-bold text-gray-800">89</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Período Activo</p>
              <p className="text-lg font-bold text-gray-800">Feb 2024</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Últimos Asientos</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Número</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Descripción</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Monto</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">000125</td>
                <td className="py-3 px-4">18/02/2024</td>
                <td className="py-3 px-4">Pago servicios basic</td>
                <td className="py-3 px-4 text-right">125.500,00</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aprobado</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">000124</td>
                <td className="py-3 px-4">17/02/2024</td>
                <td className="py-3 px-4">Venta servicios</td>
                <td className="py-3 px-4 text-right">450.000,00</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aprobado</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4">000123</td>
                <td className="py-3 px-4">16/02/2024</td>
                <td className="py-3 px-4">Ajuste inventario</td>
                <td className="py-3 px-4 text-right">75.000,00</td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Borrador</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPANIES VIEW ====================
function CompaniesView() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any>(null);
  const [formData, setFormData] = useState({
    Code: "",
    LegalName: "",
    RIF: "",
    FiscalAddress: "",
    Phone: "",
    Email: "",
    Activity: "",
    FunctionalCurrency: "VES",
    IVAAliquot: 16,
    IGTFAliquot: 3,
    IsActive: true,
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch("/api/companies");
      const data = await res.json();
      if (data.Success) {
        setCompanies(data.Data || []);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingCompany(null);
    setFormData({
      Code: "",
      LegalName: "",
      RIF: "",
      FiscalAddress: "",
      Phone: "",
      Email: "",
      Activity: "",
      FunctionalCurrency: "VES",
      IVAAliquot: 16,
      IGTFAliquot: 3,
      IsActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setFormData({
      Code: company.Code || "",
      LegalName: company.LegalName || "",
      RIF: company.RIF || "",
      FiscalAddress: company.FiscalAddress || "",
      Phone: company.Phone || "",
      Email: company.Email || "",
      Activity: company.Activity || "",
      FunctionalCurrency: company.FunctionalCurrency || "VES",
      IVAAliquot: company.IVAAliquot || 16,
      IGTFAliquot: company.IGTFAliquot || 3,
      IsActive: company.IsActive ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCompany 
        ? `/api/companies?id=${editingCompany.CompanyId}`
        : "/api/companies";
      const method = editingCompany ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (data.Success) {
        setShowModal(false);
        fetchCompanies();
      } else {
        alert(data.Message || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving company:", error);
      alert("Error al guardar la empresa");
    }
  };

  const handleDelete = async (companyId: number) => {
    if (!confirm("¿Está seguro de eliminar esta empresa?")) return;
    
    try {
      const res = await fetch(`/api/companies?id=${companyId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.Success) {
        fetchCompanies();
      } else {
        alert(data.Message || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Error al eliminar la empresa");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Empresas</h2>
          <p className="text-gray-500">Gestión de empresas del sistema</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span> Nueva Empresa
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Código</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Razón Social</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">RIF</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Moneda</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600">Estado</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No hay empresas registradas. Haga clic en &quot;Nueva Empresa&quot; para agregar una.
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.CompanyId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{company.Code}</td>
                  <td className="py-3 px-4">{company.LegalName}</td>
                  <td className="py-3 px-4">{company.RIF}</td>
                  <td className="py-3 px-4">{company.FunctionalCurrency}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${company.IsActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                      {company.IsActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => handleEdit(company)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(company.CompanyId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingCompany ? "Editar Empresa" : "Nueva Empresa"}
              </h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.Code}
                    onChange={(e) => setFormData({ ...formData, Code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RIF</label>
                  <input
                    type="text"
                    value={formData.RIF}
                    onChange={(e) => setFormData({ ...formData, RIF: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="J-12345678-9"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
                <input
                  type="text"
                  value={formData.LegalName}
                  onChange={(e) => setFormData({ ...formData, LegalName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Fiscal</label>
                <textarea
                  value={formData.FiscalAddress}
                  onChange={(e) => setFormData({ ...formData, FiscalAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.Phone}
                    onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.Email}
                    onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    value={formData.FunctionalCurrency}
                    onChange={(e) => setFormData({ ...formData, FunctionalCurrency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="VES">VES - Bolívar</option>
                    <option value="USD">USD - Dólar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.IsActive}
                    onChange={(e) => setFormData({ ...formData, IsActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Empresa Activa
                  </label>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h4 className="font-medium text-gray-800 mb-3">Configuración de Impuestos</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tasa IVA (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.IVAAliquot}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        IVAAliquot: parseFloat(e.target.value) 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tasa IGTF (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.IGTFAliquot}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        IGTFAliquot: parseFloat(e.target.value) 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {editingCompany ? "Guardar Cambios" : "Crear Empresa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ACCOUNTS VIEW ====================
function AccountsView() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    AccountCode: "",
    AccountName: "",
    Nature: "D",
    AccountType: "Detalle",
    ParentAccountId: null as number | null,
    IsMovementsRequired: false,
    RequiresThirdParty: false,
    AllowsManualEntry: true,
    Currency: "VES",
    IsCashFlowItem: false,
    IsActive: true,
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      if (data.Success) {
        setAccounts(data.Data || []);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAccount(null);
    setFormData({
      AccountCode: "",
      AccountName: "",
      Nature: "D",
      AccountType: "Detalle",
      ParentAccountId: null,
      IsMovementsRequired: false,
      RequiresThirdParty: false,
      AllowsManualEntry: true,
      Currency: "VES",
      IsCashFlowItem: false,
      IsActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      AccountCode: account.AccountCode || "",
      AccountName: account.AccountName || "",
      Nature: account.Nature || "D",
      AccountType: account.AccountType || "Detalle",
      ParentAccountId: account.ParentAccountId || null,
      IsMovementsRequired: account.IsMovementsRequired || false,
      RequiresThirdParty: account.RequiresThirdParty || false,
      AllowsManualEntry: account.AllowsManualEntry !== false,
      Currency: account.Currency || "VES",
      IsCashFlowItem: account.IsCashFlowItem || false,
      IsActive: account.IsActive ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAccount
        ? `/api/accounts?id=${editingAccount.AccountId}`
        : "/api/accounts";
      const method = editingAccount ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAccount ? { AccountId: editingAccount.AccountId, ...formData } : formData),
      });
      
      const data = await res.json();
      if (data.Success) {
        setShowModal(false);
        fetchAccounts();
      } else {
        alert(data.Message || "Error al guardar");
      }
    } catch (error) {
      console.error("Error saving account:", error);
      alert("Error al guardar la cuenta");
    }
  };

  const handleDelete = async (accountId: number) => {
    if (!confirm("¿Está seguro de eliminar esta cuenta?")) return;
    
    try {
      const res = await fetch(`/api/accounts?accountId=${accountId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.Success) {
        fetchAccounts();
      } else {
        alert(data.Message || "Error al eliminar");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("Error al eliminar la cuenta");
    }
  };

  // Filter accounts by search term
  const filteredAccounts = accounts.filter(account =>
    account.AccountCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.AccountName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Build tree structure
  const buildTree = (accounts: any[]) => {
    const map: Record<number, any> = {};
    const roots: any[] = [];
    
    accounts.forEach(account => {
      map[account.AccountId] = { ...account, children: [] };
    });
    
    accounts.forEach(account => {
      if (account.ParentAccountId && map[account.ParentAccountId]) {
        map[account.ParentAccountId].children.push(map[account.AccountId]);
      } else {
        roots.push(map[account.AccountId]);
      }
    });
    
    return roots;
  };

  const renderAccountRow = (account: any, level: number = 0): React.ReactNode => {
    const indent = level * 4;
    const rows = [
      <tr key={`${account.AccountId}-row`} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 px-4">
          <span style={{ marginLeft: `${indent}px` }} className="font-mono text-sm">
            {account.AccountCode}
          </span>
        </td>
        <td className="py-3 px-4">{account.AccountName}</td>
        <td className="py-3 px-4">
          <span className={`px-2 py-1 rounded-full text-xs ${
            account.Nature === 'D' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {account.Nature === 'D' ? 'D - Debe' : 'H - Haber'}
          </span>
        </td>
        <td className="py-3 px-4 text-center">
          <span className={`px-2 py-1 rounded-full text-xs ${account.AccountType === 'Rubro' ? 'bg-purple-100 text-purple-700' : account.AccountType === 'Subrubro' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
            {account.AccountType}
          </span>
        </td>
        <td className="py-3 px-4 text-center">
          <span className={`px-2 py-1 rounded-full text-xs ${account.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {account.IsActive ? 'Activa' : 'Inactiva'}
          </span>
        </td>
        <td className="py-3 px-4 text-center">
          <button 
            onClick={() => handleEdit(account)}
            className="text-blue-600 hover:text-blue-800 mr-2"
          >
            Editar
          </button>
          <button 
            onClick={() => handleDelete(account.AccountId)}
            className="text-red-600 hover:text-red-800"
          >
            Eliminar
          </button>
        </td>
      </tr>
    ] as React.ReactNode[];
    
    if (account.children && account.children.length > 0) {
      account.children.forEach((child: any) => {
        const childResult = renderAccountRow(child, level + 1);
        if (Array.isArray(childResult)) {
          rows.push(...childResult);
        } else {
          rows.push(childResult);
        }
      });
    }
    
    return rows;
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Plan de Cuentas</h2>
          <p className="text-gray-500">Estructura contable de la empresa</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span> Nueva Cuenta
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar cuenta por código o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Código</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Naturaleza</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Tipo</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Estado</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No hay cuentas registradas. Haga clic en &quot;Nueva Cuenta&quot; para agregar una.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((account) => renderAccountRow(account, 0))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingAccount ? "Editar Cuenta" : "Nueva Cuenta"}
              </h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                  <input
                    type="text"
                    value={formData.AccountCode}
                    onChange={(e) => setFormData({ ...formData, AccountCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="1.1.01"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.AccountName}
                    onChange={(e) => setFormData({ ...formData, AccountName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Caja General"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naturaleza</label>
                  <select
                    value={formData.Nature}
                    onChange={(e) => setFormData({ ...formData, Nature: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="D">D - Debe</option>
                    <option value="H">H - Haber</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cuenta</label>
                  <select
                    value={formData.AccountType}
                    onChange={(e) => setFormData({ ...formData, AccountType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="Rubro">Rubro</option>
                    <option value="Subrubro">Subrubro</option>
                    <option value="Detalle">Detalle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Padre</label>
                  <select
                    value={formData.ParentAccountId || ""}
                    onChange={(e) => setFormData({ ...formData, ParentAccountId: e.target.value ? parseInt(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Sin padre (Raíz)</option>
                    {accounts.filter(a => a.AccountType !== 'Detalle').map((account) => (
                      <option key={account.AccountId} value={account.AccountId}>
                        {account.AccountCode} - {account.AccountName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Moneda</label>
                  <select
                    value={formData.Currency}
                    onChange={(e) => setFormData({ ...formData, Currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="VES">VES - Bolívar</option>
                    <option value="USD">USD - Dólar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="IsMovementsRequired"
                    checked={formData.IsMovementsRequired}
                    onChange={(e) => setFormData({ ...formData, IsMovementsRequired: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="IsMovementsRequired" className="text-sm text-gray-700">
                    Requiere movimientos
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="RequiresThirdParty"
                    checked={formData.RequiresThirdParty}
                    onChange={(e) => setFormData({ ...formData, RequiresThirdParty: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="RequiresThirdParty" className="text-sm text-gray-700">
                    Requiere tercero
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="AllowsManualEntry"
                    checked={formData.AllowsManualEntry}
                    onChange={(e) => setFormData({ ...formData, AllowsManualEntry: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="AllowsManualEntry" className="text-sm text-gray-700">
                    Permite entrada manual
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="IsCashFlowItem"
                    checked={formData.IsCashFlowItem}
                    onChange={(e) => setFormData({ ...formData, IsCashFlowItem: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="IsCashFlowItem" className="text-sm text-gray-700">
                    Es flujo de caja
                  </label>
                </div>
              </div>

              {editingAccount && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="IsActive"
                    checked={formData.IsActive}
                    onChange={(e) => setFormData({ ...formData, IsActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="IsActive" className="text-sm text-gray-700">
                    Cuenta activa
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingAccount ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== JOURNAL VIEW ====================
function JournalView() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, drafts: 0, approved: 0, annulled: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [formData, setFormData] = useState({
    EntryType: "DAILY",
    EntryDate: new Date().toISOString().split('T')[0],
    Description: "",
    Reference: "",
    Lines: [{ AccountId: 0, Description: "", Debit: 0, Credit: 0 }]
  });

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('pageSize', '20');
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await fetch(`/api/journal?${params}`);
      const data = await res.json();
      if (data.Success) {
        setEntries(data.Data || []);
        setTotalPages(data.TotalPages || 1);
        // Calculate stats from the data
        const entriesData = data.Data || [];
        setStats({
          total: data.Total || 0,
          drafts: entriesData.filter((e: any) => e.Status === 'DRAFT').length,
          approved: entriesData.filter((e: any) => e.Status === 'APPROVED').length,
          annulled: entriesData.filter((e: any) => e.Status === 'ANNULED').length
        });
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleViewEntry = async (entry: any) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  const handleApprove = async (entryId: number) => {
    if (!confirm("¿Aprobar este asiento?")) return;
    try {
      const res = await fetch(`/api/journal?action=approve&id=${entryId}`, { method: 'PUT' });
      const data = await res.json();
      if (data.Success) {
        fetchEntries();
      } else {
        alert(data.Message || "Error al aprobar");
      }
    } catch (error) {
      console.error("Error approving entry:", error);
      alert("Error al aprobar el asiento");
    }
  };

  const handleAnnul = async (entryId: number) => {
    const reason = prompt("Motivo de anulación:");
    if (!reason) return;
    try {
      const res = await fetch(`/api/journal?action=annul&id=${entryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });
      const data = await res.json();
      if (data.Success) {
        fetchEntries();
      } else {
        alert(data.Message || "Error al anular");
      }
    } catch (error) {
      console.error("Error annulling entry:", error);
      alert("Error al anular el asiento");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-VE');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Borrador</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aprobado</span>;
      case 'ANNULED':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Anulado</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{status}</span>;
    }
  };

  const getEntryTypeLabel = (type: string) => {
    switch (type) {
      case 'DAILY': return 'Diario';
      case 'INCOME': return 'Ingreso';
      case 'EXPENSE': return 'Egreso';
      case 'ADJUSTMENT': return 'Ajuste';
      case 'CLOSING': return 'Cierre';
      default: return type;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const newLines = [...formData.Lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData(prev => ({ ...prev, Lines: newLines }));
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      Lines: [...prev.Lines, { AccountId: 0, Description: "", Debit: 0, Credit: 0 }]
    }));
  };

  const removeLine = (index: number) => {
    if (formData.Lines.length > 1) {
      const newLines = formData.Lines.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, Lines: newLines }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate debit equals credit
    const totalDebit = formData.Lines.reduce((sum, line) => sum + (parseFloat(String(line.Debit)) || 0), 0);
    const totalCredit = formData.Lines.reduce((sum, line) => sum + (parseFloat(String(line.Credit)) || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      alert("El total del Debe debe ser igual al total del Haber");
      return;
    }

    try {
      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.Success) {
        setShowModal(false);
        setFormData({
          EntryType: "DAILY",
          EntryDate: new Date().toISOString().split('T')[0],
          Description: "",
          Reference: "",
          Lines: [{ AccountId: 0, Description: "", Debit: 0, Credit: 0 }]
        });
        fetchEntries();
      } else {
        alert(data.Message || "Error al guardar el asiento");
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Error al guardar el asiento");
    }
  };

  const totalDebit = formData.Lines.reduce((sum, line) => sum + (parseFloat(String(line.Debit)) || 0), 0);
  const totalCredit = formData.Lines.reduce((sum, line) => sum + (parseFloat(String(line.Credit)) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Asientos Contables</h2>
          <p className="text-gray-500">Gestión de comprobantes contables</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span> Nuevo Asiento
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="DRAFT">Borrador</option>
          <option value="APPROVED">Aprobado</option>
          <option value="ANNULED">Anulado</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Asientos</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Borrador</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.drafts}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Aprobados</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Anulados</p>
          <p className="text-2xl font-bold text-red-600">{stats.annulled}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No hay asientos contables</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Número</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Descripción</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Debe</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-600">Haber</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Estado</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.EntryId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{entry.EntryNumber}</td>
                  <td className="py-3 px-4">{formatDate(entry.EntryDate)}</td>
                  <td className="py-3 px-4">{getEntryTypeLabel(entry.EntryType)}</td>
                  <td className="py-3 px-4">{entry.Description}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(entry.TotalDebit)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(entry.TotalCredit)}</td>
                  <td className="py-3 px-4 text-center">{getStatusBadge(entry.Status)}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewEntry(entry)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Ver
                      </button>
                      {entry.Status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleApprove(entry.EntryId)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleAnnul(entry.EntryId)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Anular
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="px-3 py-1">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold">Asiento {selectedEntry.EntryNumber}</h3>
                <p className="text-gray-500">{formatDate(selectedEntry.EntryDate)} - {getEntryTypeLabel(selectedEntry.EntryType)}</p>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <p className="mb-4"><strong>Descripción:</strong> {selectedEntry.Description}</p>
            <p className="mb-4"><strong>Referencia:</strong> {selectedEntry.Reference || '-'}</p>
            <p className="mb-4"><strong>Estado:</strong> {getStatusBadge(selectedEntry.Status)}</p>
            <div className="border-t pt-4 mt-4">
              <p className="font-semibold mb-2">Totales:</p>
              <p>Total Debe: {formatCurrency(selectedEntry.TotalDebit)}</p>
              <p>Total Haber: {formatCurrency(selectedEntry.TotalCredit)}</p>
            </div>
          </div>
        </div>
      )}

      {/* New Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">Nuevo Asiento Contable</h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    name="EntryType"
                    value={formData.EntryType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="DAILY">Diario</option>
                    <option value="INCOME">Ingreso</option>
                    <option value="EXPENSE">Egreso</option>
                    <option value="ADJUSTMENT">Ajuste</option>
                    <option value="CLOSING">Cierre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    name="EntryDate"
                    value={formData.EntryDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Referencia</label>
                  <input
                    type="text"
                    name="Reference"
                    value={formData.Reference}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Número de referencia"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  name="Description"
                  value={formData.Description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                  placeholder="Descripción del asiento"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Líneas del Asiento</label>
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    + Agregar línea
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Cuenta</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-600">Descripción</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">Debe</th>
                        <th className="text-right py-2 px-3 font-medium text-gray-600">Haber</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.Lines.map((line, index) => (
                        <tr key={index} className="border-t border-gray-100">
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              value={line.AccountId || ''}
                              onChange={(e) => handleLineChange(index, 'AccountId', parseInt(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="ID Cuenta"
                              required
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="text"
                              value={line.Description}
                              onChange={(e) => handleLineChange(index, 'Description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              placeholder="Descripción"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.01"
                              value={line.Debit || ''}
                              onChange={(e) => handleLineChange(index, 'Debit', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              step="0.01"
                              value={line.Credit || ''}
                              onChange={(e) => handleLineChange(index, 'Credit', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-right"
                              placeholder="0.00"
                            />
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(index)}
                              disabled={formData.Lines.length === 1}
                              className="text-red-600 hover:text-red-800 disabled:text-gray-300 disabled:cursor-not-allowed"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 font-medium">
                      <tr>
                        <td colSpan={2} className="py-2 px-3 text-right">Totales:</td>
                        <td className={`py-2 px-3 text-right ${Math.abs(totalDebit - totalCredit) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(totalDebit)}
                        </td>
                        <td className={`py-2 px-3 text-right ${Math.abs(totalDebit - totalCredit) > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(totalCredit)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                {Math.abs(totalDebit - totalCredit) > 0.01 && (
                  <p className="text-red-600 text-sm mt-1">
                    Diferencia: {formatCurrency(Math.abs(totalDebit - totalCredit))} - La partida debe balancear
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar Asiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== THIRD PARTIES VIEW ====================
function ThirdPartiesView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Terceros</h2>
          <p className="text-gray-500">Clientes, proveedores y otros</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <span>+</span> Nuevo Tercero
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">RIF</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Nombre</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Tipo</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600">Estado</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">J-12345678-9</td>
              <td className="py-3 px-4">Proveedor ABC CA</td>
              <td className="py-3 px-4">Proveedor</td>
              <td className="py-3 px-4">contacto@proveedor.com</td>
              <td className="py-3 px-4 text-center">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Activo</span>
              </td>
              <td className="py-3 px-4 text-center">
                <button className="text-blue-600 hover:text-blue-800 mr-2">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== PERIODS VIEW ====================
function PeriodsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Períodos Contables</h2>
        <p className="text-gray-500">Gestión de períodos y cierres</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Período Actual</h3>
          <p className="text-3xl font-bold text-blue-600">Febrero 2024</p>
          <p className="text-green-600 mt-2">● Abierto</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Período Anterior</h3>
          <p className="text-3xl font-bold text-gray-600">Enero 2024</p>
          <p className="text-gray-500 mt-2">● Cerrado</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Acciones</h3>
          <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg mb-2">
            Cerrar Período
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Período</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha Inicio</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha Fin</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600">Estado</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">Febrero 2024</td>
              <td className="py-3 px-4">01/02/2024</td>
              <td className="py-3 px-4">29/02/2024</td>
              <td className="py-3 px-4 text-center">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Abierto</span>
              </td>
              <td className="py-3 px-4 text-center">
                <button className="text-yellow-600 hover:text-yellow-800">Cerrar</button>
              </td>
            </tr>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">Enero 2024</td>
              <td className="py-3 px-4">01/01/2024</td>
              <td className="py-3 px-4">31/01/2024</td>
              <td className="py-3 px-4 text-center">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Cerrado</span>
              </td>
              <td className="py-3 px-4 text-center">
                <button className="text-blue-600 hover:text-blue-800">Reabrir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== REPORTS VIEW ====================
function ReportsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Reportes</h2>
        <p className="text-gray-500">Reportes financieros y fiscales</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-500 transition text-left">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="font-semibold text-gray-800">Balance de Comprobación</h3>
          <p className="text-sm text-gray-500 mt-1">Verificar partida doble</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-500 transition text-left">
          <div className="text-4xl mb-4">📈</div>
          <h3 className="font-semibold text-gray-800">Estado de Resultados</h3>
          <p className="text-sm text-gray-500 mt-1">Ganancias y pérdidas</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-500 transition text-left">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="font-semibold text-gray-800">Balance General</h3>
          <p className="text-sm text-gray-500 mt-1">Situación financiera</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-500 transition text-left">
          <div className="text-4xl mb-4">📒</div>
          <h3 className="font-semibold text-gray-800">Libro de Compras IVA</h3>
          <p className="text-sm text-gray-500 mt-1">Registro de compras</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-500 transition text-left">
          <div className="text-4xl mb-4">📗</div>
          <h3 className="font-semibold text-gray-800">Libro de Ventas IVA</h3>
          <p className="text-sm text-gray-500 mt-1">Registro de ventas</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-500 transition text-left">
          <div className="text-4xl mb-4">💵</div>
          <h3 className="font-semibold text-gray-800">Reporte IGTF</h3>
          <p className="text-sm text-gray-500 mt-1">Impuesto Transactions en Divisas</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-500 transition text-left">
          <div className="text-4xl mb-4">📖</div>
          <h3 className="font-semibold text-gray-800">Mayor General</h3>
          <p className="text-sm text-gray-500 mt-1">Movimientos por cuenta</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-500 transition text-left">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="font-semibold text-gray-800">Diario General</h3>
          <p className="text-sm text-gray-500 mt-1">Registro cronológico</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:border-blue-500 transition text-left">
          <div className="text-4xl mb-4">💸</div>
          <h3 className="font-semibold text-gray-800">Flujo de Caja</h3>
          <p className="text-sm text-gray-500 mt-1">Movimientos de efectivo</p>
        </button>
      </div>
    </div>
  );
}

// ==================== USERS VIEW ====================
function UsersView() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    Username: '',
    Email: '',
    Password: '',
    FirstName: '',
    LastName: '',
    Phone: '',
    IsActive: true,
    IsBlocked: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.Success) {
        setUsers(data.Data || []);
      } else {
        setError(data.Message || 'Error al cargar usuarios');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({
      Username: '',
      Email: '',
      Password: '',
      FirstName: '',
      LastName: '',
      Phone: '',
      IsActive: true,
      IsBlocked: false,
    });
    setShowModal(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      Username: user.Username || '',
      Email: user.Email || '',
      Password: '', // Don't show existing password
      FirstName: user.FirstName || '',
      LastName: user.LastName || '',
      Phone: user.Phone || '',
      IsActive: user.IsActive ?? true,
      IsBlocked: user.IsBlocked ?? false,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingUser 
        ? `/api/users?id=${editingUser.UserId}`
        : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (data.Success) {
        setShowModal(false);
        fetchUsers();
      } else {
        alert(data.Message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error al guardar el usuario');
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario?')) return;
    
    try {
      const res = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.Success) {
        fetchUsers();
      } else {
        alert(data.Message || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar el usuario');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Usuarios</h2>
          <p className="text-gray-500">Gestión de usuarios y permisos</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <span>+</span> Nuevo Usuario
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Usuario</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Nombre</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Teléfono</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Estado</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No hay usuarios</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.UserId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{user.Username}</td>
                    <td className="py-3 px-4">{user.FirstName} {user.LastName}</td>
                    <td className="py-3 px-4">{user.Email}</td>
                    <td className="py-3 px-4">{user.Phone || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.IsActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(user.UserId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <input
                    type="text"
                    value={formData.Username}
                    onChange={(e) => setFormData({ ...formData, Username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña {editingUser && '(dejar vacío para mantener)'}
                  </label>
                  <input
                    type="password"
                    value={formData.Password}
                    onChange={(e) => setFormData({ ...formData, Password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required={!editingUser}
                    placeholder={editingUser ? '••••••••' : ''}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.FirstName}
                    onChange={(e) => setFormData({ ...formData, FirstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    value={formData.LastName}
                    onChange={(e) => setFormData({ ...formData, LastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.Email}
                  onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  value={formData.Phone}
                  onChange={(e) => setFormData({ ...formData, Phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="+58 412 1234567"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.IsActive}
                    onChange={(e) => setFormData({ ...formData, IsActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Usuario Activo
                  </label>
                </div>
                <div className="flex items-center mt-6">
                  <input
                    type="checkbox"
                    id="isBlocked"
                    checked={formData.IsBlocked}
                    onChange={(e) => setFormData({ ...formData, IsBlocked: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isBlocked" className="ml-2 text-sm text-gray-700">
                    Usuario Bloqueado
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
