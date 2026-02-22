import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/connection';
import { getSession, hashPassword } from '@/lib/auth';
import bcrypt from 'bcryptjs';

interface User {
  UserId: number;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  Phone: string | null;
  IsActive: boolean;
  IsBlocked: boolean;
  Is2FAEnabled: boolean;
  MustChangePassword: boolean;
  LastLoginAt: string | null;
  FailedLoginAttempts: number;
  CreatedAt: string;
}

// GET - List all users
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
    }

    // Check permission
    if (!session.Permissions.includes('USERS:VIEW') && !session.Permissions.includes('*:*')) {
      return NextResponse.json({ Success: false, Message: 'Sin permiso para ver usuarios' }, { status: 403 });
    }

    const users = await query<User>(
      `SELECT UserId, Username, Email, FirstName, LastName, Phone, IsActive, IsBlocked, 
              Is2FAEnabled, MustChangePassword, LastLoginAt, FailedLoginAttempts, CreatedAt
       FROM Users 
       ORDER BY Username`
    );

    return NextResponse.json({ Success: true, Data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ Success: false, Message: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
    }

    // Check permission
    if (!session.Permissions.includes('USERS:CREATE') && !session.Permissions.includes('*:*')) {
      return NextResponse.json({ Success: false, Message: 'Sin permiso para crear usuarios' }, { status: 403 });
    }

    const body = await request.json();
    const { Username, Email, Password, FirstName, LastName, Phone, IsActive } = body;

    if (!Username || !Email || !Password || !FirstName || !LastName) {
      return NextResponse.json(
        { Success: false, Message: 'Todos los campos requeridos' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(Password);

    const result = await query<{ UserId: number }>(
      `INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, Phone, IsActive, IsBlocked, CreatedAt)
       VALUES (@Username, @Email, @PasswordHash, @FirstName, @LastName, @Phone, @IsActive, 0, GETDATE());
       SELECT SCOPE_IDENTITY() AS UserId;`,
      {
        Username,
        Email,
        PasswordHash: passwordHash,
        FirstName,
        LastName,
        Phone: Phone || null,
        IsActive: IsActive !== false ? 1 : 0,
      }
    );

    return NextResponse.json({
      Success: true,
      Message: 'Usuario creado exitosamente',
      Data: { UserId: result[0]?.UserId }
    });
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    const err = error as Error & { message?: string };
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return NextResponse.json({ Success: false, Message: 'El usuario o email ya existe' }, { status: 400 });
    }
    return NextResponse.json({ Success: false, Message: 'Error al crear usuario' }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
    }

    // Check permission
    if (!session.Permissions.includes('USERS:EDIT') && !session.Permissions.includes('*:*')) {
      return NextResponse.json({ Success: false, Message: 'Sin permiso para editar usuarios' }, { status: 403 });
    }

    const body = await request.json();
    const { UserId, Username, Email, FirstName, LastName, Phone, IsActive, IsBlocked, Password } = body;

    if (!UserId || !Username || !Email || !FirstName || !LastName) {
      return NextResponse.json(
        { Success: false, Message: 'Todos los campos requeridos' },
        { status: 400 }
      );
    }

    // Build update query
    let updateQuery = `UPDATE Users SET Username = @Username, Email = @Email, FirstName = @FirstName, 
                       LastName = @LastName, Phone = @Phone, IsActive = @IsActive, IsBlocked = @IsBlocked`;
    
    const params: Record<string, unknown> = {
      UserId,
      Username,
      Email,
      FirstName,
      LastName,
      Phone: Phone || null,
      IsActive: IsActive ? 1 : 0,
      IsBlocked: IsBlocked ? 1 : 0,
    };

    // If password is provided, update it
    if (Password) {
      const passwordHash = await hashPassword(Password);
      updateQuery += `, PasswordHash = @PasswordHash`;
      params.PasswordHash = passwordHash;
    }

    updateQuery += ` WHERE UserId = @UserId`;

    await query(updateQuery, params);

    return NextResponse.json({ Success: true, Message: 'Usuario actualizado exitosamente' });
  } catch (error: unknown) {
    console.error('Error updating user:', error);
    const err = error as Error & { message?: string };
    if (err.message?.includes('unique') || err.message?.includes('duplicate')) {
      return NextResponse.json({ Success: false, Message: 'El usuario o email ya existe' }, { status: 400 });
    }
    return NextResponse.json({ Success: false, Message: 'Error al actualizar usuario' }, { status: 500 });
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ Success: false, Message: 'No autorizado' }, { status: 401 });
    }

    // Check permission
    if (!session.Permissions.includes('USERS:DELETE') && !session.Permissions.includes('*:*')) {
      return NextResponse.json({ Success: false, Message: 'Sin permiso para eliminar usuarios' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get('id') || '0');

    if (!userId) {
      return NextResponse.json({ Success: false, Message: 'ID de usuario requerido' }, { status: 400 });
    }

    // Prevent deleting yourself
    if (userId === session.UserId) {
      return NextResponse.json({ Success: false, Message: 'No puedes eliminar tu propio usuario' }, { status: 400 });
    }

    await query(`DELETE FROM Users WHERE UserId = @UserId`, { UserId: userId });

    return NextResponse.json({ Success: true, Message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ Success: false, Message: 'Error al eliminar usuario' }, { status: 500 });
  }
}
