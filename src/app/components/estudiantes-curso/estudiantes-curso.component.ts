import { Component } from '@angular/core';
import { Matricula } from '../../models/matricula.model';
import { MatriculaService } from '../../services/matricula.service';

@Component({
  selector: 'app-estudiantes-curso',
  templateUrl: './estudiantes-curso.component.html',
})
export class EstudiantesCursoComponent {
  gradoSeleccionado = '';
  matriculas: Matricula[];

  constructor(private matriculaService: MatriculaService) {
    this.matriculas = this.matriculaService.obtenerMatriculas()
      .sort((a, b) => a.estudiante.apellidos.localeCompare(b.estudiante.apellidos));
  }

  get grados(): string[] {
    return [...new Set(this.matriculas.map((m) => m.estudiante.grado).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }

  get estudiantes(): Matricula[] {
    return this.gradoSeleccionado
      ? this.matriculas.filter((m) => m.estudiante.grado === this.gradoSeleccionado)
      : this.matriculas;
  }
}
