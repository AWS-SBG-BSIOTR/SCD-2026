import { sound } from './audio';

export interface ApplicationMockup {
  id: string;
  category: string;
  title: string;
  typeface: string;
  axesUsed: string;
  demonstration: string;
  htmlContent: string;
}

export const APPLICATIONS: ApplicationMockup[] = [
  {
    id: 'app-festival',
    category: 'CULTURAL POSTER',
    title: 'Kinetic Frequencies Tokyo 2026',
    typeface: 'AWS Elastik',
    axesUsed: "wght: 950, wdth: 145%, opsz: 144",
    demonstration: 'Ultra-wide, monumental display lettering that grips the grid like steel architecture.',
    htmlContent: `
      <div class="mockup-poster-canvas">
        <div class="poster-grid-header mono">
          <span>SUMMIT 04 // TOKYO GINZA</span>
          <span>14-16 OCT 2026</span>
          <span>CURATED BY AWS SCD</span>
        </div>
        <div class="poster-giant-title">
          KINETIC<br/>SOUND
        </div>
        <div class="poster-subhead">
          AV AUDIOVISUAL EXPEDITION
        </div>
        <div class="poster-roster-grid mono">
          <div class="roster-col">
            <strong>HALL A / AMBIENT</strong>
            <p>01. TIM HECKER<br/>02. RYUJI IKEDA<br/>03. CATERINA BARBIERI</p>
          </div>
          <div class="roster-col">
            <strong>HALL B / MODULAR</strong>
            <p>04. APHEX TWIN<br/>05. ONEOHTRIX POINT NEVER<br/>06. SQUAREPUSHER</p>
          </div>
          <div class="roster-col">
            <strong>TICKETS / ADMISSION</strong>
            <p>DOORS 19:00 JST<br/>LIMITED RUN 1,200<br/>¥8,500 PASS</p>
          </div>
        </div>
        <div class="poster-footer-barcode">
          <div class="fake-barcode">||| | |||| || | ||||| ||| || |||||| || |</div>
          <span class="mono">AWS-ELASTIK-POSTER-SPEC-01</span>
        </div>
      </div>
    `
  },
  {
    id: 'app-magazine',
    category: 'EDITORIAL COVER',
    title: 'The Editorial Review · Issue 14',
    typeface: 'AWS Morrow',
    axesUsed: "wght: 520, opsz: 120, SOFT: 70%, WONK: 0.9",
    demonstration: 'Warm, tactile serif typography with organic teardrop terminals and wonky vernacular charm.',
    htmlContent: `
      <div class="mockup-magazine-canvas">
        <div class="mag-masthead-top mono">
          <span>PARIS · LONDON · BERLIN</span>
          <span>VOL. XIV · AUTUMN</span>
          <span>EUR €18 / USD $22</span>
        </div>
        <div class="mag-hero-title">
          The Solitude<br/>of Variable Letters
        </div>
        <div class="mag-author-line">
          An Essay on Digital Craft by AWS SCD Pune Team
        </div>
        <div class="mag-articles-list">
          <div class="mag-article-item">
            <span class="p-num mono">P. 48</span>
            <span class="p-title">Why Static Weights are Obsolete</span>
          </div>
          <div class="mag-article-item">
            <span class="p-num mono">P. 92</span>
            <span class="p-title">The Geometry of Optical Size</span>
          </div>
          <div class="mag-article-item">
            <span class="p-num mono">P. 140</span>
            <span class="p-title">Vernacular Signboards of the Jura</span>
          </div>
        </div>
        <div class="mag-footer mono">
          <span>ISSN 2940-1092</span>
          <span>PRINTED ON 140GSM MUNKEN PURE</span>
        </div>
      </div>
    `
  },
  {
    id: 'app-label',
    category: 'PACKAGING & LABEL',
    title: 'No. 09 Artisan Vermouth',
    typeface: 'AWS Morrow + AWS Relay',
    axesUsed: "Morrow (wght: 700, SOFT: 40%) & Relay (MONO: 1, CASL: 0.8)",
    demonstration: 'Dual-family synergy: rich display serif branding paired with precise technical apothecary coordinates.',
    htmlContent: `
      <div class="mockup-label-canvas">
        <div class="label-border-ornament">
          <div class="label-top-meta mono">
            <span>SMALL BATCH N° 09</span>
            <span>750 ML · 18.5% VOL</span>
          </div>
          <div class="label-brand-title">
            Wormwood & Gentian
          </div>
          <div class="label-subtitle mono">
            CRAFT DRY VERMOUTH DI TORINO
          </div>
          <div class="label-divider">--- * ---</div>
          <div class="label-botanicals mono">
            HERBAL MACERATION IN PIEDMONTESE CORTESE WINE.<br/>
            ARTEMISIA ABSINTHIUM · ORANGE PEEL · CLOVE · CARDAMOM
          </div>
          <div class="label-specs-table mono">
            <div>BOTTLE: 048 / 300</div>
            <div>HARVEST: 2025</div>
            <div>ORIGIN: PIEDMONT</div>
          </div>
        </div>
      </div>
    `
  },
  {
    id: 'app-weather',
    category: 'DIGITAL INTERFACE',
    title: 'Barometric Telemetry Interface',
    typeface: 'AWS Relay',
    axesUsed: "wght: 500, MONO: 1, CASL: 0.3, slnt: -5°",
    demonstration: 'Ultra-crisp structured telemetry display with strict column alignment and monospace tabular numerals.',
    htmlContent: `
      <div class="mockup-weather-canvas">
        <div class="telemetry-hud-header mono">
          <span class="pulse-indicator">● LIVE SENSOR 08</span>
          <span>HELSINKI ARCHIPELAGO</span>
          <span>UTC 14:28:09</span>
        </div>
        <div class="telemetry-big-num mono">
          1013.25 <span class="unit">hPa</span>
        </div>
        <div class="telemetry-readouts-grid mono">
          <div class="readout-cell">
            <span class="lbl">WIND VELOCITY</span>
            <span class="val">18.4 KTS NE [38°]</span>
          </div>
          <div class="readout-cell">
            <span class="lbl">SURFACE TEMP</span>
            <span class="val">+12.8°C (DEW 8.1°C)</span>
          </div>
          <div class="readout-cell">
            <span class="lbl">RELATIVE HUMIDITY</span>
            <span class="val">74.2% SATURATED</span>
          </div>
          <div class="readout-cell">
            <span class="lbl">BAROMETRIC TENDENCY</span>
            <span class="val">▲ +1.8 hPa / 3HR</span>
          </div>
        </div>
        <div class="telemetry-ascii-graph mono">
          [BARO: 1011 ───╱▔▔▔▔▔▔▔▔╲─── 1013.25]
        </div>
      </div>
    `
  },
  {
    id: 'app-signage',
    category: 'WAYFINDING SIGNAGE',
    title: 'Airport Transport Wayfinding',
    typeface: 'AWS Elastik',
    axesUsed: "wght: 850, wdth: 65% (Ultra-Condensed), opsz: 96",
    demonstration: 'Condensed, ultra-legible wayfinding signage built to pack vital navigational data into architectural overhead bands.',
    htmlContent: `
      <div class="mockup-signage-canvas">
        <div class="signage-top-accent"></div>
        <div class="signage-main-row">
          <div class="signage-gate-badge">T3</div>
          <div class="signage-destination">
            <div class="dest-headline">GATES 42–58</div>
            <div class="dest-sub mono">FLUGHAFEN BERLIN BRANDENBURG</div>
          </div>
          <div class="signage-arrow">-></div>
        </div>
        <div class="signage-bottom-icons mono">
          <span>[AIR] INTERNATIONAL DEPARTURES</span>
          <span>[BAG] BAGGAGE RECLAIM 3</span>
          <span>[RAIL] S-BAHN AIRPORT EXPRESS</span>
        </div>
      </div>
    `
  }
];

