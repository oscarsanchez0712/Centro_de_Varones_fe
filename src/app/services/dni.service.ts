import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface RespuestaDni {
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
}

// El backend guarda la credencial; la app solo llama a la API local.
const BASE_URL = 'http://localhost:8085/api/dni';

@Injectable({ providedIn: 'root' })
export class DniService {
  constructor(private http: HttpClient) {}

  consultar(dni: string): Observable<RespuestaDni> {
    return this.http.get<RespuestaDni>(`${BASE_URL}/${encodeURIComponent(dni)}`);
  }
}
