import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
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
  exports: [RouterModule]
})
export class AppRoutingModule { }