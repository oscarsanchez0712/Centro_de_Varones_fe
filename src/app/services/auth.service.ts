import { Injectable } from '@angular/core';

export interface Sesion {
  usuario: string;
  nombre: string;
  rol: string;
}

interface CredencialDemo extends Sesion {
  clave: string;
}

const CLAVE_SESION = 'sesion_iep_20874';

/**
 * Autenticación demostrativa del lado del cliente.
 * Al no existir backend, las credenciales viven aquí; cuando se conecte una API
 * basta con reemplazar el cuerpo de iniciarSesion() por la llamada HTTP.
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usuarios: CredencialDemo[] = [
    { usuario: 'admin', clave: 'iep20874', nombre: 'Administrador', rol: 'Administrador' },
    { usuario: 'secretaria', clave: 'matricula2026', nombre: 'Secretaría Académica', rol: 'Secretaría' },
  ];

  sesionActual(): Sesion | null {
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

  estaAutenticado(): boolean {
    return this.sesionActual() !== null;
  }

  iniciarSesion(usuario: string, clave: string): boolean {
    const valor = usuario.trim().toLowerCase();
    const encontrado = this.usuarios.find((u) => u.usuario === valor && u.clave === clave);
    if (!encontrado || typeof sessionStorage === 'undefined') {
      return false;
    }
    const { clave: _omitida, ...sesion } = encontrado;
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return true;
  }

  cerrarSesion(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(CLAVE_SESION);
    }
  }
}
