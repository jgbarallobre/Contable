-- ============================================================
-- DATOS DE PRUEBA / SEED DATA
-- Sistema Contable Venezuela
-- ============================================================

USE ContabilidadVE;
GO

-- ============================================================
-- 1. EMPRESA DEMO
-- ============================================================
INSERT INTO Companies (
    Code, 
    LegalName, 
    CommercialName, 
    RIF, 
    FiscalAddress, 
    Phone, 
    Email, 
    Activity,
    FunctionalCurrency,
    SecondaryCurrency,
    IVAAliquot,
    ReducedIVAAliquot,
    AdditionalIVAAliquot,
    IGTFAliquot,
    RetentionPercentage,
    ISLRRetentionPercentage,
    IsActive,
    CreatedAt,
    CreatedBy
)
VALUES (
    'DEMO01',
    'COMERCIAL EJEMPLO C.A.',
    'Comercial Ejemplo',
    'J-12345678-9',
    'Av. Principal, Edificio Centro, Piso 1, Oficina 1-A, Caracas, Miranda',
    '+58 212 555-1234',
    'admin@comercialejemplo.com',
    'Comercio al por mayor de productos diversos',
    'VES',
    'USD',
    16.00,
    8.00,
    31.50,
    3.00,
    75.00,
    2.00,
    1,
    GETDATE(),
    NULL
);
GO

-- ============================================================
-- 2. USUARIO DEMO (Password: Demo123!)
-- Password hash para "Demo123!" (bcrypt)
-- ============================================================
INSERT INTO Users (
    Username,
    Email,
    PasswordHash,
    FirstName,
    LastName,
    Phone,
    IsActive,
    IsBlocked,
    Is2FAEnabled,
    MustChangePassword,
    CreatedAt
)
VALUES (
    'admin',
    'admin@comercialejemplo.com',
    '$2b$10$/OktFN05aKUpAzqwTiCE8eH4iYz0/sWA0WI6jOr9k1ar86quW.rFO', -- password: Demo123!
    'Administrador',
    'Sistema',
    '+58 212 555-1234',
    1,
    0,
    0,
    0,
    GETDATE()
);
GO

-- ============================================================
-- 3. ROLES
-- ============================================================
-- Rol de Administrador del Sistema
INSERT INTO Roles (CompanyId, Name, Description, IsSystem, IsActive, CreatedAt, CreatedBy)
VALUES (NULL, 'ADMIN', 'Administrador del Sistema', 1, 1, GETDATE(), 1);
GO

-- Rol de Contador
INSERT INTO Roles (CompanyId, Name, Description, IsSystem, IsActive, CreatedAt, CreatedBy)
VALUES (1, 'CONTADOR', 'Contador de la Empresa', 0, 1, GETDATE(), 1);
GO

-- Rol de Usuario Básico
INSERT INTO Roles (CompanyId, Name, Description, IsSystem, IsActive, CreatedAt, CreatedBy)
VALUES (1, 'USUARIO', 'Usuario con acceso básico', 0, 1, GETDATE(), 1);
GO

-- ============================================================
-- 4. PERMISOS
-- ============================================================
INSERT INTO Permissions (Module, Action, Description) VALUES
('COMPANIES', 'VIEW', 'Ver empresas'),
('COMPANIES', 'CREATE', 'Crear empresas'),
('COMPANIES', 'EDIT', 'Editar empresas'),
('COMPANIES', 'DELETE', 'Eliminar empresas'),
('USERS', 'VIEW', 'Ver usuarios'),
('USERS', 'CREATE', 'Crear usuarios'),
('USERS', 'EDIT', 'Editar usuarios'),
('USERS', 'DELETE', 'Eliminar usuarios'),
('ACCOUNTS', 'VIEW', 'Ver plan de cuentas'),
('ACCOUNTS', 'CREATE', 'Crear cuentas'),
('ACCOUNTS', 'EDIT', 'Editar cuentas'),
('ACCOUNTS', 'DELETE', 'Eliminar cuentas'),
('JOURNAL', 'VIEW', 'Ver asientos'),
('JOURNAL', 'CREATE', 'Crear asientos'),
('JOURNAL', 'EDIT', 'Editar asientos'),
('JOURNAL', 'DELETE', 'Eliminar asientos'),
('JOURNAL', 'APPROVE', 'Aprobar asientos'),
('JOURNAL', 'ANNUL', 'Anular asientos'),
('THIRDPARTIES', 'VIEW', 'Ver terceros'),
('THIRDPARTIES', 'CREATE', 'Crear terceros'),
('THIRDPARTIES', 'EDIT', 'Editar terceros'),
('THIRDPARTIES', 'DELETE', 'Eliminar terceros'),
('PERIODS', 'VIEW', 'Ver períodos'),
('PERIODS', 'CREATE', 'Crear períodos'),
('PERIODS', 'EDIT', 'Editar períodos'),
('PERIODS', 'CLOSE', 'Cerrar períodos'),
('PERIODS', 'REOPEN', 'Reabrir períodos'),
('REPORTS', 'VIEW', 'Ver reportes'),
('REPORTS', 'EXPORT', 'Exportar reportes');
GO

