const slides = [
  {
    title: 'Título de ejemplo',
    content: 'Este es un contenido de ejemplo para tu diapositiva.',
    image: '',
    color: '#0077b5',
    textColor: '#ffffff',
  template: 'minimalista',
  iconClass: '',
    gradient: {
      enabled: false,
      from: '#0077b5',
      to: '#50c878',
      angle: 0
    }
  }
];

let currentSlide = 0;
let selectedColor = '#0077b5';
let selectedTextColor = '#ffffff';
let selectedTemplate = 'minimalista';
let pendingImageDataUrl = '';
let gradientEnabled = false;
let gradientFrom = '#0077b5';
let gradientTo = '#50c878';
let gradientAngle = 0;

function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : { r: 0, g: 0, b: 0 };
}
function luminance({ r, g, b }) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}
function determineTextColor(slide) {
  if (slide.image) return '#ffffff';
  let base = slide.color || '#0077b5';
  if (slide.gradient && slide.gradient.enabled) {
    const c1 = hexToRgb(slide.gradient.from || '#000000');
    const c2 = hexToRgb(slide.gradient.to || '#ffffff');
    base = `#${((c1.r + c2.r) >> 1).toString(16).padStart(2, '0')}${((c1.g + c2.g) >> 1)
      .toString(16)
      .padStart(2, '0')}${((c1.b + c2.b) >> 1).toString(16).padStart(2, '0')}`;
  }
  const L = luminance(hexToRgb(base));
  return L > 0.5 ? '#111111' : '#ffffff';
}


function isValidHttpUrl(str) {
  try {
    const u = new URL(str);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function clampContent(text) {
  if (text.length > 150) {
    alert('El contenido no debe exceder los 150 caracteres.');
    return text.slice(0, 150);
  }
  return text;
}


const preview = document.getElementById('slide-preview');
const slidesListEl = document.getElementById('slides-list');


function updatePreview() {
  const slide = slides[currentSlide];
  const title = preview.querySelector('.slide-title');
  const content = preview.querySelector('.slide-content');
  const counter = preview.querySelector('.slide-counter');
  const iconEl = preview.querySelector('.slide-icon');


  if (slide.image) {
    preview.style.backgroundImage = `url(${slide.image})`;
    preview.style.backgroundColor = 'transparent';
  } else {
    if (slide.gradient && slide.gradient.enabled) {
      preview.style.backgroundImage = `linear-gradient(${slide.gradient.angle}deg, ${slide.gradient.from}, ${slide.gradient.to})`;
      preview.style.backgroundColor = 'transparent';
    } else {
      preview.style.backgroundImage = 'none';
      preview.style.backgroundColor = slide.color;
    }
  }


  title.textContent = slide.title;
  content.textContent = slide.content;
  counter.textContent = `${currentSlide + 1}/${slides.length}`;


  const textColor = determineTextColor(slide);
  if (slide.iconClass) {
    iconEl.innerHTML = `<i class="${slide.iconClass}"></i>`;
    iconEl.style.display = 'block';
    iconEl.style.color = textColor;
  } else {
    iconEl.innerHTML = '';
    iconEl.style.display = 'none';
  }


  const iconSelect = document.getElementById('slide-icon-select');
  if (iconSelect && iconSelect.value !== (slide.iconClass || '')) {
    iconSelect.value = slide.iconClass || '';
  }


  if (slide.template === 'minimalista') {
    preview.style.justifyContent = 'center';
    preview.style.alignItems = 'center';
    preview.style.textAlign = 'center';
    title.style.fontSize = '28px';
    content.style.fontSize = '18px';
  } else if (slide.template === 'moderno') {
    preview.style.justifyContent = 'flex-end';
    preview.style.alignItems = 'flex-start';
    preview.style.textAlign = 'left';
    title.style.fontSize = '32px';
    content.style.fontSize = '20px';
  }


  title.style.color = textColor;
  content.style.color = textColor;
}

function updateSlidesList() {
  slidesListEl.innerHTML = '';
  slides.forEach((slide, index) => {
    const slideItem = document.createElement('div');
    slideItem.className = 'slide-item';
    slideItem.innerHTML = `
      <span>Diapositiva ${index + 1}: ${
        slide.title.substring(0, 20)
      }${slide.title.length > 20 ? '...' : ''}</span>
      <div>
        <button class="goto" data-index="${index}">Ir</button>
        <button class="del" data-index="${index}"><i class="fas fa-trash"></i></button>
      </div>
    `;
    slidesListEl.appendChild(slideItem);
  });

  slidesListEl.querySelectorAll('button.del').forEach((btn) => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      deleteSlide(index);
    });
  });

  slidesListEl.querySelectorAll('button.goto').forEach((btn) => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      currentSlide = index;
      updatePreview();
    });
  });
}

