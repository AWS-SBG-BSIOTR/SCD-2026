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

  private onResize = () => {
    this.adjustFit();
  };

  private init() {
    this.wordmarkElement = this.heroElement.querySelector('.hero-wordmark-title');
    if (!this.wordmarkElement) return;

    this.setWordmark('AWS SCD 2026');
    this.attachEvents();
    this.startLoop();
    this.adjustFit();

    window.addEventListener('resize', this.onResize, { passive: true });
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

    // Gyroscope tilt reaction for mobile hero variable typography
    window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
      if (this.isPointerInside) return;
      if (e.gamma !== null && e.gamma !== undefined) {
        const clamped = Math.max(-25, Math.min(25, e.gamma));
        this.manualScrub = 0.5 + (clamped / 25) * 0.35;
        this.applyManualScrub();
      }
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
      // Option 1 Solid Brand Anchor: default at 50% slider is wght: 850, wdth: 110
      const wght = Math.round(700 + this.manualScrub * 300); // 700 to 1000 ultra-bold range
      const wdth = Math.round(90 + this.manualScrub * 40);   // 90 to 130 wide range
      letter.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
      letter.style.transform = 'none';
    });

    this.adjustFit();
  }

  public adjustFit() {
    if (!this.wordmarkElement) return;
    const container = this.heroElement.querySelector<HTMLElement>('.hero-wordmark-container');
    if (!container) return;

    // Temporarily reset wordmark transform to read natural unscaled scrollWidth
    this.wordmarkElement.style.transform = 'none';

    const containerWidth = container.clientWidth;
    const textWidth = this.wordmarkElement.scrollWidth;
    const availableWidth = Math.max(100, containerWidth - 24);

    if (textWidth > availableWidth && textWidth > 0) {
      const scale = availableWidth / textWidth;
      this.wordmarkElement.style.transform = `scale(${scale.toFixed(4)})`;
      this.wordmarkElement.style.transformOrigin = 'center center';
    } else {
      this.wordmarkElement.style.transform = 'none';
    }
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
            const wght = Math.round(850 + factor * 100);
            const wdth = Math.round(110 + factor * 20);
            letter.style.fontVariationSettings = `'wght' ${wght}, 'wdth' ${wdth}`;
            letter.style.transform = 'none';
          } else {
            // Letters outside cursor proximity maintain rock-solid rest state
            const restWght = Math.round(700 + this.manualScrub * 300);
            const restWdth = Math.round(90 + this.manualScrub * 40);
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
    window.removeEventListener('resize', this.onResize);
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
