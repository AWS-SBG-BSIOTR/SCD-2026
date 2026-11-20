import { sound } from './audio';
import confetti from 'canvas-confetti';

export class HeroVariableController {
  private heroElement: HTMLElement;
  private wordmarkElement: HTMLElement | null = null;
  private letters: HTMLElement[] = [];
  private isPointerInside: boolean = false;
  private mouseX: number = 0;
  private mouseY: number = 0;
  private rafId: number | null = null;

  // Manual scrub factor (0 to 1)
  private manualScrub: number = 0.5;

  constructor(heroElement: HTMLElement) {
    this.heroElement = heroElement;
    this.init();
  }

  public setWordmark(newText: string) {
    if (!this.wordmarkElement) return;
    this.letters = [];
    this.wordmarkElement.innerHTML = '';

    newText.split('').forEach((char) => {
      const span = document.createElement('span');
      span.className = 'hero-char';
      if (char === ' ') {
        span.innerHTML = '&nbsp;';
        span.classList.add('char-space');
      } else {
        span.textContent = char;
      }
      this.wordmarkElement?.appendChild(span);
      this.letters.push(span);
    });

    this.applyManualScrub();
  }

  private init() {
    this.wordmarkElement = this.heroElement.querySelector('.hero-wordmark-title');
    if (!this.wordmarkElement) return;

    this.setWordmark('AWS SCD 2026');
    this.attachEvents();
    this.startLoop();
  }

  private attachEvents() {
    // Pointer proximity on hero
    this.heroElement.addEventListener('pointerenter', () => {
      this.isPointerInside = true;
    });

    this.heroElement.addEventListener('pointerleave', () => {
      this.isPointerInside = false;
      this.resetToRest();
    });

    this.heroElement.addEventListener('pointermove', (e: PointerEvent) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.isPointerInside = true;
    });

    // Touch support
    this.heroElement.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        this.mouseX = e.touches[0].clientX;
        this.mouseY = e.touches[0].clientY;
        this.isPointerInside = true;
      }
    }, { passive: true });

    this.heroElement.addEventListener('touchend', () => {
      this.isPointerInside = false;
      this.resetToRest();
    }, { passive: true });

    this.heroElement.addEventListener('touchcancel', () => {
      this.isPointerInside = false;
      this.resetToRest();
    }, { passive: true });

    // Hero Excitement & Hype range scrubber
    const scrubSlider = this.heroElement.querySelector<HTMLInputElement>('#hero-scrub-slider');
    const scrubVal = this.heroElement.querySelector('#hero-scrub-val');
    const statusTag = this.heroElement.querySelector('#hype-status-tag');
    let hasTriggeredMaxConfetti = false;

    if (scrubSlider) {
      scrubSlider.addEventListener('input', () => {
        const val = Number(scrubSlider.value);
        this.manualScrub = val / 100;
        if (scrubVal) {
          scrubVal.textContent = `${val}%`;
        }

        // Dynamic hype status tags
        if (statusTag) {
          if (val <= 25) {
            statusTag.textContent = '[STATUS: CURIOUS // EXPLORING THE CLOUD]';
            statusTag.className = 'hype-status-banner stage-low mono';
          } else if (val <= 50) {
            statusTag.textContent = '[STATUS: STOKED // LAPTOP CHARGED & READY]';
            statusTag.className = 'hype-status-banner stage-mid mono';
          } else if (val <= 75) {
            statusTag.textContent = '[STATUS: HYPED // ARCHITECTING RAG PIPELINES]';
            statusTag.className = 'hype-status-banner stage-high mono';
          } else if (val < 100) {
            statusTag.textContent = '[STATUS: MAXIMUM OVERDRIVE // READY TO BUILD AT SEASONS 24!]';
            statusTag.className = 'hype-status-banner stage-max mono';
          } else {
            statusTag.textContent = '[STATUS: 100% MAXIMUM HYPED // SEE YOU AT SEASONS 24 WAGHOLI!]';
            statusTag.className = 'hype-status-banner stage-ultra mono';
          }
        }

        // Escalating frequency audio click
        sound.playClick(450 + val * 6, 0.02);

        // 100% celebratory explosion!
        if (val === 100 && !hasTriggeredMaxConfetti) {
          hasTriggeredMaxConfetti = true;
          sound.playSuccess();
          confetti({
            particleCount: 90,
            spread: 80,
            origin: { y: 0.65 },
            colors: ['#FD0B03', '#010101', '#DCD4C2', '#9F180F']
          });
        } else if (val < 95) {
          hasTriggeredMaxConfetti = false;
        }

        this.applyManualScrub();
      });
    }
  }

  private applyManualScrub() {
    this.letters.forEach((letter) => {
      if (letter.classList.contains('char-space')) return;
      const wght = Math.round(550 + this.manualScrub * 350); // 550 to 900 bold weight
      const wdth = Math.round(90 + this.manualScrub * 30);   // 90 to 120 width
      letter.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
      letter.style.transform = 'none';
    });
  }

  private startLoop() {
    const update = () => {
      if (this.isPointerInside && this.letters.length > 0) {
        const maxDist = 320; // Proximity radius in pixels

        this.letters.forEach((letter) => {
          if (letter.classList.contains('char-space')) return;

          const rect = letter.getBoundingClientRect();
          const letterCenterX = rect.left + rect.width / 2;
          const letterCenterY = rect.top + rect.height / 2;

          const dx = this.mouseX - letterCenterX;
          const dy = this.mouseY - letterCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const factor = Math.pow(1 - dist / maxDist, 1.4); // Smooth falloff curve
            const wght = Math.round(500 + factor * 400);
            const wdth = Math.round(85 + factor * 45);
            letter.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
            letter.style.transform = 'none';
          } else {
            // Gradual return to rest state based on current hype scrubber
            const restWght = Math.round(550 + this.manualScrub * 350);
            const restWdth = Math.round(90 + this.manualScrub * 30);
            letter.style.fontVariationSettings = `'wght' ${restWght}, 'wdth' ${restWdth}`;
            letter.style.transform = 'none';
          }
        });
      }

      this.rafId = requestAnimationFrame(update);
    };

    this.rafId = requestAnimationFrame(update);
  }

  private resetToRest() {
    this.applyManualScrub();
  }

  public destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
