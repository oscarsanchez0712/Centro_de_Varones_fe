import { Injectable } from '@angular/core';
import { Matricula, crearDocumentosVacios } from '../models/matricula.model';

const CLAVE_STORAGE = 'matriculas_2026';
const CLAVE_CONTADOR = 'matriculas_2026_contador';
const CLAVE_EJEMPLOS_CARGADOS = 'matriculas_2026_ejemplos_cargados';

export const MATRICULAS_EJEMPLO: Array<{ matricula: Matricula; curso: string; nota: number }> = [
  { matricula: crearMatriculaEjemplo('MAT-2026-DEMO-01', 'Ana', 'Torres Rojas', '70000001', '1er Grado Primaria'), curso: 'Comunicación', nota: 17 },
  { matricula: crearMatriculaEjemplo('MAT-2026-DEMO-02', 'Luis', 'Mendoza Pérez', '70000002', '1er Grado Primaria'), curso: 'Matemática', nota: 15 },
  { matricula: crearMatriculaEjemplo('MAT-2026-DEMO-03', 'María', 'Flores Díaz', '70000003', '2do Grado Primaria'), curso: 'Comunicación', nota: 18 },
  { matricula: crearMatriculaEjemplo('MAT-2026-DEMO-04', 'José', 'Castillo León', '70000004', '2do Grado Primaria'), curso: 'Ciencia y Tecnología', nota: 14 },
  { matricula: crearMatriculaEjemplo('MAT-2026-DEMO-05', 'Camila', 'Vargas Ruiz', '70000005', '3er Grado Primaria'), curso: 'Matemática', nota: 19 },
];

function crearMatriculaEjemplo(numeroSolicitud: string, nombres: string, apellidos: string, dni: string, grado: string): Matricula {
  return {
    numeroSolicitud,
    fecha: '10/03/2026',
    estudiante: { nombres, apellidos, dni, fechaNacimiento: '2018-03-10', grado, esNuevo: true },
    apoderado: {
      nombreCompleto: `Apoderado de ${nombres}`,
      dni: `6000000${dni.slice(-1)}`,
      telefono: '900000000',
      correo: 'ejemplo@institucion.edu.pe',
      parentesco: 'Apoderado legal',
      direccion: 'Dato de demostración',
    },
    documentos: crearDocumentosVacios(),
    estado: 'APROBADA',
  };
}

@Injectable({
  providedIn: 'root',
})
export class MatriculaService {
  /**
   * Genera un número de solicitud único con formato MAT-2026-000125
   */
  generarNumeroSolicitud(): string {
    const contadorActual = this.obtenerContador();
    const siguiente = contadorActual + 1;
    this.guardarContador(siguiente);
    const numero = siguiente.toString().padStart(6, '0');
    return `MAT-2026-${numero}`;
  }

  private obtenerContador(): number {
    if (typeof localStorage === 'undefined') {
      return 0;
    }
    const valor = localStorage.getItem(CLAVE_CONTADOR);
    return valor ? parseInt(valor, 10) : 0;
  }

  private guardarContador(valor: number): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(CLAVE_CONTADOR, valor.toString());
  }

  /**
   * Guarda una nueva matrícula en localStorage
   */
  guardarMatricula(matricula: Matricula): void {
    const matriculas = this.obtenerMatriculas();
    matriculas.push(matricula);
    this.persistir(matriculas);
  }

  /**
   * Obtiene todas las matrículas almacenadas
   */
  obtenerMatriculas(): Matricula[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    const datos = localStorage.getItem(CLAVE_STORAGE);
    let matriculas: Matricula[] = [];
    try {
      matriculas = datos ? JSON.parse(datos) as Matricula[] : [];
    } catch {
      matriculas = [];
    }

    if (localStorage.getItem(CLAVE_EJEMPLOS_CARGADOS) !== 'true') {
      const dniRegistrados = new Set(matriculas.map((matricula) => matricula.estudiante.dni));
      const ejemplosNuevos = MATRICULAS_EJEMPLO
        .map((ejemplo) => ejemplo.matricula)
        .filter((matricula) => !dniRegistrados.has(matricula.estudiante.dni));
      matriculas = [...matriculas, ...ejemplosNuevos];
      this.persistir(matriculas);
      localStorage.setItem(CLAVE_EJEMPLOS_CARGADOS, 'true');
    }
    return matriculas;
  }

  /**
   * Busca una matrícula por su número de solicitud
   */
  buscarPorSolicitud(numeroSolicitud: string): Matricula | undefined {
    const valor = numeroSolicitud.trim().toUpperCase();
    return this.obtenerMatriculas().find(
      (m) => m.numeroSolicitud.toUpperCase() === valor
    );
  }

  /**
   * Busca la matrícula más reciente asociada a un DNI de estudiante
   */
  buscarPorDni(dni: string): Matricula | undefined {
    const valor = dni.trim();
    const encontradas = this.obtenerMatriculas().filter(
      (m) => m.estudiante.dni === valor
    );
    return encontradas.length > 0 ? encontradas[encontradas.length - 1] : undefined;
  }

  /**
   * Devuelve una matrícula específica (alias de búsqueda por solicitud)
   */
  obtenerMatricula(numeroSolicitud: string): Matricula | undefined {
    return this.buscarPorSolicitud(numeroSolicitud);
  }

  /**
   * Cambia el estado de una matrícula de "EN REVISIÓN" a "APROBADA"
   */
  aprobarMatricula(numeroSolicitud: string): Matricula | undefined {
    const matriculas = this.obtenerMatriculas();
    const indice = matriculas.findIndex(
      (m) => m.numeroSolicitud === numeroSolicitud
    );
    if (indice === -1) {
      return undefined;
    }
    matriculas[indice].estado = 'APROBADA';
    this.persistir(matriculas);
    return matriculas[indice];
  }

  /**
   * Actualiza los datos de una matrícula existente
   */
  actualizarMatricula(matricula: Matricula): void {
    const matriculas = this.obtenerMatriculas();
    const indice = matriculas.findIndex(
      (m) => m.numeroSolicitud === matricula.numeroSolicitud
    );
    if (indice !== -1) {
      matriculas[indice] = matricula;
      this.persistir(matriculas);
    }
  }

  private persistir(matriculas: Matricula[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(matriculas));
  }
}
