import { sound } from './audio';

interface LetterNode {
  element: HTMLElement;
  char: string;
  isSpace: boolean;
  index: number;
  currentWght: number;
  targetWght: number;
  currentWdth: number;
  targetWdth: number;
  currentY: number;
  targetY: number;
  currentScale: number;
  targetScale: number;
}

export class HeroVariableController {
  private heroElement: HTMLElement;
  private wordmarkElement: HTMLElement | null = null;
  private letters: LetterNode[] = [];
  private isPointerInside: boolean = false;
  private pointerX: number = 0;
  private pointerY: number = 0;
  private rafId: number | null = null;
  private fitScale: number = 1;

  // Gyroscope tilt telemetry
  private gyroTiltX: number = 0; // -1 (tilted left) to +1 (tilted right)
  private gyroPitchY: number = 0; // front/back tilt
  private gyroActive: boolean = false;
  private lastActiveCharIndex: number = -1;

  constructor(heroElement: HTMLElement) {
    this.heroElement = heroElement;
    this.init();
  }

  public setWordmark(newText: string) {
    if (!this.wordmarkElement) return;
    this.letters = [];
    this.wordmarkElement.innerHTML = '';

    const chars = newText.split('');
    chars.forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'hero-char';
      const isSpace = char === ' ';
      if (isSpace) {
        span.innerHTML = '&nbsp;';
        span.classList.add('char-space');
      } else {
        span.textContent = char;
      }
      this.wordmarkElement?.appendChild(span);

      this.letters.push({
        element: span,
        char,
        isSpace,
        index,
        currentWght: 800,
        targetWght: 800,
        currentWdth: 105,
        targetWdth: 105,
        currentY: 0,
        targetY: 0,
        currentScale: 1,
        targetScale: 1
      });
    });

    this.adjustFit();
  }

  private onResize = () => {
    this.adjustFit();
  };

  private init() {
    this.wordmarkElement = this.heroElement.querySelector('.hero-wordmark-title');
    if (!this.wordmarkElement) return;

    this.setWordmark('AWS SCD 2026');
    this.attachEvents();
    this.startPhysicsLoop();
    this.adjustFit();

    window.addEventListener('resize', this.onResize, { passive: true });
  }

  private attachEvents() {
    const container = this.heroElement.querySelector<HTMLElement>('.hero-wordmark-container') || this.heroElement;

    // Pointer Events (Mouse, Touch, Stylus)
    container.addEventListener('pointerdown', (e: PointerEvent) => {
      this.pointerX = e.clientX;
      this.pointerY = e.clientY;
      this.isPointerInside = true;
      this.requestGyroPermission();
    });

    container.addEventListener('pointerenter', () => {
      this.isPointerInside = true;
    });

    container.addEventListener('pointerleave', () => {
      this.isPointerInside = false;
      this.lastActiveCharIndex = -1;
    });

    container.addEventListener('pointermove', (e: PointerEvent) => {
      this.pointerX = e.clientX;
      this.pointerY = e.clientY;
      this.isPointerInside = true;
    });

    container.addEventListener('pointerup', () => {
      this.isPointerInside = false;
      this.lastActiveCharIndex = -1;
    });

    // Touch Events (High-sensitivity mobile swipe & tap)
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        this.pointerX = e.touches[0].clientX;
        this.pointerY = e.touches[0].clientY;
        this.isPointerInside = true;
        this.requestGyroPermission();
      }
    };

    container.addEventListener('touchstart', onTouch, { passive: true });
    container.addEventListener('touchmove', onTouch, { passive: true });

    container.addEventListener('touchend', () => {
      this.isPointerInside = false;
      this.lastActiveCharIndex = -1;
    }, { passive: true });

    container.addEventListener('touchcancel', () => {
      this.isPointerInside = false;
      this.lastActiveCharIndex = -1;
    }, { passive: true });

    // Gyroscope tilt reaction for mobile hero variable typography
    window.addEventListener('deviceorientation', (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.gamma !== undefined) {
        this.gyroActive = true;
        // Clamp gamma -32deg to +32deg for responsive phone tilt
        const clampedGamma = Math.max(-32, Math.min(32, e.gamma));
        const clampedBeta = Math.max(-25, Math.min(65, (e.beta ?? 45) - 45));

        // Smooth target normalization
        this.gyroTiltX = clampedGamma / 32; // -1 to +1
        this.gyroPitchY = clampedBeta / 30;
      }
    }, { passive: true });
  }

  private requestGyroPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission().catch(() => {});
    }
  }

  public adjustFit() {
    if (!this.wordmarkElement) return;
    const container = this.heroElement.querySelector<HTMLElement>('.hero-wordmark-container');
    if (!container) return;

    this.wordmarkElement.style.transform = 'none';

    const containerWidth = container.clientWidth;
    const textWidth = this.wordmarkElement.scrollWidth;
    // Keep 16px safety margin so it fits right within boundaries
    const availableWidth = Math.max(100, containerWidth - 16);

    if (textWidth > availableWidth && textWidth > 0) {
      this.fitScale = availableWidth / textWidth;
      this.wordmarkElement.style.transform = `scale(${this.fitScale.toFixed(4)})`;
      this.wordmarkElement.style.transformOrigin = 'center center';
    } else {
      this.fitScale = 1;
      this.wordmarkElement.style.transform = 'none';
    }
  }

  private startPhysicsLoop() {
    const update = () => {
      const isMobile = window.innerWidth <= 768;
      // Proximity radius: 120px on mobile, 200px on desktop
      const proximityRadius = isMobile ? 120 : 200;
      const totalLetters = this.letters.length;

      // 3D Perspective tilt on the wordmark container
      if (this.wordmarkElement && this.gyroActive) {
        const rotY = (this.gyroTiltX * 8).toFixed(2);
        const rotX = (-this.gyroPitchY * 5).toFixed(2);
        const scalePrefix = this.fitScale < 1 ? `scale(${this.fitScale.toFixed(4)}) ` : '';
        this.wordmarkElement.style.transform = `${scalePrefix}perspective(600px) rotateY(${rotY}deg) rotateX(${rotX}deg)`;
      }

      this.letters.forEach((node, idx) => {
        if (node.isSpace) return;

        // Normalized position across the word: -1 (leftmost) to +1 (rightmost)
        const normalizedPos = totalLetters > 1 ? (idx / (totalLetters - 1)) * 2 - 1 : 0;
        
        // Pronounced Gyroscope morphing:
        // Left tilt stretches left letters and condenses right letters.
        // Right tilt stretches right letters and condenses left letters.
        const gyroInfluence = this.gyroTiltX * normalizedPos;
        const baseWght = 800 + gyroInfluence * 180; // 620 to 980
        const baseWdth = 105 + gyroInfluence * 35;  // 70 to 140

        let targetWght = baseWght;
        let targetWdth = baseWdth;
        let targetY = 0;
        let targetScale = 1;
        let isCharActive = false;

        // Touch / Pointer Magnetic Proximity Ripple
        if (this.isPointerInside) {
          const rect = node.element.getBoundingClientRect();
          const letterCenterX = rect.left + rect.width / 2;
          const letterCenterY = rect.top + rect.height / 2;

          const dx = this.pointerX - letterCenterX;
          const dy = this.pointerY - letterCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < proximityRadius) {
            const factor = Math.pow(1 - dist / proximityRadius, 1.4);
            
            // Dramatic, unmistakable swelling under the finger
            targetWght = Math.min(1000, baseWght + factor * 260);
            targetWdth = Math.min(151, baseWdth + factor * 46);
            targetY = -factor * 14; // 14px tactile physical lift
            targetScale = 1 + factor * 0.18; // 18% size pop

            if (factor > 0.45) {
              isCharActive = true;
            }

            // Trigger micro tactile audio tick and haptic pulse on peak crossing
            if (factor > 0.65 && this.lastActiveCharIndex !== idx) {
              this.lastActiveCharIndex = idx;
              sound.playClick(640 + idx * 45, 0.018);
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                try { navigator.vibrate(12); } catch {}
              }
            }
          }
        }

        // Active vermilion accent on hover / touch
        if (isCharActive) {
          node.element.style.color = 'var(--color-vermilion)';
        } else {
          node.element.style.color = 'var(--color-black)';
        }

        // Snappy spring physics (lerp)
        node.currentWght += (targetWght - node.currentWght) * 0.18;
        node.currentWdth += (targetWdth - node.currentWdth) * 0.18;
        node.currentY += (targetY - node.currentY) * 0.20;
        node.currentScale += (targetScale - node.currentScale) * 0.20;

        const roundedWght = Math.round(node.currentWght);
        const roundedWdth = Math.round(node.currentWdth);
        node.element.style.fontVariationSettings = `'wght' ${roundedWght}, 'wdth' ${roundedWdth}`;

        // Apply physical lift + scale transform
        if (Math.abs(node.currentY) > 0.1 || Math.abs(node.currentScale - 1) > 0.005) {
          node.element.style.transform = `translate3d(0, ${node.currentY.toFixed(2)}px, 0) scale(${node.currentScale.toFixed(3)})`;
        } else {
          node.element.style.transform = 'none';
        }
      });

      this.rafId = requestAnimationFrame(update);
    };

    this.rafId = requestAnimationFrame(update);
  }

  public destroy() {
    window.removeEventListener('resize', this.onResize);
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
