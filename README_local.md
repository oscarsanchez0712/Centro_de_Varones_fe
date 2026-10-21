# Gestión de Matrículas 2026

Aplicación frontend institucional para el proceso de matrícula del **IEP N.° 20874**.

## Objetivo

Permitir a los apoderados registrar la matrícula de un estudiante, adjuntar (simuladamente)
los documentos requeridos, enviar la solicitud, consultar su estado y obtener el
comprobante oficial una vez aprobada — todo dentro de una **única página (SPA)** con
navegación por anclas y scroll suave.

## Tecnologías utilizadas

- **Angular** (basado en NgModules, sin componentes standalone) + **TypeScript**
- **HTML5** / **CSS3**
- **Tailwind CSS** (vía CDN, en `src/index.html`)
- **Angular Reactive Forms** (`ReactiveFormsModule`) para el formulario de 5 pasos
- **HttpClient** para comunicarse con el backend Spring Boot y SQL Server

## Arquitectura

```
Angular  →  servicios HTTP  →  Spring Boot (8085)  →  SQL Server 2022 en Docker
```

Matrículas, consulta de estado y notas se guardan en la base SQL Server mediante la API.

## Estructura del proyecto

```
src/app/
├── core/                      (reservado, existente)
├── features/landing/          (reservado, existente)
├── shared/                    (reservado, existente)
├── pages/inicio/              (reservado, existente)
├── models/
│   └── matricula.model.ts     Interfaces: Estudiante, Apoderado, Documentos, Matricula
├── services/
│   ├── matricula.service.ts   Llamadas HTTP para matrículas
│   ├── cursos.service.ts      Catálogo de cursos por nivel
│   └── notas.service.ts      Llamadas HTTP para notas
├── components/
│   ├── navbar/                Header institucional + menú móvil
│   ├── hero/                  Sección de bienvenida (#inicio)
│   ├── como-funciona/         3 tarjetas explicativas
│   ├── requisitos/            6 tarjetas de requisitos (#requisitos)
│   ├── proceso-matricula/     Formulario reactivo de 5 pasos (#proceso)
│   ├── consulta-estado/       Búsqueda por N.° de solicitud o DNI (#consulta)
│   └── comprobante/           Comprobante oficial imprimible
├── app.component.ts/html/css  Integra todas las secciones en una sola página
├── app.module.ts              Declaraciones e imports (incluye ReactiveFormsModule)
└── app-routing.module.ts      Ruta única (SPA, sin páginas adicionales)
```

## Instalación

```bash
npm install
```

## Ejecución

```bash
npm start
```

## Backend y base de datos

El backend Spring Boot está en `C:\Users\Administrador\Pictures\Centro_de_varones_be` y sigue la estructura de `ASE252S3_T01-be-develop`. Usa SQL Server 2022 en Docker Compose por TCP en `localhost,1433`, además de Swagger y Postman. Sigue su `README.md` para crear `.env`, iniciar SQL Server, ejecutar los scripts SQL y levantar la API en `http://localhost:8085`.

Swagger: `http://localhost:8085/swagger-ui.html`. El API guarda matrículas y notas en SQL Server y ofrece cursos de Primaria y Secundaria.
## Inicio de sesión (demo)
- Administrador: `admin` / `Admin2026`
- Apoderado: `apoderado` / `Padre2026`
