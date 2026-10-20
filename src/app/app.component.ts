import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Gestión de Matrículas 2026';
  /** El login se muestra a pantalla completa, sin barra de navegación ni pie. */
  mostrarLayout = false;
  anioActual = new Date().getFullYear();

  constructor(router: Router) {
    router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe((evento) => {
        this.mostrarLayout = !evento.urlAfterRedirects.startsWith('/login');
      });
  }
}
