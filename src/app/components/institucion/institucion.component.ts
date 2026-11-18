import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-institucion',
  template: `
    <main class="ins">
      <header class="ins-cabecera">
        <img src="logo.jpg" alt="Escudo de la institución" class="ins-escudo">
        <div>
          <p class="ins-etiqueta">NUESTRA INSTITUCIÓN</p>
          <h1>I.E.P. N.° 20874 "Centro de Varones"</h1>
          <p class="ins-sub">Ex 451 · San Vicente de Cañete · Cañete · Lima</p>
        </div>
      </header>

      <section class="ins-grid">
        <article class="ins-card ins-ancha">
          <h2>Sobre el colegio</h2>
          <p>{{ datos.resumen }}</p>
          <p class="ins-lema">"{{ datos.lema }}"</p>
        </article>

        <article class="ins-card">
          <h2>Datos generales</h2>
          <dl>
            <dt>Nombre</dt><dd>I.E.P. N.° 20874 "Centro de Varones" (Ex 451)</dd>
            <dt>Dirección</dt><dd>{{ datos.direccion }}</dd>
            <dt>Distrito / Provincia</dt><dd>San Vicente de Cañete, Cañete, Lima</dd>
            <dt>UGEL</dt><dd>UGEL N.° 08 Cañete</dd>
            @if (datos.director) { <dt>Director</dt><dd>{{ datos.director }}</dd> }
            @if (datos.telefono) { <dt>Teléfono</dt><dd>{{ datos.telefono }}</dd> }
            @if (datos.correo) { <dt>Correo</dt><dd>{{ datos.correo }}</dd> }
            @if (datos.horario) { <dt>Horario de referencia</dt><dd>{{ datos.horario }}</dd> }
            @if (datos.fundacion) { <dt>Trayectoria</dt><dd>{{ datos.fundacion }}</dd> }
          </dl>
        </article>

        <article class="ins-card">
          <h2>Niveles educativos</h2>
          <div class="ins-niveles">
            @for (nivel of niveles; track nivel.nombre) {
              <div class="ins-nivel">
                <strong>{{ nivel.nombre }}</strong>
                <div class="ins-chips">
                  @for (grado of nivel.grados; track grado) { <span>{{ grado }}</span> }
                </div>
              </div>
            }
          </div>
        </article>

        @if (datos.mision) {
          <article class="ins-card"><h2>Misión</h2><p>{{ datos.mision }}</p></article>
        }
        @if (datos.vision) {
          <article class="ins-card"><h2>Visión</h2><p>{{ datos.vision }}</p></article>
        }

        <article class="ins-card ins-ancha">
          <h2>Nuestra historia</h2>
          <ol class="ins-linea">
            @for (hito of historia; track hito.anio) {
              <li>
                <span class="ins-anio">{{ hito.anio }}</span>
                <p>{{ hito.texto }}</p>
              </li>
            }
          </ol>
        </article>

        <article class="ins-card ins-ancha">
          <h2>Logros y reconocimientos</h2>
          <ul class="ins-lista">
            @for (logro of logros; track logro) { <li>{{ logro }}</li> }
          </ul>
        </article>

        <article class="ins-card ins-ancha">
          <h2>Ubicación</h2>
          <p class="ins-dir">{{ datos.direccion }}</p>
          <div class="ins-mapa">
            <iframe [src]="mapaUrl" title="Mapa de ubicación del colegio" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <a class="ins-enlace" [href]="enlaceMapa" target="_blank" rel="noopener">Abrir en Google Maps ›</a>
        </article>

        <article class="ins-card ins-ancha">
          <h2>Más información</h2>
          <div class="ins-enlaces">
            @for (enlace of enlaces; track enlace.url) {
              <a [href]="enlace.url" target="_blank" rel="noopener">{{ enlace.texto }} ›</a>
            }
          </div>
        </article>
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; flex: 1 0 auto; background: #f7f7fa; }
    .ins { width: min(100% - 48px, 1000px); margin: auto; padding: 34px 0 48px; }
    .ins-cabecera { display: flex; align-items: center; gap: 20px; padding: 22px 24px; margin-bottom: 20px; background: #fff; border: 1px solid #e4e3e9; border-left: 6px solid #a71f2b; border-radius: 14px; }
    .ins-escudo { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; flex: none; }
    .ins-etiqueta { margin: 0 0 4px; font-size: 12px; font-weight: 700; letter-spacing: .08em; color: #a71f2b; }
    h1 { margin: 0; font-size: 26px; line-height: 1.2; color: #1a1b25; }
    .ins-sub { margin: 6px 0 0; font-size: 15px; color: #565966; }
    .ins-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .ins-card { padding: 22px; background: #fff; border: 1px solid #e4e3e9; border-radius: 14px; }
    .ins-ancha { grid-column: 1 / -1; }
    h2 { margin: 0 0 12px; font-size: 18px; color: #1a1b25; }
    p { margin: 0; font-size: 15px; line-height: 1.6; color: #34364a; }
    .ins-lema { margin-top: 14px; padding-left: 14px; border-left: 3px solid #a71f2b; font-style: italic; color: #8e1620; font-weight: 600; }
    dl { display: grid; grid-template-columns: 150px 1fr; gap: 10px 14px; margin: 0; font-size: 15px; }
    dt { font-weight: 700; color: #565966; }
    dd { margin: 0; color: #1a1b25; }
    .ins-niveles { display: grid; gap: 16px; }
    .ins-nivel strong { display: block; margin-bottom: 8px; font-size: 15px; color: #a71f2b; }
    .ins-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .ins-chips span { padding: 5px 10px; border-radius: 999px; background: #fdecee; color: #8e1620; font-size: 13px; font-weight: 600; }
    .ins-linea { list-style: none; margin: 0; padding: 0 0 0 18px; border-left: 2px solid #e4e3e9; display: grid; gap: 18px; }
    .ins-linea li { position: relative; }
    .ins-linea li::before { content: ''; position: absolute; left: -25px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: #a71f2b; border: 2px solid #fff; box-shadow: 0 0 0 1px #a71f2b; }
    .ins-anio { display: block; margin-bottom: 2px; font-size: 14px; font-weight: 700; color: #a71f2b; }
    .ins-lista { margin: 0; padding-left: 20px; display: grid; gap: 8px; font-size: 15px; line-height: 1.5; color: #34364a; }
    .ins-dir { margin-bottom: 12px; }
    .ins-mapa { overflow: hidden; border-radius: 12px; border: 1px solid #e4e3e9; }
    .ins-mapa iframe { display: block; width: 100%; height: 340px; border: 0; }
    .ins-enlace, .ins-enlaces a { display: inline-block; margin-top: 12px; font-size: 14px; font-weight: 700; color: #a71f2b; text-decoration: none; }
    .ins-enlaces { display: flex; flex-wrap: wrap; gap: 8px 24px; }
    .ins-enlaces a { margin-top: 0; }
    .ins-enlace:hover, .ins-enlaces a:hover { text-decoration: underline; }
    @media (max-width: 760px) {
      .ins-grid { grid-template-columns: 1fr; }
      .ins-cabecera { flex-direction: column; text-align: center; border-left-width: 1px; border-top: 6px solid #a71f2b; }
      dl { grid-template-columns: 1fr; gap: 2px; }
      dd { margin-bottom: 8px; }
      .ins-mapa iframe { height: 260px; }
    }
  `],
})
export class InstitucionComponent {
  /** Lo que dejes vacío ('') no se muestra en la página. */
  readonly datos = {
    resumen:
      'La Institución Educativa Pública N.° 20874 "Centro de Varones" (Ex 451) es un colegio emblemático de San Vicente de Cañete. ' +
      'Brinda Educación Básica Regular en los niveles de primaria y secundaria, bajo la jurisdicción de la UGEL N.° 08 Cañete.',
    lema: 'En las buenas y en las malas, siempre somos 451',
    direccion: "Jirón O'Higgins, San Vicente de Cañete (cerca del Parque Plaza San Martín)",
    director: 'Walter Luis Manero Campos',
    telefono: '+51 1 3399390',
    correo: '',
    horario: 'Lunes a viernes, de 7:30 a. m. a 6:00 p. m.',
    fundacion: 'Más de 120 años formando generaciones (121.° aniversario en 2025)',
    mision: '',
    vision: '',
  };

