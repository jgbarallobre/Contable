import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/connection';

export async function GET() {
  try {
    // Test database connection
    const pool = await getDb();
    
    // Get SQL Server version
    const versionResult = await pool.request().query('SELECT @@VERSION as version');
    
    // Get database name
    const dbNameResult = await pool.request().query('SELECT DB_NAME() as databaseName');
    
    // Get tables count
    const tablesResult = await pool.request().query(`
      SELECT COUNT(*) as tableCount 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      info: {
        version: versionResult.recordset[0].version.split('\n')[0],
        database: dbNameResult.recordset[0].databaseName,
        tables: tablesResult.recordset[0].tableCount,
      },
      env: {
        server: process.env.DB_SERVER || 'not set',
        database: process.env.DB_NAME || 'not set',
        user: process.env.DB_USER || 'not set',
        encrypt: process.env.DB_ENCRYPT || 'not set',
        trustCert: process.env.DB_TRUST_CERT || 'not set',
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      env: {
        server: process.env.DB_SERVER || 'not set',
        database: process.env.DB_NAME || 'not set',
        user: process.env.DB_USER || 'not set',
        encrypt: process.env.DB_ENCRYPT || 'not set',
        trustCert: process.env.DB_TRUST_CERT || 'not set',
      },
    }, { status: 500 });
  }
}
