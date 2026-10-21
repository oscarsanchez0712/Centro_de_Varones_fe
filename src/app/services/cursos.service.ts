import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CursosService {
  constructor(private http: HttpClient) {}

  obtenerCursos(nivel: string): Observable<string[]> {
    return this.http.get<string[]>('http://localhost:8085/api/cursos', { params: { nivel } });
  }
}
