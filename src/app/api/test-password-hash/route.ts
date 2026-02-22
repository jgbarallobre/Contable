import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db/connection';
import bcrypt from 'bcryptjs';

interface DbUser {
  UserId: number;
  Username: string;
  PasswordHash: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password required' },
        { status: 400 }
      );
    }

    // Get user from database
    const dbUser = await queryOne<DbUser>(
      `SELECT UserId, Username, PasswordHash 
       FROM Users WHERE Username = @Username OR Email = @Username`,
      { Username: username }
    );

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Return debug info about the hash
    const hashFromDb = dbUser.PasswordHash || '';
    const passwordStr = password || '';
    
    const hashInfo = {
      username: dbUser.Username,
      hashFromDb: hashFromDb,
      hashLength: hashFromDb.length,
      passwordProvided: passwordStr,
      passwordLength: passwordStr.length,
    };

    // Test bcrypt comparison
    const trimmedPassword = passwordStr.trim();
    const trimmedHash = hashFromDb.trim();
    const matchOriginal = await bcrypt.compare(passwordStr, hashFromDb);
    const matchTrimmed = await bcrypt.compare(trimmedPassword, trimmedHash);

    // Test with the known seed hash
    const seedHash = '$2b$10$/OktFN05aKUpAzqwTiCE8eH4iYz0/sWA0WI6jOr9k1ar86quW.rFO';
    const matchSeedHash = await bcrypt.compare(trimmedPassword, seedHash);

    return NextResponse.json({
      success: true,
      debug: {
        ...hashInfo,
        matchOriginal,
        matchTrimmed,
        matchSeedHash,
        seedHash,
      },
    });
  } catch (error) {
    console.error('Test password hash error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: String(error) },
      { status: 500 }
    );
  }
}
