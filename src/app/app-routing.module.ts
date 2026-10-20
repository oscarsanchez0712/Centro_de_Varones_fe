import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { EstudiantesCursoComponent } from './components/estudiantes-curso/estudiantes-curso.component';
import { RegistroNotasComponent } from './components/registro-notas/registro-notas.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard, loginGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: '', component: HomePageComponent, canActivate: [authGuard] },
  { path: 'estudiantes', component: EstudiantesCursoComponent, canActivate: [authGuard] },
  { path: 'notas', component: RegistroNotasComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    useHash: true,
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'enabled',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
