/* ===== 1. Base de datos ===== */
IF DB_ID('centro_varones') IS NULL
    CREATE DATABASE centro_varones;
GO

USE centro_varones;
GO

/* ===== 2. Tablas ===== */
IF OBJECT_ID('dbo.matriculas', 'U') IS NULL
CREATE TABLE dbo.matriculas (
    numero_solicitud  NVARCHAR(255) NOT NULL PRIMARY KEY,
    fecha             NVARCHAR(255) NULL,
    estado            NVARCHAR(255) NULL,
    -- estudiante
    nombres           NVARCHAR(255) NULL,
    apellidos         NVARCHAR(255) NULL,
    dni               NVARCHAR(255) NULL,
    fecha_nacimiento  NVARCHAR(255) NULL,
    grado             NVARCHAR(255) NULL,
    es_nuevo          BIT NOT NULL DEFAULT 0,
    -- apoderado
    nombre_completo   NVARCHAR(255) NULL,
    apoderado_dni     NVARCHAR(255) NULL,
    telefono          NVARCHAR(255) NULL,
    correo            NVARCHAR(255) NULL,
    parentesco        NVARCHAR(255) NULL,
    direccion         NVARCHAR(255) NULL,
    -- documentos (JSON)
    documentos        NVARCHAR(MAX) NULL
);
GO

IF OBJECT_ID('dbo.notas', 'U') IS NULL
CREATE TABLE dbo.notas (
    id     BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    dni    NVARCHAR(255) NOT NULL,
    curso  NVARCHAR(255) NOT NULL,
    nota   FLOAT NOT NULL
);
GO

/* ===== 3. Datos de ejemplo ===== */
DECLARE @docs NVARCHAR(MAX) = N'{
"partidaNacimiento":{"nombreArchivo":"","tipo":"","adjuntado":false},
"dniEstudiante":{"nombreArchivo":"","tipo":"","adjuntado":false},
"dniApoderado":{"nombreArchivo":"","tipo":"","adjuntado":false},
"constanciaEstudios":{"nombreArchivo":"","tipo":"","adjuntado":false},
"foto":{"nombreArchivo":"","tipo":"","adjuntado":false},
"fichaMatricula":{"nombreArchivo":"","tipo":"","adjuntado":false}}';

INSERT INTO dbo.matriculas
    (numero_solicitud, fecha, estado, nombres, apellidos, dni, fecha_nacimiento, grado, es_nuevo,
     nombre_completo, apoderado_dni, telefono, correo, parentesco, direccion, documentos)
SELECT v.numero_solicitud, N'10/03/2026', N'APROBADA', v.nombres, v.apellidos, v.dni, N'2018-03-10', v.grado, 1,
       N'Apoderado de ' + v.nombres, v.apoderado_dni, N'900000000', N'ejemplo@institucion.edu.pe',
       N'Apoderado legal', N'Dato de demostración', @docs
FROM (VALUES
    (N'MAT-2026-DEMO-01', N'Ana',    N'Torres Rojas',   N'70000001', N'1er Grado Primaria', N'60000001'),
    (N'MAT-2026-DEMO-02', N'Luis',   N'Mendoza Pérez',  N'70000002', N'1er Grado Primaria', N'60000002'),
    (N'MAT-2026-DEMO-03', N'María',  N'Flores Díaz',    N'70000003', N'2do Grado Primaria', N'60000003'),
    (N'MAT-2026-DEMO-04', N'José',   N'Castillo León',  N'70000004', N'2do Grado Primaria', N'60000004'),
    (N'MAT-2026-DEMO-05', N'Camila', N'Vargas Ruiz',    N'70000005', N'3er Grado Primaria', N'60000005')
) AS v(numero_solicitud, nombres, apellidos, dni, grado, apoderado_dni)
WHERE NOT EXISTS (SELECT 1 FROM dbo.matriculas m WHERE m.numero_solicitud = v.numero_solicitud);

IF NOT EXISTS (SELECT 1 FROM dbo.notas)
INSERT INTO dbo.notas (dni, curso, nota) VALUES
    (N'70000001', N'Comunicación',         17),
    (N'70000002', N'Matemática',           15),
    (N'70000003', N'Comunicación',         18),
    (N'70000004', N'Ciencia y Tecnología', 14),
    (N'70000005', N'Matemática',           19);
GO

/* ===== 4. Verificación ===== */
SELECT * FROM dbo.matriculas;
SELECT * FROM dbo.notas;