-- Asignar todos los permisos al rol ADMIN
INSERT INTO RolePermissions (RoleId, PermissionId, GrantedAt, GrantedBy)
SELECT 1, PermissionId, GETDATE(), 1
FROM Permissions;
GO

-- Asignar permisos limitados al rol CONTADOR
INSERT INTO RolePermissions (RoleId, PermissionId, GrantedAt, GrantedBy)
SELECT 2, PermissionId, GETDATE(), 1
FROM Permissions
WHERE Module IN ('ACCOUNTS', 'JOURNAL', 'THIRDPARTIES', 'PERIODS', 'REPORTS');
GO

-- Asignar permisos básicos al rol USUARIO
INSERT INTO RolePermissions (RoleId, PermissionId, GrantedAt, GrantedBy)
SELECT 3, PermissionId, GETDATE(), 1
FROM Permissions
WHERE Action IN ('VIEW');
GO

-- ============================================================
-- 5. ASIGNAR USUARIO A EMPRESA
-- ============================================================
INSERT INTO UserCompanies (UserId, CompanyId, RoleId, IsDefault, IsActive, CreatedAt, CreatedBy)
VALUES (1, 1, 2, 1, 1, GETDATE(), 1);  -- Usuario admin con rol Contador en empresa Demo
GO

-- ============================================================
-- 6. PERÍODO CONTABLE ACTIVO
-- ============================================================
INSERT INTO Periods (
    CompanyId,
    Year,
    Month,
    StartDate,
    EndDate,
    Status,
    CreatedAt,
    CreatedBy
)
VALUES 
(1, 2025, 1, '2025-01-01', '2025-01-31', 'OPEN', GETDATE(), 1),
(1, 2025, 2, '2025-02-01', '2025-02-28', 'OPEN', GETDATE(), 1),
(1, 2025, 3, '2025-03-01', '2025-03-31', 'OPEN', GETDATE(), 1);
GO

-- ============================================================
-- 7. PLAN DE CUENTAS GENÉRICO VENEZUELA
-- ============================================================

-- === ACTIVO (1) ===
-- 1.0 ACTIVO
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1', 'ACTIVO', NULL, 1, 'DEBITOR', 'ASSET', 0, 0, 0, 'VES', 1, GETDATE(), 1);

-- 1.1 ACTIVO CORRIENTE
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1', 'ACTIVO CORRIENTE', 1, 2, 'DEBITOR', 'ASSET', 0, 0, 0, 'VES', 1, GETDATE(), 1);

