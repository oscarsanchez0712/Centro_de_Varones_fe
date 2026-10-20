import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  form: FormGroup;
  error = '';
  cargando = false;
  verClave = false;
  anioActual = new Date().getFullYear();

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      usuario: ['', [Validators.required]],
      clave: ['', [Validators.required, Validators.minLength(4)]],
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  ingresar(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.cargando = true;
    const { usuario, clave } = this.form.value;

    // Pequeña pausa para dar retroalimentación visual (no hay backend).
    setTimeout(() => {
      const correcto = this.auth.iniciarSesion(usuario, clave);
      this.cargando = false;
      if (correcto) {
        this.router.navigateByUrl('/');
      } else {
        this.error = 'Usuario o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.';
        this.form.get('clave')?.reset('');
      }
    }, 600);
  }
}