function deleteSlide(index) {
  if (slides.length <= 1) {
    alert('Debe haber al menos una diapositiva');
    return;
  }
  slides.splice(index, 1);
  if (currentSlide >= index) currentSlide = Math.max(0, currentSlide - 1);
  updateSlidesList();
  updatePreview();
}

function resetCarousel() {
  if (!confirm('¿Estás seguro de que quieres reiniciar? Se perderán todas las diapositivas.')) return;
  slides.length = 0;
  slides.push({
    title: 'Nueva diapositiva',
    content: 'Añade contenido aquí',
    image: '',
    color: selectedColor,
    textColor: selectedTextColor,
    template: selectedTemplate,
    gradient: {
      enabled: gradientEnabled,
      from: gradientFrom,
      to: gradientTo,
      angle: gradientAngle
    }
  });
  currentSlide = 0;
  updateSlidesList();
  updatePreview();
}

async function exportToPDF() {
  if (!window.jspdf || !window.html2canvas) {
    alert('Librerías no cargadas. Recarga la página.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = doc.internal.pageSize.getHeight();

  const loadingMsg = document.createElement('div');
  loadingMsg.style.position = 'fixed';
  loadingMsg.style.top = '0';
  loadingMsg.style.left = '0';
  loadingMsg.style.width = '100%';
  loadingMsg.style.height = '100%';
  loadingMsg.style.backgroundColor = 'rgba(0,0,0,0.7)';
  loadingMsg.style.color = 'white';
  loadingMsg.style.display = 'flex';
  loadingMsg.style.justifyContent = 'center';
  loadingMsg.style.alignItems = 'center';
  loadingMsg.style.zIndex = '10000';
  loadingMsg.style.fontSize = '24px';
  loadingMsg.innerHTML = '<div>Generando PDF...<br><small>Por favor, espera</small></div>';
  document.body.appendChild(loadingMsg);

  try {
    for (let i = 0; i < slides.length; i++) {
      if (i > 0) doc.addPage();
      const slide = slides[i];

      const slideDiv = document.createElement('div');
      slideDiv.style.width = '350px';
      slideDiv.style.height = '350px';
      if (slide.image) {
        slideDiv.style.background = `url(${slide.image}) center/cover`;
      } else if (slide.gradient && slide.gradient.enabled) {
        slideDiv.style.background = `linear-gradient(${slide.gradient.angle}deg, ${slide.gradient.from}, ${slide.gradient.to})`;
      } else {
        slideDiv.style.background = slide.color;
      }
      slideDiv.style.borderRadius = '10px';
      slideDiv.style.padding = '30px';
      slideDiv.style.position = 'relative';
      slideDiv.style.color = slide.textColor;
      slideDiv.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
      slideDiv.style.display = 'flex';
      slideDiv.style.flexDirection = 'column';
      slideDiv.style.justifyContent = slide.template === 'minimalista' ? 'center' : 'flex-end';
      slideDiv.style.alignItems = slide.template === 'minimalista' ? 'center' : 'flex-start';
      slideDiv.style.textAlign = slide.template === 'minimalista' ? 'center' : 'left';

      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.right = '0';
      overlay.style.bottom = '0';
      overlay.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))';
      slideDiv.appendChild(overlay);

      const contentDiv = document.createElement('div');
      contentDiv.style.position = 'relative';
      contentDiv.style.zIndex = '1';

      // NUEVO: icono en PDF
      if (slide.iconClass) {
        const iconEl = document.createElement('i');
        iconEl.className = slide.iconClass;
        iconEl.style.fontSize = '48px';
        iconEl.style.marginBottom = '10px';
        iconEl.style.color = determineTextColor(slide);
        contentDiv.appendChild(iconEl);
      }

      const title = document.createElement('h3');
      title.textContent = slide.title;
      title.style.fontSize = slide.template === 'minimalista' ? '28px' : '32px';
      title.style.marginBottom = '15px';
      title.style.fontWeight = '700';
      title.style.color = determineTextColor(slide);

      const content = document.createElement('p');
      content.textContent = slide.content;
      content.style.fontSize = slide.template === 'minimalista' ? '18px' : '20px';
      content.style.lineHeight = '1.5';
      content.style.whiteSpace = 'pre-wrap';
      content.style.wordBreak = 'break-word';
      content.style.color = determineTextColor(slide);

      contentDiv.appendChild(title);
      contentDiv.appendChild(content);
      slideDiv.appendChild(contentDiv);

      document.body.appendChild(slideDiv);

      const canvas = await html2canvas(slideDiv, { scale: 2, useCORS: true });
      document.body.removeChild(slideDiv);

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      doc.addImage(imgData, 'JPEG', (pdfWidth - 180) / 2, (pdfHeight - 180) / 2, 180, 180);
    }

    doc.save('carrusel-linkedin.pdf');
  } catch (e) {
    console.error(e);
    alert('Ocurrió un error al generar el PDF.');
  } finally {
    loadingMsg.remove();
  }
}


