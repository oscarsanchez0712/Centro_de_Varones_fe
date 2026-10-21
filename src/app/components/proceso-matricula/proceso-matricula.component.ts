import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatriculaService } from '../../services/matricula.service';
import { Documentos, Matricula, crearDocumentosVacios } from '../../models/matricula.model';

const EXTENSIONES = ['pdf', 'jpg', 'jpeg', 'png'];
const MAX_MB = 5;
const L = 'A-Za-zÁÉÍÓÚáéíóúÑñÜü';
const PATRON_NOMBRE = new RegExp(`^[${L}]+(?:[ '-][${L}]+)*$`);
const CLAVE_BORRADOR = 'borrador_matricula_2026';

type ClaveDocumento = keyof Documentos;
interface DocumentoCampo { clave: ClaveDocumento; nombre: string; descripcion: string; }
interface Campo { key: string; label: string; tipo: 'texto' | 'numero' | 'date' | 'select' | 'email'; max?: number; auto?: string; ayuda?: string; ancho?: boolean; opciones?: { v: string; t: string }[]; }

function dniRepetido(c: AbstractControl): ValidationErrors | null {
  return /^(\d)\1{7}$/.test(c.value || '') ? { repetido: true } : null;
}

function fechaNacimiento(c: AbstractControl): ValidationErrors | null {
  if (!c.value) { return null; }
  const f = new Date(c.value);
  const hoy = new Date();
  if (isNaN(+f) || f > hoy) { return { futura: true }; }
  const edad = edadAlCorte(c.value, 2026);
  return edad < 6 || edad > 18 ? { rango: true } : null;
}

