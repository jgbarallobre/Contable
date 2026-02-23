"use client";

import { useState, useEffect } from "react";

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
      } else {
        setError(data.Message || "Error al iniciar sesión");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
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
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-800">Contabilidad VE</h1>
          <p className="text-xs text-gray-500">Sistema Contable</p>
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
    CompanyCode: "",
    CompanyName: "",
    TaxId: "",
    Address: "",
    Phone: "",
    Email: "",
    Currency: "VES",
    TaxConfig: {
      ivaRate: 16,
      igtfRate: 3,
    },
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
      CompanyCode: "",
      CompanyName: "",
      TaxId: "",
      Address: "",
      Phone: "",
      Email: "",
      Currency: "VES",
      TaxConfig: {
        ivaRate: 16,
        igtfRate: 3,
      },
      IsActive: true,
    });
    setShowModal(true);
  };

  const handleEdit = (company: any) => {
    setEditingCompany(company);
    setFormData({
      CompanyCode: company.CompanyCode || "",
      CompanyName: company.CompanyName || "",
      TaxId: company.TaxId || "",
      Address: company.Address || "",
      Phone: company.Phone || "",
      Email: company.Email || "",
      Currency: company.Currency || "VES",
      TaxConfig: company.TaxConfig || { ivaRate: 16, igtfRate: 3 },
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
                  <td className="py-3 px-4">{company.CompanyCode}</td>
                  <td className="py-3 px-4">{company.CompanyName}</td>
                  <td className="py-3 px-4">{company.TaxId}</td>
                  <td className="py-3 px-4">{company.Currency}</td>
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
                    value={formData.CompanyCode}
                    onChange={(e) => setFormData({ ...formData, CompanyCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RIF</label>
                  <input
                    type="text"
                    value={formData.TaxId}
                    onChange={(e) => setFormData({ ...formData, TaxId: e.target.value })}
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
                  value={formData.CompanyName}
                  onChange={(e) => setFormData({ ...formData, CompanyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Fiscal</label>
                <textarea
                  value={formData.Address}
                  onChange={(e) => setFormData({ ...formData, Address: e.target.value })}
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
                    value={formData.Currency}
                    onChange={(e) => setFormData({ ...formData, Currency: e.target.value })}
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
                      value={formData.TaxConfig.ivaRate}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        TaxConfig: { ...formData.TaxConfig, ivaRate: parseFloat(e.target.value) } 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tasa IGTF (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.TaxConfig.igtfRate}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        TaxConfig: { ...formData.TaxConfig, igtfRate: parseFloat(e.target.value) } 
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
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Plan de Cuentas</h2>
          <p className="text-gray-500">Estructura contable de la empresa</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <span>+</span> Nueva Cuenta
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar cuenta..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div className="p-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg font-semibold">
              <span className="w-24">1</span>
              <span>ACTIVOS</span>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg ml-4">
              <span className="w-24">1.1</span>
              <span>1.1 - ACTIVO CORRIENTE</span>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg ml-8">
              <span className="w-24">1.1.01</span>
              <span>1.1.01 - Caja</span>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg ml-8">
              <span className="w-24">1.1.02</span>
              <span>1.1.02 - Bancos</span>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg ml-4">
              <span className="w-24">1.2</span>
              <span>1.2 - ACTIVO NO CORRIENTE</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg font-semibold mt-4">
              <span className="w-24">2</span>
              <span>PASIVOS</span>
            </div>
            <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg ml-4">
              <span className="w-24">2.1</span>
              <span>2.1 - PASIVO CORRIENTE</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg font-semibold mt-4">
              <span className="w-24">3</span>
              <span>PATRIMONIO</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg font-semibold mt-4">
              <span className="w-24">4</span>
              <span>INGRESOS</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg font-semibold mt-4">
              <span className="w-24">5</span>
              <span>GASTOS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== JOURNAL VIEW ====================
function JournalView() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Asientos Contables</h2>
          <p className="text-gray-500">Gestión de comprobantes contables</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <span>+</span> Nuevo Asiento
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total Asientos</p>
          <p className="text-2xl font-bold text-gray-800">156</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Borrador</p>
          <p className="text-2xl font-bold text-yellow-600">12</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Aprobados</p>
          <p className="text-2xl font-bold text-green-600">140</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Anulados</p>
          <p className="text-2xl font-bold text-red-600">4</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="py-3 px-4">000125</td>
              <td className="py-3 px-4">18/02/2024</td>
              <td className="py-3 px-4">Egreso</td>
              <td className="py-3 px-4">Pago servicios básicos</td>
              <td className="py-3 px-4 text-right">125.500,00</td>
              <td className="py-3 px-4 text-right">125.500,00</td>
              <td className="py-3 px-4 text-center">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Aprobado</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Usuarios</h2>
          <p className="text-gray-500">Gestión de usuarios y permisos</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
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
                      <button className="text-blue-600 hover:text-blue-800 mr-2">Editar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
