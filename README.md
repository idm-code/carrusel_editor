# Generador de Carruseles para LinkedIn (HTML/CSS/JS)

Aplicación web estática para diseñar carruseles cuadrados 1:1 y exportarlos a PDF. Permite elegir plantillas, colores (o degradado), incorporar iconos y usar una imagen de fondo (URL o archivo local).

- Demo local: ver sección “Ejecutar localmente”
- Estructura del proyecto:
  - [index.html](index.html): UI y dependencias por CDN (Font Awesome, jsPDF, html2canvas)
  - [styles.css](styles.css): estilos y diseño
  - [app.js](app.js): lógica de la app
  - [icons.json](icons.json): catálogo de iconos (agrupados)

## Características

- Plantillas: Minimalista y Moderno
- Fondo: color sólido o degradado (con ángulo)
- Iconos: selector basado en Font Awesome, cargados desde `icons.json`
- Imagen de fondo: por URL http(s) o como archivo local (se incrusta como Data URL)
- Lista y navegación de diapositivas (ir/eliminar)
- Exportación a PDF con jsPDF + html2canvas
- Contraste de texto automático según fondo

## Requisitos

Al usar `fetch` para cargar [icons.json](icons.json), se debe servir por HTTP (no abrir con file://). Cualquier servidor estático funciona.

## Ejecutar localmente

- Visual Studio Code:
  - Usar la extensión “Live Server” y abrir [index.html](index.html)
- Python 3:
  ```bash
  python3 -m http.server 8080
  ```
  Abrir http://localhost:8080/
- Node.js (serve):
  ```bash
  npx serve .
  ```
  Abrir la URL que indique la consola

## Uso

1. Elegir la plantilla (Minimalista/Moderno)
2. Fondo:
   - Color sólido o activar “Usar degradado”
   - Elegir color “Hasta” y ajustar el ángulo
3. Título y contenido (máx. 150 caracteres)
4. Icono opcional desde el selector
5. Imagen de fondo:
   - URL con CORS habilitado, o
   - Subir archivo local (se incrusta y evita CORS al exportar)
6. “Añadir diapositiva”
7. Gestionar desde la lista (Ir/Eliminar) y navegar con Anterior/Siguiente
8. “Exportar a PDF”

Notas:
- El tamaño de la vista previa es 350×350. En el PDF, cada slide se coloca a 180×180 centrado en la página.
- El contraste del texto se calcula automáticamente.

## Personalización rápida

- Lógica de renderizado y estado: ver [`updatePreview`](app.js) y el arreglo `slides` (estado principal)
- Exportación: ver [`exportToPDF`](app.js) para ajustar tamaños, calidad o layout en PDF
- Carga de iconos: ver [`loadIcons`](app.js) y editar [icons.json](icons.json) para añadir grupos/iconos
- Eventos y bindings de UI: ver [`wireEvents`](app.js)
- Contraste de texto: ver [`determineTextColor`](app.js) (usa `hexToRgb` + `luminance`)

## Dependencias (CDN)

- Font Awesome 6 (para iconos)
- jsPDF 2.5.x
- html2canvas 1.4.x

Están referenciadas en [index.html](index.html).

## Limitaciones y consejos

- Imágenes remotas requieren CORS para que html2canvas pueda rasterizarlas; preferir subir archivo local (se convierte a Data URL)
- El contraste automático es heurístico (promedia colores en degradado)
- Si `icons.json` falla al cargar, el selector mostrará “Sin icono”