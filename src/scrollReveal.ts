import './scroll-reveal.css';

type RevealVariant = 'sr-header-item' | 'sr-card-item' | 'sr-panel-left' | 'sr-panel-right';

interface StaggerRule {
  itemSelector: string;
  containerSelector: string;
  stepMs: number;
}

interface GroupMeta {
  host: Element;
  stepMs: number;
}

const STAGGER_RULES: ReadonlyArray<StaggerRule> = [
  { itemSelector: '.metric-card', containerSelector: '.overview-metrics-grid', stepMs: 85 },
  { itemSelector: '.why-attend-card', containerSelector: '.why-attend-grid', stepMs: 85 },
  { itemSelector: '.speaker-card', containerSelector: '.speakers-grid', stepMs: 85 },
  { itemSelector: '.flightboard-row', containerSelector: '.flightboard-container', stepMs: 55 },
  { itemSelector: '.pass-tier-card', containerSelector: '.pass-tiers-section', stepMs: 85 },
  { itemSelector: '.faq-item', containerSelector: '.faq-terminal-block', stepMs: 55 },
  { itemSelector: '.sponsor-logo-card', containerSelector: '.sponsors-logo-grid', stepMs: 85 },
  { itemSelector: '.partner-card', containerSelector: '.partners-grid', stepMs: 85 },
  { itemSelector: '.footer-col', containerSelector: '.site-footer', stepMs: 85 }
];

const STANDALONE_CARD_SELECTORS: ReadonlyArray<string> = [
  '.overview-countdown-panel',
  '.overview-actions-row',
  '.speakers-status-banner',
  '.speakers-cta-footer',
  '.schedule-overview-banner',
  '.schedule-telemetry-strip',
  '.ticket-stub-card'
];

const PANEL_LEFT_SELECTORS: ReadonlyArray<string> = [
  '.pass-controls-card',
  '.venue-info-panel'
];

const PANEL_RIGHT_SELECTORS: ReadonlyArray<string> = [
  '.pass-preview-stage',
  '.venue-blueprint-panel'
];

const MAX_STAGGER_DELAY_MS = 440;
const BASE_TRANSFORM_DURATION_MS = 640;
const CLEANUP_BUFFER_MS = 100;

export class ScrollRevealController {
  private observer: IntersectionObserver | null = null;
  private mutationObserver: MutationObserver | null = null;
  private progressBar: HTMLElement | null = null;

  private pendingTargets: Set<HTMLElement> = new Set();
  private pendingHeaders: Set<HTMLElement> = new Set();
  private registeredElements: WeakSet<Element> = new WeakSet();
  private revealedSections: WeakSet<Element> = new WeakSet();
  private elementGroups: WeakMap<HTMLElement, GroupMeta> = new WeakMap();

  private cleanupTimers: Set<number> = new Set();
  private activeCleanups: Set<() => void> = new Set();
  private scrollRafId: number | null = null;
  private paintRafA: number | null = null;
  private paintRafB: number | null = null;
  private initialSweepTimer: number | null = null;
  private isDestroyed: boolean = false;
  private readyToObserve: boolean = false;

  constructor() {
    this.mountProgressBar();
    this.initMutationObserver();
    this.bindScrollListeners();
    this.refresh();

    // Wait two rAF ticks so browsers paint initial .sr-init hidden state before attaching IO
    this.paintRafA = window.requestAnimationFrame(() => {
      this.paintRafA = null;
      this.paintRafB = window.requestAnimationFrame(() => {
        this.paintRafB = null;
        if (this.isDestroyed) return;
        this.readyToObserve = true;
        this.initIntersectionObserver();
        this.pendingHeaders.forEach((header) => this.observer?.observe(header));
        this.pendingTargets.forEach((target) => this.observer?.observe(target));
        this.checkFallbackVisibility();
        this.updateProgressBar();
      });
    });

    // Safety fallback sweep in case layout shifts or IO is unsupported
    this.initialSweepTimer = window.setTimeout(() => {
      this.initialSweepTimer = null;
      if (this.isDestroyed) return;
      if (!this.readyToObserve) {
        this.readyToObserve = true;
        this.initIntersectionObserver();
        this.pendingHeaders.forEach((header) => this.observer?.observe(header));
        this.pendingTargets.forEach((target) => this.observer?.observe(target));
      }
      this.checkFallbackVisibility();
      this.updateProgressBar();
    }, 240);
  }

