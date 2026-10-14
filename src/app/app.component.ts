import { Component } from '@angular/core';
<<<<<<< HEAD
=======
import { Matricula } from './models/matricula.model';
>>>>>>> 527eb82de0f7dc6166a0c8e9b03b46644470d071

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Gestión de Matrículas 2026';
<<<<<<< HEAD
=======
  matriculaConsultada: Matricula | null = null;

  onMatriculaEncontrada(matricula: Matricula | null): void {
    this.matriculaConsultada = matricula;
  }
>>>>>>> 527eb82de0f7dc6166a0c8e9b03b46644470d071
}
