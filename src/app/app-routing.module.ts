import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
<<<<<<< HEAD
import { HomePageComponent } from './components/home-page/home-page.component';
import { EstudiantesCursoComponent } from './components/estudiantes-curso/estudiantes-curso.component';
import { RegistroNotasComponent } from './components/registro-notas/registro-notas.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'estudiantes', component: EstudiantesCursoComponent },
  { path: 'notas', component: RegistroNotasComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, anchorScrolling: 'enabled' })],
=======

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
>>>>>>> 527eb82de0f7dc6166a0c8e9b03b46644470d071
  exports: [RouterModule]
})
export class AppRoutingModule { }
