import m from 'mithril';
import './style.css';

let inputSVGDataURL = null;
let inputSVGSize = null;
let inputSVGImage = null;
const options = {
  width: 800,
  height: 600,
  spacing: 20,
  radius: 10,
  offsetX: 0,
  offsetY: 0,
};
let rendered = null;

function setInputImage(file) {
  const fr = new FileReader();
  fr.onload = (event) => {
    const url = fr.result;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      inputSVGSize = {
        width: img.width,
        height: img.height,
      };
      inputSVGDataURL = url;
      inputSVGImage = img;
      m.redraw();
    };
    img.onerror = () => {
      alert('Invalid image.');
    };
  };
  fr.readAsDataURL(file);
}

function render(image, width, height, spacing, radius, offsetX, offsetY) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  const data = ctx.getImageData(0, 0, width, height);
  const circles = [];
  for (let y = 0; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      const ox = (x + offsetX);
      const oy = (y + offsetY);
      if (ox < 0 || ox >= width || oy < 0 || oy >= height) {
        continue;
      }
      const offset = data.width * oy * 4 + ox * 4;
      const [r, g, b, a] = data.data.slice(offset, offset + 4);
      if (a > 192) {
        circles.push({ x, y, r, g, b, radius });
      }
    }
  }
  return { circles, width, height };
}

function renderedToSVG(rendered) {
  return m('svg', { width: rendered.width, height: rendered.height }, rendered.circles.map((c) =>
    m('circle', { cx: c.x, cy: c.y, r: c.radius, fill: `rgb(${c.r}, ${c.g}, ${c.b})` })
  ));
}

function exportSVG(rendered) {
  const tree = renderedToSVG(rendered);
  const frag = document.createDocumentFragment();
  m.render(frag, tree);
  const xml = frag.firstChild.outerHTML;
  alert('...');
}

const optionNumberInput = (field, attrs) => {
  const finalAttrs = Object.assign({
    type: 'number',
    value: options[field],
    oninput: (e) => {
      options[field] = e.target.valueAsNumber;
    },
  }, attrs);
  return m('input', finalAttrs);
};

const view = () => {
  return [
    m('div#controls', [
      m('label', [
        m('input[type=file]', {
          accept: 'image/*',
          onchange: (event) => setInputImage(event.target.files[0]),
        }),
      ]),
      m('label', 'Output Size', [
        optionNumberInput('width', { min: 0, step: 1 }),
        'x',
        optionNumberInput('height', { min: 0, step: 1 }),
        m('button', {
          onclick: () => {
            options.width = inputSVGSize.width;
            options.height = inputSVGSize.height;
          },
          disabled: !inputSVGSize,
        }, 'From Original'),
      ]),
      m('label', 'Circle Spacing', [
        optionNumberInput('spacing', { min: 1, step: 1 }),
      ]),
      m('label', 'Circle Radius', [
        optionNumberInput('radius', { min: 1, step: 1 }),
      ]),
      m('label', 'Offset', [
        optionNumberInput('offsetX', { step: 1 }),
        'x',
        optionNumberInput('offsetY', { step: 1 }),
      ]),
      m(
        'button',
        {
          onclick: () => {
            rendered = render(
              inputSVGImage,
              options.width,
              options.height,
              options.spacing,
              options.radius,
              options.offsetX,
              options.offsetY,
            );
          },
          disabled: !inputSVGImage,
        }, 'Render',
      ),
      m(
        'button',
        {
          onclick: () => {
            exportSVG(rendered);
          },
          disabled: !rendered,
        },
        'Export',
      )
    ]),
    m('div#inout', [
      m('div#input', m('img', { src: inputSVGDataURL })),
      m('div#output', rendered ? renderedToSVG(rendered) : null),
    ]),
  ];
};


m.mount(document.body, { view });
