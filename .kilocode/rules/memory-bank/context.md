# Active Context: Sistema Contable Venezuela

## Current State

**Project Status**: ✅ Sistema Contable Venezuela - Multiempresa/Multiusuario

El proyecto es un sistema completo de contabilidad para Venezuela con SQL Server como base de datos.

## Recently Completed

- [x] Fix: React warning - unique key prop en AccountsView list rendering
- [x] Implementar JournalView con API -获取asientos contables, paginación, filtros, aprobar/anular
- [x] Debug de autenticación: Agregar logging y endpoint de prueba para diagnosticar error de contraseña incorrecta
- [x] Fix en mensajes de login para diferenciar usuario vs contraseña incorrecta
- [x] Commit de datos demo y script de password reset
- [x] Base de datos SQL Server con 21 tablas
- [x] Conexión verificada a SQL Server (DESKTOP\EXPRESS)
- [x] Procedimientos almacenados para reportes (9)
- [x] API Routes para autenticación
- [x] API Routes para CRUD de empresas, cuentas, asientos, terceros, períodos
- [x] API Routes para reportes financieros y fiscales
- [x] Frontend dashboard con navegación a todos los módulos
- [x] Sistema de autenticación JWT con bcrypt
- [x] Sistema de permisos RBAC
- [x] Documentación completa (README.md)
- [x] Mejora en mensajes de error de conexión a BD
- [x] Fix en verificación de pool de conexión
- [x] Fix FK cascade cycles en schema.sql (UserCompanies, Roles)

## Current Structure

| Component | Purpose | Status |
|-----------|---------|--------|
| `database/schema.sql` | SQL Server schema con tablas, índices, procedimientos | ✅ |
| `src/lib/db/connection.ts` | Conexión a SQL Server | ✅ |
| `src/lib/auth.ts` | Autenticación JWT + bcrypt | ✅ |
| `src/lib/types.ts` | Tipos TypeScript | ✅ |
| `src/app/api/auth/` | Endpoints de autenticación | ✅ |
| `src/app/api/companies/` | CRUD Empresas | ✅ |
| `src/app/api/accounts/` | Plan de Cuentas | ✅ |
| `src/app/api/journal/` | Asientos Contables | ✅ |
| `src/app/api/third-parties/` | Terceros | ✅ |
| `src/app/api/periods/` | Períodos Contables | ✅ |
| `src/app/api/reports/` | Reportes | ✅ |
| `src/app/page.tsx` | Dashboard Frontend | ✅ |

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | Framework |
| React | 19.x | UI Library |
| TypeScript | 5.9.x | Type Safety |
| SQL Server | 2019+ | Database |
| Tailwind CSS | 4.x | Styling |
| bcryptjs | 3.x | Password Hashing |
| jose | 6.x | JWT Tokens |
| mssql | 11.x | SQL Server Driver |

## Módulos Implementados

### A) Multiempresa (Tenant)
- CRUD completo de Empresas
- Datos: razón social, RIF, dirección fiscal, moneda funcional, configuración IVA/IGTF
- Aislamiento por CompanyId

### B) Seguridad / Multiusuario
- CRUD de Usuarios con hash bcrypt
- Roles y Permisos (RBAC)
- Auditoría de acciones

### C) Plan de Cuentas
- Estructura jerárquica (cuenta padre/hijo)
- Niveles, naturaleza, tipo de cuenta
- Validaciones

### D) Núcleo Contable
- Comprobantes/Asientos contables
- Encabezado y detalle
- Regla: partida doble (sum(debe)=sum(haber))
- Flujo: crear → editar → aprobar → anular
- Períodos contables y cierres
- Terceros: clientes/proveedores

### E) Reportería
- Balance de Comprobación
- Estado de Resultados
- Balance General
- Mayor General
- Diario General
- Libro de Compras IVA
- Libro de Ventas IVA
- Reporte de IGTF

## Quick Start

1. Configurar variables de entorno (.env.local):
   - DB_SERVER=DESKTOP\EXPRESS
   - DB_NAME=ContabilidadVE
   - DB_USER=sa
   - DB_PASSWORD=(tu password)
2. Ejecutar database/schema.sql en SQL Server
3. Instalar dependencias: bun install
4. Iniciar servidor: bun dev

## Pending Improvements

- [ ] Agregar más recipes (auth completo)
- [ ] Tests automatizados
- [ ] 2FA opcional
- [ ] Exportación Excel/PDF

## Session History

| Date | Changes |
|------|---------|
| 2026-02-23 | Fix: React unique key warning in AccountsView list |
| 2026-02-23 | Implementar JournalView con API - fetch entries, pagination, filters, approve/annul actions |
| 2026-02-22 | Debug de autenticación: Agregar logging y endpoint de prueba para diagnosticar error de contraseña |
| 2026-02-22 | Fix en mensajes de login para diferenciar usuario vs contraseña incorrecta |
| 2026-02-20 | Fix mssql import (default import instead of named) and TypeScript errors in journal route |
| 2026-02-20 | Conexión SQL Server verificada exitosamente (DESKTOP\EXPRESS, 21 tablas) |
| 2026-02-18 | Fix FK cascade cycles en schema.sql |
| 2024-02-18 | Sistema Contable Venezuela - Versión inicial completa |
