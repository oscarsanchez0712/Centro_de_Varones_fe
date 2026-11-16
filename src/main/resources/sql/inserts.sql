/*
  Datos de demostración sintéticos para matrículas y notas.
  Ejecutar DESPUÉS de schema.sql, dentro de CentroVarones2026.
  Incluye 11 estudiantes (1 por grado de Primaria/Secundaria) y 22 notas.
  Nombres, DNI, teléfonos, direcciones y correos son ficticios de prueba.
  El script es repetible: no duplica las solicitudes ni las notas de demostración.
*/
IF DB_NAME() <> N'CentroVarones2026'
    THROW 50002, 'Selecciona la base CentroVarones2026 antes de ejecutar este archivo.', 1;
GO

DECLARE @Demo TABLE (
    NumeroSolicitud NVARCHAR(30) NOT NULL,
    AnioEscolar SMALLINT NOT NULL,
    DNI CHAR(8) NOT NULL,
    Nombres NVARCHAR(80) NOT NULL,
    Apellidos NVARCHAR(100) NOT NULL,
    FechaNacimiento DATE NOT NULL,
    Grado NVARCHAR(60) NOT NULL,
    Seccion CHAR(1) NOT NULL,
    EsNuevo BIT NOT NULL,
    NombreApoderado NVARCHAR(150) NOT NULL,
    DNIapoderado CHAR(8) NOT NULL,
    Telefono NVARCHAR(9) NOT NULL,
    Correo NVARCHAR(150) NOT NULL,
    Parentesco NVARCHAR(30) NOT NULL,
    Direccion NVARCHAR(180) NOT NULL,
    Estado NVARCHAR(20) NOT NULL
);

INSERT INTO @Demo VALUES
(N'MAT-2026-TEST-0001',2026,'70910001',N'Ana Lucía',N'Torres Rojas','2019-10-14',N'1er Grado Primaria','A',1,N'Rosa Elena Rojas Paredes','40810001','987610001','rosa.rojas@example.test',N'Madre',N'Jr. Los Laureles 120, San Vicente de Cañete',N'EN REVISIÓN'),
(N'MAT-2026-TEST-0002',2026,'70910002',N'Luis Alberto',N'Mendoza Pérez','2018-09-21',N'2do Grado Primaria','B',0,N'Carlos Mendoza Salas','40810002','987610002','carlos.mendoza@example.test',N'Padre',N'Av. Mariscal Benavides 245, San Vicente de Cañete',N'APROBADA'),
(N'MAT-2026-TEST-0003',2026,'70910003',N'María Fernanda',N'Flores Díaz','2017-12-11',N'3er Grado Primaria','A',1,N'Patricia Díaz León','40810003','987610003','patricia.diaz@example.test',N'Madre',N'Calle Bolognesi 318, Imperial',N'EN REVISIÓN'),
(N'MAT-2026-TEST-0004',2026,'70910004',N'José Miguel',N'Castillo León','2016-08-07',N'4to Grado Primaria','C',0,N'Elena León Vargas','40810004','987610004','elena.leon@example.test',N'Madre',N'Jr. Sucre 410, San Vicente de Cañete',N'APROBADA'),
(N'MAT-2026-TEST-0005',2026,'70910005',N'Camila Andrea',N'Vargas Ruiz','2015-11-30',N'5to Grado Primaria','B',1,N'Marco Vargas Rivas','40810005','987610005','marco.vargas@example.test',N'Padre',N'Av. Dos de Mayo 155, Nuevo Imperial',N'EN REVISIÓN'),
(N'MAT-2026-TEST-0006',2026,'70910006',N'Diego Alejandro',N'Salazar Ponce','2014-07-22',N'6to Grado Primaria','A',0,N'Julia Ponce Ríos','40810006','987610006','julia.ponce@example.test',N'Madre',N'Pasaje Las Flores 82, San Vicente de Cañete',N'APROBADA'),
(N'MAT-2026-TEST-0007',2026,'70910007',N'Valeria Sofía',N'Cárdenas Luna','2013-06-18',N'1er Grado Secundaria','C',1,N'Jorge Cárdenas Soto','40810007','987610007','jorge.cardenas@example.test',N'Padre',N'Jr. Grau 509, Imperial',N'EN REVISIÓN'),
(N'MAT-2026-TEST-0008',2026,'70910008',N'Mateo Nicolás',N'Huamán Silva','2012-12-09',N'2do Grado Secundaria','B',0,N'Andrea Silva Campos','40810008','987610008','andrea.silva@example.test',N'Madre',N'Av. Libertadores 227, San Vicente de Cañete',N'APROBADA'),
(N'MAT-2026-TEST-0009',2026,'70910009',N'Daniela Isabel',N'Quispe Ramos','2011-09-02',N'3er Grado Secundaria','A',1,N'Fernando Quispe Huerta','40810009','987610009','fernando.quispe@example.test',N'Padre',N'Calle Santa Rosa 601, Cerro Azul',N'EN REVISIÓN'),
(N'MAT-2026-TEST-0010',2026,'70910010',N'Sebastián Gabriel',N'Navarro Campos','2010-10-14',N'4to Grado Secundaria','C',0,N'Lucía Campos Medina','40810010','987610010','lucia.campos@example.test',N'Madre',N'Jr. San Martín 140, San Vicente de Cañete',N'APROBADA'),
(N'MAT-2026-TEST-0011',2026,'70910011',N'Luciana Belén',N'Salazar Mena','2009-12-12',N'5to Grado Secundaria','B',1,N'Óscar Salazar Torres','40810011','987610011','oscar.salazar@example.test',N'Padre',N'Av. Circunvalación 390, Imperial',N'EN REVISIÓN');

