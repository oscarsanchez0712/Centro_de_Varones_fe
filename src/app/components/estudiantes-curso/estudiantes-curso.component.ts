import { Component } from '@angular/core';
import { Matricula } from '../../models/matricula.model';
import { MatriculaService } from '../../services/matricula.service';

@Component({
  selector: 'app-estudiantes-curso',
  templateUrl: './estudiantes-curso.component.html',
  styleUrls: ['./estudiantes-curso.component.css'],
})
export class EstudiantesCursoComponent {
  gradoSeleccionado = '';
  seccionSeleccionada = '';
  estadoSeleccionado = '';
  busqueda = '';
  matriculas: Matricula[] = [];
  errorCarga = '';

  constructor(private matriculaService: MatriculaService) {
    this.matriculaService.obtenerMatriculas().subscribe({
      next: (matriculas) => { this.matriculas = matriculas.filter((m) => /primaria|secundaria/i.test(m.estudiante.grado)).sort((a, b) => a.estudiante.apellidos.localeCompare(b.estudiante.apellidos)); },
      error: () => { this.errorCarga = 'No se pudo cargar el padrón. Comprueba que la API esté iniciada.'; },
    });
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

  get matriculasAprobadas(): number {
    return this.matriculas.filter((m) => m.estado === 'APROBADA').length;
  }

  get matriculasEnRevision(): number {
    return this.matriculas.filter((m) => m.estado === 'EN REVISIÓN').length;
  }

  get estudiantesFiltrados(): Matricula[] {
    const consulta = this.busqueda.trim().toLocaleLowerCase('es');
    return this.matriculas.filter((matricula) => {
      const estudiante = matricula.estudiante;
      const coincideBusqueda = !consulta || [estudiante.nombres, estudiante.apellidos, estudiante.dni, matricula.numeroSolicitud]
        .some((dato) => dato.toLocaleLowerCase('es').includes(consulta));
      const coincideGrado = !this.gradoSeleccionado || estudiante.grado === this.gradoSeleccionado;
      const coincideSeccion = !this.seccionSeleccionada || (estudiante.seccion ?? '') === this.seccionSeleccionada;
      const coincideEstado = !this.estadoSeleccionado || matricula.estado === this.estadoSeleccionado;
      return coincideBusqueda && coincideGrado && coincideSeccion && coincideEstado;
    });
  }

  get secciones(): string[] {
    return [...new Set(this.matriculas.map((m) => m.estudiante.seccion).filter((seccion): seccion is string => !!seccion))]
      .sort((a, b) => a.localeCompare(b));
  }

  get resumenNiveles(): Array<{ nombre: string; sigla: string; total: number; grados: number; aprobados: number; porcentaje: number }> {
    const niveles = [
      { nombre: 'NIVEL PRIMARIA', sigla: 'P', buscar: /primaria/i },
      { nombre: 'NIVEL SECUNDARIA', sigla: 'S', buscar: /secundaria/i },
    ];
    return niveles.map((nivel) => {
      const estudiantes = this.matriculas.filter((m) => nivel.buscar.test(m.estudiante.grado));
      return {
        nombre: nivel.nombre,
        sigla: nivel.sigla,
        total: estudiantes.length,
        grados: new Set(estudiantes.map((m) => m.estudiante.grado)).size,
        aprobados: estudiantes.filter((m) => m.estado === 'APROBADA').length,
        porcentaje: this.matriculas.length ? estudiantes.length / this.matriculas.length * 100 : 0,
      };
    });
  }
}