-- 1.1.01 Efectivo y Equivalentes
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.01', 'Efectivo y Equivalentes', 2, 3, 'DEBITOR', 'ASSET', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.01.01 Caja General
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.01.01', 'Caja General', 3, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.01.02 Caja Chica
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.01.02', 'Caja Chica', 3, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.01.03 Banco - Cuenta Corriente
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.01.03', 'Banco - Cuenta Corriente', 3, 4, 'DEBITOR', 'ASSET', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.01.04 Banco - Cuenta Ahorros
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.01.04', 'Banco - Cuenta Ahorros', 3, 4, 'DEBITOR', 'ASSET', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.02 Cuentas por Cobrar
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.02', 'Cuentas por Cobrar', 2, 3, 'DEBITOR', 'ASSET', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.02.01 Cuentas por Cobrar Clientes
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.02.01', 'Cuentas por Cobrar Clientes', 5, 4, 'DEBITOR', 'ASSET', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.02.02 Cuentas por Cobrar Empleados
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.02.02', 'Cuentas por Cobrar Empleados', 5, 4, 'DEBITOR', 'ASSET', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.02.03 Otras Cuentas por Cobrar
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.02.03', 'Otras Cuentas por Cobrar', 5, 4, 'DEBITOR', 'ASSET', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.03 Inventarios
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.03', 'Inventarios', 2, 3, 'DEBITOR', 'ASSET', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.03.01 Mercancías para la Venta
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.03.01', 'Mercancías para la Venta', 8, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.03.02 Materiales y Suministros
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.03.02', 'Materiales y Suministros', 8, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.04 Créditos por IVA
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.04', 'Créditos por IVA', 2, 3, 'DEBITOR', 'ASSET', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.04.01 IVA Acreditable
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.04.01', 'IVA Acreditable', 11, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.04.02 IVA Retenido por Terceros
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.04.02', 'IVA Retenido por Terceros', 11, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.04.03 Anticipo de IVA (IGTF)
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.04.03', 'Anticipo de IVA (IGTF)', 11, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.05 Gastos Pagados por Anticipado
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.05', 'Gastos Pagados por Anticipado', 2, 3, 'DEBITOR', 'ASSET', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.05.01 Primas de Seguros
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.05.01', 'Primas de Seguros', 14, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.1.05.02 Alquileres Pagados por Anticipado
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.1.05.02', 'Alquileres Pagados por Anticipado', 14, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.2 ACTIVO NO CORRIENTE
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2', 'ACTIVO NO CORRIENTE', 1, 2, 'DEBITOR', 'ASSET', 0, 0, 0, 'VES', 1, GETDATE(), 1);

-- 1.2.01 Propiedad, Planta y Equipo
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2.01', 'Propiedad, Planta y Equipo', 16, 3, 'DEBITOR', 'ASSET', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.2.01.01 Muebles y Enseres
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2.01.01', 'Muebles y Enseres', 17, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.2.01.02 Equipos de Oficina
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2.01.02', 'Equipos de Oficina', 17, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.2.01.03 Equipos de Cómputo
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2.01.03', 'Equipos de Cómputo', 17, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.2.01.04 Vehículos
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2.01.04', 'Vehículos', 17, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.2.02 Depreciación Acumulada (Cuenta contra-activo)
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2.02', 'Depreciación Acumulada', 16, 3, 'CREDITOR', 'ASSET', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.2.02.01 Depreciación Acumulada Muebles
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2.02.01', 'Depreciación Acumulada Muebles', 21, 4, 'CREDITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.2.02.02 Depreciación Acumulada Equipos
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2.02.02', 'Depreciación Acumulada Equipos', 21, 4, 'CREDITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.2.03 Intangibles
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2.03', 'Intangibles', 16, 3, 'DEBITOR', 'ASSET', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 1.2.03.01 Licencias y Software
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '1.2.03.01', 'Licencias y Software', 24, 4, 'DEBITOR', 'ASSET', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- === PASIVO (2) ===
-- 2.0 PASIVO
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2', 'PASIVO', NULL, 1, 'CREDITOR', 'LIABILITY', 0, 0, 0, 'VES', 1, GETDATE(), 1);

-- 2.1 PASIVO CORRIENTE
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1', 'PASIVO CORRIENTE', 26, 2, 'CREDITOR', 'LIABILITY', 0, 0, 0, 'VES', 1, GETDATE(), 1);

