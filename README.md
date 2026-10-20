# Republica_de_Chile_fe
---

## Acceso al sistema (login)

La aplicación inicia en `/#/login`. Las demás rutas (`/`, `/estudiantes`, `/notas`) están protegidas por `authGuard`.

| Usuario      | Contraseña      | Rol           |
|--------------|-----------------|---------------|
| `admin`      | `iep20874`      | Administrador |
| `secretaria` | `matricula2026` | Secretaría    |

> Autenticación **demostrativa** del lado del cliente (sesión en `sessionStorage`). Al conectar un backend,
> reemplazar el cuerpo de `AuthService.iniciarSesion()` por la llamada a la API.

Archivos nuevos: `services/auth.service.ts`, `guards/auth.guard.ts`, `components/login/*`.
