@echo off
REM Script de prueba de conexion a SQL Server
REM Ejecutar en Windows: node test-db-local.js

echo.
echo ============================================
echo  Probando conexion a SQL Server
echo ============================================
echo.

REM Configuracion - cambia estos valores si es necesario
set DB_SERVER=localhost\express
set DB_NAME=ContabilidadVE
set DB_USER=sa
set DB_PASSWORD=solucionesnetpos2022*

echo Configuracion:
echo    Servidor: %DB_SERVER%
echo    Base de datos: %DB_NAME%
echo    Usuario: %DB_USER%
echo.

echo.
echo Probando...
echo.

node -e "
const sql = require('mssql');

const config = {
  server: '%DB_SERVER%',
  database: '%DB_NAME%',
  user: '%DB_USER%',
  password: '%DB_PASSWORD%',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  }
};

async function test() {
  try {
    const pool = await sql.connect(config);
    console.log('==========================================');
    console.log('   CONEXION EXITOSA!');
    console.log('==========================================');
    console.log();
    
    const result = await pool.query('SELECT @@VERSION AS version');
    console.log('Version de SQL Server:');
    console.log(result.recordset[0].version);
    console.log();
    
    const dbCheck = await pool.query(\"SELECT name FROM sys.databases WHERE name = 'ContabilidadVE'\");
    if (dbCheck.recordset.length > 0) {
      console.log('Base de datos ContabilidadVE: EXISTE');
      console.log();
      
      const tables = await pool.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = ''BASE TABLE'' ORDER BY TABLE_NAME');
      console.log('Tablas:');
      if (tables.recordset.length > 0) {
        tables.recordset.forEach(t => console.log('   - ' + t.TABLE_NAME));
      } else {
        console.log('   (vacio - ejecutar schema.sql)');
      }
    } else {
      console.log('Base de datos ContabilidadVE: NO EXISTE');
      console.log('Ejecutar database/schema.sql para crearla');
    }
    
    await pool.close();
  } catch (err) {
    console.log('==========================================');
    console.log('   ERROR DE CONEXION');
    console.log('==========================================');
    console.log(err.message);
  }
}

test();
"

echo.
pause
