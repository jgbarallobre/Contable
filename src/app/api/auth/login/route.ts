import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authenticateUser, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { Username, Password } = body;

    if (!Username || !Password) {
      return NextResponse.json(
        { Success: false, Message: 'Usuario y contraseña requeridos' },
        { status: 400 }
      );
    }

    const result = await authenticateUser(Username, Password);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { Success: false, Message: result.message },
        { status: 401 }
      );
    }

    // Crear token JWT
    const token = await createToken(result.user);

    // Configurar cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 horas
      path: '/',
    });

    return NextResponse.json({
      Success: true,
      Data: {
        User: {
          UserId: result.user.UserId,
          Username: result.user.Username,
          Email: result.user.Email,
          FirstName: result.user.FirstName,
          LastName: result.user.LastName,
        },
        Token: token,
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    const err = error as Error & { message?: string };
    // Proporcionar mensaje de error más detallado
    let errorMessage = 'Error interno del servidor';
    
    // Análisis más detallado del error
    const errorStr = String(error);
    if (errorStr.includes('connection') || errorStr.includes('ECONNREFUSED') || errorStr.includes('getaddrinfo')) {
      errorMessage = '❌ No se puede conectar a SQL Server. Verifica que el servidor esté ejecutándose y que DB_SERVER en .env.local sea correcto.';
    } else if (errorStr.includes('login failed') || errorStr.includes('Login failed')) {
      errorMessage = '❌ Error de autenticación en SQL Server. Verifica DB_USER y DB_PASSWORD en .env.local.';
    } else if (errorStr.includes('database') || errorStr.includes('Cannot open database')) {
      errorMessage = '❌ La base de datos no existe o no se puede acceder. Verifica DB_NAME en .env.local y ejecuta database/schema.sql.';
    } else if (err.message?.includes('connection')) {
      errorMessage = 'Error de conexión a la base de datos. Verifica tu archivo .env.local';
    } else if (err.message?.includes('login')) {
      errorMessage = 'Error de autenticación en SQL Server. Verifica el usuario y contraseña';
    } else if (err.message?.includes('database')) {
      errorMessage = 'La base de datos no existe o no se puede acceder';
    }
    
    // Log detallado para debugging
    console.log('Error details:', errorStr);
    return NextResponse.json(
      { Success: false, Message: errorMessage, Debug: process.env.NODE_ENV === 'development' ? errorStr : undefined },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  
  return NextResponse.json({ Success: true });
}
