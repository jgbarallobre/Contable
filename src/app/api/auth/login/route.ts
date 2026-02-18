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
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { Success: false, Message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  
  return NextResponse.json({ Success: true });
}
