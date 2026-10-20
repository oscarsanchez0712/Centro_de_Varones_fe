import { Component } from '@angular/core';

interface RequisitoInfo { d: string; titulo: string; descripcion: string; }

@Component({
  selector: 'app-requisitos',
  templateUrl: './requisitos.component.html',
  styleUrls: ['./requisitos.component.css'],
})
export class RequisitosComponent {
  listos = new Set<string>();

  requisitos: RequisitoInfo[] = [
    { d: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h6', titulo: 'Partida de nacimiento', descripcion: 'Documento que acredita los datos del estudiante.' },
    { d: 'M3 6h18v12H3z M8 12a2 2 0 1 0 0 .01 M5.5 16c.5-1.5 4.5-1.5 5 0 M14 10h4 M14 14h4', titulo: 'DNI del estudiante', descripcion: 'Documento de identidad del estudiante.' },
    { d: 'M3 6h18v12H3z M8 12a2 2 0 1 0 0 .01 M5.5 16c.5-1.5 4.5-1.5 5 0 M14 10h4 M14 14h4', titulo: 'DNI del apoderado', descripcion: 'Documento del responsable.' },
    { d: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z M4 21V5 M9 7h6', titulo: 'Constancia de estudios', descripcion: 'Documento que acredita los estudios realizados.' },
    { d: 'M4 8h3l2-3h6l2 3h3v11H4z M12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7', titulo: '2 fotos tamaño carné', descripcion: 'Fotografías recientes del estudiante.' },
    { d: 'M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', titulo: 'Ficha única de matrícula', descripcion: 'Ficha necesaria para completar el registro.' },
  ];

  alternar(titulo: string): void {
    this.listos.has(titulo) ? this.listos.delete(titulo) : this.listos.add(titulo);
  }

  get porcentaje(): number {
    return Math.round((this.listos.size / this.requisitos.length) * 100);
  }
}
