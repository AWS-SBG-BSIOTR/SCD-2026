const FORWARD_SPEED_PX_PER_SEC = 88;
const REVERSE_SPEED_PX_PER_SEC = -132;
const SCROLL_HOLD_MS = 220;
const VELOCITY_SMOOTHING = 10;

export class TickerController {
  private tickerElement: HTMLElement;
  private track: HTMLElement | null = null;
  private abortController: AbortController = new AbortController();
  private intersectionObserver: IntersectionObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private rafId: number | null = null;
  private lastFrameTime: number = 0;
  private translateX: number = 0;
  private velocity: number = FORWARD_SPEED_PX_PER_SEC;
  private loopWidth: number = 0;

  private isVisible: boolean = true;
  private isHovering: boolean = false;
  private isTouching: boolean = false;
  private scrollReverseUntil: number = 0;
  private isDestroyed: boolean = false;

  constructor(tickerElement: HTMLElement) {
    this.tickerElement = tickerElement;
    this.track = this.tickerElement.querySelector('.ticker-track');
    if (!this.track) return;

    this.measureLoopWidth();
    this.attachEvents();
    this.observeVisibility();
    this.startLoop();
  }

  private measureLoopWidth() {
    if (!this.track) return;
    const firstItem = this.track.querySelector<HTMLElement>('.ticker-text');
    const measured = firstItem ? firstItem.getBoundingClientRect().width : this.track.scrollWidth / 2;
    if (measured > 0) {
      this.loopWidth = measured;
      this.normalizePosition();
    }
  }

  private normalizePosition() {
    if (this.loopWidth <= 0) return;
    let next = ((this.translateX % this.loopWidth) + this.loopWidth) % this.loopWidth;
    if (next > 0) {
      next -= this.loopWidth;
    }
    this.translateX = next;
  }

  private isReversed(now: number): boolean {
    return this.isTouching || this.isHovering || now < this.scrollReverseUntil;
  }

  private observeVisibility() {
    if ('IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          this.isVisible = entries.some((entry) => entry.isIntersecting);
          if (this.isVisible && !document.hidden) {
            this.startLoop();
          } else {
            this.stopLoop();
          }
        },
        { threshold: 0 }
      );
      this.intersectionObserver.observe(this.tickerElement);
    }

    if ('ResizeObserver' in window && this.track) {
      this.resizeObserver = new ResizeObserver(() => {
        this.measureLoopWidth();
      });
      this.resizeObserver.observe(this.track);
    }
  }

  private attachEvents() {
    const { signal } = this.abortController;

    const markScrolling = () => {
      this.scrollReverseUntil = performance.now() + SCROLL_HOLD_MS;
    };

    // Touch screen (mobile & touch laptops): reverse while finger touches/moves
    window.addEventListener(
      'touchstart',
      () => {
        this.isTouching = true;
      },
      { passive: true, signal }
    );

    window.addEventListener(
      'touchmove',
      () => {
        this.isTouching = true;
      },
      { passive: true, signal }
    );

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        this.isTouching = false;
      }
    };

    window.addEventListener('touchend', onTouchEnd, { passive: true, signal });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true, signal });

    // Page scroll / mouse wheel: reverse while actively scrolling
    window.addEventListener('scroll', markScrolling, { passive: true, signal });
    window.addEventListener('wheel', markScrolling, { passive: true, signal });

    // Hover or press directly on the red ticker bar: reverse smoothly
    this.tickerElement.addEventListener(
      'pointerenter',
      (e: PointerEvent) => {
        if (e.pointerType !== 'touch') {
          this.isHovering = true;
        }
      },
      { signal }
    );

    this.tickerElement.addEventListener(
      'pointerleave',
      (e: PointerEvent) => {
        if (e.pointerType !== 'touch') {
          this.isHovering = false;
        }
      },
      { signal }
    );

    this.tickerElement.addEventListener(
      'pointerdown',
      () => {
        this.isHovering = true;
      },
      { signal }
    );

    const onPointerRelease = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        this.isHovering = false;
      }
    };

    window.addEventListener('pointerup', onPointerRelease, { passive: true, signal });
    window.addEventListener('pointercancel', onPointerRelease, { passive: true, signal });

    // Font metrics ready recalculation & tab sleep guard
    if (typeof document !== 'undefined') {
      document.fonts?.ready
        .then(() => {
          if (!this.isDestroyed) {
            this.measureLoopWidth();
          }
        })
        .catch(() => {});

      document.addEventListener(
        'visibilitychange',
        () => {
          if (document.hidden) {
            this.isTouching = false;
            this.isHovering = false;
            this.stopLoop();
          } else if (this.isVisible) {
            this.startLoop();
          }
        },
        { signal }
      );
    }

    window.addEventListener(
      'blur',
      () => {
        this.isTouching = false;
        this.isHovering = false;
      },
      { passive: true, signal }
    );

    window.addEventListener(
      'resize',
      () => {
        this.measureLoopWidth();
      },
      { passive: true, signal }
    );
  }

  private startLoop() {
    if (this.isDestroyed || !this.track || !this.isVisible || this.rafId !== null) return;
    this.lastFrameTime = 0;
    this.rafId = window.requestAnimationFrame(this.tick);
  }

  private stopLoop() {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastFrameTime = 0;
  }

  private tick = (now: number) => {
    this.rafId = null;
    if (this.isDestroyed || !this.track || !this.isVisible) {
      this.lastFrameTime = 0;
      return;
    }

    const rawDt = this.lastFrameTime > 0 ? (now - this.lastFrameTime) / 1000 : 1 / 60;
    this.lastFrameTime = now;
    const dt = Math.min(0.05, Math.max(0.001, rawDt));

    if (this.loopWidth <= 0) {
      this.measureLoopWidth();
    }

    const targetVelocity = this.isReversed(now) ? REVERSE_SPEED_PX_PER_SEC : FORWARD_SPEED_PX_PER_SEC;
    const alpha = 1 - Math.exp(-VELOCITY_SMOOTHING * dt);
    this.velocity += (targetVelocity - this.velocity) * alpha;

    if (this.loopWidth > 0) {
      this.translateX -= this.velocity * dt;
      this.normalizePosition();
      this.track.style.transform = `translate3d(${this.translateX.toFixed(2)}px, 0, 0)`;
    }

    this.rafId = window.requestAnimationFrame(this.tick);
  };

  public destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.stopLoop();
    this.abortController.abort();

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.track) {
      this.track.style.transform = '';
    }
  }
}
