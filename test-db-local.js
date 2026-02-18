// Script de prueba de conexión a SQL Server
// Ejecutar en Windows: node test-db-local.js

const sql = require('mssql');

const config = {
  server: 'localhost\\express',  // o 'desktop\\express' si el equipo se llama desktop
  database: 'ContabilidadVE',
  user: 'sa',
  password: 'solucionesnetpos2022*',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  }
};

async function testConnection() {
  console.log('===========================================');
  console.log('  Prueba de conexión a SQL Server');
  console.log('===========================================');
  console.log();
  console.log('Configuración:');
  console.log('  Servidor:', config.server);
  console.log('  Base de datos:', config.database);
  console.log('  Usuario:', config.user);
  console.log();

  try {
    console.log('Conectando...');
    const pool = await sql.connect(config);
    
    if (pool.connected) {
      console.log();
      console.log('===========================================');
      console.log('  ¡CONEXIÓN EXITOSA!');
      console.log('===========================================');
      console.log();
      
      // Versión de SQL Server
      const result = await pool.query('SELECT @@VERSION AS version');
      console.log('Versión de SQL Server:');
      console.log(result.recordset[0].version);
      console.log();
      
      // Verificar base de datos
      const dbCheck = await pool.query(
        "SELECT name FROM sys.databases WHERE name = 'ContabilidadVE'"
      );
      
      if (dbCheck.recordset.length > 0) {
        console.log('Base de datos "ContabilidadVE": ✓ EXISTE');
        console.log();
        
        // Listar tablas
        const tables = await pool.query(`
          SELECT TABLE_NAME 
          FROM INFORMATION_SCHEMA.TABLES 
          WHERE TABLE_TYPE = 'BASE TABLE'
          ORDER BY TABLE_NAME
        `);
        
        console.log('Tablas en la base de datos:');
        if (tables.recordset.length > 0) {
          tables.recordset.forEach(t => console.log('  - ' + t.TABLE_NAME));
        } else {
          console.log('  (No hay tablas - ejecutar schema.sql)');
        }
      } else {
        console.log('Base de datos "ContabilidadVE": ✗ NO EXISTE');
        console.log('  Ejecutar database/schema.sql para crearla');
      }
      
      await pool.close();
    }
  } catch (error) {
    console.log();
    console.log('===========================================');
    console.log('  ERROR DE CONEXIÓN');
    console.log('===========================================');
    console.log();
    console.log('Mensaje:', error.message);
    console.log();
    
    // Sugerencias
    if (error.message.includes('login failed')) {
      console.log('Sugerencia: Verificar usuario y contraseña');
    } else if (error.message.includes('refused')) {
      console.log('Sugerencia: SQL Server puede no estar ejecutándose');
      console.log('  Iniciar SQL Server en Servicios de Windows');
    } else if (error.message.includes('timeout')) {
      console.log('Sugerencia: Verificar nombre del servidor e instancia');
      console.log('  Intenta: localhost\\express o 127.0.0.1\\express');
    }
  }
}

testConnection();
