import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { query, queryOne } from '@/lib/db/connection';
import type { User, Company, Permission, AuthUser } from '@/lib/types';

// ==================== CONFIGURACIÓN ====================
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'contabilidad-ve-secret-key-change-in-production'
);
const JWT_EXPIRY = '8h';

// ==================== UTILIDADES DE CONTRASEÑA ====================
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ==================== JWT ====================
export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    UserId: user.UserId,
    Username: user.Username,
    Email: user.Email,
    FirstName: user.FirstName,
    LastName: user.LastName,
    CurrentCompanyId: user.CurrentCompanyId,
    CurrentRoleId: user.CurrentRoleId,
    Permissions: user.Permissions,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as AuthUser;
  } catch {
    return null;
  }
}

// ==================== SESIÓN ====================
export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return null;
  }
  
  return verifyToken(token);
}

// ==================== AUTENTICACIÓN ====================
interface DbUser {
  UserId: number;
  Username: string;
  Email: string;
  PasswordHash: string;
  FirstName: string;
  LastName: string;
  IsActive: boolean;
  IsBlocked: boolean;
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; message?: string }> {
  console.log('DEBUG authenticateUser: Received username:', username, 'password length:', password?.length);
  
  // Buscar usuario
  const dbUser = await queryOne<DbUser>(
    `SELECT UserId, Username, Email, PasswordHash, FirstName, LastName, IsActive, IsBlocked 
     FROM Users WHERE Username = @Username OR Email = @Username`,
    { Username: username }
  );
  
  console.log('DEBUG authenticateUser: dbUser:', dbUser);
  
  if (!dbUser) {
    // Usuario no encontrado - mensaje específico
    return { success: false, message: 'Usuario no encontrado' };
  }
  
  if (!dbUser.IsActive) {
    return { success: false, message: 'Usuario inactivo' };
  }
  
  if (dbUser.IsBlocked) {
    return { success: false, message: 'Usuario bloqueado' };
  }
  
  // Verificar contraseña - mensaje específico si la contraseña es incorrecta
  console.log('DEBUG: Attempting password verification');
  console.log('DEBUG: Received password length:', password?.length);
  console.log('DEBUG: Hash from DB length:', dbUser.PasswordHash?.length);
  console.log('DEBUG: Hash from DB:', dbUser.PasswordHash);
  
  // Trim password and hash to handle potential whitespace issues
  const trimmedPassword = password?.trim() || '';
  const trimmedHash = dbUser.PasswordHash?.trim() || '';
  
  const validPassword = await verifyPassword(trimmedPassword, trimmedHash);
  console.log('DEBUG: Password verification result:', validPassword);
  if (!validPassword) {
    // Incrementar intentos fallidos
    await query(
      `UPDATE Users SET FailedLoginAttempts = FailedLoginAttempts + 1 
       WHERE UserId = @UserId`,
      { UserId: dbUser.UserId }
    );
    return { success: false, message: 'Contraseña incorrecta' };
  }
  
  // Obtener empresas del usuario
  const userCompanies = await query<{ CompanyId: number; RoleId: number; IsDefault: boolean }>(
    `SELECT CompanyId, RoleId, IsDefault 
     FROM UserCompanies 
     WHERE UserId = @UserId AND IsActive = 1`,
    { UserId: dbUser.UserId }
  );
  
  if (userCompanies.length === 0) {
    return { success: false, message: 'Usuario sin empresas asignadas' };
  }
  
  // Obtener empresa por defecto o primera disponible
  const defaultCompany = userCompanies.find(c => c.IsDefault) || userCompanies[0];
  
  // Obtener permisos del rol
  const rolePermissions = await query<Permission>(
    `SELECT p.PermissionId, p.Module, p.Action, p.Description, p.IsActive
     FROM Permissions p
     INNER JOIN RolePermissions rp ON p.PermissionId = rp.PermissionId
     WHERE rp.RoleId = @RoleId AND p.IsActive = 1`,
    { RoleId: defaultCompany.RoleId }
  );
  
  // Actualizar último inicio de sesión
  await query(
    `UPDATE Users SET LastLoginAt = GETDATE(), FailedLoginAttempts = 0 WHERE UserId = @UserId`,
    { UserId: dbUser.UserId }
  );
  
  const authUser: AuthUser = {
    UserId: dbUser.UserId,
    Username: dbUser.Username,
    Email: dbUser.Email,
    FirstName: dbUser.FirstName,
    LastName: dbUser.LastName,
    CurrentCompanyId: defaultCompany.CompanyId,
    CurrentRoleId: defaultCompany.RoleId,
    Permissions: rolePermissions.map(p => `${p.Module}:${p.Action}`),
  };
  
  return { success: true, user: authUser };
}

// ==================== AUTORIZACIÓN ====================
export function hasPermission(authUser: AuthUser | null, module: string, action: string): boolean {
  if (!authUser) return false;
  if (authUser.Permissions.includes('*:*')) return true; // Super admin
  return authUser.Permissions.includes(`${module}:${action}`);
}

export function hasAnyPermission(
  authUser: AuthUser | null,
  requiredPermissions: { module: string; action: string }[]
): boolean {
  if (!authUser) return false;
  return requiredPermissions.some(p => hasPermission(authUser, p.module, p.action));
}

export function hasAllPermissions(
  authUser: AuthUser | null,
  requiredPermissions: { module: string; action: string }[]
): boolean {
  if (!authUser) return false;
  return requiredPermissions.every(p => hasPermission(authUser, p.module, p.action));
}

// ==================== CREACIÓN DE USUARIO ====================
export async function createUser(userData: {
  Username: string;
  Email: string;
  Password: string;
  FirstName: string;
  LastName: string;
  Phone?: string;
}): Promise<{ success: boolean; userId?: number; message?: string }> {
  try {
    const passwordHash = await hashPassword(userData.Password);
    
    const result = await query<{ UserId: number }>(
      `INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Phone)
       VALUES (@Username, @Email, @PasswordHash, @FirstName, @LastName, @Phone);
       SELECT SCOPE_IDENTITY() AS UserId;`,
      {
        Username: userData.Username,
        Email: userData.Email,
        PasswordHash: passwordHash,
        FirstName: userData.FirstName,
        LastName: userData.LastName,
        Phone: userData.Phone || null,
      }
    );
    
    return { success: true, userId: result[0].UserId };
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes('unique')) {
      return { success: false, message: 'El usuario o email ya existe' };
    }
    return { success: false, message: 'Error al crear usuario' };
  }
}

// ==================== OBTENER USUARIO ACTUAL ====================
export async function getCurrentUser(userId: number): Promise<User | null> {
  return queryOne<User>(
    `SELECT UserId, Username, Email, FirstName, LastName, Phone, IsActive, IsBlocked,
            Is2FAEnabled, MustChangePassword, LastLoginAt, FailedLoginAttempts, CreatedAt
     FROM Users WHERE UserId = @UserId`,
    { UserId: userId }
  );
}

// ==================== OBTENER EMPRESA ACTUAL ====================
export async function getCurrentCompany(companyId: number): Promise<Company | null> {
  return queryOne<Company>(
    `SELECT * FROM Companies WHERE CompanyId = @CompanyId`,
    { CompanyId: companyId }
  );
}
