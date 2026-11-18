import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export interface Sesion {
  usuario: string;
  nombre: string;
  rol: string;
}

interface Cuenta {
  usuario: string;
  clave: string;
  nombre: string;
  rol: string;
}

const CLAVE_SESION = 'sesion_matriculas_2026';
const CLAVE_CUENTAS = 'cuentas_registradas_2026';

/** Cuentas de demostración (frontend sin backend). */
const CUENTAS: Cuenta[] = [
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

  get esAdmin(): boolean {
    return this.sesion?.rol === 'Administrador';
  }

  private get cuentasRegistradas(): Cuenta[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    try {
      const datos = localStorage.getItem(CLAVE_CUENTAS);
      return datos ? (JSON.parse(datos) as Cuenta[]) : [];
    } catch {
      return [];
    }
  }

  iniciarSesion(usuario: string, clave: string): boolean {
    const usuarioLimpio = usuario.trim().toLowerCase();
    const cuenta = [...CUENTAS, ...this.cuentasRegistradas].find(
      (c) => c.usuario === usuarioLimpio && c.clave === clave,
    );
    if (!cuenta) {
      return false;
    }
    const sesion: Sesion = { usuario: cuenta.usuario, nombre: cuenta.nombre, rol: cuenta.rol };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return true;
  }

  /** Crea una cuenta de apoderado e inicia sesión. Devuelve el mensaje de error, o '' si salió bien. */
  registrar(nombre: string, usuario: string, clave: string): string {
    const nombreLimpio = nombre.trim().replace(/\s+/g, ' ');
    const usuarioLimpio = usuario.trim().toLowerCase();

    if (nombreLimpio.length < 3) { return 'Escribe tu nombre completo.'; }
    if (!/^[a-z0-9._-]{4,20}$/.test(usuarioLimpio)) {
      return 'El usuario debe tener de 4 a 20 caracteres: letras, números, punto, guion o guion bajo.';
    }
    if (clave.length < 6) { return 'La contraseña debe tener al menos 6 caracteres.'; }

    const existentes = [...CUENTAS, ...this.cuentasRegistradas];
    if (existentes.some((c) => c.usuario === usuarioLimpio)) {
      return 'Ese usuario ya existe. Elige otro.';
    }

    const nuevas: Cuenta[] = [
      ...this.cuentasRegistradas,
      { usuario: usuarioLimpio, clave, nombre: nombreLimpio, rol: 'Apoderado' },
    ];
    try {
      localStorage.setItem(CLAVE_CUENTAS, JSON.stringify(nuevas));
    } catch {
      return 'No se pudo guardar la cuenta en este navegador.';
    }
    this.iniciarSesion(usuarioLimpio, clave);
    return '';
  }

  cerrarSesion(): void {
    sessionStorage.removeItem(CLAVE_SESION);
  }
}

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.autenticado ? true : inject(Router).createUrlTree(['/login']);
};

/** Solo el administrador entra a Matrículas (padrón) y Notas. */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.esAdmin ? true : inject(Router).createUrlTree(['/']);
};