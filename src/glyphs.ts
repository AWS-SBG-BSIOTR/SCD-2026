import { GlyphMetric } from './types';
import { TYPEFACE_FAMILIES } from './families';
import { sound } from './audio';

export class GlyphsController {
  private container: HTMLElement;
  private currentCategory: 'uppercase' | 'lowercase' | 'numeral' | 'symbol' = 'uppercase';
  private selectedChar: string = 'A';
  private currentFamilyId: string = 'ks-elastik';
  private glyphWeight: number = 700;
  private glyphWidth: number = 100;

  private glyphDatabase: Record<string, GlyphMetric> = {};

  constructor(container: HTMLElement) {
    this.container = container;
    this.initDatabase();
    this.render();
    this.listenToGlobalEvents();
  }

  private initDatabase() {
    // Populate letters, numbers and symbols with metrics
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    upper.forEach((char) => {
      this.glyphDatabase[char] = {
        char,
        name: `LATIN CAPITAL LETTER ${char}`,
        unicode: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
        category: 'uppercase',
        advanceWidth: 620 + ((char.charCodeAt(0) * 17) % 180),
        leftBearing: 48,
        rightBearing: 52,
        ascender: 800,
        capHeight: 720,
        xHeight: 520,
        baseline: 0,
        descender: -220
      };
    });

    const lower = 'abcdefghijklmnopqrstuvwxyz'.split('');
    lower.forEach((char) => {
      const hasAscender = 'bdfhkl'.includes(char);
      const hasDescender = 'gjpqy'.includes(char);
      this.glyphDatabase[char] = {
        char,
        name: `LATIN SMALL LETTER ${char.toUpperCase()}`,
        unicode: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
        category: 'lowercase',
        advanceWidth: 510 + ((char.charCodeAt(0) * 13) % 150),
        leftBearing: 42,
        rightBearing: 46,
        ascender: hasAscender ? 800 : 520,
        capHeight: 720,
        xHeight: 520,
        baseline: 0,
        descender: hasDescender ? -220 : 0
      };
    });

    const nums = '0123456789'.split('');
    nums.forEach((char) => {
      this.glyphDatabase[char] = {
        char,
        name: `DIGIT ${char}`,
        unicode: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
        category: 'numeral',
        advanceWidth: 560,
        leftBearing: 50,
        rightBearing: 50,
        ascender: 720,
        capHeight: 720,
        xHeight: 520,
        baseline: 0,
        descender: 0
      };
    });

    const syms = ['&', '%', '$', '@', '!', '?', '¶', '©', '+', '=', '<', '>', '¢', '£', '¥', '§', '/', '#', '*', '—'];
    syms.forEach((char) => {
      this.glyphDatabase[char] = {
        char,
        name: `SYMBOL ${char}`,
        unicode: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`,
        category: 'symbol',
        advanceWidth: 580,
        leftBearing: 40,
        rightBearing: 40,
        ascender: 760,
        capHeight: 720,
        xHeight: 520,
        baseline: 0,
        descender: -180
      };
    });
  }

  private listenToGlobalEvents() {
    window.addEventListener('ks:familyChanged', ((e: CustomEvent) => {
      if (e.detail && e.detail.family) {
        this.currentFamilyId = e.detail.family.id;
        this.updateLoupe();
      }
    }) as EventListener);
  }

  private getActiveFamily() {
    return TYPEFACE_FAMILIES.find(f => f.id === this.currentFamilyId) || TYPEFACE_FAMILIES[0];
  }

  private render() {
    const family = this.getActiveFamily();
    const metric = this.glyphDatabase[this.selectedChar] || this.glyphDatabase['A'];

    const filteredChars = Object.values(this.glyphDatabase).filter(g => g.category === this.currentCategory);

    this.container.innerHTML = `
      <div class="glyphs-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">(03) Glyphs</span>
          <h2 class="section-headline">Glyphs under the loupe</h2>
          <p class="section-sub">Hover or tap any glyph to inspect its anatomical proportions, metric baselines, and vector contours.</p>
        </div>

        <div class="glyph-loupe-layout">
          <!-- Left Column: The Interactive Loupe Inspector -->
          <div class="loupe-stage-container">
            <div class="loupe-hud-bar mono">
              <span class="hud-target">INSPECTOR: <strong>${metric.name}</strong></span>
              <span class="hud-unicode">${metric.unicode}</span>
            </div>

            <!-- The Visual Loupe with Typographic Metric Guide Lines -->
            <div class="loupe-canvas-frame" id="loupe-canvas-frame">
              <!-- Metric Guide Overlays -->
              <div class="metric-line line-ascender" title="Ascender (+800)">
                <span class="metric-label mono">ASCENDER (+800)</span>
              </div>
              <div class="metric-line line-capheight" title="Cap Height (+720)">
                <span class="metric-label mono">CAP HEIGHT (+720)</span>
              </div>
              <div class="metric-line line-xheight" title="x-Height (+520)">
                <span class="metric-label mono">x-HEIGHT (+520)</span>
              </div>
              <div class="metric-line line-baseline" title="Baseline (0)">
                <span class="metric-label mono">BASELINE (0)</span>
              </div>
              <div class="metric-line line-descender" title="Descender (-220)">
                <span class="metric-label mono">DESCENDER (-220)</span>
              </div>

              <!-- Center Giant Inspected Glyph -->
              <div class="inspected-glyph-display" 
                   id="inspected-glyph"
                   style="font-family: ${family.fontFamily}; font-variation-settings: 'wght' ${this.glyphWeight}, 'wdth' ${this.glyphWidth};">
                ${metric.char}
              </div>
            </div>

            <!-- Telemetry Metrics Readout Table -->
            <div class="loupe-telemetry-grid mono">
              <div class="tele-item">
                <span class="lbl">GLYPH</span>
                <span class="val" id="tele-char">${metric.char}</span>
              </div>
              <div class="tele-item">
                <span class="lbl">UNICODE</span>
                <span class="val" id="tele-uni">${metric.unicode}</span>
              </div>
              <div class="tele-item">
                <span class="lbl">ADVANCE</span>
                <span class="val" id="tele-adv">${metric.advanceWidth} UPM</span>
              </div>
              <div class="tele-item">
                <span class="lbl">LEFT BEARING</span>
                <span class="val" id="tele-lsb">${metric.leftBearing} UPM</span>
              </div>
              <div class="tele-item">
                <span class="lbl">RIGHT BEARING</span>
                <span class="val" id="tele-rsb">${metric.rightBearing} UPM</span>
              </div>
              <div class="tele-item">
                <span class="lbl">ACTIVE FAMILY</span>
                <span class="val" id="tele-family">${family.name}</span>
              </div>
            </div>

            <!-- Weight / Width Real-time Scrubber for the Loupe -->
            <div class="loupe-slider-row mono">
              <div class="scrub-item">
                <label>GLYPH WEIGHT: <span id="loupe-wght-val">${this.glyphWeight}</span></label>
                <input type="range" id="loupe-wght-slider" min="100" max="1000" step="10" value="${this.glyphWeight}">
              </div>
              <div class="scrub-item">
                <label>GLYPH WIDTH: <span id="loupe-wdth-val">${this.glyphWidth}%</span></label>
                <input type="range" id="loupe-wdth-slider" min="25" max="151" step="1" value="${this.glyphWidth}">
              </div>
            </div>
          </div>

          <!-- Right Column: Character Grid & Categories -->
          <div class="glyph-grid-container">
            <div class="grid-controls-header">
              <div class="category-tabs" role="tablist">
                <button class="cat-btn ${this.currentCategory === 'uppercase' ? 'is-active' : ''}" data-cat="uppercase">A-Z UPPERCASE</button>
                <button class="cat-btn ${this.currentCategory === 'lowercase' ? 'is-active' : ''}" data-cat="lowercase">a-z LOWERCASE</button>
                <button class="cat-btn ${this.currentCategory === 'numeral' ? 'is-active' : ''}" data-cat="numeral">0-9 NUMERALS</button>
                <button class="cat-btn ${this.currentCategory === 'symbol' ? 'is-active' : ''}" data-cat="symbol">SYMBOLS & PUNCT</button>
              </div>

              <!-- Quick Family Switcher for Glyph Grid -->
              <div class="glyph-family-selector mono">
                <span>SPECIMEN:</span>
                <select id="glyph-family-select" class="brutalist-select">
                  ${TYPEFACE_FAMILIES.map(f => `
                    <option value="${f.id}" ${f.id === this.currentFamilyId ? 'selected' : ''}>${f.name} (${f.personality})</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- The Grid of Glyphs -->
            <div class="characters-matrix" role="grid" aria-label="Characters Matrix">
              ${filteredChars.map(g => {
                const isSelected = g.char === this.selectedChar;
                return `
                  <button 
                    class="char-cell ${isSelected ? 'is-selected' : ''}" 
                    style="font-family: ${family.fontFamily}"
                    data-char="${g.char}"
                    title="${g.name} (${g.unicode})"
                    aria-label="${g.name}">
                    <span class="cell-glyph">${g.char}</span>
                    <span class="cell-sub mono">${g.unicode.replace('U+', '')}</span>
                  </button>
                `;
              }).join('')}
            </div>

            <div class="grid-footer-hint mono">
              <span>TIP: Click any cell to lock inspection. Hovering reveals instant metrics.</span>
              <span>TOTAL GLYPHS: 256+ PER OTF/WOFF2 MASTER</span>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private updateLoupe() {
    const family = this.getActiveFamily();
    const metric = this.glyphDatabase[this.selectedChar] || this.glyphDatabase['A'];

    const glyphDisplay = this.container.querySelector<HTMLElement>('#inspected-glyph');
    if (glyphDisplay) {
      glyphDisplay.textContent = metric.char;
      glyphDisplay.style.fontFamily = family.fontFamily;
      glyphDisplay.style.fontVariationSettings = `'wght' ${this.glyphWeight}, 'wdth' ${this.glyphWidth}`;
    }

    const teleChar = this.container.querySelector('#tele-char');
    const teleUni = this.container.querySelector('#tele-uni');
    const teleAdv = this.container.querySelector('#tele-adv');
    const teleLsb = this.container.querySelector('#tele-lsb');
    const teleRsb = this.container.querySelector('#tele-rsb');
    const teleFamily = this.container.querySelector('#tele-family');

    if (teleChar) teleChar.textContent = metric.char;
    if (teleUni) teleUni.textContent = metric.unicode;
    if (teleAdv) teleAdv.textContent = `${metric.advanceWidth} UPM`;
    if (teleLsb) teleLsb.textContent = `${metric.leftBearing} UPM`;
    if (teleRsb) teleRsb.textContent = `${metric.rightBearing} UPM`;
    if (teleFamily) teleFamily.textContent = family.name;

    const hudTarget = this.container.querySelector('.hud-target strong');
    const hudUni = this.container.querySelector('.hud-unicode');
    if (hudTarget) hudTarget.textContent = metric.name;
    if (hudUni) hudUni.textContent = metric.unicode;
  }

  private attachEvents() {
    // Category tabs
    const catButtons = this.container.querySelectorAll<HTMLButtonElement>('.cat-btn');
    catButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat') as 'uppercase' | 'lowercase' | 'numeral' | 'symbol';
        if (cat && cat !== this.currentCategory) {
          this.currentCategory = cat;
          sound.playClick(720, 0.03);
          // auto pick first char in new category
          const firstInCat = Object.values(this.glyphDatabase).find(g => g.category === cat);
          if (firstInCat) {
            this.selectedChar = firstInCat.char;
          }
          this.render();
        }
      });
    });

    // Family select dropdown
    const select = this.container.querySelector<HTMLSelectElement>('#glyph-family-select');
    if (select) {
      select.addEventListener('change', () => {
        this.currentFamilyId = select.value;
        sound.playClick(600, 0.03);
        this.render();
      });
    }

    // Character cell clicks and hovers
    const cells = this.container.querySelectorAll<HTMLButtonElement>('.char-cell');
    cells.forEach(cell => {
      const char = cell.getAttribute('data-char');
      if (!char) return;

      cell.addEventListener('click', () => {
        this.selectedChar = char;
        cells.forEach(c => c.classList.remove('is-selected'));
        cell.classList.add('is-selected');
        sound.playClick(850 + char.charCodeAt(0) * 2, 0.03);
        this.updateLoupe();
      });

      cell.addEventListener('mouseenter', () => {
        this.selectedChar = char;
        cells.forEach(c => c.classList.remove('is-selected'));
        cell.classList.add('is-selected');
        sound.playClick(1000, 0.008);
        this.updateLoupe();
      });
    });

    // Loupe weight & width sliders
    const wghtSlider = this.container.querySelector<HTMLInputElement>('#loupe-wght-slider');
    const wdthSlider = this.container.querySelector<HTMLInputElement>('#loupe-wdth-slider');
    const wghtVal = this.container.querySelector('#loupe-wght-val');
    const wdthVal = this.container.querySelector('#loupe-wdth-val');

    if (wghtSlider) {
      wghtSlider.addEventListener('input', () => {
        this.glyphWeight = Number(wghtSlider.value);
        if (wghtVal) wghtVal.textContent = String(this.glyphWeight);
        sound.playClick(600 + this.glyphWeight * 0.4, 0.01);
        this.updateLoupe();
      });
    }

    if (wdthSlider) {
      wdthSlider.addEventListener('input', () => {
        this.glyphWidth = Number(wdthSlider.value);
        if (wdthVal) wdthVal.textContent = `${this.glyphWidth}%`;
        sound.playClick(800 + this.glyphWidth * 2, 0.01);
        this.updateLoupe();
      });
    }
  }
}
