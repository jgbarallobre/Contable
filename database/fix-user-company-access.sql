-- Script para agregar acceso a empresas existentes
-- Ejecutar en SQL Server Management Studio

-- Ver las empresas existentes
SELECT CompanyId, Code, LegalName FROM Companies;

-- Ver los usuarios existentes  
SELECT UserId, Username FROM Users;

-- Ver las asociaciones actuales usuario-empresa
SELECT * FROM UserCompanies;

-- =====================================================
-- INSTRUCCIONES:
-- 1. Reemplaza @CompanyId con el ID de la empresa que creaste
-- 2. Reemplaza @UserId con tu ID de usuario
-- =====================================================

-- Ejemplo: Agregar acceso del usuario 1 a la empresa 2
-- INSERT INTO UserCompanies (UserId, CompanyId, Role, IsActive, CreatedBy)
-- VALUES (1, 2, 'ADMIN', 1, 1);
