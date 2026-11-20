import { TypefaceFamily } from './types';
import { sound } from './audio';

export const TYPEFACE_FAMILIES: TypefaceFamily[] = [
  {
    id: 'ks-elastik',
    name: 'AWS Elastik',
    year: '2019',
    personality: 'Stretch',
    fontFamily: "'Roboto Flex', -apple-system, sans-serif",
    tagline: 'A kinetic sans serif that moves from ultra-condensed to ultra-wide.',
    description: 'Designed as an elastic typographic membrane for high-impact editorial headlines, kinetic branding, and dynamic signage. Interpolates seamlessly across 5 geometric and optical axes without losing structural equilibrium.',
    heroSpecimen: 'ELASTICITY IS A FUNCTION OF TENSION',
    samplePangram: 'PACK MY BOX WITH FIVE DOZEN LIQUOR JUGS',
    axes: [
      { tag: 'wght', name: 'Weight', min: 100, max: 1000, default: 700, step: 10, description: 'Thin to Black stroke width' },
      { tag: 'wdth', name: 'Width', min: 25, max: 151, default: 110, step: 1, unit: '%', description: 'Ultra-condensed to ultra-expanded' },
      { tag: 'opsz', name: 'Optical Size', min: 8, max: 144, default: 96, step: 1, unit: 'pt', description: 'Micro-text to monumental display' },
      { tag: 'slnt', name: 'Slant', min: -10, max: 0, default: 0, step: 1, unit: '°', description: 'Upright to forward oblique angle' },
      { tag: 'GRAD', name: 'Grade', min: -200, max: 150, default: 0, step: 5, description: 'Weight adjustment without reflow' }
    ],
    applications: ['Festival poster', 'Transport signage', 'Exhibition identity']
  },
  {
    id: 'ks-morrow',
    name: 'AWS Morrow',
    year: '2021',
    personality: 'Honey',
    fontFamily: "'Fraunces', Georgia, serif",
    tagline: 'A warm, soft serif with intentionally irregular, human characteristics.',
    description: 'Inspired by early 20th-century packaging, vernacular hand-painted signboards, and expressive French display lettering. Features exaggerated teardrop terminals, variable corner softness, and an intentional "wonk" axis that injects charming vernacular idiosyncrasies.',
    heroSpecimen: 'SUBTLE IRREGULARITIES PRODUCE TIMELESS WARMTH',
    samplePangram: 'Sphinx of black quartz, judge my vow.',
    axes: [
      { tag: 'wght', name: 'Weight', min: 100, max: 900, default: 600, step: 10, description: 'Delicate hair-stroke to rich slab serif' },
      { tag: 'opsz', name: 'Optical Size', min: 9, max: 144, default: 72, step: 1, unit: 'pt', description: 'Refined book text to voluptuous headlines' },
      { tag: 'SOFT', name: 'Softness', min: 0, max: 100, default: 50, step: 1, unit: '%', description: 'Sharp crisp chiseling to melted fluid terminals' },
      { tag: 'WONK', name: 'Wonkiness', min: 0, max: 1, default: 0.8, step: 0.05, description: 'Clean geometry to organic vernacular quirk' }
    ],
    applications: ['Literary magazine cover', 'Small-batch vermouth label', 'Editorial book jacket']
  },
  {
    id: 'ks-relay',
    name: 'AWS Relay',
    year: '2024',
    personality: 'Off duty',
    fontFamily: "'Recursive', 'Space Mono', monospace",
    tagline: 'A technical monospace design with casual, handwritten characteristics.',
    description: 'Bridges the sterile discipline of code telemetry and the warm spontaneity of informal script. Shift from strict fixed-width monospace into relaxed proportional cursive with continuous sliders for casualness, cursive stroke connections, and slant.',
    heroSpecimen: 'MONOSPACE WITH A HUMAN HANDWRITING HEARTBEAT',
    samplePangram: '0123456789 — [DEBUG] 1013.25 hPa LAT 52.5° N',
    axes: [
      { tag: 'wght', name: 'Weight', min: 300, max: 1000, default: 500, step: 10, description: 'Light code line to heavy terminal punch' },
      { tag: 'CASL', name: 'Casual', min: 0, max: 1, default: 0.65, step: 0.05, description: 'Formal mechanical to brush-drawn brushwork' },
      { tag: 'CRSV', name: 'Cursive', min: 0, max: 1, default: 0.5, step: 0.05, description: 'Disconnected glyphs to flowing script' },
      { tag: 'MONO', name: 'Monospace', min: 0, max: 1, default: 1, step: 0.05, description: 'Strict tabular columns to proportional flow' },
      { tag: 'slnt', name: 'Slant', min: -15, max: 0, default: -5, step: 1, unit: '°', description: 'Dynamic cursive forward lean' }
    ],
    applications: ['Weather telemetry HUD', 'Technical cocktail recipe', 'Financial terminal typography']
  }
];

