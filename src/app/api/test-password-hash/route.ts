import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db/connection';
import bcrypt from 'bcryptjs';

interface DbUser {
  UserId: number;
  Username: string;
  PasswordHash: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, action } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password required' },
        { status: 400 }
      );
    }

    // Action to create or reset user password
    if (action === 'reset' || action === 'create') {
      const passwordHash = await bcrypt.hash(password, 12);
      
      // Check if user exists
      const existingUser = await queryOne<DbUser>(
        `SELECT UserId FROM Users WHERE Username = @Username`,
        { Username: username }
      );

      if (existingUser) {
        // Update existing user
        await query(
          `UPDATE Users SET PasswordHash = @PasswordHash WHERE Username = @Username`,
          { Username: username, PasswordHash: passwordHash }
        );
        return NextResponse.json({
          success: true,
          message: `Password reset for user '${username}'`,
          newHash: passwordHash,
        });
      } else if (action === 'create') {
        // Create new user - need additional fields
        const { email, firstName, lastName } = body;
        if (!email || !firstName || !lastName) {
          return NextResponse.json({
            success: false,
            message: 'For create action, provide: username, password, email, firstName, lastName',
          });
        }
        
        await query(
          `INSERT INTO Users (Username, Email, PasswordHash, FirstName, LastName, IsActive, IsBlocked, CreatedAt)
           VALUES (@Username, @Email, @PasswordHash, @FirstName, @LastName, 1, 0, GETDATE())`,
          { 
            Username: username, 
            Email: email, 
            PasswordHash: passwordHash, 
            FirstName: firstName, 
            LastName: lastName 
          }
        );
        return NextResponse.json({
          success: true,
          message: `User '${username}' created successfully`,
          newHash: passwordHash,
        });
      } else {
        return NextResponse.json({
          success: false,
          message: `User '${username}' not found. Use action='create' with full user details.`,
        });
      }
    }

    // Get user from database
    const dbUser = await queryOne<DbUser>(
      `SELECT UserId, Username, PasswordHash 
       FROM Users WHERE Username = @Username OR Email = @Username`,
      { Username: username }
    );

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: 'User not found', suggestion: 'Run with action=create to create the user' },
        { status: 404 }
      );
    }

    // Return debug info about the hash
    const hashFromDb = (dbUser.PasswordHash || '').toString();
    const passwordStr = (password || '').toString();
    
    const hashInfo = {
      username: dbUser.Username,
      hashFromDb: hashFromDb,
      hashLength: hashFromDb.length,
      hashBytes: Array.from(Buffer.from(hashFromDb)).slice(0, 10), // First 10 bytes for debugging
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
