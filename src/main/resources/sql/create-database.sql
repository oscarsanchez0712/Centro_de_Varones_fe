/*
  Crear la base de datos del sistema.
  Ejecutar conectado al servidor SQL Server (por ejemplo, localhost,1433),
  con la base master seleccionada. Luego ejecutar schema.sql en CentroVarones2026.
*/
IF DB_ID(N'CentroVarones2026') IS NULL
BEGIN
    CREATE DATABASE CentroVarones2026;
END;
GO
