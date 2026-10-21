import { Component } from '@angular/core';
import { Matricula } from '../../models/matricula.model';
import { AuthService } from '../../services/auth.service';
import { MatriculaService } from '../../services/matricula.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent {
  matriculaConsultada: Matricula | null = null;
  matriculas: Matricula[] = [];
  errorCarga = '';

  constructor(public auth: AuthService, matriculaService: MatriculaService) {
    matriculaService.obtenerMatriculas().subscribe({
      next: (matriculas) => { this.matriculas = matriculas.filter((m) => /primaria|secundaria/i.test(m.estudiante.grado)); },
      error: () => { this.errorCarga = 'No se pudo conectar con el servicio de matrículas.'; },
    });
  }

  get totalMatriculas(): number { return this.matriculas.length; }
  get matriculasAprobadas(): number { return this.matriculas.filter((m) => m.estado === 'APROBADA').length; }
  get matriculasEnRevision(): number { return this.matriculas.filter((m) => m.estado === 'EN REVISIÓN').length; }
  get porcentajeAprobadas(): number {
    return this.totalMatriculas ? Math.round(this.matriculasAprobadas / this.totalMatriculas * 100) : 0;
  }

  onMatriculaEncontrada(matricula: Matricula | null): void {
    this.matriculaConsultada = matricula;
  }
}
