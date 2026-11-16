IF DB_NAME() <> N'CentroVarones2026'
    THROW 50001, 'Selecciona la base CentroVarones2026 antes de ejecutar este archivo.', 1;
GO

IF OBJECT_ID(N'dbo.Auditoria', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Auditoria (
        AuditoriaId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Auditoria PRIMARY KEY,
        Entidad NVARCHAR(40) NOT NULL,
        EntidadId NVARCHAR(80) NOT NULL,
        Accion NVARCHAR(40) NOT NULL,
        DatosAnteriores NVARCHAR(MAX) NOT NULL,
        DatosNuevos NVARCHAR(MAX) NOT NULL,
        Fecha DATETIME2(0) NOT NULL CONSTRAINT DF_Auditoria_Fecha DEFAULT (SYSUTCDATETIME()),
        Revertida BIT NOT NULL CONSTRAINT DF_Auditoria_Revertida DEFAULT (0),
        CONSTRAINT CK_Auditoria_Anterior CHECK (ISJSON(DatosAnteriores) = 1),
        CONSTRAINT CK_Auditoria_Nuevo CHECK (ISJSON(DatosNuevos) = 1)
    );
END;
GO
