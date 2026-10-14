import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { HeroComponent } from './components/hero/hero.component';
import { ComoFuncionaComponent } from './components/como-funciona/como-funciona.component';
import { RequisitosComponent } from './components/requisitos/requisitos.component';
import { ProcesoMatriculaComponent } from './components/proceso-matricula/proceso-matricula.component';
import { ConsultaEstadoComponent } from './components/consulta-estado/consulta-estado.component';
import { ComprobanteComponent } from './components/comprobante/comprobante.component';
<<<<<<< HEAD
import { EstudiantesCursoComponent } from './components/estudiantes-curso/estudiantes-curso.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { RegistroNotasComponent } from './components/registro-notas/registro-notas.component';
=======
>>>>>>> 527eb82de0f7dc6166a0c8e9b03b46644470d071

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HeroComponent,
    ComoFuncionaComponent,
    RequisitosComponent,
    ProcesoMatriculaComponent,
    ConsultaEstadoComponent,
    ComprobanteComponent,
<<<<<<< HEAD
    EstudiantesCursoComponent,
    HomePageComponent,
    RegistroNotasComponent,
=======
>>>>>>> 527eb82de0f7dc6166a0c8e9b03b46644470d071
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