function edadAlCorte(fecha: string, anio: number): number {
  const nacimiento = new Date(`${fecha}T00:00:00`);
  const corte = new Date(anio, 2, 31);
  let edad = corte.getFullYear() - nacimiento.getFullYear();
  if (corte.getMonth() < nacimiento.getMonth() ||
    (corte.getMonth() === nacimiento.getMonth() && corte.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

@Component({
  selector: 'app-proceso-matricula',
  templateUrl: './proceso-matricula.component.html',
  styleUrls: ['./proceso-matricula.component.css'],
})
export class ProcesoMatriculaComponent {
  pasoActual = 1;
  totalPasos = 5;
  etiquetas = ['Estudiante', 'Apoderado', 'Documentos', 'Revisión', 'Envío'];
  hoy = new Date().toISOString().slice(0, 10);

  grados = [
    '1er Grado Primaria', '2do Grado Primaria', '3er Grado Primaria',
    '4to Grado Primaria', '5to Grado Primaria', '6to Grado Primaria',
    '1er Grado Secundaria', '2do Grado Secundaria', '3er Grado Secundaria',
    '4to Grado Secundaria', '5to Grado Secundaria',
  ];
  secciones = ['A', 'B', 'C'];
  parentescos = ['Padre', 'Madre', 'Apoderado legal', 'Abuelo/a', 'Otro'];

  camposEstudiante: Campo[] = [
    { key: 'nombres', label: 'Nombres', tipo: 'texto', auto: 'given-name', ayuda: 'Solo letras. Ej. María José' },
    { key: 'apellidos', label: 'Apellidos', tipo: 'texto', auto: 'family-name', ayuda: 'Paterno y materno' },
    { key: 'dni', label: 'DNI', tipo: 'numero', max: 8, ayuda: '8 dígitos' },
    { key: 'fechaNacimiento', label: 'Fecha de nacimiento', tipo: 'date', ayuda: 'El grado sugerido se calcula al 31 de marzo de 2026.' },
    { key: 'grado', label: 'Grado asignado automáticamente', tipo: 'texto', ayuda: 'Se calcula según la fecha de nacimiento y la edad al 31 de marzo de 2026.' },
    { key: 'seccion', label: 'Sección', tipo: 'select', opciones: this.secciones.map((s) => ({ v: s, t: `Sección ${s}` })) },
    { key: 'esNuevo', label: '¿Es nuevo en la institución?', tipo: 'select', opciones: [{ v: 'si', t: 'Sí' }, { v: 'no', t: 'No' }] },
  ];
  camposApoderado: Campo[] = [
    { key: 'nombreCompleto', label: 'Nombre completo', tipo: 'texto', auto: 'name', ancho: true, ayuda: 'Nombres y apellidos' },
    { key: 'dni', label: 'DNI', tipo: 'numero', max: 8, ayuda: '8 dígitos' },
    { key: 'telefono', label: 'Teléfono', tipo: 'numero', max: 9, ayuda: 'Empieza con 9' },
    { key: 'correo', label: 'Correo', tipo: 'email', ayuda: 'nombre@correo.com' },
    { key: 'parentesco', label: 'Parentesco', tipo: 'select', opciones: this.parentescos.map((p) => ({ v: p, t: p })) },
    { key: 'direccion', label: 'Dirección', tipo: 'texto', ancho: true, ayuda: 'Calle, número y distrito' },
  ];

  documentosCampos: DocumentoCampo[] = [
    { clave: 'partidaNacimiento', nombre: 'Partida de nacimiento', descripcion: 'Documento que acredita los datos del estudiante.' },
    { clave: 'dniEstudiante', nombre: 'DNI del estudiante', descripcion: 'Documento de identidad del estudiante.' },
    { clave: 'dniApoderado', nombre: 'DNI del apoderado', descripcion: 'Documento del responsable.' },
    { clave: 'constanciaEstudios', nombre: 'Constancia de estudios', descripcion: 'Documento que acredita los estudios realizados.' },
    { clave: 'foto', nombre: 'Foto tamaño carné', descripcion: 'Fotografía reciente del estudiante.' },
    { clave: 'fichaMatricula', nombre: 'Ficha de matrícula', descripcion: 'Ficha necesaria para completar el registro.' },
  ];

  documentos: Documentos = crearDocumentosVacios();
  erroresDocumentos: Partial<Record<ClaveDocumento, string>> = {};
  vistas: Partial<Record<ClaveDocumento, string>> = {};
  arrastrando: ClaveDocumento | null = null;
  sacudir = false;
  borradorGuardado = false;

  formEstudiante: FormGroup;
  formApoderado: FormGroup;

  get seccionesDisponibles(): string[] {
    return this.secciones;
  }

  alCambiarGrado(): void { /* El grado se deriva de la fecha y no se edita manualmente. */ }

  alCambiarFechaNacimiento(): void {
    const fecha = this.formEstudiante.get('fechaNacimiento')?.value as string;
    if (!fecha) return;
    const grado = this.gradoSugerido(edadAlCorte(fecha, 2026));
    this.formEstudiante.patchValue({ grado, seccion: '' });
    this.formEstudiante.get('fechaNacimiento')?.updateValueAndValidity({ emitEvent: false });
  }

  gradoSugerido(edad: number): string {
    const gradosPorEdad: Record<number, string> = {
      6: '1er Grado Primaria', 7: '2do Grado Primaria', 8: '3er Grado Primaria',
      9: '4to Grado Primaria', 10: '5to Grado Primaria', 11: '6to Grado Primaria',
      12: '1er Grado Secundaria', 13: '2do Grado Secundaria', 14: '3er Grado Secundaria',
      15: '4to Grado Secundaria', 16: '5to Grado Secundaria',
      17: '5to Grado Secundaria', 18: '5to Grado Secundaria',
    };
    return gradosPorEdad[edad] ?? '';
  }

  numeroSolicitudGenerado = '';
  fechaGenerada = '';
  envioExitoso = false;
  enviando = false;

  constructor(private fb: FormBuilder, private matriculaService: MatriculaService) {
    const nombre = [Validators.required, Validators.minLength(2), Validators.pattern(PATRON_NOMBRE)];
    const dni = [Validators.required, Validators.pattern(/^\d{8}$/), dniRepetido];
    this.formEstudiante = this.fb.group({
      nombres: ['', nombre], apellidos: ['', nombre], dni: ['', dni],
      fechaNacimiento: ['', [Validators.required, fechaNacimiento]],
      grado: ['', Validators.required], seccion: ['', Validators.required], esNuevo: ['', Validators.required],
    });
    this.formEstudiante.get('grado')?.valueChanges.subscribe(() => {
      this.formEstudiante.get('fechaNacimiento')?.updateValueAndValidity({ emitEvent: false });
    });
    this.formApoderado = this.fb.group({
      nombreCompleto: ['', [...nombre, Validators.pattern(/^\S+(?: \S+)+$/)]],
      dni: ['', [...dni, (c: AbstractControl) => (c.value && c.value === this.formEstudiante?.value.dni ? { igual: true } : null)]],
      telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      parentesco: ['', Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(5)]],
    });
    this.restaurarBorrador();
    this.formEstudiante.valueChanges.subscribe(() => this.guardarBorrador());
    this.formApoderado.valueChanges.subscribe(() => this.guardarBorrador());
  }

  get completitud(): number {
    const ok = [this.formEstudiante, this.formApoderado]
      .flatMap((f) => Object.values(f.controls))
      .filter((c) => c.valid).length;
    const docs = this.documentosCampos.filter((d) => this.documentos[d.clave].adjuntado).length;
    return Math.round(((ok + docs) / 18) * 100);
  }

  get docsAdjuntos(): number {
    return this.documentosCampos.filter((d) => this.documentos[d.clave].adjuntado).length;
  }

  /* ---------- Validación y estado visual ---------- */
  estado(f: FormGroup, campo: string): 'ok' | 'error' | '' {
    const c = f.get(campo);
    if (!c) { return ''; }
    if (c.valid && c.value) { return 'ok'; }
    return c.touched && c.invalid ? 'error' : '';
  }

  error(f: FormGroup, campo: string): string {
    const c = f.get(campo);
    if (!c || !c.touched || !c.errors) { return ''; }
    const e = c.errors;
    if (e['required']) { return 'Este campo es obligatorio.'; }
    if (e['igual']) { return 'El DNI del apoderado no puede ser igual al del estudiante.'; }
    if (e['repetido']) { return 'Ingresa un DNI válido (no todos los dígitos iguales).'; }
    if (e['email']) { return 'Ingresa un correo válido, ej. nombre@correo.com.'; }
    if (e['futura']) { return 'La fecha no puede ser futura.'; }
    if (e['rango']) { return 'Para matrícula 2026, la edad debe ser de 6 a 18 años al 31 de marzo.'; }
    if (e['minlength']) { return 'Escribe al menos ' + e['minlength'].requiredLength + ' caracteres.'; }
    if (campo === 'dni') { return 'El DNI debe tener 8 dígitos.'; }
    if (campo === 'telefono') { return 'Debe tener 9 dígitos y empezar con 9.'; }
    if (campo === 'nombreCompleto') { return 'Ingresa nombre y apellido, solo letras.'; }
    return 'Solo letras, sin símbolos ni números.';
  }

  alEscribir(evento: Event, f: FormGroup, c: Campo): void {
    if (c.tipo !== 'texto' && c.tipo !== 'numero') { return; }
    const input = evento.target as HTMLInputElement;
    let v = input.value;
    if (c.tipo === 'numero') { v = v.replace(/\D/g, ''); }
    else if (c.key !== 'direccion') { v = v.replace(new RegExp(`[^${L} '-]`, 'g'), '').replace(/^\s+/, '').replace(/\s{2,}/g, ' '); }
    input.value = v;
    f.get(c.key)?.setValue(v, { emitEvent: true });
  }

  alSalir(f: FormGroup, c: Campo): void {
    const ctrl = f.get(c.key);
    if (ctrl && c.tipo === 'texto' && c.key !== 'direccion' && ctrl.value) {
      const limpio = ctrl.value.trim().replace(/\s+/g, ' ').toLowerCase()
        .replace(/(^|[ '-])([a-záéíóúñü])/g, (_m: string, a: string, b: string) => a + b.toUpperCase());
      ctrl.setValue(limpio);
    }
    ctrl?.markAsTouched();
    if (c.key === 'dni') { this.formApoderado.get('dni')?.updateValueAndValidity(); }
  }

  /* ---------- Borrador ---------- */
  private guardarBorrador(): void {
    if (typeof localStorage === 'undefined' || this.envioExitoso) { return; }
    localStorage.setItem(CLAVE_BORRADOR, JSON.stringify({ e: this.formEstudiante.value, a: this.formApoderado.value, p: this.pasoActual }));
    this.borradorGuardado = true;
  }

  private restaurarBorrador(): void {
    try {
      const b = typeof localStorage !== 'undefined' ? localStorage.getItem(CLAVE_BORRADOR) : null;
      if (!b) { return; }
      const d = JSON.parse(b);
      const estudianteBorrador = { ...d.e };
      if (!/primaria|secundaria/i.test(estudianteBorrador.grado ?? '')) {
        estudianteBorrador.grado = estudianteBorrador.fechaNacimiento
          ? this.gradoSugerido(edadAlCorte(estudianteBorrador.fechaNacimiento, 2026))
          : '';
      }
      if (!estudianteBorrador.seccion) estudianteBorrador.seccion = '';
      this.formEstudiante.patchValue(estudianteBorrador);
      this.formApoderado.patchValue(d.a);
      this.pasoActual = Math.min(Math.max(d.p || 1, 1), 3);
      this.borradorGuardado = true;
    } catch { /* borrador inválido */ }
  }

  /* ---------- Navegación ---------- */
  irAPaso(paso: number): void {
    if (paso < this.pasoActual && !this.envioExitoso) { this.pasoActual = paso; }
  }

  siguientePaso(): void {
    const f = this.pasoActual === 1 ? this.formEstudiante : this.pasoActual === 2 ? this.formApoderado : null;
    let invalido = false;
    if (f) { f.markAllAsTouched(); invalido = f.invalid; }
    if (invalido && f === this.formEstudiante) {
      this.mensajeFormulario = 'Completa los datos del estudiante, incluido el grado y la sección.';
    } else if (invalido && f === this.formApoderado) {
      this.mensajeFormulario = 'Revisa los datos del apoderado marcados en rojo.';
    } else {
      this.mensajeFormulario = '';
    }
    if (this.pasoActual === 3) {
      this.documentosCampos.forEach((d) => delete this.erroresDocumentos[d.clave]);
    }
    if (invalido) {
      this.sacudir = true;
      setTimeout(() => (this.sacudir = false), 450);
      return;
    }
    if (this.pasoActual < this.totalPasos) { this.pasoActual++; this.guardarBorrador(); }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 1) { this.pasoActual--; }
  }

  /* ---------- Documentos ---------- */
  seleccionarArchivo(evento: Event, clave: ClaveDocumento): void {
    const input = evento.target as HTMLInputElement;
    if (input.files && input.files.length > 0) { this.procesarArchivo(input.files[0], clave); }
    input.value = '';
  }

  soltar(evento: DragEvent, clave: ClaveDocumento): void {
    evento.preventDefault();
    this.arrastrando = null;
    const archivo = evento.dataTransfer?.files?.[0];
    if (archivo) { this.procesarArchivo(archivo, clave); }
  }

  private procesarArchivo(archivo: File, clave: ClaveDocumento): void {
    const ext = archivo.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTENSIONES.includes(ext)) { this.erroresDocumentos[clave] = 'Formato no permitido. Solo PDF, JPG o PNG.'; return; }
    if (archivo.size > MAX_MB * 1024 * 1024) { this.erroresDocumentos[clave] = `El archivo supera los ${MAX_MB} MB.`; return; }
    delete this.erroresDocumentos[clave];
    this.liberarVista(clave);
    if (ext !== 'pdf') { this.vistas[clave] = URL.createObjectURL(archivo); }
    this.documentos[clave] = { nombreArchivo: archivo.name, tipo: ext, adjuntado: true };
  }

  quitarArchivo(clave: ClaveDocumento): void {
    this.liberarVista(clave);
    this.documentos[clave] = { nombreArchivo: '', tipo: '', adjuntado: false };
  }

  private liberarVista(clave: ClaveDocumento): void {
    const v = this.vistas[clave];
    if (v) { URL.revokeObjectURL(v); delete this.vistas[clave]; }
  }

  /* ---------- Envío ---------- */
  enviarSolicitud(): void {
    this.mensajeFormulario = '';
    if (this.formEstudiante.invalid || this.formApoderado.invalid) {
      this.formEstudiante.markAllAsTouched();
      this.formApoderado.markAllAsTouched();
      this.mensajeFormulario = 'Revisa los datos requeridos antes de enviar la matrícula.';
      return;
    }
    const e = this.formEstudiante.value;
    const a = this.formApoderado.value;
    const nueva: Matricula = {
      numeroSolicitud: '', fecha: '',
      estudiante: { nombres: e.nombres, apellidos: e.apellidos, dni: e.dni, fechaNacimiento: e.fechaNacimiento, grado: e.grado, seccion: e.seccion, esNuevo: e.esNuevo === 'si' },
      apoderado: { nombreCompleto: a.nombreCompleto, dni: a.dni, telefono: a.telefono, correo: a.correo, parentesco: a.parentesco, direccion: a.direccion },
      documentos: this.documentos,
      estado: 'EN REVISIÓN',
    };
    this.enviando = true;
    this.matriculaService.guardarMatricula(nueva).subscribe({
      next: (guardada) => {
        if (typeof localStorage !== 'undefined') { localStorage.removeItem(CLAVE_BORRADOR); }
        this.numeroSolicitudGenerado = guardada.numeroSolicitud;
        this.fechaGenerada = guardada.fecha;
        this.envioExitoso = true;
        this.borradorGuardado = false;
        this.pasoActual = 5;
        this.enviando = false;
      },
      error: (error) => {
        this.mensajeFormulario = error.status === 409
          ? 'Este estudiante ya tiene una matrícula registrada para el año escolar.'
          : 'No se pudo registrar la matrícula. Comprueba que el backend y SQL Server estén activos e inténtalo de nuevo.';
        this.enviando = false;
      },
    });
  }

  nuevaMatricula(): void {
    this.documentosCampos.forEach((d) => this.liberarVista(d.clave));
    this.formEstudiante.reset();
    this.formApoderado.reset();
    this.documentos = crearDocumentosVacios();
    this.erroresDocumentos = {};
    this.envioExitoso = false;
    this.numeroSolicitudGenerado = '';
    this.borradorGuardado = false;
    if (typeof localStorage !== 'undefined') { localStorage.removeItem(CLAVE_BORRADOR); }
    this.pasoActual = 1;
    this.mensajeFormulario = '';
  }

  mensajeFormulario = '';
}
