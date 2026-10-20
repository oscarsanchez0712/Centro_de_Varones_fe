import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Sesion } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  menuAbierto = false;

  constructor(private auth: AuthService, private router: Router) {}

  get sesion(): Sesion | null {
    return this.auth.sesionActual();
  }

  toggleMenu(): void {
    this.menuAbierto = !this.menuAbierto;
  }

  cerrarMenu(): void {
    this.menuAbierto = false;
  }

  cerrarSesion(): void {
    this.menuAbierto = false;
    this.auth.cerrarSesion();
    this.router.navigateByUrl('/login');
  }
}
