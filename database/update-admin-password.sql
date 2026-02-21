-- ============================================================
-- ACTUALIZAR CONTRASEÑA DEL USUARIO ADMIN
-- Ejecutar este script en SQL Server para corregir la contraseña
-- ============================================================

USE ContabilidadVE;
GO

-- Actualizar la contraseña del usuario admin
UPDATE Users 
SET PasswordHash = '$2b$10$/OktFN05aKUpAzqwTiCE8eH4iYz0/sWA0WI6jOr9k1ar86quW.rFO'
WHERE Username = 'admin';
GO

-- Verificar que se actualizó
SELECT Username, Email, IsActive, IsBlocked 
FROM Users 
WHERE Username = 'admin';
GO
