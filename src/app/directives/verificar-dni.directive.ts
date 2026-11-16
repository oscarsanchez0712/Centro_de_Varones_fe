import { Directive, HostListener, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DniService } from '../services/dni.service';

@Directive({ selector: '[appVerificarDni]' })
export class VerificarDniDirective {
  @Input('appVerificarDni') config: { form: FormGroup; dni: string; nombre: string; apellidos?: string } | null = null;
  private consultado = '';
  private ultimoDni = '';
  private peticion = 0;

  constructor(private dniService: DniService) {}

  @HostListener('input') alIngresar(): void {
    if (!this.config) return;
    const control = this.config.form.get(this.config.dni);
    const dni = String(control?.value || '');
    if (dni !== this.ultimoDni) {
      this.ultimoDni = dni;
      this.consultado = '';
      this.peticion++;
      this.config.form.get(this.config.nombre)?.setValue('', { emitEvent: false });
      if (this.config.apellidos) this.config.form.get(this.config.apellidos)?.setValue('', { emitEvent: false });
    }
    if (!/^\d{8}$/.test(dni) || control?.invalid || dni === this.consultado) return;
    this.consultado = dni;
    const peticion = ++this.peticion;
    this.dniService.consultar(dni).subscribe({
      next: (respuesta) => {
        if (peticion !== this.peticion || !this.config || this.config.form.get(this.config.dni)?.value !== dni) return;
        const nombres = respuesta.nombres?.trim();
        const apellidos = [respuesta.apellidoPaterno, respuesta.apellidoMaterno].filter(Boolean).join(' ').trim();
        if (nombres) this.config.form.get(this.config.nombre)?.setValue(nombres);
        if (apellidos && this.config.apellidos) this.config.form.get(this.config.apellidos)?.setValue(apellidos);
      },
      error: () => { /* La consulta externa es opcional; se permite completar los datos manualmente. */ },
    });
  }
}
