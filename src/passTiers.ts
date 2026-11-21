import { sound } from './audio';
import confetti from 'canvas-confetti';

export interface SinglePassDetails {
  title: string;
  badge: string;
  edition: string;
  date: string;
  hours: string;
  venue: string;
  capacity: string;
  konfhubUrl: string;
  inclusions: string[];
}

export const OFFICIAL_PASS: SinglePassDetails = {
  title: 'PASS',
  badge: 'OFFICIAL ADMISSION: IN-PERSON DELEGATE',
  edition: 'PUNE BUILDER SPECIAL // EDITION 2026',
  date: '27 DECEMBER 2026',
  hours: '08:00 AM – 05:30 PM IST',
  venue: 'SEASONS 24, WAGHOLI, PUNE',
  capacity: '300 STUDENT BUILDERS',
  konfhubUrl: 'https://konfhub.com/aws-scd-pune-2026',
  inclusions: [
    'Admission to all Keynotes, Technical Deep Dives & Panel Discussion',
    'Exclusive AWS Student Community Day Pune Swag & Builder Kit',
    'Morning breakfast, buffet lunch, and evening high-tea at Seasons 24',
    'Verified digital participation certificate & social badge',
    'Direct face-to-face networking with AWS Community Leaders & Mentors',
    'Full access to sponsor exhibits & interactive tech demos'
  ]
};

