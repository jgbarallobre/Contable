/**
 * Test script for SQL Server connection
 * Run this on your Windows machine where SQL Server is running
 * 
 * Usage: node test-db-local.js
 */

const sql = require('mssql');

// Configuration that works with local SQL Server Express
const config = {
  server: 'localhost\\express',
  database: 'ContabilidadVE',
  user: 'sa',
  password: 'solucionesnetpos2022*',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

async function testConnection() {
  console.log('🔄 Connecting to SQL Server...');
  console.log(`   Server: ${config.server}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}`);
  console.log('');

  try {
    const pool = await sql.connect(config);
    
    // Test query
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('✅ Connected successfully!');
    console.log('');
    console.log('📊 SQL Server Version:');
    console.log(result.recordset[0].version);
    console.log('');

    // Check if ContabilidadVE database exists and has tables
    const tablesResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);
    
    console.log(`📋 Tables found in ContabilidadVE: ${tablesResult.recordset.length}`);
    tablesResult.recordset.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.TABLE_NAME}`);
    });

    await pool.close();
    console.log('');
    console.log('🔌 Connection closed.');
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