;WITH Nuevas AS (
    SELECT d.*,
        CONVERT(VARCHAR(10), GETDATE(), 103) AS FechaTexto,
        (
            SELECT CONVERT(VARCHAR(10), GETDATE(), 103) AS fecha,
                   CONVERT(VARCHAR(10), GETDATE(), 103) AS fechaRegistro,
                   JSON_QUERY((SELECT d.Nombres AS nombres, d.Apellidos AS apellidos,
                                      d.DNI AS dni, CONVERT(VARCHAR(10),d.FechaNacimiento,23) AS fechaNacimiento,
                                      d.Grado AS grado, d.Seccion AS seccion, d.EsNuevo AS esNuevo
                               FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)) AS estudiante,
                   JSON_QUERY((SELECT d.NombreApoderado AS nombreCompleto, d.DNIapoderado AS dni,
                                      d.Telefono AS telefono, d.Correo AS correo,
                                      d.Parentesco AS parentesco, d.Direccion AS direccion
                               FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)) AS apoderado,
                   JSON_QUERY(N'{"partidaNacimiento":{"nombreArchivo":"","tipo":"","adjuntado":false},"dniEstudiante":{"nombreArchivo":"","tipo":"","adjuntado":false},"dniApoderado":{"nombreArchivo":"","tipo":"","adjuntado":false},"constanciaEstudios":{"nombreArchivo":"","tipo":"","adjuntado":false},"foto":{"nombreArchivo":"","tipo":"","adjuntado":false},"fichaMatricula":{"nombreArchivo":"","tipo":"","adjuntado":false}}') AS documentos,
                   d.Estado AS estado
            FOR JSON PATH, WITHOUT_ARRAY_WRAPPER
        ) AS DatosJson
    FROM @Demo d
)
MERGE dbo.Matriculas AS destino
USING Nuevas AS fuente
ON destino.NumeroSolicitud=fuente.NumeroSolicitud
WHEN MATCHED THEN UPDATE SET
    destino.AnioEscolar=fuente.AnioEscolar,
    destino.DNI=fuente.DNI,
    destino.Grado=fuente.Grado,
    destino.Estado=fuente.Estado,
    destino.DatosJson=fuente.DatosJson
WHEN NOT MATCHED THEN INSERT (NumeroSolicitud, AnioEscolar, DNI, Grado, Estado, DatosJson)
    VALUES (fuente.NumeroSolicitud, fuente.AnioEscolar, fuente.DNI, fuente.Grado, fuente.Estado, fuente.DatosJson);

DECLARE @DemoNotas TABLE (DNI CHAR(8), Curso NVARCHAR(120), Calificacion DECIMAL(4,1));
INSERT INTO @DemoNotas VALUES
('70910001',N'Matemática',16),('70910001',N'Comunicación',17),
('70910002',N'Matemática',15),('70910002',N'Personal Social',18),
('70910003',N'Comunicación',17),('70910003',N'Ciencia y Tecnología',16),
('70910004',N'Matemática',18),('70910004',N'Arte y Cultura',19),
('70910005',N'Comunicación',16),('70910005',N'Educación Física',18),
('70910006',N'Ciencia y Tecnología',17),('70910006',N'Tutoría y Orientación Educativa',18),
('70910007',N'Matemática',15),('70910007',N'Inglés',17),
('70910008',N'Comunicación',18),('70910008',N'Ciencias Sociales',16),
('70910009',N'Desarrollo Personal, Ciudadanía y Cívica',17),('70910009',N'Inglés',16),
('70910010',N'Ciencia y Tecnología',18),('70910010',N'Educación para el Trabajo',19),
('70910011',N'Matemática',17),('70910011',N'Tutoría y Orientación Educativa',18);

INSERT INTO dbo.Notas (MatriculaId, CursoId, Calificacion)
SELECT m.MatriculaId, c.CursoId, n.Calificacion
FROM @DemoNotas n
JOIN dbo.Matriculas m ON m.DNI=n.DNI AND m.AnioEscolar=2026
JOIN dbo.Cursos c ON c.Nombre=n.Curso
    AND c.Nivel=CASE WHEN m.Grado LIKE N'%Primaria%' THEN N'Primaria' ELSE N'Secundaria' END
WHERE NOT EXISTS (SELECT 1 FROM dbo.Notas x WHERE x.MatriculaId=m.MatriculaId AND x.CursoId=c.CursoId);
GO
