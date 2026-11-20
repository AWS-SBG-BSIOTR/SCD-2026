import { TYPEFACE_FAMILIES } from './families';
import { sound } from './audio';

export class FontTesterController {
  private container: HTMLElement;
  private currentFamilyId: string = 'ks-elastik';
  private fontSize: number = 120;
  private lineHeight: number = 1.0;
  private letterSpacing: number = 0;
  private alignment: 'left' | 'center' | 'right' | 'justify' = 'left';
  private isDarkCanvas: boolean = false;
  private text: string = 'SPHINX OF BLACK QUARTZ, JUDGE MY VOW.';
  private axisValues: Record<string, number> = {};

  constructor(container: HTMLElement) {
    this.container = container;
    this.initDefaultAxes();
    this.render();
    this.listenToGlobalEvents();
  }

  private initDefaultAxes() {
    const family = this.getActiveFamily();
    this.axisValues = {};
    family.axes.forEach(axis => {
      this.axisValues[axis.tag] = axis.default;
    });
  }

  private getActiveFamily() {
    return TYPEFACE_FAMILIES.find(f => f.id === this.currentFamilyId) || TYPEFACE_FAMILIES[0];
  }

  private listenToGlobalEvents() {
    window.addEventListener('ks:familyChanged', ((e: CustomEvent) => {
      if (e.detail && e.detail.family && e.detail.family.id !== this.currentFamilyId) {
        this.currentFamilyId = e.detail.family.id;
        this.initDefaultAxes();
        this.render();
      }
    }) as EventListener);

    window.addEventListener('ks:selectTestDriveFont', ((e: CustomEvent) => {
      if (e.detail && e.detail.fontId) {
        this.currentFamilyId = e.detail.fontId;
        this.initDefaultAxes();
        this.render();
        const testSection = document.getElementById('test-drive');
        if (testSection) {
          testSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }) as EventListener);
  }

  private applyPreset(preset: 'poster' | 'editorial' | 'whisper') {
    const family = this.getActiveFamily();
    sound.playClick(850, 0.04);

    if (preset === 'poster') {
      this.fontSize = 140;
      this.lineHeight = 0.92;
      this.letterSpacing = -2;
      this.alignment = 'left';
      this.text = 'VARIABLE TYPE FOR RESTLESS BRANDS.';
      if (this.axisValues['wght'] !== undefined) this.axisValues['wght'] = family.axes.find(a => a.tag === 'wght')?.max || 900;
      if (this.axisValues['wdth'] !== undefined) this.axisValues['wdth'] = 140;
      if (this.axisValues['opsz'] !== undefined) this.axisValues['opsz'] = 144;
      if (this.axisValues['WONK'] !== undefined) this.axisValues['WONK'] = 1;
      if (this.axisValues['CASL'] !== undefined) this.axisValues['CASL'] = 1;
    } else if (preset === 'editorial') {
      this.fontSize = 44;
      this.lineHeight = 1.3;
      this.letterSpacing = 0;
      this.alignment = 'left';
      this.text = 'The product is the interface. Typography should demonstrate its own capabilities rather than being represented through static promotional graphics.';
      if (this.axisValues['wght'] !== undefined) this.axisValues['wght'] = 450;
      if (this.axisValues['wdth'] !== undefined) this.axisValues['wdth'] = 100;
      if (this.axisValues['opsz'] !== undefined) this.axisValues['opsz'] = 48;
      if (this.axisValues['WONK'] !== undefined) this.axisValues['WONK'] = 0.3;
      if (this.axisValues['CASL'] !== undefined) this.axisValues['CASL'] = 0.4;
    } else if (preset === 'whisper') {
      this.fontSize = 20;
      this.lineHeight = 1.6;
      this.letterSpacing = 4;
      this.alignment = 'left';
      this.text = 'AWS SCD 2026 // PUNE EDITION // 300+ BUILDERS // 127.0.0.1 -> GLOBAL SCALE & AI // ALL RIGHTS RESERVED';
      if (this.axisValues['wght'] !== undefined) this.axisValues['wght'] = family.axes.find(a => a.tag === 'wght')?.min || 200;
      if (this.axisValues['wdth'] !== undefined) this.axisValues['wdth'] = 90;
      if (this.axisValues['opsz'] !== undefined) this.axisValues['opsz'] = 14;
      if (this.axisValues['WONK'] !== undefined) this.axisValues['WONK'] = 0;
      if (this.axisValues['CASL'] !== undefined) this.axisValues['CASL'] = 0;
    }

    this.render();
  }

  private resetDefaults() {
    sound.playClick(500, 0.05);
    this.fontSize = 120;
    this.lineHeight = 1.0;
    this.letterSpacing = 0;
    this.alignment = 'left';
    this.text = 'SPHINX OF BLACK QUARTZ, JUDGE MY VOW.';
    this.initDefaultAxes();
    this.render();
  }

  private getVariationString(): string {
    const family = this.getActiveFamily();
    return family.axes.map(axis => {
      const val = this.axisValues[axis.tag] ?? axis.default;
      return `'${axis.tag}' ${val}`;
    }).join(', ');
  }

  private render() {
    const family = this.getActiveFamily();
    const variationCSS = this.getVariationString();

    this.container.innerHTML = `
      <div class="tester-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">(04) Test Drive</span>
          <h2 class="section-headline">No license required. Yet.</h2>
          <p class="section-sub">Type anything directly onto the specimen canvas. Drag variable axes to test extreme optical limits.</p>
        </div>

        <div class="tester-workbench ${this.isDarkCanvas ? 'is-dark-theme' : ''}">
          <!-- Top Control Toolbar -->
          <div class="tester-toolbar">
            <!-- Left: Family Buttons -->
            <div class="toolbar-group family-switcher" role="radiogroup" aria-label="Select Typeface Family">
              ${TYPEFACE_FAMILIES.map(f => `
                <button 
                  class="btn-tool-tab ${f.id === this.currentFamilyId ? 'is-active' : ''}" 
                  data-font-id="${f.id}" 
                  style="font-family: ${f.fontFamily}">
                  ${f.name}
                </button>
              `).join('')}
            </div>

            <!-- Middle: Presets -->
            <div class="toolbar-group preset-pills">
              <span class="tool-label mono">PRESETS:</span>
              <button class="btn-preset-pill mono" data-preset="poster">POSTER (140PX)</button>
              <button class="btn-preset-pill mono" data-preset="editorial">EDITORIAL (44PX)</button>
              <button class="btn-preset-pill mono" data-preset="whisper">WHISPER (20PX)</button>
            </div>

            <!-- Right: Quick Canvas Actions -->
            <div class="toolbar-group canvas-actions mono">
              <button class="btn-tool-icon" id="toggle-canvas-theme" title="Invert Canvas Colors">
                ${this.isDarkCanvas ? '[LIGHT CANVAS]' : '[DARK CANVAS]'}
              </button>
              <button class="btn-tool-icon" id="tester-reset-btn" title="Reset all specimen controls to default">
                [RESET]
              </button>
            </div>
          </div>

          <!-- Secondary Sliders Strip: Font Size, Line Height, Tracking, Alignment -->
          <div class="tester-sliders-strip mono">
            <div class="strip-control">
              <label>SIZE: <span id="font-size-val">${this.fontSize}px</span></label>
              <input type="range" id="font-size-slider" min="16" max="220" step="1" value="${this.fontSize}">
            </div>

            <div class="strip-control">
              <label>LEADING: <span id="line-height-val">${this.lineHeight.toFixed(2)}</span></label>
              <input type="range" id="line-height-slider" min="0.8" max="2.0" step="0.05" value="${this.lineHeight}">
            </div>

            <div class="strip-control">
              <label>TRACKING: <span id="letter-spacing-val">${this.letterSpacing}px</span></label>
              <input type="range" id="letter-spacing-slider" min="-6" max="20" step="1" value="${this.letterSpacing}">
            </div>

            <div class="strip-control align-control">
              <label>ALIGN:</label>
              <div class="align-btn-group">
                <button class="align-btn ${this.alignment === 'left' ? 'is-active' : ''}" data-align="left">L</button>
                <button class="align-btn ${this.alignment === 'center' ? 'is-active' : ''}" data-align="center">C</button>
                <button class="align-btn ${this.alignment === 'right' ? 'is-active' : ''}" data-align="right">R</button>
                <button class="align-btn ${this.alignment === 'justify' ? 'is-active' : ''}" data-align="justify">J</button>
              </div>
            </div>
          </div>

          <!-- Dynamic Axis Sliders Bar (Tailored specifically to active font axes) -->
          <div class="tester-axes-tray">
            <div class="tray-header mono">
              <span class="tray-title">${family.name.toUpperCase()} VARIABLE AXIS CONTROLS:</span>
              <span class="tray-hint">Real-time CSS font-variation-settings interpolation</span>
            </div>
            <div class="axes-grid">
              ${family.axes.map(axis => {
                const currentVal = this.axisValues[axis.tag] ?? axis.default;
                return `
                  <div class="axis-slider-box mono">
                    <div class="box-top">
                      <span class="axis-name">${axis.name}</span>
                      <span class="axis-tag-code">[${axis.tag}]</span>
                      <span class="axis-current-val" id="axis-val-${axis.tag}">${currentVal}${axis.unit || ''}</span>
                    </div>
                    <input 
                      type="range" 
                      class="tester-axis-slider"
                      data-tag="${axis.tag}"
                      min="${axis.min}" 
                      max="${axis.max}" 
                      step="${axis.step}" 
                      value="${currentVal}">
                    <div class="box-bounds">
                      <span>${axis.min}${axis.unit || ''}</span>
                      <span>${axis.max}${axis.unit || ''}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Live Editable Text Specimen Area -->
          <div class="tester-stage-wrapper">
            <div 
              class="tester-editable-canvas"
              id="tester-canvas"
              contenteditable="true"
              spellcheck="false"
              style="
                font-family: ${family.fontFamily};
                font-size: ${this.fontSize}px;
                line-height: ${this.lineHeight};
                letter-spacing: ${this.letterSpacing}px;
                text-align: ${this.alignment};
                font-variation-settings: ${variationCSS};
              ">${this.text}</div>
          </div>

          <!-- Live CSS Code Snippet & Copy Bar -->
          <div class="tester-code-export mono">
            <div class="code-preview-block">
              <span class="code-prefix">CSS EXPORT:</span>
              <code id="css-snippet">font-family: ${family.fontFamily}; font-variation-settings: ${variationCSS};</code>
            </div>
            <button class="btn-copy-css" id="btn-copy-css">
              <span id="copy-label">COPY CSS SNIPPET</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private updateCanvasStyles() {
    const family = this.getActiveFamily();
    const canvas = this.container.querySelector<HTMLElement>('#tester-canvas');
    const cssCode = this.container.querySelector<HTMLElement>('#css-snippet');
    const variationCSS = this.getVariationString();

    if (canvas) {
      canvas.style.fontFamily = family.fontFamily;
      canvas.style.fontSize = `${this.fontSize}px`;
      canvas.style.lineHeight = `${this.lineHeight}`;
      canvas.style.letterSpacing = `${this.letterSpacing}px`;
      canvas.style.textAlign = this.alignment;
      canvas.style.fontVariationSettings = variationCSS;
    }

    if (cssCode) {
      cssCode.textContent = `font-family: ${family.fontFamily}; font-variation-settings: ${variationCSS};`;
    }
  }

  private attachEvents() {
    // Family switcher
    const famBtns = this.container.querySelectorAll<HTMLButtonElement>('.family-switcher .btn-tool-tab');
    famBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-font-id');
        if (id && id !== this.currentFamilyId) {
          this.currentFamilyId = id;
          this.initDefaultAxes();
          sound.playClick(600, 0.04);
          this.render();
        }
      });
    });

