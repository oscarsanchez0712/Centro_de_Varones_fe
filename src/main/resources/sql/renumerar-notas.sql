/*
  Reenumera las notas existentes por NotaId, conservando su información.
  En CentroVarones2026, con SQL Server 2017 o posterior.
  No la ejecutes si otra tabla tiene una FK hacia dbo.Notas.NotaId.
*/
IF DB_NAME() <> N'CentroVarones2026'
    THROW 50003, 'Selecciona la base CentroVarones2026 antes de ejecutar este archivo.', 1;
GO

IF EXISTS (
    SELECT 1
    FROM sys.foreign_keys
    WHERE referenced_object_id = OBJECT_ID(N'dbo.Notas')
)
    THROW 50004, 'Hay una clave foránea que referencia dbo.Notas; no se renumeraron los IDs.', 1;
GO

IF OBJECT_ID(N'dbo.Notas_Reenumeradas', N'U') IS NOT NULL
    THROW 50005, 'Ya existe dbo.Notas_Reenumeradas. Revísala antes de volver a ejecutar la migración.', 1;
GO

-- Se ejecuta en autocommit, antes de iniciar la transacción de migración.
ALTER DATABASE SCOPED CONFIGURATION SET IDENTITY_CACHE = OFF;
GO

SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    CREATE TABLE dbo.Notas_Reenumeradas (
        NotaId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Notas_Reenumeradas PRIMARY KEY,
        MatriculaId BIGINT NOT NULL,
        CursoId INT NOT NULL,
        Calificacion DECIMAL(4,1) NOT NULL,
        FechaRegistro DATETIME2(0) NOT NULL CONSTRAINT DF_Notas_Reenumeradas_Fecha DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT CK_Notas_Reenumeradas_Calificacion CHECK (Calificacion BETWEEN 0 AND 20),
        CONSTRAINT UQ_Notas_Reenumeradas_Matricula_Curso UNIQUE (MatriculaId, CursoId),
        CONSTRAINT FK_Notas_Reenumeradas_Matriculas FOREIGN KEY (MatriculaId) REFERENCES dbo.Matriculas(MatriculaId),
        CONSTRAINT FK_Notas_Reenumeradas_Cursos FOREIGN KEY (CursoId) REFERENCES dbo.Cursos(CursoId)
    );

    SET IDENTITY_INSERT dbo.Notas_Reenumeradas ON;

    ;WITH Numeradas AS (
        SELECT ROW_NUMBER() OVER (ORDER BY NotaId) AS NuevoNotaId,
               MatriculaId, CursoId, Calificacion, FechaRegistro
        FROM dbo.Notas
    )
    INSERT INTO dbo.Notas_Reenumeradas (NotaId, MatriculaId, CursoId, Calificacion, FechaRegistro)
    SELECT NuevoNotaId, MatriculaId, CursoId, Calificacion, FechaRegistro
    FROM Numeradas;

    SET IDENTITY_INSERT dbo.Notas_Reenumeradas OFF;

    DROP TABLE dbo.Notas;
    EXEC sys.sp_rename N'dbo.Notas_Reenumeradas', N'Notas';

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF OBJECT_ID(N'dbo.Notas_Reenumeradas', N'U') IS NOT NULL
        SET IDENTITY_INSERT dbo.Notas_Reenumeradas OFF;
    IF XACT_STATE() <> 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