-- 2.1.01 Cuentas por Pagar
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.01', 'Cuentas por Pagar', 27, 3, 'CREDITOR', 'LIABILITY', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.01.01 Cuentas por Pagar Proveedores
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.01.01', 'Cuentas por Pagar Proveedores', 28, 4, 'CREDITOR', 'LIABILITY', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.01.02 Cuentas por Pagar Empleados
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.01.02', 'Cuentas por Pagar Empleados', 28, 4, 'CREDITOR', 'LIABILITY', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.01.03 Otras Cuentas por Pagar
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.01.03', 'Otras Cuentas por Pagar', 28, 4, 'CREDITOR', 'LIABILITY', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.02 Obligaciones Fiscales
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.02', 'Obligaciones Fiscales', 27, 3, 'CREDITOR', 'LIABILITY', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.02.01 IVA Debito Fiscal
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.02.01', 'IVA Débito Fiscal', 31, 4, 'CREDITOR', 'LIABILITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.02.02 IVA Retenido a Terceros
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.02.02', 'IVA Retenido a Terceros', 31, 4, 'CREDITOR', 'LIABILITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.02.03 ISLR Retenido a Terceros
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.02.03', 'ISLR Retenido a Terceros', 31, 4, 'CREDITOR', 'LIABILITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.02.04 IGTF por Pagar
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.02.04', 'IGTF por Pagar', 31, 4, 'CREDITOR', 'LIABILITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.03 Obligaciones Laborales
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.03', 'Obligaciones Laborales', 27, 3, 'CREDITOR', 'LIABILITY', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.03.01 Sueldos por Pagar
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.03.01', 'Sueldos por Pagar', 35, 4, 'CREDITOR', 'LIABILITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.03.02 Prestaciones Sociales por Pagar
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.03.02', 'Prestaciones Sociales por Pagar', 35, 4, 'CREDITOR', 'LIABILITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.03.03 Utilidades por Pagar
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.03.03', 'Utilidades por Pagar', 35, 4, 'CREDITOR', 'LIABILITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.04 Ingresos Diferidos
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.04', 'Ingresos Diferidos', 27, 3, 'CREDITOR', 'LIABILITY', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.1.04.01 Anticipos de Clientes
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.1.04.01', 'Anticipos de Clientes', 38, 4, 'CREDITOR', 'LIABILITY', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 2.2 PASIVO NO CORRIENTE
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.2', 'PASIVO NO CORRIENTE', 26, 2, 'CREDITOR', 'LIABILITY', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.2.01 Préstamos por Pagar
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.2.01', 'Préstamos por Pagar', 40, 3, 'CREDITOR', 'LIABILITY', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 2.2.01.01 Préstamos Bancarios
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '2.2.01.01', 'Préstamos Bancarios', 41, 4, 'CREDITOR', 'LIABILITY', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- === PATRIMONIO (3) ===
-- 3.0 PATRIMONIO
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '3', 'PATRIMONIO', NULL, 1, 'CREDITOR', 'EQUITY', 0, 0, 0, 'VES', 1, GETDATE(), 1);

-- 3.1 Capital
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '3.1', 'Capital', 43, 2, 'CREDITOR', 'EQUITY', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 3.1.01 Capital Social
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '3.1.01', 'Capital Social', 44, 3, 'CREDITOR', 'EQUITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 3.2 Reservas
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '3.2', 'Reservas', 43, 2, 'CREDITOR', 'EQUITY', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 3.2.01 Reserva Legal
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '3.2.01', 'Reserva Legal', 46, 3, 'CREDITOR', 'EQUITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 3.3 Resultados
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '3.3', 'Resultados', 43, 2, 'CREDITOR', 'EQUITY', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 3.3.01 Resultados del Ejercicio
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '3.3.01', 'Resultados del Ejercicio', 48, 3, 'CREDITOR', 'EQUITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 3.3.02 Resultados Acumulados
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '3.3.02', 'Resultados Acumulados', 48, 3, 'CREDITOR', 'EQUITY', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- === INGRESOS (4) ===
-- 4.0 INGRESOS
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4', 'INGRESOS', NULL, 1, 'CREDITOR', 'INCOME', 0, 0, 0, 'VES', 1, GETDATE(), 1);

