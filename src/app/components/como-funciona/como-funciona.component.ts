import { Component } from '@angular/core';

interface PasoInfo { numero: string; d: string; titulo: string; descripcion: string; }

@Component({
  selector: 'app-como-funciona',
  templateUrl: './como-funciona.component.html',
  styleUrls: ['./como-funciona.component.css'],
})
export class ComoFuncionaComponent {
  pasos: PasoInfo[] = [
    { numero: '01', d: 'M9 4h6v3H9z M7 5H5v16h14V5h-2 M9 12h6 M9 16h4', titulo: 'Requisitos', descripcion: 'Revisa los documentos necesarios.' },
    { numero: '02', d: 'M4 20l1-5L16 4l4 4L9 19z M14 6l4 4', titulo: 'Registro', descripcion: 'Completa los datos del estudiante y apoderado.' },
    { numero: '03', d: 'M22 2L11 13 M22 2l-7 20-4-9-9-4z', titulo: 'Envío', descripcion: 'Envía tu solicitud y realiza el seguimiento.' },
  ];
}
