import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotaEstudiante {
  id: number;
  dni: string;
  curso: string;
  nota: number;
}

@Injectable({ providedIn: 'root' })
export class NotasService {
  private readonly api = 'http://localhost:8085/api/notas';
  constructor(private http: HttpClient) {}

  listar(): Observable<NotaEstudiante[]> { return this.http.get<NotaEstudiante[]>(this.api); }
  registrar(datos: Omit<NotaEstudiante, 'id'>): Observable<NotaEstudiante> { return this.http.post<NotaEstudiante>(this.api, datos); }
  eliminar(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/${id}`); }
}