-- 4.1 Ingresos Operacionales
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.1', 'Ingresos Operacionales', 51, 2, 'CREDITOR', 'INCOME', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 4.1.01 Ventas de Mercancías
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.1.01', 'Ventas de Mercancías', 52, 3, 'CREDITOR', 'INCOME', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 4.1.02 Ventas de Servicios
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.1.02', 'Ventas de Servicios', 52, 3, 'CREDITOR', 'INCOME', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 4.2 Descuentos y Rebajas
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.2', 'Descuentos y Rebajas', 51, 2, 'DEBITOR', 'INCOME', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 4.2.01 Descuentos sobre Ventas
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.2.01', 'Descuentos sobre Ventas', 55, 3, 'DEBITOR', 'INCOME', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 4.2.02 Rebajas sobre Ventas
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.2.02', 'Rebajas sobre Ventas', 55, 3, 'DEBITOR', 'INCOME', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 4.3 Devoluciones sobre Ventas
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.3', 'Devoluciones sobre Ventas', 51, 2, 'DEBITOR', 'INCOME', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 4.3.01 Devoluciones sobre Ventas
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.3.01', 'Devoluciones sobre Ventas', 58, 3, 'DEBITOR', 'INCOME', 1, 1, 1, 'VES', 1, GETDATE(), 1);

-- 4.4 Otros Ingresos
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.4', 'Otros Ingresos', 51, 2, 'CREDITOR', 'INCOME', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 4.4.01 Ingresos Financieros
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.4.01', 'Ingresos Financieros', 60, 3, 'CREDITOR', 'INCOME', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 4.4.02 Otros Ingresos No Operacionales
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '4.4.02', 'Otros Ingresos No Operacionales', 60, 3, 'CREDITOR', 'INCOME', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- === COSTOS (5) ===
-- 5.0 COSTOS
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '5', 'COSTOS', NULL, 1, 'DEBITOR', 'EXPENSE', 0, 0, 0, 'VES', 1, GETDATE(), 1);

-- 5.1 Costo de Ventas
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '5.1', 'Costo de Ventas', 63, 2, 'DEBITOR', 'EXPENSE', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 5.1.01 Costo de Mercancías Vendidas
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '5.1.01', 'Costo de Mercancías Vendidas', 64, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 5.1.02 Costo de Servicios Prestados
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '5.1.02', 'Costo de Servicios Prestados', 64, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 5.2 Costo de Distribución
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '5.2', 'Costo de Distribución', 63, 2, 'DEBITOR', 'EXPENSE', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 5.2.01 Gastos de Transporte
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '5.2.01', 'Gastos de Transporte', 67, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 5.2.02 Gastos de Embalaje
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '5.2.02', 'Gastos de Embalaje', 67, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- === GASTOS (6) ===
-- 6.0 GASTOS
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6', 'GASTOS', NULL, 1, 'DEBITOR', 'EXPENSE', 0, 0, 0, 'VES', 1, GETDATE(), 1);

-- 6.1 Gastos de Operación
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1', 'Gastos de Operación', 70, 2, 'DEBITOR', 'EXPENSE', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.01 Gastos de Personal
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.01', 'Gastos de Personal', 71, 3, 'DEBITOR', 'EXPENSE', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.01.01 Sueldos y Salarios
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.01.01', 'Sueldos y Salarios', 72, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.01.02 Bonificaciones
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.01.02', 'Bonificaciones', 72, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.01.03 Prestaciones Sociales
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.01.03', 'Prestaciones Sociales', 72, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.01.04 Vacaciones
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.01.04', 'Vacaciones', 72, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.01.05 Utilidades
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.01.05', 'Utilidades', 72, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.01.06 SSО
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.01.06', 'SSO', 72, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.01.07 INCE
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.01.07', 'INCE', 72, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.01.08 Paro Forzoso
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.01.08', 'Paro Forzoso', 72, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02 Gastos de Administración
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02', 'Gastos de Administración', 71, 3, 'DEBITOR', 'EXPENSE', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02.01 Alquileres
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02.01', 'Alquileres', 81, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02.02 Servicios Públicos
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02.02', 'Servicios Públicos', 81, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02.03 Mantenimiento y Reparaciones
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02.03', 'Mantenimiento y Reparaciones', 81, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02.04 Seguros
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02.04', 'Seguros', 81, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02.05 Depreciación
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02.05', 'Depreciación', 81, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02.06 Amortización
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02.06', 'Amortización', 81, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02.07 Gastos de Representation
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02.07', 'Gastos de Representación', 81, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02.08 Materiales y Suministros
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02.08', 'Materiales y Suministros', 81, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02.09 Comunicaciones
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02.09', 'Comunicaciones', 81, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.02.10 Limpieza
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.02.10', 'Limpieza', 81, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.03 Gastos de Ventas
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.03', 'Gastos de Ventas', 71, 3, 'DEBITOR', 'EXPENSE', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.03.01 Propaganda y Publicidad
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.03.01', 'Propaganda y Publicidad', 91, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.03.02 Comisiones sobre Ventas
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.03.02', 'Comisiones sobre Ventas', 91, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.1.03.03 Gastos de Viaje
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.1.03.03', 'Gastos de Viaje', 91, 4, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.2 Gastos Financieros
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.2', 'Gastos Financieros', 70, 2, 'DEBITOR', 'EXPENSE', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.2.01 Intereses Pagados
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.2.01', 'Intereses Pagados', 95, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.2.02 Comisiones Bancarias
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.2.02', 'Comisiones Bancarias', 95, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.2.03 Diferencia en Cambio
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.2.03', 'Diferencia en Cambio', 95, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.2.04 Gastos Bancarios
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.2.04', 'Gastos Bancarios', 95, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.3 Gastos Tributarios
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.3', 'Gastos Tributarios', 70, 2, 'DEBITOR', 'EXPENSE', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.3.01 ISLR
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.3.01', 'ISLR', 100, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.3.02 Otros Impuestos
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.3.02', 'Otros Impuestos', 100, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.3.03 IGTF
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.3.03', 'IGTF', 100, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.4 Otros Gastos
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.4', 'Otros Gastos', 70, 2, 'DEBITOR', 'EXPENSE', 0, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.4.01 Gastos No Deducibles
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.4.01', 'Gastos No Deducibles', 104, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.4.02 Multas y Sanciones
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.4.02', 'Multas y Sanciones', 104, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);

