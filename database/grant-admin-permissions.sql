-- ============================================================
-- GRANT ADMIN PERMISSIONS TO ADMIN USER
-- Sistema Contable Venezuela
-- ============================================================

USE ContabilidadVE;
GO

-- Actualizar el rol del usuario admin de CONTADOR (2) a ADMIN (1)
UPDATE UserCompanies 
SET RoleId = 1, UpdatedBy = 1
WHERE UserId = 1 AND CompanyId = 1;
GO

-- Verificar el cambio
SELECT 
    uc.UserCompanyId,
    u.Username,
    u.FirstName,
    u.LastName,
    c.LegalName AS CompanyName,
    r.Name AS RoleName,
    r.IsSystem AS IsSystemRole,
    uc.IsDefault,
    uc.IsActive
FROM UserCompanies uc
INNER JOIN Users u ON uc.UserId = u.UserId
INNER JOIN Companies c ON uc.CompanyId = c.CompanyId
INNER JOIN Roles r ON uc.RoleId = r.RoleId
WHERE u.UserId = 1;
GO

PRINT 'El usuario admin ahora tiene el rol de ADMINISTRADOR del Sistema';
GO