  public refresh(): void {
    if (this.isDestroyed) return;
    this.pruneDisconnected();
    this.scanSubtree(document.body, false);
    this.updateProgressBar();
  }

  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    window.removeEventListener('scroll', this.handleScrollOrResize);
    window.removeEventListener('resize', this.handleScrollOrResize);
    window.removeEventListener('load', this.handleScrollOrResize);

    if (this.scrollRafId !== null) {
      window.cancelAnimationFrame(this.scrollRafId);
      this.scrollRafId = null;
    }

    if (this.paintRafA !== null) {
      window.cancelAnimationFrame(this.paintRafA);
      this.paintRafA = null;
    }

    if (this.paintRafB !== null) {
      window.cancelAnimationFrame(this.paintRafB);
      this.paintRafB = null;
    }

    if (this.initialSweepTimer !== null) {
      window.clearTimeout(this.initialSweepTimer);
      this.initialSweepTimer = null;
    }

    this.activeCleanups.forEach(fn => fn());
    this.activeCleanups.clear();

    this.cleanupTimers.forEach(timerId => window.clearTimeout(timerId));
    this.cleanupTimers.clear();

    // Ensure no elements remain hidden if controller is torn down
    this.pendingHeaders.forEach(header => {
      this.revealHeaderChildren(header, true);
    });
    this.pendingHeaders.clear();

    this.pendingTargets.forEach(target => {
      this.revealElement(target, 0, true);
    });
    this.pendingTargets.clear();

