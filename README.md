# Sistema Contable Venezuela - Multiempresa/Multiusuario

## 📋 Descripción

Sistema de contabilidad completo para Venezuela, desarrollado con Next.js 16 (App Router) y SQL Server. Diseñado para soportar múltiples empresas (tenants) y usuarios concurrentes con control de acceso basado en roles (RBAC).

## 🚀 Características Principales

### ✅ Multiempresa
- CRUD completo de empresas
- Configuración por empresa: RIF, dirección fiscal, moneda funcional, alícuotas IVA/IGTF
- Aislamiento total de datos por empresa (CompanyId)
- Acceso multi-empresa por usuario

### ✅ Seguridad y Autenticación
- Autenticación con JWT
- Hash de contraseñas con bcrypt
- Control de acceso basado en roles (RBAC)
- Permisos granulares por módulo/acción
- Auditoría completa de acciones

### ✅ Contabilidad
- Plan de cuentas jerárquico (padre/hijo)
- Tipos de cuenta: Activo, Pasivo, Patrimonio, Ingreso, Gasto, Orden
- Naturaleza deudora/acreedora
- Validación de partida doble
- Comprobantes: Diario, Ingreso, Egreso, Ajuste
- Flujo: Borrador → Aprobado → Anulado
- Soporte para reversos automáticos
- Períodos contables con apertura/cierre

### ✅ Terceros
- Clientes, Proveedores, Empleados, Otros
- RIF único por empresa
- Categorías fiscales
- Agentes de retención

### ✅ Reportes Financieros
- Balance de Comprobación
- Estado de Resultados
- Balance General
- Mayor General
- Diario General

### ✅ Reportes Fiscales Venezuela
- Libro de Compras IVA
- Libro de Ventas IVA
- Reporte de IGTF (Ley 25/02/2022)
- Soporte para retenciones (IVA/ISLR)

### ✅ Configurabilidad
- Moneda base y secundaria
- Alícuotas IVA configurables (general, reducida, adicional)
- Configuración IGTF parametrizable

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Backend**: Next.js API Routes
- **Base de Datos**: SQL Server 2019+
- **Estilos**: Tailwind CSS 4
- **Autenticación**: JWT + bcrypt

### Estructura del Proyecto
```
src/
├── app/
│   ├── api/
│   │   ├── auth/login/       # Autenticación
│   │   ├── companies/        # CRUD Empresas
│   │   ├── accounts/        # Plan de Cuentas
│   │   ├── journal/         # Asientos Contables
│   │   ├── third-parties/   # Terceros
│   │   ├── periods/         # Períodos Contables
│   │   └── reports/         # Reportes
│   ├── page.tsx             # Dashboard Principal
│   └── layout.tsx            # Layout Principal
└── lib/
    ├── db/connection.ts      # Conexión SQL Server
    ├── auth.ts               # Utilidades de Auth
    └── types.ts              # Tipos TypeScript
```

## 📦 Instalación

### 1. Requisitos Previos
- Node.js 20+
- SQL Server 2019+
- Bun (gestor de paquetes)

