import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { EstudiantesCursoComponent } from './components/estudiantes-curso/estudiantes-curso.component';
import { RegistroNotasComponent } from './components/registro-notas/registro-notas.component';
import { LoginComponent } from './components/login/login.component';
import { ProcesoMatriculaComponent } from './components/proceso-matricula/proceso-matricula.component';
import { ConsultaEstadoComponent } from './components/consulta-estado/consulta-estado.component';
import { RegistroCuentaComponent } from './components/registro-cuenta/registro-cuenta.component';
import { InstitucionComponent } from './components/institucion/institucion.component';
import { adminGuard, authGuard } from './services/auth.service';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroCuentaComponent },
  { path: '', component: HomePageComponent, canActivate: [authGuard] },
  { path: 'colegio', component: InstitucionComponent, canActivate: [authGuard] },
  { path: 'matriculas', component: EstudiantesCursoComponent, canActivate: [authGuard, adminGuard] },
  { path: 'nueva-matricula', component: ProcesoMatriculaComponent, canActivate: [authGuard] },
  { path: 'consulta', component: ConsultaEstadoComponent, canActivate: [authGuard] },
  { path: 'estudiantes', redirectTo: 'matriculas', pathMatch: 'full' },
  { path: 'notas', component: RegistroNotasComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }