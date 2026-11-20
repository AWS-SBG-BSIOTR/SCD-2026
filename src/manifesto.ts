import { sound } from './audio';

export class ManifestoController {
  private container: HTMLElement;
  private sliderWeight: number = 500;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <div class="manifesto-section-wrapper">
        <div class="manifesto-grid">
          <!-- Left: Big Editorial Headline and Ethos -->
          <div class="manifesto-text-col">
            <span class="section-tag mono">(01) Manifesto</span>
            <h2 class="manifesto-headline">Letters that move.</h2>
            <div class="manifesto-body-text">
              <p class="lead-paragraph">
                For five hundred years, movable type was cast in rigid metal. In the digital era, we inexplicably retained that prison: dividing letterforms into arbitrary frozen slices called "Regular", "SemiBold", and "Black".
              </p>
              <p>
                AWS Student Community Day 2026 was engineered to challenge static conventions. Just as modern cloud infrastructure scales elastically across multi-region clusters, our typography is an organic, multi-dimensional continuum packaged into a single variable font file. Weight is an elastic spectrum; optical size adapts dynamically to reading distance; compute and character are dials you rotate.
              </p>
              <div class="manifesto-quote-box">
                <span class="quote-mark">“</span>
                <p>The infrastructure is the interface. Typography should demonstrate its own capabilities rather than being represented through static promotional graphics.</p>
                <cite class="mono">— AWS SCD Pune Community & Engineering Council</cite>
              </div>
            </div>
          </div>

          <!-- Right: Interactive Demonstration (Static vs. Variable) -->
          <div class="manifesto-interactive-col">
            <div class="manifesto-demo-card mono">
              <div class="demo-card-header">
                <span>INTERACTIVE COMPARISON RIG</span>
                <span class="tag-status">CONTINUUM VS. DISCRETE</span>
              </div>

              <!-- Top: Static Font Step Simulation -->
              <div class="comparison-row static-row">
                <div class="row-header">
                  <span class="lbl-type">STATIC FONT FILES (18 FILES / 4.2 MB)</span>
                  <span class="lbl-status" id="static-step-label">REGULAR (400)</span>
                </div>
                <div class="step-specimen" id="static-specimen">
                  STATIC LETTERS JUMP IN STEPS
                </div>
                <div class="discrete-steps-bar">
                  <div class="step-notch" data-step="100">Thin</div>
                  <div class="step-notch" data-step="300">Light</div>
                  <div class="step-notch is-active" data-step="400">Regular</div>
                  <div class="step-notch" data-step="600">SemiBold</div>
                  <div class="step-notch" data-step="800">Bold</div>
                  <div class="step-notch" data-step="950">Black</div>
                </div>
              </div>

              <!-- Bottom: Variable Font Continuous Simulation -->
              <div class="comparison-row variable-row">
                <div class="row-header">
                  <span class="lbl-type text-accent">AWS SCD VARIABLE CONTINUUM (1 FILE / 120 KB)</span>
                  <span class="lbl-status text-accent" id="variable-weight-label">FLUID: 'wght' 500, 'wdth' 100</span>
                </div>
                <div class="continuous-specimen" id="variable-specimen">
                  VARIABLE LETTERS FLOW LIKE LIQUID
                </div>
              </div>

              <!-- Unified Scrubber -->
              <div class="manifesto-slider-controller">
                <div class="slider-meta">
                  <span>DRAG TO INTERPOLATE:</span>
                  <span id="manifesto-live-val">WEIGHT: 500 / 1000</span>
                </div>
                <input 
                  type="range" 
                  id="manifesto-scrubber" 
                  min="100" 
                  max="1000" 
                  step="1" 
                  value="500">
                <div class="slider-bounds">
                  <span>100 (HAIRLINE)</span>
                  <span>500 (INTERPOLATED)</span>
                  <span>1000 (MONUMENTAL)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents() {
    const scrubber = this.container.querySelector<HTMLInputElement>('#manifesto-scrubber');
    const liveVal = this.container.querySelector('#manifesto-live-val');
    const staticSpecimen = this.container.querySelector<HTMLElement>('#static-specimen');
    const staticLabel = this.container.querySelector('#static-step-label');
    const variableSpecimen = this.container.querySelector<HTMLElement>('#variable-specimen');
    const variableLabel = this.container.querySelector('#variable-weight-label');
    const notches = this.container.querySelectorAll<HTMLElement>('.step-notch');

    if (!scrubber) return;

    scrubber.addEventListener('input', () => {
      const w = Number(scrubber.value);
      this.sliderWeight = w;
      if (liveVal) liveVal.textContent = `WEIGHT: ${w} / 1000`;

      // Variable specimen interpolates smoothly every single integer
      if (variableSpecimen) {
        variableSpecimen.style.fontVariationSettings = `'wght' ${w}, 'wdth' ${Math.min(135, Math.max(75, 75 + (w / 1000) * 50))}`;
      }
      if (variableLabel) {
        variableLabel.textContent = `FLUID: 'wght' ${w}`;
      }

      // Static specimen snaps to nearest traditional static weight bucket: 100, 300, 400, 600, 800, 950
      let snappedWeight = 400;
      let stepName = 'REGULAR (400)';
      if (w < 200) {
        snappedWeight = 100;
        stepName = 'THIN (100)';
      } else if (w < 350) {
        snappedWeight = 300;
        stepName = 'LIGHT (300)';
      } else if (w < 500) {
        snappedWeight = 400;
        stepName = 'REGULAR (400)';
      } else if (w < 700) {
        snappedWeight = 600;
        stepName = 'SEMIBOLD (600)';
      } else if (w < 875) {
        snappedWeight = 800;
        stepName = 'BOLD (800)';
      } else {
        snappedWeight = 950;
        stepName = 'BLACK (950)';
      }

      if (staticSpecimen) {
        staticSpecimen.style.fontWeight = String(snappedWeight);
      }
      if (staticLabel) {
        staticLabel.textContent = stepName;
      }

      notches.forEach(n => {
        const step = Number(n.getAttribute('data-step'));
        n.classList.toggle('is-active', step === snappedWeight);
      });

      sound.playClick(600 + (w * 0.4), 0.008);
    });
  }
}
