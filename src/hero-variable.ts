import { sound } from './audio';

interface LetterNode {
  element: HTMLElement;
  char: string;
  isSpace: boolean;
  index: number;
  currentWght: number;
  currentWdth: number;
  currentSlnt: number;
  currentY: number;
  currentScale: number;
  lastVariation: string;
  lastTransform: string;
  lastColor: string;
}

interface DominoShockwave {
  originIndex: number;
  startTime: number;
  duration: number;
}

const BASE_WGHT = 720;
const BASE_WDTH = 96;
const BASE_SLNT = 0;
const ENTRANCE_DURATION_MS = 1200;
const SHOCKWAVE_DURATION_MS = 950;
const MAX_SHOCKWAVES = 4;

export class HeroVariableController {
  private heroElement: HTMLElement;
  private containerElement: HTMLElement | null = null;
  private wordmarkElement: HTMLElement | null = null;
  private letters: LetterNode[] = [];

  private isPointerInside: boolean = false;
  private pointerX: number = 0;
  private pointerY: number = 0;
  private lastPointerX: number = 0;
  private lastPointerY: number = 0;
  private lastPointerMoveTime: number = 0;
  private pointerSpeed: number = 0;
  private pointerDownX: number = 0;
  private pointerDownY: number = 0;
  private pointerMovedFar: boolean = false;

  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private fitScale: number = 1;
  private lastContainerWidth: number = -1;
  private lastWordmarkTransform: string = '';

  private entranceStartTime: number | null = null;
  private entranceScheduled: boolean = false;
  private entranceFallbackTimer: number | null = null;
  private shockwaves: DominoShockwave[] = [];

  // Gyroscope tilt telemetry
  private targetGyroTiltX: number = 0;
  private targetGyroPitchY: number = 0;
  private gyroTiltX: number = 0; // -1 (tilted left) to +1 (tilted right)
  private gyroPitchY: number = 0; // front/back tilt
  private gyroActive: boolean = false;
  private gyroPermissionRequested: boolean = false;

  private lastActiveCharIndex: number = -1;
  private isHeroVisible: boolean = true;
  private isDestroyed: boolean = false;

  private heroObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private abortController: AbortController = new AbortController();

  constructor(heroElement: HTMLElement) {
    this.heroElement = heroElement;
    this.init();
  }

  private formatVariation(wght: number, wdth: number, slnt: number): string {
    return `'wght' ${wght}, 'wdth' ${wdth}, 'slnt' ${slnt}`;
  }

  public setWordmark(newText: string) {
    if (!this.wordmarkElement) return;
    this.letters = [];
    this.wordmarkElement.innerHTML = '';
    this.lastActiveCharIndex = -1;

    const restVariation = this.formatVariation(BASE_WGHT, BASE_WDTH, BASE_SLNT);
    const chars = newText.split('');
    chars.forEach((char, index) => {
      const span = document.createElement('span');
      span.className = 'hero-char';
      span.dataset.charIndex = String(index);
      span.setAttribute('aria-hidden', 'true');

      const isSpace = char === ' ';
      if (isSpace) {
        span.innerHTML = '&nbsp;';
        span.classList.add('char-space');
      } else {
        span.textContent = char;
        span.style.fontVariationSettings = restVariation;
        span.style.color = 'var(--color-black)';
        span.style.transform = 'none';
      }
      this.wordmarkElement?.appendChild(span);

      this.letters.push({
        element: span,
        char,
        isSpace,
        index,
        currentWght: BASE_WGHT,
        currentWdth: BASE_WDTH,
        currentSlnt: BASE_SLNT,
        currentY: 0,
        currentScale: 1,
        lastVariation: restVariation,
        lastTransform: 'none',
        lastColor: 'var(--color-black)'
      });
    });

    this.adjustFit(true);
  }

  private onResize = () => {
    this.adjustFit(false);
  };

