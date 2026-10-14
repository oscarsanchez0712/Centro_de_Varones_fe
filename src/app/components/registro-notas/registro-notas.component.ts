import { Component } from '@angular/core';
import { Matricula } from '../../models/matricula.model';
import { MATRICULAS_EJEMPLO, MatriculaService } from '../../services/matricula.service';

interface NotaEstudiante {
  id: number;
  dni: string;
  curso: string;
  nota: number;
}

const CLAVE_NOTAS = 'notas-iep-20874';

@Component({
  selector: 'app-registro-notas',
  templateUrl: './registro-notas.component.html',
})
export class RegistroNotasComponent {
  dniEstudiante = '';
  curso = '';
  nota: number | null = null;
  gradoSeleccionado = '';
  matriculas: Matricula[];
  registros: NotaEstudiante[];

  constructor(private matriculaService: MatriculaService) {
    this.matriculas = this.matriculaService.obtenerMatriculas();
    this.dniEstudiante = MATRICULAS_EJEMPLO[0]?.matricula.estudiante.dni ?? this.matriculas[0]?.estudiante.dni ?? '';
    this.registros = this.cargarRegistros();
  }

  agregarNota(): void {
    const dni = this.dniEstudiante;
    const curso = this.curso.trim();
    if (!this.matriculas.some((matricula) => matricula.estudiante.dni === dni) || !curso || this.nota === null || this.nota < 0 || this.nota > 20) return;

    this.registros = [...this.registros, { id: Date.now(), dni, curso, nota: this.nota }];
    this.guardarRegistros();
    this.dniEstudiante = '';
    this.curso = '';
    this.nota = null;
  }

  eliminarNota(id: number): void {
    this.registros = this.registros.filter((registro) => registro.id !== id);
    this.guardarRegistros();
  }

  get grados(): string[] {
    return [...new Set(this.registros.map((registro) => this.obtenerMatricula(registro.dni)?.estudiante.grado ?? '').filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }

  get notasFiltradas(): NotaEstudiante[] {
    return this.gradoSeleccionado
      ? this.registros.filter((registro) => this.obtenerMatricula(registro.dni)?.estudiante.grado === this.gradoSeleccionado)
      : this.registros;
  }

  obtenerMatricula(dni: string): Matricula | undefined {
    return this.matriculas.find((matricula) => matricula.estudiante.dni === dni);
  }

  private cargarRegistros(): NotaEstudiante[] {
    const ejemplos: NotaEstudiante[] = MATRICULAS_EJEMPLO.map((ejemplo, indice) => ({
      id: indice + 1,
      dni: ejemplo.matricula.estudiante.dni,
      curso: ejemplo.curso,
      nota: ejemplo.nota,
    }));

    if (typeof localStorage === 'undefined') return ejemplos;
    try {
      const guardadas = localStorage.getItem(CLAVE_NOTAS);
      if (guardadas) {
        const datos = JSON.parse(guardadas) as Array<NotaEstudiante & { estudiante?: string; grado?: string }>;
        return datos.map((dato, indice) => {
          if (dato.dni) return dato;
          const matricula = this.matriculas.find((item) => `${item.estudiante.nombres} ${item.estudiante.apellidos}` === dato.estudiante);
          return { id: dato.id ?? indice + 1, dni: matricula?.estudiante.dni ?? '', curso: dato.curso, nota: dato.nota };
        }).filter((dato) => dato.dni);
      }
      localStorage.setItem(CLAVE_NOTAS, JSON.stringify(ejemplos));
      return ejemplos;
    } catch {
      return ejemplos;
    }
  }

  private guardarRegistros(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CLAVE_NOTAS, JSON.stringify(this.registros));
    }
  }
}