    if (this.progressBar && this.progressBar.parentNode) {
      this.progressBar.parentNode.removeChild(this.progressBar);
    }
    this.progressBar = null;
  }

  private mountProgressBar(): void {
    const existing = document.getElementById('scroll-progress-bar');
    if (existing) {
      this.progressBar = existing;
      this.progressBar.setAttribute('aria-hidden', 'true');
      return;
    }

    const bar = document.createElement('div');
    bar.id = 'scroll-progress-bar';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    this.progressBar = bar;
  }

  private initIntersectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      this.observer = null;
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        if (this.isDestroyed) return;
        this.handleIntersections(entries);
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.06
      }
    );
  }

  private initMutationObserver(): void {
    if (typeof MutationObserver === 'undefined') return;

    this.mutationObserver = new MutationObserver((mutations) => {
      if (this.isDestroyed) return;

      const addedRoots: HTMLElement[] = [];
      for (const mutation of mutations) {
        if (mutation.type !== 'childList' || mutation.addedNodes.length === 0) continue;
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement && node.id !== 'scroll-progress-bar') {
            addedRoots.push(node);
          }
        });
      }

      if (addedRoots.length === 0) return;

      this.pruneDisconnected();

      for (const root of addedRoots) {
        if (!root.isConnected) continue;
        const hostSection = root.closest('section, footer');
        const forceImmediate = Boolean(hostSection && this.revealedSections.has(hostSection));
        this.scanSubtree(root, forceImmediate);
      }

      this.updateProgressBar();
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private bindScrollListeners(): void {
    window.addEventListener('scroll', this.handleScrollOrResize, { passive: true });
    window.addEventListener('resize', this.handleScrollOrResize, { passive: true });
    if (document.readyState !== 'complete') {
      window.addEventListener('load', this.handleScrollOrResize, { passive: true, once: true });
    }
  }

  private handleScrollOrResize = (): void => {
    if (this.isDestroyed || this.scrollRafId !== null) return;

    this.scrollRafId = window.requestAnimationFrame(() => {
      this.scrollRafId = null;
      if (this.isDestroyed) return;
      this.updateProgressBar();
      this.checkFallbackVisibility();
    });
  };

  private updateProgressBar(): void {
    if (!this.progressBar) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
    this.progressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
  }

  private pruneDisconnected(): void {
    this.pendingTargets.forEach((el) => {
      if (!el.isConnected) {
        this.observer?.unobserve(el);
        this.pendingTargets.delete(el);
      }
    });

    this.pendingHeaders.forEach((header) => {
      if (!header.isConnected) {
        this.observer?.unobserve(header);
        this.pendingHeaders.delete(header);
      }
    });
  }

  private isHiddenByDisplay(el: HTMLElement): boolean {
    return window.getComputedStyle(el).display === 'none';
  }

  private queryIncludingSelf(root: HTMLElement, selector: string): HTMLElement[] {
    const results: HTMLElement[] = [];
    if (root.matches(selector)) {
      results.push(root);
    }
    root.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      results.push(el);
    });
    return results;
  }

  private scanSubtree(root: HTMLElement, forceImmediate: boolean): void {
    // 1. Section headers (tag -> headline -> subline)
    const headerContainers = new Set<HTMLElement>();
    const directAncestorHeader = root.closest<HTMLElement>('.section-meta-header');
    if (directAncestorHeader) {
      headerContainers.add(directAncestorHeader);
    }
    this.queryIncludingSelf(root, '.section-meta-header').forEach((header) => {
      headerContainers.add(header);
    });

    headerContainers.forEach((header) => {
      this.registerSectionHeader(header, forceImmediate);
    });

    // Optional standalone .why-attend-header (only if not handled by .section-meta-header)
    this.queryIncludingSelf(root, '.why-attend-header').forEach((el) => {
      if (el.classList.contains('section-meta-header') || el.querySelector('.section-meta-header')) {
        return;
      }
      this.registerTarget(el, 'sr-header-item', null, forceImmediate);
    });

    // 2. Staggered Card Grids & Tables
    for (const rule of STAGGER_RULES) {
      this.queryIncludingSelf(root, rule.itemSelector).forEach((el) => {
        const host = el.closest(rule.containerSelector);
        if (!host) return;
        this.registerTarget(el, 'sr-card-item', { host, stepMs: rule.stepMs }, forceImmediate);
      });
    }

    // 3. Standalone Banners / Cards / Action Rows
    const standaloneSelector = STANDALONE_CARD_SELECTORS.join(', ');
    this.queryIncludingSelf(root, standaloneSelector).forEach((el) => {
      this.registerTarget(el, 'sr-card-item', null, forceImmediate);
    });

    // 4. Two-Column Directional Panels
    const leftSelector = PANEL_LEFT_SELECTORS.join(', ');
    this.queryIncludingSelf(root, leftSelector).forEach((el) => {
      if (!el.closest('.pass-generator-grid, .venue-grid')) return;
      this.registerTarget(el, 'sr-panel-left', null, forceImmediate);
    });

    const rightSelector = PANEL_RIGHT_SELECTORS.join(', ');
    this.queryIncludingSelf(root, rightSelector).forEach((el) => {
      if (!el.closest('.pass-generator-grid, .venue-grid')) return;
      this.registerTarget(el, 'sr-panel-right', null, forceImmediate);
    });
  }

  private getHeaderChildren(header: HTMLElement): Array<{ el: HTMLElement; delayMs: number }> {
    const items: Array<{ el: HTMLElement; delayMs: number }> = [];
    const seen = new Set<HTMLElement>();

    header.querySelectorAll<HTMLElement>('.section-tag, .overview-header-tagline').forEach((el) => {
      if (!seen.has(el)) {
        seen.add(el);
        items.push({ el, delayMs: 0 });
      }
    });

    header.querySelectorAll<HTMLElement>('.section-headline').forEach((el) => {
      if (!seen.has(el)) {
        seen.add(el);
        items.push({ el, delayMs: 60 });
      }
    });

    header.querySelectorAll<HTMLElement>('.section-sub').forEach((el) => {
      if (!seen.has(el)) {
        seen.add(el);
        items.push({ el, delayMs: 120 });
      }
    });

    return items;
  }

  private registerSectionHeader(header: HTMLElement, forceImmediate: boolean): void {
    if (this.isHiddenByDisplay(header)) return;
    if (this.registeredElements.has(header)) return;

    const children = this.getHeaderChildren(header);
    if (children.length === 0) return;

    this.registeredElements.add(header);

    const rect = header.getBoundingClientRect();
    const alreadyPassedAbove = rect.width > 0 && rect.height > 0 && rect.bottom <= 0;
    const ioUnsupported = typeof IntersectionObserver === 'undefined';
    const immediate = forceImmediate || alreadyPassedAbove || ioUnsupported;

    if (immediate) {
      children.forEach(({ el }) => {
        el.classList.add('sr-header-item');
        this.registeredElements.add(el);
        this.revealElement(el, 0, true);
      });
      this.markSectionRevealed(header);
      return;
    }

    children.forEach(({ el }) => {
      if (this.registeredElements.has(el)) return;
      this.registeredElements.add(el);
      el.classList.add('sr-header-item', 'sr-init', 'sr-will-change');
    });

    this.pendingHeaders.add(header);
    if (this.readyToObserve) {
      this.observer?.observe(header);
    }
  }

  private registerTarget(
    el: HTMLElement,
    variant: RevealVariant,
    groupMeta: GroupMeta | null,
    forceImmediate: boolean
  ): void {
    if (this.registeredElements.has(el)) return;
    if (this.isHiddenByDisplay(el)) return;

    this.registeredElements.add(el);
    el.classList.add(variant);

    const rect = el.getBoundingClientRect();
    const alreadyPassedAbove = rect.width > 0 && rect.height > 0 && rect.bottom <= 0;
    const ioUnsupported = typeof IntersectionObserver === 'undefined';

    if (forceImmediate || alreadyPassedAbove || ioUnsupported) {
      this.revealElement(el, 0, true);
      this.markSectionRevealed(el);
      return;
    }

    if (groupMeta) {
      this.elementGroups.set(el, groupMeta);
    }

    el.classList.add('sr-init', 'sr-will-change');
    this.pendingTargets.add(el);
    if (this.readyToObserve) {
      this.observer?.observe(el);
    }
  }

  private handleIntersections(entries: IntersectionObserverEntry[]): void {
    const intersectingHeaders: HTMLElement[] = [];
    const intersectingTargets: HTMLElement[] = [];

    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (!(entry.target instanceof HTMLElement)) continue;
      const target = entry.target;

      if (this.pendingHeaders.has(target)) {
        this.pendingHeaders.delete(target);
        this.observer?.unobserve(target);
        intersectingHeaders.push(target);
      } else if (this.pendingTargets.has(target)) {
        this.pendingTargets.delete(target);
        this.observer?.unobserve(target);
        intersectingTargets.push(target);
      }
    }

    for (const header of intersectingHeaders) {
      this.revealHeaderChildren(header, false);
    }

    if (intersectingTargets.length > 0) {
      this.revealTargetBatch(intersectingTargets);
    }
  }

  private revealHeaderChildren(header: HTMLElement, immediate: boolean): void {
    const children = this.getHeaderChildren(header);
    children.forEach(({ el, delayMs }) => {
      this.revealElement(el, delayMs, immediate);
    });
    this.markSectionRevealed(header);
  }

  private revealTargetBatch(targets: HTMLElement[]): void {
    // Sort in visual DOM order so staggered waves always flow left-to-right, top-to-bottom
    targets.sort((a, b) => {
      if (a === b) return 0;
      const pos = a.compareDocumentPosition(b);
      if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
      if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
      return 0;
    });

    const grouped = new Map<Element, { stepMs: number; items: HTMLElement[] }>();
    const ungrouped: HTMLElement[] = [];

    for (const el of targets) {
      const meta = this.elementGroups.get(el);
      if (meta) {
        let bucket = grouped.get(meta.host);
        if (!bucket) {
          bucket = { stepMs: meta.stepMs, items: [] };
          grouped.set(meta.host, bucket);
        }
        bucket.items.push(el);
      } else {
        ungrouped.push(el);
      }
    }

    grouped.forEach(({ stepMs, items }) => {
      items.forEach((el, index) => {
        const delayMs = Math.min(index * stepMs, MAX_STAGGER_DELAY_MS);
        if (delayMs > 0) {
          el.style.setProperty('--sr-delay', `${delayMs}ms`);
        }
        this.revealElement(el, delayMs, false);
        this.markSectionRevealed(el);
      });
    });

    for (const el of ungrouped) {
      const panelDelay = el.classList.contains('sr-panel-right') && window.innerWidth > 900 ? 70 : 0;
      this.revealElement(el, panelDelay, false);
      this.markSectionRevealed(el);
    }
  }

  private revealElement(el: HTMLElement, delayMs: number, immediate: boolean): void {
    if (immediate) {
      el.classList.remove('sr-will-change');
      el.style.removeProperty('--sr-delay');
      el.classList.add('sr-init', 'is-sr-visible', 'sr-settled');
      return;
    }

    if (!el.classList.contains('sr-init')) {
      el.classList.add('sr-init');
    }
    el.classList.add('is-sr-visible');

    let settled = false;
    let timerId = 0;

    const finishReveal = () => {
      if (settled) return;
      settled = true;
      el.removeEventListener('transitionend', onTransitionEnd);
      window.clearTimeout(timerId);
      this.cleanupTimers.delete(timerId);
      this.activeCleanups.delete(cleanupOnly);
      el.classList.remove('sr-will-change');
      el.classList.add('sr-settled');
      el.style.removeProperty('--sr-delay');
    };

    const cleanupOnly = () => {
      if (settled) return;
      settled = true;
      el.removeEventListener('transitionend', onTransitionEnd);
      window.clearTimeout(timerId);
      this.cleanupTimers.delete(timerId);
    };

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== el) return;
      if (e.propertyName === 'transform') {
        finishReveal();
      }
    };

    el.addEventListener('transitionend', onTransitionEnd, { passive: true });
    timerId = window.setTimeout(finishReveal, delayMs + BASE_TRANSFORM_DURATION_MS + CLEANUP_BUFFER_MS);
    this.cleanupTimers.add(timerId);
    this.activeCleanups.add(cleanupOnly);
  }

  private checkFallbackVisibility(): void {
    if (this.isDestroyed) return;
    if (this.pendingHeaders.size === 0 && this.pendingTargets.size === 0) return;

    const vh = window.innerHeight || document.documentElement.clientHeight || 0;
    if (vh <= 0) return;

    const docHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const nearBottom = scrollTop + vh >= docHeight - 24;
    const triggerY = nearBottom ? vh : vh * 0.94;

    this.pendingHeaders.forEach((header) => {
      if (!header.isConnected || this.isHiddenByDisplay(header)) return;
      const rect = header.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      if (rect.bottom <= 0) {
        this.pendingHeaders.delete(header);
        this.observer?.unobserve(header);
        this.revealHeaderChildren(header, true);
      } else if (rect.top <= triggerY && (nearBottom || rect.bottom <= vh || rect.top <= vh * 0.85)) {
        this.pendingHeaders.delete(header);
        this.observer?.unobserve(header);
        this.revealHeaderChildren(header, false);
      }
    });

    const fallbackBatch: HTMLElement[] = [];
    this.pendingTargets.forEach((el) => {
      if (!el.isConnected || this.isHiddenByDisplay(el)) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) return;

      if (rect.bottom <= 0) {
        this.pendingTargets.delete(el);
        this.observer?.unobserve(el);
        this.revealElement(el, 0, true);
        this.markSectionRevealed(el);
      } else if (rect.top <= triggerY && (nearBottom || rect.top <= vh * 0.88)) {
        this.pendingTargets.delete(el);
        this.observer?.unobserve(el);
        fallbackBatch.push(el);
      }
    });

    if (fallbackBatch.length > 0) {
      this.revealTargetBatch(fallbackBatch);
    }
  }

  private markSectionRevealed(el: Element): void {
    const section = el.closest('section, footer');
    if (section) {
      this.revealedSections.add(section);
    }
  }
}