  private init() {
    this.wordmarkElement = this.heroElement.querySelector('.hero-wordmark-title');
    if (!this.wordmarkElement) return;

    this.containerElement =
      this.heroElement.querySelector<HTMLElement>('.hero-wordmark-container') || this.heroElement;

    this.setWordmark('AWS SCD 2026');
    this.attachEvents();
    this.adjustFit(true);

    if ('ResizeObserver' in window && this.containerElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.adjustFit(false);
      });
      this.resizeObserver.observe(this.containerElement);
    }

    if ('IntersectionObserver' in window) {
      this.heroObserver = new IntersectionObserver(
        (entries) => {
          this.isHeroVisible = entries.some((entry) => entry.isIntersecting);
          if (this.isHeroVisible) {
            if (this.hasPendingPhysics()) {
              this.startPhysicsLoop();
            }
          } else {
            this.stopPhysicsLoop();
          }
        },
        { threshold: 0.01 }
      );
      this.heroObserver.observe(this.heroElement);
    }

    window.addEventListener('resize', this.onResize, {
      passive: true,
      signal: this.abortController.signal
    });

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready
        .then(() => {
          if (this.isDestroyed) return;
          this.adjustFit(true);
          this.triggerEntranceWave();
        })
        .catch(() => {
          if (!this.isDestroyed) {
            this.triggerEntranceWave();
          }
        });
    }

    // Fallback ensures entrance wave plays promptly even if font loading stalls
    this.entranceFallbackTimer = window.setTimeout(() => {
      this.entranceFallbackTimer = null;
      if (!this.isDestroyed) {
        this.triggerEntranceWave();
      }
    }, 240);
  }

  private triggerEntranceWave() {
    if (this.entranceScheduled || this.isDestroyed) return;
    this.entranceScheduled = true;
    if (this.entranceFallbackTimer !== null) {
      clearTimeout(this.entranceFallbackTimer);
      this.entranceFallbackTimer = null;
    }
    this.entranceStartTime = performance.now();
    this.startPhysicsLoop();
  }

  private attachEvents() {
    const container = this.containerElement || this.heroElement;
    const { signal } = this.abortController;
    const hasPointerEvents = typeof window !== 'undefined' && 'PointerEvent' in window;

    const updatePointerPosition = (clientX: number, clientY: number, trackSpeed: boolean) => {
      const now = performance.now();
      const dx = clientX - this.lastPointerX;
      const dy = clientY - this.lastPointerY;
      const moveDist = Math.hypot(dx, dy);

      if (trackSpeed && this.lastPointerMoveTime > 0 && moveDist > 0.5) {
        const elapsedMs = Math.max(4, now - this.lastPointerMoveTime);
        const speedPxPerMs = moveDist / elapsedMs;
        const boost = Math.min(1, speedPxPerMs / 2.0);
        this.pointerSpeed = Math.max(this.pointerSpeed, boost);
      }

      this.pointerX = clientX;
      this.pointerY = clientY;
      this.lastPointerX = clientX;
      this.lastPointerY = clientY;
      this.lastPointerMoveTime = now;
    };

    container.addEventListener(
      'pointerdown',
      (e: PointerEvent) => {
        this.pointerDownX = e.clientX;
        this.pointerDownY = e.clientY;
        this.pointerMovedFar = false;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        this.lastPointerMoveTime = performance.now();
        this.isPointerInside = true;
        updatePointerPosition(e.clientX, e.clientY, false);
        if (e.pointerType === 'touch') {
          this.requestGyroPermission();
        }
        this.startPhysicsLoop();
      },
      { signal }
    );

    container.addEventListener(
      'pointerenter',
      (e: PointerEvent) => {
        this.isPointerInside = true;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        this.lastPointerMoveTime = performance.now();
        updatePointerPosition(e.clientX, e.clientY, false);
        this.startPhysicsLoop();
      },
      { signal }
    );

    container.addEventListener(
      'pointerleave',
      () => {
        this.isPointerInside = false;
        this.lastActiveCharIndex = -1;
        this.pointerSpeed = 0;
        this.startPhysicsLoop();
      },
      { signal }
    );

    container.addEventListener(
      'pointermove',
      (e: PointerEvent) => {
        if (Math.hypot(e.clientX - this.pointerDownX, e.clientY - this.pointerDownY) > 16) {
          this.pointerMovedFar = true;
        }
        this.isPointerInside = true;
        updatePointerPosition(e.clientX, e.clientY, true);
        this.startPhysicsLoop();
      },
      { signal }
    );

    container.addEventListener(
      'pointerup',
      (e: PointerEvent) => {
        if (e.pointerType === 'touch') {
          this.isPointerInside = false;
          this.lastActiveCharIndex = -1;
          this.pointerSpeed = 0;
          this.startPhysicsLoop();
        }
      },
      { signal }
    );

    container.addEventListener(
      'pointercancel',
      (e: PointerEvent) => {
        if (e.pointerType === 'touch') {
          this.isPointerInside = false;
          this.lastActiveCharIndex = -1;
          this.pointerSpeed = 0;
          this.startPhysicsLoop();
        }
      },
      { signal }
    );

    container.addEventListener(
      'click',
      (e: MouseEvent) => {
        if (this.pointerMovedFar) {
          this.pointerMovedFar = false;
          return;
        }
        const originIndex = this.resolveCharIndex(e.clientX, e.clientY, e.target);
        if (originIndex !== -1) {
          this.triggerShockwave(originIndex);
        }
      },
      { signal }
    );

    // Fallback Touch Events for browsers without PointerEvent
    if (!hasPointerEvents) {
      container.addEventListener(
        'touchstart',
        (e: TouchEvent) => {
          if (e.touches.length > 0) {
            const t = e.touches[0];
            this.pointerDownX = t.clientX;
            this.pointerDownY = t.clientY;
            this.pointerMovedFar = false;
            this.lastPointerX = t.clientX;
            this.lastPointerY = t.clientY;
            this.lastPointerMoveTime = performance.now();
            this.isPointerInside = true;
            updatePointerPosition(t.clientX, t.clientY, false);
            this.requestGyroPermission();
            this.startPhysicsLoop();
          }
        },
        { passive: true, signal }
      );

      container.addEventListener(
        'touchmove',
        (e: TouchEvent) => {
          if (e.touches.length > 0) {
            const t = e.touches[0];
            if (Math.hypot(t.clientX - this.pointerDownX, t.clientY - this.pointerDownY) > 16) {
              this.pointerMovedFar = true;
            }
            this.isPointerInside = true;
            updatePointerPosition(t.clientX, t.clientY, true);
            this.startPhysicsLoop();
          }
        },
        { passive: true, signal }
      );

      const onTouchRelease = () => {
        this.isPointerInside = false;
        this.lastActiveCharIndex = -1;
        this.pointerSpeed = 0;
        this.startPhysicsLoop();
      };

      container.addEventListener('touchend', onTouchRelease, { passive: true, signal });
      container.addEventListener('touchcancel', onTouchRelease, { passive: true, signal });
    }

    // Gyroscope tilt reaction for mobile hero variable typography (with landscape axis swap)
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (!this.isHeroVisible || this.isDestroyed) return;
      if (e.gamma !== null && e.gamma !== undefined) {
        this.gyroActive = true;
        const isLandscape =
          (typeof screen !== 'undefined' && screen.orientation?.type?.includes('landscape')) ||
          Math.abs((window as unknown as { orientation?: number }).orientation ?? 0) === 90;
        const rollAngle = isLandscape ? (e.beta ?? 0) : e.gamma;
        const pitchAngle = isLandscape ? e.gamma : (e.beta ?? 45) - 45;

        const clampedGamma = Math.max(-32, Math.min(32, rollAngle));
        const clampedBeta = Math.max(-25, Math.min(65, pitchAngle));

        const nextTiltX = clampedGamma / 32;
        const nextPitchY = clampedBeta / 30;

        const deltaChanged =
          Math.abs(nextTiltX - this.targetGyroTiltX) > 0.015 ||
          Math.abs(nextPitchY - this.targetGyroPitchY) > 0.015;

        if (deltaChanged) {
          this.targetGyroTiltX = nextTiltX;
          this.targetGyroPitchY = nextPitchY;
          this.startPhysicsLoop();
        }
      }
    };

    window.addEventListener('deviceorientation', onOrientation, { passive: true, signal });
  }

  private resolveCharIndex(clientX: number, clientY: number, target: EventTarget | null): number {
    const charEl = (target as HTMLElement | null)?.closest?.('.hero-char') as HTMLElement | null;
    if (charEl && charEl.dataset.charIndex !== undefined) {
      const idx = Number(charEl.dataset.charIndex);
      if (Number.isInteger(idx) && this.letters[idx] && !this.letters[idx].isSpace) {
        return idx;
      }
    }

    if (!this.wordmarkElement) return -1;
    const titleRect = this.wordmarkElement.getBoundingClientRect();
    // Generous hitbox for mobile taps right above/below glyph baselines
    if (
      clientX < titleRect.left - 24 ||
      clientX > titleRect.right + 24 ||
      clientY < titleRect.top - 32 ||
      clientY > titleRect.bottom + 32
    ) {
      return -1;
    }

    let closestIdx = -1;
    let minDx = Infinity;
    for (const node of this.letters) {
      if (node.isSpace) continue;
      const rect = node.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const dx = Math.abs(clientX - centerX);
      if (dx < minDx) {
        minDx = dx;
        closestIdx = node.index;
      }
    }
    return closestIdx;
  }

  private triggerShockwave(originIndex: number) {
    sound.playClick(540 + originIndex * 42, 0.032);
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(10);
      } catch {
        // Ignore haptic restriction
      }
    }

    this.shockwaves.push({
      originIndex,
      startTime: performance.now(),
      duration: SHOCKWAVE_DURATION_MS
    });
    if (this.shockwaves.length > MAX_SHOCKWAVES) {
      this.shockwaves.shift();
    }

    this.startPhysicsLoop();
  }

  private requestGyroPermission() {
    if (this.gyroPermissionRequested) return;
    this.gyroPermissionRequested = true;
    const devOrient = typeof DeviceOrientationEvent !== 'undefined'
      ? (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
      : undefined;
    if (devOrient && typeof devOrient.requestPermission === 'function') {
      devOrient.requestPermission().catch(() => {});
    }
  }

  public adjustFit(force = false) {
    if (!this.wordmarkElement || this.isDestroyed) return;
    const container = this.containerElement || this.heroElement.querySelector<HTMLElement>('.hero-wordmark-container');
    if (!container) return;

    const containerWidth = container.clientWidth;
    if (!force && containerWidth === this.lastContainerWidth) return;
    this.lastContainerWidth = containerWidth;

    const containerStyle = getComputedStyle(container);
    const padX =
      (parseFloat(containerStyle.paddingLeft) || 0) +
      (parseFloat(containerStyle.paddingRight) || 0);
    const innerWidth = Math.max(100, containerWidth - padX);
    const safetyMargin = window.innerWidth <= 768 ? 20 : 28;
    const availableWidth = Math.max(100, innerWidth - safetyMargin);

    // Measure true rest glyph width synchronously without flicker
    const restVariation = this.formatVariation(BASE_WGHT, BASE_WDTH, BASE_SLNT);
    const savedVariations = this.letters.map((node) => {
      if (node.isSpace) return '';
      const prev = node.element.style.fontVariationSettings;
      node.element.style.fontVariationSettings = restVariation;
      return prev;
    });

    this.wordmarkElement.style.transform = 'none';
    this.lastWordmarkTransform = 'none';

    const textWidth = this.wordmarkElement.scrollWidth;

    this.letters.forEach((node, idx) => {
      if (!node.isSpace) {
        node.element.style.fontVariationSettings = savedVariations[idx];
      }
    });

    if (textWidth > availableWidth && textWidth > 0) {
      this.fitScale = availableWidth / textWidth;
    } else {
      this.fitScale = 1;
    }

    this.applyWordmarkTransform();
  }

  private applyWordmarkTransform() {
    if (!this.wordmarkElement) return;

    const parts: string[] = [];
    if (this.fitScale < 1) {
      parts.push(`scale(${this.fitScale.toFixed(4)})`);
    }
    if (this.gyroActive) {
      const rotY = (this.gyroTiltX * 8).toFixed(2);
      const rotX = (-this.gyroPitchY * 5).toFixed(2);
      parts.push(`perspective(600px) rotateY(${rotY}deg) rotateX(${rotX}deg)`);
    }

    const nextTransform = parts.length > 0 ? parts.join(' ') : 'none';
    if (nextTransform !== this.lastWordmarkTransform) {
      this.wordmarkElement.style.transform = nextTransform;
      this.wordmarkElement.style.transformOrigin = 'center center';
      this.lastWordmarkTransform = nextTransform;
    }
  }

  private hasPendingPhysics(): boolean {
    if (this.entranceStartTime !== null || this.shockwaves.length > 0 || this.isPointerInside) {
      return true;
    }
    if (
      this.gyroActive &&
      (Math.abs(this.targetGyroTiltX - this.gyroTiltX) > 0.002 ||
        Math.abs(this.targetGyroPitchY - this.gyroPitchY) > 0.002)
    ) {
      return true;
    }
    return this.letters.some(
      (n) =>
        !n.isSpace &&
        (Math.abs(n.currentWght - BASE_WGHT) >= 0.1 ||
          Math.abs(n.currentWdth - BASE_WDTH) >= 0.1 ||
          Math.abs(n.currentSlnt - BASE_SLNT) >= 0.05 ||
          Math.abs(n.currentY) >= 0.1 ||
          Math.abs(n.currentScale - 1) >= 0.002)
    );
  }

  private stopPhysicsLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastFrameTime = 0;
  }

  private startPhysicsLoop() {
    if (!this.isHeroVisible || this.isDestroyed || this.rafId !== null) {
      return;
    }

    const update = (now: number) => {
      this.rafId = null;
      if (!this.isHeroVisible || this.isDestroyed) {
        this.lastFrameTime = 0;
        return;
      }

      const dt =
        this.lastFrameTime > 0
          ? Math.min(0.05, Math.max(0.001, (now - this.lastFrameTime) / 1000))
          : 1 / 60;
      this.lastFrameTime = now;

      this.pointerSpeed *= Math.exp(-6.5 * dt);
      if (this.pointerSpeed < 0.005) {
        this.pointerSpeed = 0;
      }

      const gyroAlpha = 1 - Math.exp(-10 * dt);
      this.gyroTiltX += (this.targetGyroTiltX - this.gyroTiltX) * gyroAlpha;
      this.gyroPitchY += (this.targetGyroPitchY - this.gyroPitchY) * gyroAlpha;

      const gyroMoving =
        this.gyroActive &&
        (Math.abs(this.targetGyroTiltX - this.gyroTiltX) > 0.002 ||
          Math.abs(this.targetGyroPitchY - this.gyroPitchY) > 0.002);

      if (!gyroMoving && this.gyroActive) {
        this.gyroTiltX = this.targetGyroTiltX;
        this.gyroPitchY = this.targetGyroPitchY;
      }

      this.applyWordmarkTransform();

      let entranceProgress = -1;
      if (this.entranceStartTime !== null) {
        const elapsed = now - this.entranceStartTime;
        if (elapsed < ENTRANCE_DURATION_MS) {
          entranceProgress = elapsed / ENTRANCE_DURATION_MS;
        } else {
          this.entranceStartTime = null;
        }
      }
      const isEntranceActive = entranceProgress >= 0;

      if (this.shockwaves.length > 0) {
        this.shockwaves = this.shockwaves.filter((w) => now - w.startTime < w.duration);
      }
      const hasShockwaves = this.shockwaves.length > 0;

      const isMobile = window.innerWidth <= 768;
      const proximityRadius = isMobile ? 140 : 230;
      const totalLetters = this.letters.length;
      const alphaMain = 1 - Math.exp(-14 * dt);
      const alphaLift = 1 - Math.exp(-16 * dt);

      const wordmarkCenterY = this.wordmarkElement
        ? (() => {
            const wr = this.wordmarkElement.getBoundingClientRect();
            return wr.top + wr.height / 2;
          })()
        : this.pointerY;

      let anyUnsettled = false;

      for (let idx = 0; idx < totalLetters; idx++) {
        const node = this.letters[idx];
        if (node.isSpace) continue;

        const normalizedPos = totalLetters > 1 ? (idx / (totalLetters - 1)) * 2 - 1 : 0;
        const gyroInfluence = this.gyroTiltX * normalizedPos;
        const baseWght = BASE_WGHT + gyroInfluence * 200;
        const baseWdth = BASE_WDTH + gyroInfluence * 42;
        const baseSlnt = BASE_SLNT - gyroInfluence * 6;

        let deltaWght = 0;
        let deltaWdth = 0;
        let deltaSlnt = 0;
        let targetY = 0;
        let targetScale = 1;
        let isCharHot = false;

        // 1. Entrance left-to-right kinetic sweep
        if (isEntranceActive) {
          const normIdx = totalLetters > 1 ? idx / (totalLetters - 1) : 0.5;
          const waveFront = entranceProgress * 1.48 - 0.24;
          const distFromFront = normIdx - waveFront;
          const tailFade = entranceProgress > 0.85 ? (1 - entranceProgress) / 0.15 : 1;
          const bell = Math.exp(-(distFromFront * distFromFront) / (2 * 0.22 * 0.22)) * tailFade;

          deltaWght += bell * 260;
          deltaWdth += bell * 50;
          deltaSlnt -= bell * 9;
          targetY -= bell * 16;
          targetScale += bell * 0.14;
          if (bell > 0.62) {
            isCharHot = true;
          }
        }

        // 2. Click / tap damped elastic domino shockwaves
        if (hasShockwaves) {
          for (const wave of this.shockwaves) {
            const charDist = Math.abs(idx - wave.originIndex);
            const localTime = (now - wave.startTime) / 1000 - charDist / 15;
            if (localTime > 0 && localTime < 0.65) {
              const envelope = Math.exp(-localTime * 5.0) * Math.exp(-charDist * 0.14);
              const elastic = Math.sin(localTime * Math.PI * 3.8);
              const amp = elastic * envelope;

              deltaWght += amp * 280;
              deltaWdth += amp * 52;
              deltaSlnt -= amp * 10;
              targetY -= amp * 20;
              targetScale += amp * 0.17;
              if (amp > 0.22) {
                isCharHot = true;
              }
            }
          }
        }

        // 3. Touch / Pointer magnetic proximity ripple + velocity boost
        if (this.isPointerInside) {
          const rect = node.element.getBoundingClientRect();
          const letterCenterX = rect.left + rect.width / 2;
          const dist = Math.hypot(this.pointerX - letterCenterX, this.pointerY - wordmarkCenterY);
          const effectiveRadius = proximityRadius * (1 + this.pointerSpeed * 0.25);

          if (dist < effectiveRadius) {
            const factor = Math.pow(1 - dist / effectiveRadius, 1.35);
            const velocityGain = 1 + this.pointerSpeed * 0.36;

            deltaWght += factor * 280 * velocityGain;
            deltaWdth += factor * 55 * velocityGain;
            deltaSlnt -= factor * 10 * velocityGain;
            targetY -= factor * (18 + this.pointerSpeed * 6);
            targetScale += factor * (0.18 + this.pointerSpeed * 0.05);

            if (factor > 0.34) {
              isCharHot = true;
            }

            if (factor > 0.58 && this.lastActiveCharIndex !== idx) {
              this.lastActiveCharIndex = idx;
              sound.playClick(640 + idx * 45, 0.018);
              if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
                try {
                  navigator.vibrate(12);
                } catch {
                  // Ignore haptic restriction
                }
              }
            }
          }
        }

        const targetWght = Math.max(100, Math.min(1000, baseWght + deltaWght));
        const targetWdth = Math.max(25, Math.min(151, baseWdth + deltaWdth));
        const targetSlnt = Math.max(-10, Math.min(0, baseSlnt + deltaSlnt));
        targetY = Math.max(-30, Math.min(12, targetY));
        targetScale = Math.max(0.92, Math.min(1.26, targetScale));

        node.currentWght += (targetWght - node.currentWght) * alphaMain;
        node.currentWdth += (targetWdth - node.currentWdth) * alphaMain;
        node.currentSlnt += (targetSlnt - node.currentSlnt) * alphaMain;
        node.currentY += (targetY - node.currentY) * alphaLift;
        node.currentScale += (targetScale - node.currentScale) * alphaLift;

        const isNodeSettled =
          Math.abs(targetWght - node.currentWght) < 0.1 &&
          Math.abs(targetWdth - node.currentWdth) < 0.1 &&
          Math.abs(targetSlnt - node.currentSlnt) < 0.05 &&
          Math.abs(targetY - node.currentY) < 0.1 &&
          Math.abs(targetScale - node.currentScale) < 0.002;

        if (!isNodeSettled) {
          anyUnsettled = true;
        } else {
          node.currentWght = targetWght;
          node.currentWdth = targetWdth;
          node.currentSlnt = targetSlnt;
          node.currentY = targetY;
          node.currentScale = targetScale;
        }

        const nextColor = isCharHot ? 'var(--color-vermilion)' : 'var(--color-black)';
        if (nextColor !== node.lastColor) {
          node.element.style.color = nextColor;
          node.lastColor = nextColor;
        }

        const roundedWght = Math.round(node.currentWght);
        const roundedWdth = Math.round(node.currentWdth);
        const roundedSlnt = Math.round(node.currentSlnt * 10) / 10;
        const nextVariation = this.formatVariation(roundedWght, roundedWdth, roundedSlnt);
        if (nextVariation !== node.lastVariation) {
          node.element.style.fontVariationSettings = nextVariation;
          node.lastVariation = nextVariation;
        }

        const nextTransform =
          Math.abs(node.currentY) > 0.08 || Math.abs(node.currentScale - 1) > 0.002
            ? `translate3d(0, ${node.currentY.toFixed(2)}px, 0) scale(${node.currentScale.toFixed(3)})`
            : 'none';

        if (nextTransform !== node.lastTransform) {
          node.element.style.transform = nextTransform;
          node.lastTransform = nextTransform;
        }
      }

      const hasPointerMotion = this.pointerSpeed > 0.005;
      const shouldContinue =
        isEntranceActive || hasShockwaves || hasPointerMotion || gyroMoving || anyUnsettled;

      if (shouldContinue) {
        this.rafId = requestAnimationFrame(update);
      } else {
        this.lastFrameTime = 0;
      }
    };

    this.rafId = requestAnimationFrame(update);
  }

  public destroy() {
    this.isDestroyed = true;
    this.abortController.abort();

    if (this.entranceFallbackTimer !== null) {
      clearTimeout(this.entranceFallbackTimer);
      this.entranceFallbackTimer = null;
    }

    if (this.heroObserver) {
      this.heroObserver.disconnect();
      this.heroObserver = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    this.stopPhysicsLoop();
  }
}
