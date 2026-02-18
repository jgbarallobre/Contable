import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/connection';

export async function GET() {
  try {
    const pool = await getDb();
    
    if (!pool || !pool.connected) {
      return NextResponse.json(
        { success: false, message: 'No se pudo conectar a la base de datos' },
        { status: 500 }
      );
    }

    // Probar una consulta simple
    const result = await pool.query('SELECT @@VERSION AS version');
    
    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa a SQL Server',
      serverVersion: result.recordset[0].version,
      database: process.env.DB_NAME,
      server: process.env.DB_SERVER
    });
  } catch (error) {
    console.error('Error de conexión:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al conectar a la base de datos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