function wireEvents() {
  document.getElementById('add-slide').addEventListener('click', async function () {
    const title = document.getElementById('slide-title').value || 'Nueva diapositiva';
    const content = clampContent(document.getElementById('slide-content').value || 'Añade contenido aquí');
    const urlField = document.getElementById('slide-image');
    const urlValue = (urlField.value || '').trim();
    const iconClass = document.getElementById('slide-icon-select').value || '';

    let image = '';
    if (pendingImageDataUrl) {
      image = pendingImageDataUrl;
    } else if (isValidHttpUrl(urlValue)) {
      image = urlValue;
    } else if (urlValue) {
      alert('La URL de imagen no es válida. Se ignorará.');
    }

    slides.push({
      title,
      content,
      image,
      color: selectedColor,
      textColor: selectedTextColor,
      template: selectedTemplate,
      iconClass,
      gradient: {
        enabled: gradientEnabled,
        from: gradientFrom,
        to: gradientTo,
        angle: gradientAngle
      }
    });

    currentSlide = slides.length - 1;
    updateSlidesList();
    updatePreview();

    document.getElementById('slide-title').value = '';
    document.getElementById('slide-content').value = '';
    urlField.value = '';
    pendingImageDataUrl = '';
    document.getElementById('slide-image-file').value = '';
    document.getElementById('slide-icon-select').value = '';
  });

  document.getElementById('next-slide').addEventListener('click', function () {
    if (currentSlide < slides.length - 1) {
      currentSlide++;
      updatePreview();
    }
  });

  document.getElementById('prev-slide').addEventListener('click', function () {
    if (currentSlide > 0) {
      currentSlide--;
      updatePreview();
    }
  });


  document.getElementById('download-pdf').addEventListener('click', exportToPDF);
  document.getElementById('reset-btn').addEventListener('click', resetCarousel);

  const color1 = document.getElementById('bg-color-1');
  const color2 = document.getElementById('bg-color-2');
  const useGradient = document.getElementById('use-gradient');
  const angleInput = document.getElementById('bg-angle');
  const angleValue = document.getElementById('bg-angle-value');
  const gradientControls = document.getElementById('gradient-controls');

  color1.addEventListener('input', function () {
    selectedColor = this.value;
    gradientFrom = this.value;
    const slide = slides[currentSlide];
    if (!slide.image) {
      if (slide.gradient && slide.gradient.enabled) {
        slide.gradient.from = this.value;
      } else {
        slide.color = this.value;
      }
      updatePreview();
    }
  });
  color2 && color2.addEventListener('input', function () {
    gradientTo = this.value;
    const slide = slides[currentSlide];
    if (!slide.image && slide.gradient && slide.gradient.enabled) {
      slide.gradient.to = this.value;
      updatePreview();
    }
  });
  useGradient.addEventListener('change', function () {
    gradientEnabled = this.checked;
    gradientControls.style.display = this.checked ? 'block' : 'none';
    const slide = slides[currentSlide];
    if (!slide.image) {
      slide.gradient = slide.gradient || { enabled: false, from: color1.value, to: color2?.value || '#50c878', angle: parseInt(angleInput.value, 10) };
      slide.gradient.enabled = this.checked;
      slide.color = color1.value;
      updatePreview();
    }
  });
  angleInput && angleInput.addEventListener('input', function () {
    gradientAngle = parseInt(this.value, 10) || 0;
    angleValue.textContent = `${gradientAngle}°`;
    const slide = slides[currentSlide];
    if (!slide.image && slide.gradient && slide.gradient.enabled) {
      slide.gradient.angle = gradientAngle;
      updatePreview();
    }
  });

  document.querySelectorAll('.template').forEach((template) => {
    template.addEventListener('click', function () {
      document.querySelectorAll('.template').forEach((t) => t.classList.remove('active'));
      this.classList.add('active');
      selectedTemplate = this.getAttribute('data-template');
      slides[currentSlide].template = selectedTemplate;
      updatePreview();
    });
  });

  document.getElementById('slide-icon-select').addEventListener('change', function () {
    slides[currentSlide].iconClass = this.value || '';
    updatePreview();
  });

  document.getElementById('slide-title').addEventListener('input', function () {
    slides[currentSlide].title = this.value || 'Nueva diapositiva';
    updatePreview();
  });
  document.getElementById('slide-content').addEventListener('input', function () {
    slides[currentSlide].content = clampContent(this.value || 'Añade contenido aquí');
    updatePreview();
  });

  const urlInput = document.getElementById('slide-image');
  function applyUrlToSlide(value) {
    const val = (value || '').trim();
    if (!val) {
      slides[currentSlide].image = '';
      updatePreview();
      return;
    }
    if (isValidHttpUrl(val)) {
      slides[currentSlide].image = val;
      pendingImageDataUrl = '';
      updatePreview();
    }

  }
  urlInput.addEventListener('input', function () {
    applyUrlToSlide(this.value);
  });
  urlInput.addEventListener('change', function () {
    if (this.value && !isValidHttpUrl(this.value)) alert('URL inválida.');
    applyUrlToSlide(this.value);
  });

  document.getElementById('slide-image-file').addEventListener('change', function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Selecciona un archivo de imagen válido.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      pendingImageDataUrl = reader.result;
      slides[currentSlide].image = pendingImageDataUrl;
      document.getElementById('slide-image').value = '';
      updatePreview();
    };
    reader.readAsDataURL(file);
  });
}

async function loadIcons() {
  const select = document.getElementById('slide-icon-select');
  if (!select) return;
  try {
    select.innerHTML = '<option value="">Cargando iconos…</option>';
    const res = await fetch('./icons.json', { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    select.innerHTML = '';
    const none = document.createElement('option');
    none.value = '';
    none.textContent = 'Sin icono';
    select.appendChild(none);

    (data.groups || []).forEach(group => {
      const og = document.createElement('optgroup');
      og.label = group.label || 'Otros';
      (group.icons || []).forEach(icon => {
        const opt = document.createElement('option');
        opt.value = icon.class;
        opt.textContent = icon.label || icon.class;
        og.appendChild(opt);
      });
      select.appendChild(og);
    });

    const current = slides[currentSlide]?.iconClass || '';
    select.value = current;
  } catch (err) {
    console.error('No se pudieron cargar los iconos:', err);
    select.innerHTML = '<option value="">Sin icono</option>';
  }
}

updateSlidesList();
updatePreview();
loadIcons();
wireEvents();
