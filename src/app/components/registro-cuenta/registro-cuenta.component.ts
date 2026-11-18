import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro-cuenta',
  template: `
    <main class="rc">
      <form class="rc-card" (ngSubmit)="registrar()">
        <h1>Crear cuenta de apoderado</h1>
        <p class="rc-sub">Regístrate para consultar el estado de tus solicitudes.</p>

        @if (error) { <p class="rc-error" role="alert">{{ error }}</p> }

        <label>Nombre completo
          <input name="nombre" [(ngModel)]="nombre" type="text" autocomplete="name" placeholder="Ej. Carlos Ramírez">
        </label>
        <label>Usuario
          <input name="usuario" [(ngModel)]="usuario" type="text" autocomplete="username" placeholder="Ej. cramirez">
        </label>
        <label>Contraseña
          <input name="clave" [(ngModel)]="clave" type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres">
        </label>
        <label>Repite la contraseña
          <input name="clave2" [(ngModel)]="clave2" type="password" autocomplete="new-password">
        </label>

        <button type="submit">Crear cuenta y entrar</button>
        <a class="rc-volver" routerLink="/login">Ya tengo cuenta</a>
      </form>
    </main>
  `,
  styles: [`
    :host { display: block; flex: 1 0 auto; background: #f7f7fa; }
    .rc { min-height: 100%; display: grid; place-items: center; padding: 40px 16px; }
    .rc-card { width: min(100%, 420px); display: grid; gap: 14px; padding: 28px; background: #fff; border: 1px solid #e4e3e9; border-radius: 14px; }
    h1 { margin: 0; font-size: 22px; color: #1a1b25; }
    .rc-sub { margin: 0 0 4px; font-size: 14px; color: #565966; }
    label { display: grid; gap: 6px; font-size: 14px; font-weight: 600; color: #34364a; }
    input { padding: 10px 12px; border: 1px solid #d6d5dd; border-radius: 8px; font: inherit; }
    button { padding: 12px; border: 0; border-radius: 8px; background: #a71f2b; color: #fff; font: 700 15px inherit; cursor: pointer; }
    button:hover { background: #861923; }
    .rc-error { margin: 0; padding: 10px 12px; border-radius: 8px; background: #fdecee; color: #b3202a; font-size: 14px; font-weight: 600; }
    .rc-volver { text-align: center; font-size: 14px; color: #a71f2b; }
  `],
})
export class RegistroCuentaComponent {
  nombre = '';
  usuario = '';
  clave = '';
  clave2 = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  registrar(): void {
    if (this.clave !== this.clave2) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    this.error = this.auth.registrar(this.nombre, this.usuario, this.clave);
    if (!this.error) {
      this.router.navigate(['/']);
    }
  }
}