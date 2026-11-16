/*
  Esquema inicial de CentroVarones2026.
  Ejecutar después de create-database.sql, seleccionando CentroVarones2026.
  Crea las tablas de cursos, matrículas y notas; deja cargado el catálogo académico.
*/
IF DB_NAME() <> N'CentroVarones2026'
    THROW 50001, 'Selecciona la base CentroVarones2026 antes de ejecutar este archivo.', 1;
GO

-- Evita saltos grandes en columnas IDENTITY cuando SQL Server se reinicia.
ALTER DATABASE SCOPED CONFIGURATION SET IDENTITY_CACHE = OFF;
GO

IF OBJECT_ID(N'dbo.Cursos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Cursos (
        CursoId INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Cursos PRIMARY KEY,
        Nombre NVARCHAR(120) NOT NULL,
        Nivel NVARCHAR(20) NOT NULL,
        Activo BIT NOT NULL CONSTRAINT DF_Cursos_Activo DEFAULT (1),
        CONSTRAINT CK_Cursos_Nivel CHECK (Nivel IN (N'Primaria', N'Secundaria')),
        CONSTRAINT UQ_Cursos_Nivel_Nombre UNIQUE (Nivel, Nombre)
    );
END;
GO

IF OBJECT_ID(N'dbo.Matriculas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Matriculas (
        MatriculaId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Matriculas PRIMARY KEY,
        NumeroSolicitud NVARCHAR(30) NOT NULL,
        AnioEscolar SMALLINT NOT NULL,
        DNI CHAR(8) NOT NULL,
        Grado NVARCHAR(60) NOT NULL,
        Estado NVARCHAR(20) NOT NULL,
        DatosJson NVARCHAR(MAX) NOT NULL,
        FechaRegistro DATETIME2(0) NOT NULL CONSTRAINT DF_Matriculas_Fecha DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT UQ_Matriculas_Numero UNIQUE (NumeroSolicitud),
        CONSTRAINT UQ_Matriculas_Anio_DNI UNIQUE (AnioEscolar, DNI),
        CONSTRAINT CK_Matriculas_DNI CHECK (DNI NOT LIKE '%[^0-9]%'),
        CONSTRAINT CK_Matriculas_Estado CHECK (Estado IN (N'EN REVISIÓN', N'APROBADA')),
        CONSTRAINT CK_Matriculas_Json CHECK (ISJSON(DatosJson) = 1)
    );
END;
GO

IF OBJECT_ID(N'dbo.Notas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notas (
        NotaId BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Notas PRIMARY KEY,
        MatriculaId BIGINT NOT NULL,
        CursoId INT NOT NULL,
        Calificacion DECIMAL(4,1) NOT NULL,
        FechaRegistro DATETIME2(0) NOT NULL CONSTRAINT DF_Notas_Fecha DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT CK_Notas_Calificacion CHECK (Calificacion BETWEEN 0 AND 20),
        CONSTRAINT UQ_Notas_Matricula_Curso UNIQUE (MatriculaId, CursoId),
        CONSTRAINT FK_Notas_Matriculas FOREIGN KEY (MatriculaId) REFERENCES dbo.Matriculas(MatriculaId),
        CONSTRAINT FK_Notas_Cursos FOREIGN KEY (CursoId) REFERENCES dbo.Cursos(CursoId)
    );
END;
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

MERGE dbo.Cursos AS destino
USING (VALUES
    (N'Matemática', N'Primaria'),
    (N'Comunicación', N'Primaria'),
    (N'Personal Social', N'Primaria'),
    (N'Ciencia y Tecnología', N'Primaria'),
    (N'Arte y Cultura', N'Primaria'),
    (N'Educación Física', N'Primaria'),
    (N'Educación Religiosa', N'Primaria'),
    (N'Tutoría y Orientación Educativa', N'Primaria'),
    (N'Matemática', N'Secundaria'),
    (N'Comunicación', N'Secundaria'),
    (N'Inglés', N'Secundaria'),
    (N'Ciencias Sociales', N'Secundaria'),
    (N'Desarrollo Personal, Ciudadanía y Cívica', N'Secundaria'),
    (N'Ciencia y Tecnología', N'Secundaria'),
    (N'Educación para el Trabajo', N'Secundaria'),
    (N'Arte y Cultura', N'Secundaria'),
    (N'Educación Física', N'Secundaria'),
    (N'Educación Religiosa', N'Secundaria'),
    (N'Tutoría y Orientación Educativa', N'Secundaria')
) AS fuente(Nombre, Nivel)
ON destino.Nombre = fuente.Nombre AND destino.Nivel = fuente.Nivel
WHEN NOT MATCHED THEN INSERT (Nombre, Nivel) VALUES (fuente.Nombre, fuente.Nivel);
GO
