import { sql } from 'mssql';

// Database configuration - adjust these for your SQL Server instance
const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'ContabilidadVE',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableArithAbort: true,
    connectionTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

/**
 * Get or create a database connection pool
 */
export async function getDb(): Promise<sql.ConnectionPool> {
  if (pool?.connected) {
    return pool;
  }

  try {
    console.log('Attempting database connection with config:', {
      server: dbConfig.server,
      database: dbConfig.database,
      user: dbConfig.user,
      encrypt: dbConfig.options.encrypt,
      trustServerCertificate: dbConfig.options.trustServerCertificate,
    });
    pool = await sql.connect(dbConfig);
    console.log('Connected to SQL Server successfully');
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to connect to database: ${errMsg}`);
  }
}

/**
 * Execute a query with parameters
 */
export async function query<T>(sqlText: string, params?: Record<string, unknown>): Promise<T[]> {
  const pool = await getDb();
  const request = pool.request();
  
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }
  
  const result = await request.query(sqlText);
  return result.recordset as T[];
}

/**
 * Execute a query that returns a single row
 */
export async function queryOne<T>(sqlText: string, params?: Record<string, unknown>): Promise<T | null> {
  const rows = await query<T>(sqlText, params);
  return rows[0] || null;
}

/**
 * Execute a stored procedure
 */
export async function executeProcedure<T>(
  procedureName: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const pool = await getDb();
  const request = pool.request();
  
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }
  
  const result = await request.execute(procedureName);
  return result.recordset as T[];
}

/**
 * Execute a transaction
 */
export async function withTransaction<T>(
  callback: (transaction: sql.Transaction) => Promise<T>
): Promise<T> {
  const pool = await getDb();
  const transaction = pool.transaction();
  
  try {
    await transaction.begin();
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Close the database connection
 */
export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}

// SQL types for reference
export const SQL_TYPES = {
  INT: sql.Int,
  VARCHAR: sql.VarChar,
  NVARCHAR: sql.NVarChar,
  DECIMAL: sql.Decimal,
  DATETIME2: sql.DateTime2,
  DATE: sql.Date,
  BIT: sql.Bit,
  BIGINT: sql.BigInt,
  TEXT: sql.Text,
  JSON: sql.NVarChar(sql.MAX),
};