    // Preset pills
    const presetBtns = this.container.querySelectorAll<HTMLButtonElement>('.btn-preset-pill');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const p = btn.getAttribute('data-preset') as 'poster' | 'editorial' | 'whisper';
        if (p) this.applyPreset(p);
      });
    });

    // Theme toggle
    const themeBtn = this.container.querySelector<HTMLButtonElement>('#toggle-canvas-theme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        this.isDarkCanvas = !this.isDarkCanvas;
        sound.playClick(750, 0.03);
        const wb = this.container.querySelector('.tester-workbench');
        if (wb) wb.classList.toggle('is-dark-theme', this.isDarkCanvas);
        themeBtn.textContent = this.isDarkCanvas ? '[LIGHT CANVAS]' : '[DARK CANVAS]';
      });
    }

    // Reset button
    const resetBtn = this.container.querySelector<HTMLButtonElement>('#tester-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetDefaults());
    }

    // Size slider
    const sizeSlider = this.container.querySelector<HTMLInputElement>('#font-size-slider');
    const sizeVal = this.container.querySelector('#font-size-val');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', () => {
        this.fontSize = Number(sizeSlider.value);
        if (sizeVal) sizeVal.textContent = `${this.fontSize}px`;
        sound.playClick(600 + this.fontSize * 1.5, 0.01);
        this.updateCanvasStyles();
      });
    }

    // Line height slider
    const lhSlider = this.container.querySelector<HTMLInputElement>('#line-height-slider');
    const lhVal = this.container.querySelector('#line-height-val');
    if (lhSlider) {
      lhSlider.addEventListener('input', () => {
        this.lineHeight = Number(lhSlider.value);
        if (lhVal) lhVal.textContent = this.lineHeight.toFixed(2);
        this.updateCanvasStyles();
      });
    }

    // Letter spacing slider
    const lsSlider = this.container.querySelector<HTMLInputElement>('#letter-spacing-slider');
    const lsVal = this.container.querySelector('#letter-spacing-val');
    if (lsSlider) {
      lsSlider.addEventListener('input', () => {
        this.letterSpacing = Number(lsSlider.value);
        if (lsVal) lsVal.textContent = `${this.letterSpacing}px`;
        this.updateCanvasStyles();
      });
    }

    // Alignment buttons
    const alignBtns = this.container.querySelectorAll<HTMLButtonElement>('.align-btn');
    alignBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const align = btn.getAttribute('data-align') as 'left' | 'center' | 'right' | 'justify';
        if (align) {
          this.alignment = align;
          alignBtns.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          sound.playClick(680, 0.02);
          this.updateCanvasStyles();
        }
      });
    });

    // Dynamic Axis sliders
    const axisSliders = this.container.querySelectorAll<HTMLInputElement>('.tester-axis-slider');
    const family = this.getActiveFamily();
    axisSliders.forEach(slider => {
      const tag = slider.getAttribute('data-tag');
      if (!tag) return;
      slider.addEventListener('input', () => {
        const val = Number(slider.value);
        this.axisValues[tag] = val;
        const valSpan = this.container.querySelector(`#axis-val-${tag}`);
        const axisObj = family.axes.find(a => a.tag === tag);
        if (valSpan) {
          valSpan.textContent = `${val}${axisObj?.unit || ''}`;
        }
        sound.playClick(700 + val * 0.3, 0.01);
        this.updateCanvasStyles();
      });
    });

    // Editable canvas text typing sound
    const canvas = this.container.querySelector<HTMLElement>('#tester-canvas');
    if (canvas) {
      canvas.addEventListener('input', () => {
        this.text = canvas.innerText;
        sound.playTypewriter(Math.random() * 200 + 400);
      });
    }

    // Copy CSS snippet
    const copyBtn = this.container.querySelector<HTMLButtonElement>('#btn-copy-css');
    const copyLabel = this.container.querySelector<HTMLElement>('#copy-label');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const code = this.container.querySelector<HTMLElement>('#css-snippet')?.innerText;
        if (code) {
          try {
            await navigator.clipboard.writeText(code);
            sound.playSuccess();
            if (copyLabel) copyLabel.textContent = 'COPIED TO CLIPBOARD [OK]';
            setTimeout(() => {
              if (copyLabel) copyLabel.textContent = 'COPY CSS SNIPPET';
            }, 2500);
          } catch {
            if (copyLabel) copyLabel.textContent = 'SELECT & COPY MANUALLY';
          }
        }
      });
    }
  }
}