### 2. Configurar Variables de Entorno
```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### 3. Instalar Dependencias
```bash
bun install
```

### 4. Ejecutar Schema de Base de Datos
```bash
# Ejecutar database/schema.sql en SQL Server Management Studio
```

### 5. Iniciar Servidor
```bash
bun dev
```

## 📊 API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| POST | /api/auth/login | Iniciar sesión |
| DELETE | /api/auth/login | Cerrar sesión |

### Empresas
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | /api/companies | Listar empresas |
| POST | /api/companies | Crear empresa |

### Plan de Cuentas
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | /api/accounts | Listar cuentas |
| POST | /api/accounts | Crear cuenta |
| PUT | /api/accounts | Actualizar cuenta |
| DELETE | /api/accounts | Eliminar cuenta |

### Asientos Contables
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | /api/journal | Listar asientos |
| POST | /api/journal | Crear asiento |
| PUT | /api/journal/approve | Aprobar asiento |
| PUT | /api/journal/annul | Anular asiento |
| PUT | /api/journal/reverse | Reversar asiento |

### Terceros
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | /api/third-parties | Listar terceros |
| POST | /api/third-parties | Crear tercero |
| PUT | /api/third-parties | Actualizar tercero |
| DELETE | /api/third-parties | Eliminar tercero |

### Períodos
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | /api/periods | Listar períodos |
| PUT | /api/periods/close | Cerrar período |
| PUT | /api/periods/reopen | Reabrir período |

### Reportes
| Método | Endpoint | Descripción |
|--------|---------|-------------|
| GET | /api/reports?type=trial_balance | Balance de Comprobación |
| GET | /api/reports?type=income_statement | Estado de Resultados |
| GET | /api/reports?type=balance_sheet | Balance General |
| GET | /api/reports?type=general_ledger | Mayor General |
| GET | /api/reports?type=general_journal | Diario General |
| GET | /api/reports?type=purchase_book | Libro de Compras |
| GET | /api/reports?type=sales_book | Libro de Ventas |
| GET | /api/reports?type=igtf | Reporte IGTF |

## 🔐 Matriz de Permisos

| Rol | Empresas | Cuentas | Asientos | Terceros | Períodos | Reportes | Usuarios |
|-----|----------|---------|----------|----------|----------|----------|----------|
| Administrador | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| Contador | Ver | CRUD | CRUD | CRUD | Cerrar | Ver | - |
| Auditor | Ver | Ver | Ver | Ver | Ver | Ver | - |
| Operador | - | Ver | Crear/Editar | CRUD | - | - | - |
| Consulta | - | Ver | Ver | Ver | Ver | Ver | - |

## 📝 Reglas de Negocio

1. **Multiempresa**: Todo registro pertenece a una empresa (CompanyId)
2. **Períodos**: No se puede registrar en período cerrado
3. **Partida Doble**: Total Debe = Total Haber
4. **Auditoría**: Registro de todas las operaciones críticas
5. **Terceros**: RIF único por empresa
6. **Cuentas**: No permiten movimiento en cuentas "título"

## 🧪 Casos de Prueba

### Contabilidad
- [x] Crear asiento con partida doble
- [x] Verificar cuadre Debe = Haber
- [x] Aprobar/anular/reversar asiento
- [x] Cerrar período contable
- [x] Reabrir período

### Multiempresa
- [x] Crear múltiples empresas
- [x] Asignar usuarios a empresas
- [x] Aislamiento de datos

### Permisos
- [x] Verificar acceso por rol
- [x] Denegar acciones no permitidas

### Reportes
- [x] Generar Balance de Comprobación
- [x] Generar Estado de Resultados
- [x] Generar Balance General
- [x] Generar Libro de Compras/Ventas
- [x] Generar Reporte IGTF

## 📄 Tablas de Base de Datos

### Seguridad
- Companies (Empresas)
- Users (Usuarios)
- Roles (Roles)
- Permissions (Permisos)
- RolePermissions (Relación Roles-Permisos)
- UserCompanies (Usuario-Empresa)

### Contabilidad
- ChartOfAccounts (Plan de Cuentas)
- JournalEntryHeaders (Encabezados de Asientos)
- JournalEntryLines (Líneas de Asientos)
- Periods (Períodos)
- ThirdParties (Terceros)
- CostCenters (Centros de Costo)
- Banks (Bancos)
- BankAccounts (Cuentas Bancarias)

### Fiscal
- PurchaseBook (Libro de Compras)
- SalesBook (Libro de Ventas)
- ExchangeRates (Tasas de Cambio)
- CurrencyConfigurations (Configuración de Monedas)

### Sistema
- AuditLog (Bitácora de Auditoría)
- SystemConfigurations (Configuraciones)
- DocumentSequences (Numeración de Comprobantes)

## 📋 Pendientes y Mejoras Futuras

- [ ] Implementar更多recetas de base de datos
- [ ] Agregar更多reportes fiscales
- [ ] Implementar autenticación de dos factores (2FA)
- [ ] Agregar更多tests automatizados
- [ ] Implementar dashboard más completo
- [ ] Agregar exportación a Excel/PDF
- [ ] Implementar notificaciones
- [ ] Agregar integraciones con otros sistemas

## 📄 Licencia

MIT License - Venezuela 2024