export class ApplicationsController {
  private container: HTMLElement;
  private activeMockupId: string = 'app-festival';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <div class="applications-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">(05) In Use</span>
          <h2 class="section-headline">Typefaces with day jobs.</h2>
          <p class="section-sub">No stock photos. Pure typographic compositions illustrating how our variable fonts solve real-world editorial, identity, and interface problems.</p>
        </div>

        <!-- Filter tabs for applications -->
        <div class="app-filter-tabs mono" role="tablist">
          ${APPLICATIONS.map(app => `
            <button 
              class="app-tab-btn ${app.id === this.activeMockupId ? 'is-active' : ''}" 
              data-app-id="${app.id}">
              <span class="tab-category">[${app.category}]</span>
              <span class="tab-font">${app.typeface}</span>
            </button>
          `).join('')}
        </div>

        <!-- Dynamic Stage for the Selected Application -->
        <div class="mockups-gallery-viewport">
          ${APPLICATIONS.map(app => {
            const isVisible = app.id === this.activeMockupId;
            return `
              <div class="app-mockup-slide ${isVisible ? 'is-active' : ''}" id="slide-${app.id}">
                <div class="slide-meta-bar mono">
                  <div class="meta-left">
                    <span class="tag-badge">${app.category}</span>
                    <strong class="title-bold">${app.title}</strong>
                  </div>
                  <div class="meta-right">
                    <span>FONT: <strong>${app.typeface}</strong></span>
                    <span>AXES: <code>${app.axesUsed}</code></span>
                  </div>
                </div>

                <div class="mockup-visual-wrapper">
                  ${app.htmlContent}
                </div>

                <div class="slide-footer-explainer mono">
                  <span class="note-bullet">// DEMONSTRATION:</span>
                  <span class="note-desc">${app.demonstration}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents() {
    const tabs = this.container.querySelectorAll<HTMLButtonElement>('.app-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const id = tab.getAttribute('data-app-id');
        if (id && id !== this.activeMockupId) {
          this.activeMockupId = id;
          sound.playClick(720, 0.03);

          tabs.forEach(t => t.classList.remove('is-active'));
          tab.classList.add('is-active');

          const slides = this.container.querySelectorAll('.app-mockup-slide');
          slides.forEach(s => s.classList.remove('is-active'));
          const targetSlide = this.container.querySelector(`#slide-${id}`);
          if (targetSlide) {
            targetSlide.classList.add('is-active');
          }
        }
      });
    });
  }
}