export class FamiliesController {
  private activeFamilyId: string = 'ks-elastik';
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  public getActiveFamily(): TypefaceFamily {
    return TYPEFACE_FAMILIES.find(f => f.id === this.activeFamilyId) || TYPEFACE_FAMILIES[0];
  }

  public setActiveFamily(id: string) {
    this.activeFamilyId = id;
    this.render();
    sound.playClick(650, 0.04);

    // Notify any other components (like glyph inspector or font tester)
    const event = new CustomEvent('ks:familyChanged', { detail: { family: this.getActiveFamily() } });
    window.dispatchEvent(event);
  }

  private render() {
    const active = this.getActiveFamily();

    this.container.innerHTML = `
      <div class="families-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">(02) Typefaces</span>
          <h2 class="section-headline">Three families. No static.</h2>
          <p class="section-sub">Each family is supplied as a single, master-interpolated variable font file containing all axes and weights.</p>
        </div>

        <!-- Family Selection Tabs -->
        <div class="family-nav-pills" role="tablist" aria-label="Typeface Families">
          ${TYPEFACE_FAMILIES.map(family => {
      const isSelected = family.id === this.activeFamilyId;
      return `
              <button 
                class="family-tab-btn ${isSelected ? 'is-active' : ''}" 
                role="tab" 
                aria-selected="${isSelected}"
                data-family-id="${family.id}">
                <div class="tab-top">
                  <span class="tab-year mono">${family.year}</span>
                  <span class="tab-badge">${family.personality}</span>
                </div>
                <div class="tab-title" style="font-family: ${family.fontFamily}">${family.name}</div>
                <div class="tab-axes mono">${family.axes.length} AXES · ${family.axes.map(a => a.tag).join('/')}</div>
              </button>
            `;
    }).join('')}
        </div>

        <!-- Active Family Showcase Card -->
        <div class="family-detail-card" style="font-family: ${active.fontFamily}">
          <div class="family-detail-header">
            <div class="header-left">
              <span class="active-personality mono">PERSONALITY: [${active.personality.toUpperCase()}]</span>
              <h3 class="active-family-title">${active.name}</h3>
              <p class="active-family-tagline">${active.tagline}</p>
            </div>
            <div class="header-right">
              <div class="axis-pill-list">
                <span class="axis-pill-label mono">VARIABLE AXES:</span>
                ${active.axes.map(axis => `
                  <span class="axis-chip mono" title="${axis.name} (${axis.min} -> ${axis.max})">
                    <strong>${axis.tag}</strong>
                    <span>${axis.min}..${axis.max}</span>
                  </span>
                `).join('')}
              </div>
              <div class="cta-actions">
                <a href="#test-drive" class="btn-brutalist btn-accent test-font-btn" data-font="${active.id}">
                  Test Drive ${active.name} ->
                </a>
                <a href="#licensing" class="btn-brutalist btn-secondary license-font-btn" data-font="${active.id}">
                  Configure License
                </a>
              </div>
            </div>
          </div>

          <!-- Hero Display Waterfall for the Selected Family -->
          <div class="waterfall-specimen">
            <div class="waterfall-row row-giant">
              <div class="row-meta mono">140px / HERO</div>
              <div class="waterfall-text" style="font-size: clamp(48px, 11vw, 130px); line-height: 0.9; font-variation-settings: ${this.getVariationString(active, 1.0)};">
                ${active.heroSpecimen}
              </div>
            </div>

            <div class="waterfall-row row-medium">
              <div class="row-meta mono">54px / DISPLAY</div>
              <div class="waterfall-text" style="font-size: clamp(28px, 5vw, 54px); font-variation-settings: ${this.getVariationString(active, 0.7)};">
                Sphinx of black quartz, judge my vow. 0123456789
              </div>
            </div>

            <div class="waterfall-row row-body">
              <div class="row-meta mono">20px / EDITORIAL</div>
              <div class="waterfall-text body-specimen" style="font-size: clamp(16px, 1.8vw, 20px); font-variation-settings: ${this.getVariationString(active, 0.4)};">
                ${active.description}
              </div>
            </div>
          </div>

          <!-- Live Axis Scrub Strip for this card -->
          <div class="card-axis-scrubber">
            <div class="scrubber-header mono">
              <span>LIVE AXIS INTERPOLATION:</span>
              <span class="scrub-status">DRAG SLIDER TO ANIMATE ${active.name.toUpperCase()} SPECIMEN</span>
            </div>
            <div class="scrub-controls-row">
              ${active.axes.map(axis => `
                <div class="mini-slider-control">
                  <div class="slider-labels mono">
                    <span class="tag-title">${axis.name} (${axis.tag})</span>
                    <span class="val-display" id="val-${active.id}-${axis.tag}">${axis.default}${axis.unit || ''}</span>
                  </div>
                  <input 
                    type="range" 
                    class="axis-range-input" 
                    data-tag="${axis.tag}" 
                    data-family="${active.id}"
                    min="${axis.min}" 
                    max="${axis.max}" 
                    step="${axis.step}" 
                    value="${axis.default}">
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private getVariationString(family: TypefaceFamily, factor: number): string {
    return family.axes.map(axis => {
      let val = axis.default;
      if (axis.tag === 'wght') {
        val = Math.round(axis.min + (axis.max - axis.min) * factor);
      } else if (axis.tag === 'wdth') {
        val = Math.round(axis.min + (axis.max - axis.min) * (0.3 + 0.7 * factor));
      }
      return `'${axis.tag}' ${val}`;
    }).join(', ');
  }

  private attachEvents() {
    // Tab switching
    const buttons = this.container.querySelectorAll<HTMLButtonElement>('.family-tab-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-family-id');
        if (id && id !== this.activeFamilyId) {
          this.setActiveFamily(id);
        }
      });
    });

    // Test drive button shortcuts
    const testBtns = this.container.querySelectorAll<HTMLAnchorElement>('.test-font-btn');
    testBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const fontId = btn.getAttribute('data-font');
        if (fontId) {
          const ev = new CustomEvent('ks:selectTestDriveFont', { detail: { fontId } });
          window.dispatchEvent(ev);
        }
      });
    });

    // Card axis scrubbers
    const sliders = this.container.querySelectorAll<HTMLInputElement>('.axis-range-input');
    const waterfallRows = this.container.querySelectorAll<HTMLElement>('.waterfall-text');

    const updateSpecimens = () => {
      const active = this.getActiveFamily();
      const settings: string[] = [];

      sliders.forEach(slider => {
        const tag = slider.getAttribute('data-tag');
        const val = slider.value;
        const valDisplay = this.container.querySelector(`#val-${active.id}-${tag}`);
        const axisObj = active.axes.find(a => a.tag === tag);
        if (valDisplay) {
          valDisplay.textContent = `${val}${axisObj?.unit || ''}`;
        }
        if (tag) {
          settings.push(`'${tag}' ${val}`);
        }
      });

      const fullSetting = settings.join(', ');
      waterfallRows.forEach(row => {
        row.style.fontVariationSettings = fullSetting;
      });
    };

    sliders.forEach(slider => {
      slider.addEventListener('input', () => {
        sound.playClick(900 + Number(slider.value) * 0.5, 0.015);
        updateSpecimens();
      });
    });
  }
}
