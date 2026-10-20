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
  verClave = false;
  cargando = false;
  error = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      usuario: ['', Validators.required],
      clave: ['', [Validators.required, Validators.minLength(4)]],
    });
    if (this.auth.autenticado) {
      this.router.navigate(['/']);
    }
  }

  ingresar(): void {
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.cargando = true;
    setTimeout(() => {
      const { usuario, clave } = this.form.value;
      if (this.auth.iniciarSesion(usuario, clave)) {
        this.router.navigate(['/']);
      } else {
        this.error = 'Usuario o contraseña incorrectos.';
        this.cargando = false;
      }
    }, 450);
  }
}
