# UNAB 360

Portal web para estudiantes de la Universidad Autónoma de Bucaramanga (UNAB). Reúne en un solo sitio el control de **horas libres (HL)**, los **lugares del campus** donde se pueden cumplir, el calendario académico, las tareas y otras herramientas para organizar el semestre.

Proyecto académico hecho con HTML, CSS y JavaScript, sin frameworks ni servidor.

## Funcionalidades

- **Inicio de sesión** con validación de usuario y clave.
- **Inicio:** resumen de horas libres cumplidas y faltantes, accesos directos a Mi Portal U, Cosmos, Tema y Canvas, próximas actividades, tareas y Top 10 de estudiantes con más horas libres.
- **Horas libres:** registrar, editar y eliminar horas (CRUD), cambiar la meta, ver horas por lugar y recibir sugerencias según el tiempo libre.
- **Lugares del campus:** Banú, Gimnasio, Cafetería Casona, Cafetería Bosque, Cafetería CSU, Biblioteca, Salas de cómputo y más, con fotos, horarios, buscador y filtros. Permite registrarse en un lugar, ver los lugares registrados y sumar las horas a las HL.
- **Calendario:** vista por mes, con clases (que se repiten cada semana), parciales, entregas, festivos de Colombia y actividades personales. Se puede agregar, editar y eliminar.
- **Tareas:** lista de tareas y recordatorios personales.
- **Notas:** simulador de la nota que se necesita para aprobar y cálculo de promedio ponderado.
- **Asistencia:** control de faltas por materia con alerta al acercarse al límite.
- **Perfil:** datos del estudiante, progreso de HL y edición de nombre, programa, semestre, código y foto.
- **Ayuda:** preguntas frecuentes y formulario de contacto.
- **Creadores:** información del equipo que desarrolló la página.
- **Modo claro y oscuro**, que se recuerda al volver.
- **Diseño adaptable** para computador, tablet y celular.

## Tecnologías

- HTML5
- CSS3 (variables CSS, grid y flexbox)
- JavaScript (sin librerías)
- `localStorage` del navegador para guardar los datos

## Estructura del proyecto

```
unab360/
├── index.html            Inicio de sesión
├── inicio.html           Página principal
├── horas-libres.html     Horas libres (CRUD)
├── lugares.html          Lugares del campus
├── calendario.html       Calendario
├── tareas.html           Tareas
├── notas.html            Simulador de notas
├── asistencia.html       Asistencia
├── perfil.html           Perfil del estudiante
├── ayuda.html            Ayuda y contacto
├── creadores.html        Creadores de la página
├── css/style.css         Estilos
├── js/core.js            Sesión, datos y utilidades compartidas
├── js/pages.js           Lógica de cada página
├── js/firebase-config.js Configuración opcional de Firebase (vacía)
└── img/                  Logo, fotos del campus y del equipo
```

## Cómo usarlo

1. Descarga o clona el repositorio.
2. Abre `index.html` en el navegador (Chrome, Edge o Firefox).
3. Inicia sesión con el usuario precargado. Los datos de acceso aparecen escritos en el formulario.

No requiere instalar nada.

## Publicar en GitHub Pages

1. En el repositorio entra a **Settings** y luego a **Pages**.
2. En **Source** elige **Deploy from a branch**.
3. Selecciona la rama **main** y la carpeta **/ (root)**, y guarda.
4. Después de uno o dos minutos la página queda disponible en `https://TU-USUARIO.github.io/NOMBRE-DEL-REPOSITORIO/`.

## Notas importantes

- No hay servidor ni base de datos: los datos se guardan en el navegador de cada dispositivo. Si se borran los datos del navegador, se pierden.
- Los usuarios están precargados en el código y la página no tiene registro de cuentas. Las claves no están cifradas, por lo que el sistema es solo para fines académicos.
- El Top 10 de estudiantes, los horarios de las clases y los horarios de los lugares son datos de muestra.
- Las fotos del campus provienen del sitio oficial de la UNAB (unab.edu.co).
- Este es un proyecto estudiantil y no es un sitio oficial de la Universidad.

## Creadores

- Alejandra Suárez Durán
- Thore Nicholas Dohn Cerchiaro
- Betsy Katheryn Ardila Ardila

Estudiantes de Ingeniería de Sistemas, 2.º semestre, UNAB.
