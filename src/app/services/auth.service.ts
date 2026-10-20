import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export interface Sesion {
  usuario: string;
  nombre: string;
  rol: string;
}

const CLAVE_SESION = 'sesion_matriculas_2026';

/** Cuentas de demostración (frontend sin backend). */
const CUENTAS = [
  { usuario: 'admin', clave: 'Admin2026', nombre: 'Administración', rol: 'Administrador' },
  { usuario: 'apoderado', clave: 'Padre2026', nombre: 'Apoderado', rol: 'Apoderado' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  get sesion(): Sesion | null {
    if (typeof sessionStorage === 'undefined') {
      return null;
    }
    try {
      const datos = sessionStorage.getItem(CLAVE_SESION);
      return datos ? (JSON.parse(datos) as Sesion) : null;
    } catch {
      return null;
    }
  }

  get autenticado(): boolean {
    return this.sesion !== null;
  }

  iniciarSesion(usuario: string, clave: string): boolean {
    const cuenta = CUENTAS.find((c) => c.usuario === usuario.trim().toLowerCase() && c.clave === clave);
    if (!cuenta) {
      return false;
    }
    const sesion: Sesion = { usuario: cuenta.usuario, nombre: cuenta.nombre, rol: cuenta.rol };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return true;
  }

  cerrarSesion(): void {
    sessionStorage.removeItem(CLAVE_SESION);
  }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.autenticado ? true : inject(Router).createUrlTree(['/login']);
};
