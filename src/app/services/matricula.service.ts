import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Matricula } from '../models/matricula.model';

const API = 'http://localhost:8085/api/matriculas';

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  constructor(private http: HttpClient) {}

  guardarMatricula(matricula: Matricula): Observable<Matricula> {
    const body = {
      estudiante: matricula.estudiante,
      apoderado: matricula.apoderado,
      documentos: matricula.documentos,
    };
    return this.http.post<Matricula>(API, body);
  }

  obtenerMatriculas(): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(API);
  }

  buscarPorSolicitud(numeroSolicitud: string): Observable<Matricula> {
    return this.http.get<Matricula>(`${API}/solicitud/${encodeURIComponent(numeroSolicitud.trim())}`);
  }

  buscarPorDni(dni: string): Observable<Matricula> {
    return this.http.get<Matricula>(`${API}/dni/${encodeURIComponent(dni.trim())}`);
  }

  aprobarMatricula(numeroSolicitud: string): Observable<Matricula> {
    return this.http.patch<Matricula>(`${API}/${encodeURIComponent(numeroSolicitud)}/estado`, { estado: 'APROBADA' });
  }
}