  readonly niveles = [
    { nombre: 'Primaria', grados: ['1.° grado', '2.° grado', '3.° grado', '4.° grado', '5.° grado', '6.° grado'] },
    { nombre: 'Secundaria', grados: ['1.° año', '2.° año', '3.° año', '4.° año', '5.° año'] },
  ];

  readonly historia = [
    { anio: 'Antes de 1874', texto: 'El colegio funcionaba de manera intermitente y con recursos muy limitados.' },
    { anio: '1885', texto: 'El Concejo Municipal le dio vida formal, durante la gestión del alcalde León Quiroz.' },
    { anio: '1904', texto: 'El plantel pasó a depender del Estado, lo que le dio mayor estabilidad.' },
    { anio: '1940', texto: 'Se construyó el local emblemático con el apoyo de la Compañía Agrícola Montalbán.' },
    { anio: '1974', texto: 'Tras el terremoto, docentes, padres y alumnos levantaron nuevos pabellones.' },
    { anio: '1979', texto: 'Se incorporó el nivel secundario y creció la población escolar.' },
    { anio: 'Años 90 y 2000', texto: 'Nuevas edificaciones y el Aula de Innovación Pedagógica Huascarán con computadoras modernas.' },
  ];

  readonly logros = [
    'Campeonatos de matemáticas, concursos nacionales y reconocimientos escolares.',
    'Participación y premios en concursos de comprensión lectora, debate, ciencias y deportes.',
    'Varios estudiantes ingresaron al Colegio Mayor Secundario del Perú.',
    'Fue declarado "Institución Educativa de Calidad" por la PUCP.',
  ];

  readonly enlaces = [
    { texto: 'Facebook oficial del colegio', url: 'https://www.facebook.com/CentroDeVarones/' },
    { texto: 'Nota de la Municipalidad de Cañete: 121 años formando generaciones', url: 'https://www.gob.pe/institucion/municanete/noticias/1244347-centro-de-varones-121-anos-formando-generaciones' },
  ];

  readonly mapaUrl: SafeResourceUrl;
  readonly enlaceMapa: string;

  constructor(sanitizer: DomSanitizer) {
    const consulta = encodeURIComponent('Centro de Varones 20874, San Vicente de Cañete, Lima, Perú');
    this.mapaUrl = sanitizer.bypassSecurityTrustResourceUrl(`https://www.google.com/maps?q=${consulta}&output=embed`);
    this.enlaceMapa = `https://www.google.com/maps/search/?api=1&query=${consulta}`;
  }
}