-- 6.4.03 Donaciones
INSERT INTO ChartOfAccounts (CompanyId, AccountCode, AccountName, ParentAccountId, AccountLevel, Nature, AccountType, IsMovementsRequired, RequiresThirdParty, AllowsManualEntry, Currency, IsActive, CreatedAt, CreatedBy)
VALUES (1, '6.4.03', 'Donaciones', 104, 3, 'DEBITOR', 'EXPENSE', 1, 0, 1, 'VES', 1, GETDATE(), 1);
GO

-- ============================================================
-- 8. TERCEROS DE EJEMPLO
-- ============================================================

-- Cliente ejemplo
INSERT INTO ThirdParties (
    CompanyId,
    ThirdPartyType,
    RIF,
    LegalName,
    CommercialName,
    FiscalAddress,
    Phone,
    Email,
    ContactPerson,
    TaxCategory,
    IsWithholdingAgent,
    IVAApplicable,
    ISLRApplicable,
    IsActive,
    CreatedAt,
    CreatedBy
)
VALUES (
    1,
    'CUSTOMER',
    'J-00000000-1',
    'CLIENTE EJEMPLO C.A.',
    'Cliente Ejemplo',
    'Av. Cliente, Edificio Alfa, Caracas',
    '+58 212 555-0001',
    'cliente@ejemplo.com',
    'Juan Pérez',
    'ORDINARY',
    0,
    1,
    1,
    GETDATE(),
    1
);

-- Proveedor ejemplo
INSERT INTO ThirdParties (
    CompanyId,
    ThirdPartyType,
    RIF,
    LegalName,
    CommercialName,
    FiscalAddress,
    Phone,
    Email,
    ContactPerson,
    TaxCategory,
    IsWithholdingAgent,
    IVAApplicable,
    ISLRApplicable,
    IsActive,
    CreatedAt,
    CreatedBy
)
VALUES (
    1,
    'SUPPLIER',
    'J-00000000-2',
    'PROVEEDOR EJEMPLO C.A.',
    'Proveedor Ejemplo',
    'Av. Proveedor, Edificio Beta, Caracas',
    '+58 212 555-0002',
    'proveedor@ejemplo.com',
    'María García',
    'ORDINARY',
    1,
    1,
    1,
    GETDATE(),
    1
);
GO

PRINT '=== DATOS DE PRUEBA CARGADOS EXITOSAMENTE ===';
PRINT 'Usuario: admin';
PRINT 'Password: Demo123!';
PRINT 'Empresa: Comercial Ejemplo C.A.';
PRINT 'RIF: J-12345678-9';
GO
