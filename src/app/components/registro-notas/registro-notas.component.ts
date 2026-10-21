import { Component } from '@angular/core';
import { Matricula } from '../../models/matricula.model';
import { MatriculaService } from '../../services/matricula.service';
import { CursosService } from '../../services/cursos.service';
import { NotaEstudiante, NotasService } from '../../services/notas.service';

@Component({
  selector: 'app-registro-notas',
  templateUrl: './registro-notas.component.html',
  styleUrls: ['./registro-notas.component.css'],
})
export class RegistroNotasComponent {
  dniEstudiante = '';
  busquedaEstudiante = '';
  curso = '';
  nota: number | null = null;
  nivelSeleccionado = '';
  matriculas: Matricula[] = [];
  registros: NotaEstudiante[] = [];
  cursosActuales: string[] = [];
  mensajeError = '';
  cargando = true;
  registrando = false;

  constructor(
    private matriculaService: MatriculaService,
    private cursosService: CursosService,
    private notasService: NotasService,
  ) {
    this.matriculaService.obtenerMatriculas().subscribe({
      next: (matriculas) => { this.matriculas = matriculas.filter((m) => /primaria|secundaria/i.test(m.estudiante.grado)); this.cargando = false; },
      error: () => { this.mensajeError = 'No se pudieron cargar las matrículas. Comprueba que el backend esté iniciado.'; this.cargando = false; },
    });
    this.recargarNotas();
  }

  private recargarNotas(): void {
    this.notasService.listar().subscribe({
      next: (notas) => { this.registros = notas; },
      error: () => { this.mensajeError = 'No se pudieron cargar las notas del servidor.'; },
    });
  }

  agregarNota(): void {
    const dni = this.dniEstudiante;
    const curso = this.curso;
    const estudiante = this.obtenerMatricula(dni);
    if (!estudiante || !this.cursosActuales.includes(curso) || this.nota === null || this.nota < 0 || this.nota > 20 || this.notaDuplicada) return;
    this.mensajeError = '';
    this.registrando = true;
    this.notasService.registrar({ dni, curso, nota: this.nota }).subscribe({
      next: (registro) => {
        this.registros = [registro, ...this.registros];
        this.dniEstudiante = '';
        this.curso = '';
        this.cursosActuales = [];
        this.nota = null;
        this.registrando = false;
      },
      error: (error) => {
        this.mensajeError = error.status === 409 ? 'Ya existe una nota para ese estudiante y curso.' : 'No se pudo guardar la nota. Revisa la conexión e inténtalo de nuevo.';
        this.registrando = false;
      },
    });
  }

  eliminarNota(id: number): void {
    this.notasService.eliminar(id).subscribe({
      next: () => { this.registros = this.registros.filter((registro) => registro.id !== id); },
      error: () => { this.mensajeError = 'No se pudo eliminar la nota del servidor.'; },
    });
  }

  get niveles(): string[] { return ['Primaria', 'Secundaria']; }

  nivelDeGrado(grado: string): string {
    if (/primaria/i.test(grado)) return 'Primaria';
    if (/secundaria/i.test(grado)) return 'Secundaria';
    return '';
  }

  get matriculasDisponibles(): Matricula[] {
    const termino = this.busquedaEstudiante.trim().toLocaleLowerCase('es');
    return this.matriculas
      .filter((m) => (!this.nivelSeleccionado || this.nivelDeGrado(m.estudiante.grado) === this.nivelSeleccionado) && `${m.estudiante.nombres} ${m.estudiante.apellidos} ${m.estudiante.dni} ${m.estudiante.grado}`.toLocaleLowerCase('es').includes(termino))
      .sort((a, b) => this.nombreEstudiante(a).localeCompare(this.nombreEstudiante(b), 'es'));
  }

  nombreEstudiante(matricula: Matricula): string {
    return `${this.capitalizar(matricula.estudiante.apellidos)}, ${this.capitalizar(matricula.estudiante.nombres)}`;
  }

  private capitalizar(valor: string): string {
    return valor.toLocaleLowerCase('es').replace(/(^|[\s'-])([\p{L}])/gu, (_m, separador: string, letra: string) => separador + letra.toLocaleUpperCase('es'));
  }

  get notasFiltradas(): NotaEstudiante[] {
    return this.registros.filter((registro) => {
      const nivel = this.nivelDeGrado(this.obtenerMatricula(registro.dni)?.estudiante.grado ?? '');
      return !!nivel && (!this.nivelSeleccionado || nivel === this.nivelSeleccionado);
    });
  }

  obtenerMatricula(dni: string): Matricula | undefined { return this.matriculas.find((m) => m.estudiante.dni === dni); }

  cursosDisponibles(_grado: string): string[] { return this.cursosActuales; }

  alCambiarEstudiante(): void {
    this.curso = '';
    this.cursosActuales = [];
    const matricula = this.obtenerMatricula(this.dniEstudiante);
    const nivel = this.nivelDeGrado(matricula?.estudiante.grado ?? '');
    if (!nivel) return;
    this.cursosService.obtenerCursos(nivel).subscribe({
      next: (cursos) => { this.cursosActuales = cursos; },
      error: () => { this.mensajeError = 'No se pudo cargar el catálogo de cursos.'; },
    });
  }

  get notaDuplicada(): boolean {
    return !!this.dniEstudiante && !!this.curso && this.registros.some((r) => r.dni === this.dniEstudiante && r.curso === this.curso);
  }
}
