import { Component } from '@angular/core';
import { Matricula } from '../../models/matricula.model';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {
  matriculaConsultada: Matricula | null = null;

  onMatriculaEncontrada(matricula: Matricula | null): void {
    this.matriculaConsultada = matricula;
  }
}