export class PassTiersController {
  private container: HTMLElement;
  private isTorn: boolean = false;
  private isDragging: boolean = false;
  private startY: number = 0;
  private startX: number = 0;
  private currentProgress: number = 0;
  private lastSoundProgress: number = 0;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render() {
    const pass = OFFICIAL_PASS;

    this.container.innerHTML = `
      <div class="passes-section-wrapper">
        <!-- Section Header -->
        <div class="section-meta-header">
          <span class="section-tag mono">(04) // TICKETS & REGISTRATION</span>
          <h2 class="section-headline">Official Admission Pass. Powered by KonfHub.</h2>
          <p class="section-sub">
            One single pass. All-inclusive in-person admission to all keynotes, technical sessions, and community networking at Seasons 24, Wagholi on 27 December 2026.
          </p>
        </div>

        <!-- Registration Partner Banner -->
        <div class="konfhub-banner mono">
          <div class="partner-badge">[PARTNER] OFFICIAL REGISTRATION PLATFORM</div>
          <div class="partner-info">
            <span>KONFHUB SECURE TICKETING ENGINE</span>
            <span class="sep">/</span>
            <span>INSTANT QR ADMISSION CONFIRMATION</span>
            <span class="sep">/</span>
            <span>VENUE: SEASONS 24, WAGHOLI, PUNE</span>
          </div>
        </div>

        <!-- The Physical Perforated Ticket Stub Card -->
        <div class="ticket-stub-wrapper">
          <div class="ticket-stub-card mono" id="ticket-stub-card">
            <!-- Main Ticket Body (Left) -->
            <div class="ticket-main-body">
              <div class="ticket-ragged-edge-left" aria-hidden="true"></div>

              <div class="ticket-top-meta">
                <span class="ticket-badge-pill">[${pass.badge}]</span>
                <span class="ticket-edition-tag">${pass.edition}</span>
              </div>

              <div class="ticket-title-row">
                <div class="ticket-title-group">
                  <span class="ticket-eyebrow">AWS STUDENT COMMUNITY DAY 2026</span>
                  <h3 class="ticket-giant-title">${pass.title}</h3>
                  <span class="ticket-subheading">All-Access In-Person Delegate Admission</span>
                </div>
                <div class="ticket-price-pill" id="ticket-price-pill">
                  <span class="price-status">ALL-INCLUSIVE ADMISSION</span>
                  <span class="price-platform">[POWERED BY KONFHUB]</span>
                </div>
              </div>

              <!-- Event Parameters Matrix -->
              <div class="ticket-parameters-matrix">
                <div class="param-cell">
                  <span class="param-lbl">DATE:</span>
                  <strong class="param-val">${pass.date}</strong>
                </div>
                <div class="param-cell">
                  <span class="param-lbl">HOURS:</span>
                  <strong class="param-val">${pass.hours}</strong>
                </div>
                <div class="param-cell">
                  <span class="param-lbl">VENUE:</span>
                  <strong class="param-val">${pass.venue}</strong>
                </div>
                <div class="param-cell">
                  <span class="param-lbl">CAPACITY:</span>
                  <strong class="param-val">${pass.capacity}</strong>
                </div>
              </div>

              <!-- Inclusions Checklist -->
              <div class="ticket-inclusions-block">
                <span class="inclusions-label">ADMISSION PRIVILEGES & INCLUSIONS:</span>
                <ul class="inclusions-grid">
                  ${pass.inclusions.map(inc => `<li>[OK] ${inc}</li>`).join('')}
                </ul>
              </div>

              <!-- Action CTAs -->
              <div class="ticket-actions-row">
                <a 
                  href="${pass.konfhubUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="btn-brutalist btn-accent btn-ticket-konfhub"
                  id="btn-konfhub-direct-link">
                  REGISTER PASS ON KONFHUB [EXTERNAL ->]
                </a>
                <a href="#pass-generator" class="btn-brutalist btn-secondary btn-ticket-badge">
                  CUSTOMIZE YOUR BADGE FIRST [v]
                </a>
              </div>
            </div>

            <!-- Vertical Perforation Divider with Physical Semi-Circle Punches -->
            <div 
              class="ticket-perforation-divider" 
              id="ticket-perforation"
              tabindex="0"
              role="button"
              aria-label="Tear admission ticket stub to register on KonfHub"
              title="Click or drag down to tear ticket stub">
              <div class="punch-notch punch-top"></div>
              <div class="perforation-dashed-line">
                <div class="perforation-rip-fill" id="rip-fill"></div>
              </div>
              <div class="perforation-label mono">
                <span class="label-txt">TEAR HERE</span>
                <span class="label-drag-hint">[PULL v]</span>
              </div>
              <div class="tear-hint-pill mono" id="tear-hint-pill">
                [CLICK OR DRAG TO TEAR]
              </div>
              <div class="punch-notch punch-bottom"></div>
            </div>

            <!-- Tear-off Verification Stub (Right) -->
            <div class="ticket-stub-aside" id="ticket-stub-aside">
              <div class="stub-ragged-edge" aria-hidden="true"></div>

              <div class="stub-header">
                <span class="stub-label">GATE ACCESS STUB</span>
                <span class="stub-serial">#SCD26-PUN-00127</span>
              </div>

              <div class="stub-barcode-box">
                <div class="ascii-barcode">
||| | |||| | || ||||| | ||| ||| | ||
||| | |||| | || ||||| | ||| ||| | ||
||| | |||| | || ||||| | ||| ||| | ||
                </div>
                <span class="barcode-num">* 27-12-2026-SEASONS-24 *</span>
              </div>

              <div class="stub-specs-list">
                <div class="stub-row">
                  <span>PASS:</span>
                  <strong>ALL-ACCESS</strong>
                </div>
                <div class="stub-row">
                  <span>CITY:</span>
                  <strong>PUNE, IN</strong>
                </div>
                <div class="stub-row">
                  <span>GATE:</span>
                  <strong>LOCAL-01</strong>
                </div>
                <div class="stub-row">
                  <span>STATUS:</span>
                  <strong class="text-accent" id="stub-status-val">READY</strong>
                </div>
              </div>

              <div class="stub-verified-badge">
                <span>[VERIFIED: OFFICIAL KONFHUB ENGINE]</span>
              </div>

              <button 
                type="button" 
                class="btn-brutalist btn-accent w-full text-center stub-cta-btn"
                id="btn-stub-konfhub-link">
                TEAR & CLAIM PASS ->
              </button>
            </div>

            <!-- Claimed Souvenir Stub Receipt Placeholder (revealed when stub tears off) -->
            <div class="ticket-stub-claimed mono" id="ticket-stub-claimed" aria-hidden="true">
              <div class="claimed-header">
                <span class="claimed-tag">[STATUS: TICKET TORN]</span>
                <span class="claimed-serial">#SCD26-PUN-00127</span>
              </div>
              <div class="claimed-body">
                <div class="claimed-barcode-icon">
                  ||| | |||| | || ||||| | |||
                </div>
                <strong class="claimed-title">ADMISSION STUB DETACHED</strong>
                <p class="claimed-desc">
                  Delegate admission submitted. Redirecting to official KonfHub registration...
                </p>
                <a 
                  href="${pass.konfhubUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="btn-brutalist btn-accent claimed-action-btn"
                  id="btn-reopen-konfhub">
                  OPEN KONFHUB REGISTRATION [->]
                </a>
                <button type="button" class="btn-reset-ticket mono" id="btn-reset-ticket">
                  [RESET & TEAR AGAIN]
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents() {
    // Direct link on main ticket body
    const directKonfhubBtn = this.container.querySelector<HTMLAnchorElement>('#btn-konfhub-direct-link');
    if (directKonfhubBtn) {
      directKonfhubBtn.addEventListener('click', () => {
        sound.playSuccess();
        confetti({
          particleCount: 70,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#FD0B03', '#010101', '#DCD4C2', '#5C413C']
        });
      });
    }

    // Badge generator scroll anchor
    const badgeLink = this.container.querySelector<HTMLAnchorElement>('.btn-ticket-badge');
    if (badgeLink) {
      badgeLink.addEventListener('click', (e) => {
        e.preventDefault();
        sound.playClick(680, 0.03);
        const target = document.getElementById('pass-generator');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    // Reset button
    const resetBtn = this.container.querySelector<HTMLButtonElement>('#btn-reset-ticket');
    if (resetBtn) {
      resetBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetTicket();
      });
    }

    this.setupTearInteractions();
  }

  private setupTearInteractions() {
    const perf = this.container.querySelector<HTMLElement>('#ticket-perforation');
    const stub = this.container.querySelector<HTMLElement>('#ticket-stub-aside');
    const ripFill = this.container.querySelector<HTMLElement>('#rip-fill');
    const card = this.container.querySelector<HTMLElement>('#ticket-stub-card');
    const stubCta = this.container.querySelector<HTMLElement>('#btn-stub-konfhub-link');

    if (!perf || !stub || !card) return;

    // Hover audio tick
    perf.addEventListener('pointerenter', () => {
      if (!this.isTorn && !this.isDragging) {
        sound.playClick(880, 0.015);
      }
    });

    // Simple Click on perforation divider
    perf.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!this.isTorn && !this.isDragging) {
        this.triggerTear();
      }
    });

    // Keyboard support (Enter or Space)
    perf.addEventListener('keydown', (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !this.isTorn) {
        e.preventDefault();
        this.triggerTear();
      }
    });

    // Click on right-side stub button also activates tear sequence
    if (stubCta) {
      stubCta.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.isTorn) {
          this.triggerTear();
        }
      });
    }

    // Pointer Dragging (works across mouse, pen, and touch swipe)
    perf.addEventListener('pointerdown', (e: PointerEvent) => {
      if (this.isTorn) return;
      this.isDragging = true;
      this.startY = e.clientY;
      this.startX = e.clientX;
      this.currentProgress = 0;
      this.lastSoundProgress = 0;

      try {
        perf.setPointerCapture(e.pointerId);
      } catch {}

      card.classList.add('is-tearing');
      stub.style.transition = 'none';
      sound.playClick(650, 0.02);
    });

    perf.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isDragging || this.isTorn) return;

      const rect = perf.getBoundingClientRect();
      const isHorizontal = window.innerWidth <= 960;
      const totalLength = isHorizontal ? rect.width : rect.height;
      const dragDist = isHorizontal ? (e.clientX - this.startX) : (e.clientY - this.startY);

      // Drag progress bounded [0, 1]
      this.currentProgress = Math.min(1, Math.max(0, dragDist / (totalLength * 0.7)));

      // Update rip fill line
      if (ripFill) {
        if (isHorizontal) {
          ripFill.style.width = `${this.currentProgress * 100}%`;
          ripFill.style.height = '100%';
        } else {
          ripFill.style.height = `${this.currentProgress * 100}%`;
          ripFill.style.width = '100%';
        }
      }

      // Tilt and separate stub dynamically
      if (isHorizontal) {
        const transY = this.currentProgress * 24;
        const rot = this.currentProgress * 3;
        stub.style.transform = `translate3d(0, ${transY}px, 0) rotate(${rot}deg)`;
      } else {
        const transX = this.currentProgress * 28;
        const transY = this.currentProgress * 16;
        const rot = this.currentProgress * 4.5;
        stub.style.transform = `translate3d(${transX}px, ${transY}px, 0) rotate(${rot}deg)`;
      }
      stub.style.boxShadow = `${8 + this.currentProgress * 16}px ${8 + this.currentProgress * 16}px 0px rgba(1, 1, 1, ${0.3 + this.currentProgress * 0.4})`;

      // Audio ticks on progress increments
      if (this.currentProgress - this.lastSoundProgress >= 0.14) {
        this.lastSoundProgress = this.currentProgress;
        sound.playClick(580 + this.currentProgress * 480, 0.025);
      }

      // Dragged past 72%: automatically complete the tear!
      if (this.currentProgress >= 0.72) {
        this.isDragging = false;
        try {
          perf.releasePointerCapture(e.pointerId);
        } catch {}
        this.triggerTear();
      }
    });

    const finishDrag = (e: PointerEvent) => {
      if (!this.isDragging || this.isTorn) return;
      this.isDragging = false;
      try {
        perf.releasePointerCapture(e.pointerId);
      } catch {}

      if (this.currentProgress >= 0.45) {
        this.triggerTear();
      } else {
        // Snap back to intact
        card.classList.remove('is-tearing');
        stub.style.transition = 'transform 0.32s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.32s ease';
        stub.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        stub.style.boxShadow = '';
        if (ripFill) {
          ripFill.style.height = '0%';
          ripFill.style.width = '0%';
        }
        setTimeout(() => {
          if (!this.isTorn) {
            stub.style.transition = '';
          }
        }, 340);
      }
    };

    perf.addEventListener('pointerup', finishDrag);
    perf.addEventListener('pointercancel', finishDrag);
  }

  private triggerTear() {
    if (this.isTorn) return;
    this.isTorn = true;

    const card = this.container.querySelector<HTMLElement>('#ticket-stub-card');
    const stub = this.container.querySelector<HTMLElement>('#ticket-stub-aside');
    const ripFill = this.container.querySelector<HTMLElement>('#rip-fill');
    const claimedReceipt = this.container.querySelector<HTMLElement>('#ticket-stub-claimed');
    const pricePill = this.container.querySelector<HTMLElement>('#ticket-price-pill');
    const stubStatus = this.container.querySelector<HTMLElement>('#stub-status-val');

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Procedural paper tear audio + celebration chime
    sound.playPaperTear();
    sound.playSuccess();

    // Celebratory confetti burst
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.62 },
      colors: ['#FD0B03', '#010101', '#DCD4C2', '#5C413C']
    });

    // Update status labels
    if (stubStatus) {
      stubStatus.textContent = 'CLAIMED';
    }
    if (pricePill) {
      pricePill.innerHTML = `
        <span class="price-status text-accent">[TICKET TORN // CLAIMED]</span>
        <span class="price-platform">[REDIRECTING TO KONFHUB...]</span>
      `;
    }

    if (card) {
      card.classList.add('is-tearing');
    }
    if (ripFill) {
      ripFill.style.height = '100%';
      ripFill.style.width = '100%';
    }

    if (prefersReducedMotion) {
      if (card) {
        card.classList.remove('is-tearing');
        card.classList.add('is-torn');
      }
      if (claimedReceipt) {
        claimedReceipt.classList.add('show-claimed');
        claimedReceipt.setAttribute('aria-hidden', 'false');
      }
      window.open(OFFICIAL_PASS.konfhubUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Detach stub with momentum animation
    setTimeout(() => {
      if (card) {
        card.classList.remove('is-tearing');
        card.classList.add('is-torn');
      }
      if (stub) {
        stub.style.transition = '';
      }
      if (claimedReceipt) {
        claimedReceipt.classList.add('show-claimed');
        claimedReceipt.setAttribute('aria-hidden', 'false');
      }
    }, 180);

    // After animation completes (~750ms), transition to KonfHub
    setTimeout(() => {
      window.open(OFFICIAL_PASS.konfhubUrl, '_blank', 'noopener,noreferrer');
    }, 760);
  }

  private resetTicket() {
    this.isTorn = false;
    this.isDragging = false;
    this.currentProgress = 0;
    this.lastSoundProgress = 0;

    const card = this.container.querySelector<HTMLElement>('#ticket-stub-card');
    const stub = this.container.querySelector<HTMLElement>('#ticket-stub-aside');
    const ripFill = this.container.querySelector<HTMLElement>('#rip-fill');
    const claimedReceipt = this.container.querySelector<HTMLElement>('#ticket-stub-claimed');
    const pricePill = this.container.querySelector<HTMLElement>('#ticket-price-pill');
    const stubStatus = this.container.querySelector<HTMLElement>('#stub-status-val');

    if (stubStatus) {
      stubStatus.textContent = 'READY';
    }
    if (pricePill) {
      pricePill.innerHTML = `
        <span class="price-status">ALL-INCLUSIVE ADMISSION</span>
        <span class="price-platform">[POWERED BY KONFHUB]</span>
      `;
    }

    if (card) {
      card.classList.remove('is-tearing', 'is-torn');
    }
    if (stub) {
      stub.style.transform = '';
      stub.style.boxShadow = '';
      stub.style.transition = '';
    }
    if (ripFill) {
      ripFill.style.height = '0%';
      ripFill.style.width = '0%';
    }
    if (claimedReceipt) {
      claimedReceipt.classList.remove('show-claimed');
      claimedReceipt.setAttribute('aria-hidden', 'false');
    }

    sound.playClick(720, 0.02);
  }
}
