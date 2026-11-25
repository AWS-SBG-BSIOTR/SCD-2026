import { sound } from './audio';
import confetti from 'canvas-confetti';

export interface SinglePassDetails {
  title: string;
  badge: string;
  edition: string;
  date: string;
  hours: string;
  venue: string;
  access: string;
  konfhubUrl: string;
}

export interface PassTierCard {
  id: string;
  number: string;
  name: string;
  badge: string;
  price: string;
  priceSub: string;
  tagline: string;
  isOpen: boolean;
  variant: 'featured' | 'standard' | 'pro';
  checkoutUrl?: string;
  highlightedPerk?: string;
  inclusions: string[];
}

export const OFFICIAL_PASS: SinglePassDetails = {
  title: 'PASS',
  badge: 'OFFICIAL ADMISSION: IN-PERSON DELEGATE',
  edition: 'PUNE BUILDER SPECIAL // EDITION 2026',
  date: '27 DECEMBER 2026',
  hours: '08:00 AM – 05:00 PM IST',
  venue: 'SEASONS 24, WAGHOLI, PUNE',
  access: 'ALL STUDENT BUILDERS',
  konfhubUrl: 'https://konfhub.com/aws-student-community-day-pune-2026'
};

export const PASS_TIERS_DATA: PassTierCard[] = [
  {
    id: 'tier-early-bird',
    number: '01',
    name: 'EARLY BIRD PASS',
    badge: 'ACTIVE NOW // LIMITED SEATS',
    price: '₹299',
    priceSub: 'EXCLUSIVE INTRODUCTORY PRICE',
    tagline: 'Be an early bird and secure your seat at AWS Student Community Day Pune 2026 at an introductory price.',
    isOpen: true,
    variant: 'featured',
    checkoutUrl: 'https://konfhub.com/aws-student-community-day-pune-2026',
    inclusions: [
      'Full-day access to the conference',
      'Breakfast and delicious lunch',
      'Exclusive event swags and AWS goodies',
      'Credly badge for participants',
      'Networking with industry professionals, speakers & developers'
    ]
  },
  {
    id: 'tier-regular',
    number: '02',
    name: 'REGULAR PASS',
    badge: 'PHASE 02 // UNLOCKS NEXT',
    price: '₹ X99',
    priceSub: 'RELEASING AFTER EARLY BIRD',
    tagline: 'Standard all-access conference pass opening once the initial Early Bird allocation closes.',
    isOpen: false,
    variant: 'standard',
    inclusions: [
      'Full-day access to the conference',
      'Breakfast and delicious lunch',
      'Exclusive event swags and AWS goodies',
      'Credly badge for participants',
      'Networking with industry professionals, speakers & developers'
    ]
  },
  {
    id: 'tier-professional',
    number: '03',
    name: 'PROFESSIONAL PASS',
    badge: 'PRIORITY TIER // UNLOCKS NEXT',
    price: '₹ X99',
    priceSub: 'WORKING ENGINEERS & LEADERS',
    tagline: 'Tailored for software engineers, architects, and tech professionals joining Pune’s cloud builder community.',
    isOpen: false,
    variant: 'pro',
    highlightedPerk: 'Reserved seating at Hall 1',
    inclusions: [
      'Full-day access to the conference',
      'Breakfast and delicious lunch',
      'Exclusive event swags and AWS goodies',
      'Credly badge for participants',
      'Networking with industry professionals, speakers & developers'
    ]
  }
];

export class PassTiersController {
  private container: HTMLElement;
  private isTorn: boolean = false;
  private isRejoining: boolean = false;
  private isDragging: boolean = false;
  private suppressNextClick: boolean = false;
  private startY: number = 0;
  private startX: number = 0;
  private currentProgress: number = 0;
  private lastSoundProgress: number = 0;
  private autoRejoinTimeout: number | null = null;
  private tearCompleteTimeout: number | null = null;
  private rejoinCompleteTimeout: number | null = null;
  private snapBackTimeout: number | null = null;
  private visibilityRejoinTimeout: number | null = null;
  private abortController: AbortController = new AbortController();

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



        <!-- The Physical Perforated Ticket Stub Card -->
        <div class="ticket-stub-wrapper">
          <div class="ticket-stub-card mono" id="ticket-stub-card">
            <!-- Main Ticket Body (Left) -->
            <div class="ticket-main-body">
              <div class="ticket-ragged-edge-left" aria-hidden="true"></div>

              <div class="ticket-top-meta">
                <span class="ticket-badge-pill">[${pass.badge}]</span>
              </div>

              <div class="ticket-title-row">
                <div class="ticket-title-group">
                  <span class="ticket-eyebrow">AWS STUDENT COMMUNITY DAY 2026</span>
                  <h3 class="ticket-giant-title">${pass.title}</h3>
                  <span class="ticket-subheading">All-Access In-Person Delegate Admission</span>
                </div>
                <div class="ticket-price-pill" id="ticket-price-pill">
                  <span class="price-status">EARLY BIRD ADMISSION</span>
                  <span class="price-platform">[PHASE 01 NOW LIVE]</span>
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
                  <span class="param-lbl">ACCESS:</span>
                  <strong class="param-val">${pass.access}</strong>
                </div>
              </div>

              <!-- Action CTAs -->
              <div class="ticket-actions-row">
                <a 
                  href="${pass.konfhubUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="btn-brutalist btn-accent btn-ticket-konfhub"
                  id="btn-konfhub-direct-link">
                  REGISTER NOW ->
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
              <div class="perforation-scissor" id="perforation-scissor" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="58" height="58" aria-hidden="true" focusable="false">
                  <g class="scissor-blade-a" id="scissor-blade-a">
                    <circle cx="8.2" cy="5.2" r="2.7" fill="none" stroke="#FD0B03" stroke-width="1.65" />
                    <path d="M8.6 7.5 L11.1 12.1 L12.4 22.0 L13.1 12.0 L9.9 7.2 Z" fill="#010101" stroke="#FFFFFF" stroke-width="0.3" stroke-linejoin="round" />
                  </g>
                  <g class="scissor-blade-b" id="scissor-blade-b">
                    <circle cx="15.8" cy="5.2" r="2.7" fill="none" stroke="#FD0B03" stroke-width="1.65" />
                    <path d="M15.4 7.5 L12.9 12.1 L11.6 22.0 L10.9 12.0 L14.1 7.2 Z" fill="#010101" stroke="#FFFFFF" stroke-width="0.3" stroke-linejoin="round" />
                  </g>
                  <circle class="scissor-pin" cx="12" cy="12" r="1.4" fill="#FD0B03" stroke="#FFFFFF" stroke-width="0.55" />
                </svg>
              </div>
              <div class="perforation-label mono">
                <span class="label-txt">TEAR HERE</span>
                <span class="label-drag-hint">[PULL v]</span>
              </div>
              <div class="tear-hint-pill mono" id="tear-hint-pill">
                <span class="tear-hint-dot" aria-hidden="true"></span>
                <span class="hint-desktop">[DRAG DOWN TO CUT v]</span>
                <span class="hint-mobile">[TAP OR SWIPE TO TEAR ->]</span>
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
                TEAR & REGISTER ->
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
                  REGISTER NOW ->
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 3 Pass Tiers Comparison Grid (Below the Tearable Ticket) -->
        <div class="pass-tiers-section mono" id="pass-tiers-grid">
          <div class="tiers-section-header">
            <span class="tiers-tag">[PASS TIERS // PHASE 01 EARLY BIRD OPEN]</span>
            <span class="tiers-note">WHERE BUILDERS MEET. IDEAS EVOLVE. FUTURES BEGIN.</span>
          </div>

          <div class="pass-tiers-grid">
            ${PASS_TIERS_DATA.map(tier => `
              <article class="pass-tier-card tier-${tier.variant} ${tier.isOpen ? 'is-live' : 'is-locked'}" id="${tier.id}">
                <div class="tier-card-top">
                  <span class="tier-num">[${tier.number}]</span>
                  <span class="tier-status-badge ${tier.isOpen ? 'is-live' : ''}">${tier.badge}</span>
                </div>

                <h3 class="tier-title">${tier.name}</h3>

                <div class="tier-price-block">
                  <span class="tier-price">${tier.price}</span>
                  <span class="tier-price-sub">${tier.priceSub}</span>
                </div>

                <p class="tier-tagline">${tier.tagline}</p>

                <div class="tier-inclusions-wrapper">
                  <span class="tier-inclusions-lbl">PRIVILEGES &amp; AMENITIES:</span>
                  <ul class="tier-inclusions-list">
                    ${tier.highlightedPerk ? `<li class="perk-exclusive">[+] <strong>${tier.highlightedPerk}</strong></li>` : ''}
                    ${tier.inclusions.map(inc => `<li>[OK] ${inc}</li>`).join('')}
                  </ul>
                </div>

                <div class="tier-card-cta">
                  ${tier.isOpen && tier.checkoutUrl ? `
                    <a
                      href="${tier.checkoutUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="btn-brutalist btn-accent w-full tier-register-btn">
                      REGISTER NOW ->
                    </a>
                  ` : `
                    <button
                      type="button"
                      class="btn-brutalist btn-secondary w-full tier-disabled-btn"
                      disabled
                      aria-disabled="true">
                      OPENING SOON
                    </button>
                  `}
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents() {
    this.abortController.abort();
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    // Direct links on main ticket body & Early Bird tier card
    this.container.querySelectorAll<HTMLAnchorElement>('#btn-konfhub-direct-link, .tier-register-btn').forEach(btn => {
      btn.addEventListener(
        'click',
        () => {
          sound.playSuccess();
          confetti({
            particleCount: 70,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#FD0B03', '#010101', '#DCD4C2', '#5C413C']
          });
        },
        { signal }
      );
    });

    // Auto-rejoin smoothly if user switches back to this tab from KonfHub
    document.addEventListener(
      'visibilitychange',
      () => {
        if (!document.hidden && this.isTorn && !this.isRejoining) {
          this.clearVisibilityRejoinTimeout();
          this.visibilityRejoinTimeout = window.setTimeout(() => {
            this.visibilityRejoinTimeout = null;
            if (this.isTorn && !this.isRejoining) {
              this.rejoinTicket();
            }
          }, 200);
        }
      },
      { signal }
    );

    // Clicking anywhere on the claimed receipt (except the Konfhub button) also rejoins immediately
    const claimedReceipt = this.container.querySelector<HTMLElement>('#ticket-stub-claimed');
    if (claimedReceipt) {
      claimedReceipt.addEventListener(
        'click',
        (e) => {
          const target = e.target as HTMLElement;
          if (target.closest('#btn-reopen-konfhub')) return;
          this.rejoinTicket();
        },
        { signal }
      );
    }

    this.setupTearInteractions(signal);
  }

  private setupTearInteractions(signal: AbortSignal) {
    const perf = this.container.querySelector<HTMLElement>('#ticket-perforation');
    const stub = this.container.querySelector<HTMLElement>('#ticket-stub-aside');
    const ripFill = this.container.querySelector<HTMLElement>('#rip-fill');
    const scissor = this.container.querySelector<HTMLElement>('#perforation-scissor');
    const bladeA = this.container.querySelector<SVGGElement>('#scissor-blade-a');
    const bladeB = this.container.querySelector<SVGGElement>('#scissor-blade-b');
    const card = this.container.querySelector<HTMLElement>('#ticket-stub-card');
    const stubCta = this.container.querySelector<HTMLElement>('#btn-stub-konfhub-link');

    if (!perf || !stub || !card) return;

    const resetScissorVisuals = (animateBack: boolean) => {
      if (scissor) {
        scissor.style.transition = animateBack
          ? 'top 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), left 0.28s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 0.2s ease'
          : '';
        scissor.style.top = '';
        scissor.style.left = '';
      }
      if (bladeA) bladeA.style.transform = '';
      if (bladeB) bladeB.style.transform = '';
    };

    const syncScissorToCutProgress = (progress: number, rect: DOMRect, isHorizontal: boolean) => {
      if (!scissor) return;
      const clamped = Math.min(1, Math.max(0, progress));
      const scissorSize = scissor.offsetWidth || 64;
      scissor.style.transition = 'none';

      if (isHorizontal) {
        const cutTipX = clamped * rect.width;
        const maxLeft = Math.max(6, rect.width - scissorSize * 0.72);
        const scissorX = Math.max(6, Math.min(maxLeft, cutTipX - scissorSize * 0.5));
        scissor.style.left = `${scissorX.toFixed(1)}px`;
        scissor.style.top = '50%';
      } else {
        const cutTipY = clamped * rect.height;
        const maxTop = Math.max(6, rect.height - scissorSize * 0.72);
        const scissorY = Math.max(6, Math.min(maxTop, cutTipY - scissorSize * 0.5));
        scissor.style.top = `${scissorY.toFixed(1)}px`;
        scissor.style.left = '50%';
      }

      // Snip blades strictly in response to distance cut by cursor
      const snipsPerCut = 5;
      const wave = 0.5 - 0.5 * Math.cos(clamped * Math.PI * 2 * snipsPerCut);
      const angleA = -16 + wave * 18;
      const angleB = 16 - wave * 18;
      if (bladeA) bladeA.style.transform = `rotate(${angleA.toFixed(2)}deg)`;
      if (bladeB) bladeB.style.transform = `rotate(${angleB.toFixed(2)}deg)`;
    };

    // Hover audio tick
    perf.addEventListener(
      'pointerenter',
      () => {
        if (!this.isTorn && !this.isRejoining && !this.isDragging) {
          sound.playClick(880, 0.015);
        }
      },
      { signal }
    );

    // Simple Click on perforation divider (tears if intact, rejoins if torn)
    perf.addEventListener(
      'click',
      (e) => {
        e.stopPropagation();
        if (this.suppressNextClick) {
          this.suppressNextClick = false;
          return;
        }
        if (this.isRejoining) return;
        if (this.isTorn) {
          this.rejoinTicket();
        } else if (!this.isDragging) {
          this.triggerTear();
        }
      },
      { signal }
    );

    // Keyboard support (Enter or Space)
    perf.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && !this.isTorn && !this.isRejoining) {
          e.preventDefault();
          this.triggerTear();
        }
      },
      { signal }
    );

    // Click on right-side stub button also activates tear sequence
    if (stubCta) {
      stubCta.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!this.isTorn && !this.isRejoining) {
            this.triggerTear();
          }
        },
        { signal }
      );
    }

    // Pointer Dragging (works across mouse, pen, and touch swipe)
    perf.addEventListener(
      'pointerdown',
      (e: PointerEvent) => {
        if (this.isTorn || this.isRejoining) return;
        this.clearSnapBackTimeout();
        this.isDragging = true;
        this.suppressNextClick = false;
        this.startY = e.clientY;
        this.startX = e.clientX;
        this.currentProgress = 0;
        this.lastSoundProgress = 0;

        try {
          perf.setPointerCapture(e.pointerId);
        } catch { }

        card.classList.add('is-tearing');
        stub.style.transition = 'none';
        sound.playClick(650, 0.02);
      },
      { signal }
    );

    perf.addEventListener(
      'pointermove',
      (e: PointerEvent) => {
        if (!this.isDragging || this.isTorn || this.isRejoining) return;

        if (Math.hypot(e.clientX - this.startX, e.clientY - this.startY) > 6) {
          this.suppressNextClick = true;
        }

        const rect = perf.getBoundingClientRect();
        const isHorizontal = window.innerWidth <= 960;
        const totalLength = isHorizontal ? rect.width : rect.height;
        const dragDist = isHorizontal ? (e.clientX - this.startX) : (e.clientY - this.startY);

        // Drag progress bounded [0, 1]
        this.currentProgress = Math.min(1, Math.max(0, dragDist / (totalLength * 0.7)));

        // Update rip fill line and move scissor strictly to the tip of the cut area
        if (ripFill) {
          if (isHorizontal) {
            ripFill.style.width = `${this.currentProgress * 100}%`;
            ripFill.style.height = '100%';
          } else {
            ripFill.style.height = `${this.currentProgress * 100}%`;
            ripFill.style.width = '100%';
          }
        }

        syncScissorToCutProgress(this.currentProgress, rect, isHorizontal);

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
          } catch { }
          this.triggerTear();
        }
      },
      { signal }
    );

    const finishDrag = (e: PointerEvent) => {
      if (!this.isDragging || this.isTorn) return;
      this.isDragging = false;
      try {
        perf.releasePointerCapture(e.pointerId);
      } catch { }

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
        resetScissorVisuals(true);
        this.clearSnapBackTimeout();
        this.snapBackTimeout = window.setTimeout(() => {
          this.snapBackTimeout = null;
          if (!this.isTorn && !this.isRejoining) {
            stub.style.transition = '';
            resetScissorVisuals(false);
          }
        }, 340);
      }
    };

    perf.addEventListener('pointerup', finishDrag, { signal });
    perf.addEventListener('pointercancel', finishDrag, { signal });
  }

  private clearAutoRejoin() {
    if (this.autoRejoinTimeout !== null) {
      window.clearTimeout(this.autoRejoinTimeout);
      this.autoRejoinTimeout = null;
    }
  }

  private clearTearCompleteTimeout() {
    if (this.tearCompleteTimeout !== null) {
      window.clearTimeout(this.tearCompleteTimeout);
      this.tearCompleteTimeout = null;
    }
  }

  private clearRejoinCompleteTimeout() {
    if (this.rejoinCompleteTimeout !== null) {
      window.clearTimeout(this.rejoinCompleteTimeout);
      this.rejoinCompleteTimeout = null;
    }
  }

  private clearSnapBackTimeout() {
    if (this.snapBackTimeout !== null) {
      window.clearTimeout(this.snapBackTimeout);
      this.snapBackTimeout = null;
    }
  }

  private clearVisibilityRejoinTimeout() {
    if (this.visibilityRejoinTimeout !== null) {
      window.clearTimeout(this.visibilityRejoinTimeout);
      this.visibilityRejoinTimeout = null;
    }
  }

  private clearAllTimers() {
    this.clearAutoRejoin();
    this.clearTearCompleteTimeout();
    this.clearRejoinCompleteTimeout();
    this.clearSnapBackTimeout();
    this.clearVisibilityRejoinTimeout();
  }

  private triggerTear() {
    if (this.isTorn || this.isRejoining) return;
    this.clearAllTimers();
    this.isTorn = true;

    const card = this.container.querySelector<HTMLElement>('#ticket-stub-card');
    const stub = this.container.querySelector<HTMLElement>('#ticket-stub-aside');
    const ripFill = this.container.querySelector<HTMLElement>('#rip-fill');
    const claimedReceipt = this.container.querySelector<HTMLElement>('#ticket-stub-claimed');
    const pricePill = this.container.querySelector<HTMLElement>('#ticket-price-pill');
    const stubStatus = this.container.querySelector<HTMLElement>('#stub-status-val');

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
        <span class="price-platform">[POWERED BY KONFHUB]</span>
      `;
    }

    if (card) {
      card.classList.remove('is-rejoining');
      card.classList.add('is-tearing');
    }
    if (ripFill) {
      ripFill.style.height = '100%';
      ripFill.style.width = '100%';
    }

    // Direct user to official KonfHub registration in a new window/tab
    let popupBlocked = false;
    try {
      const opened = window.open(OFFICIAL_PASS.konfhubUrl, '_blank');
      if (opened) {
        opened.opener = null;
        try {
          if (opened.closed) {
            popupBlocked = true;
          }
        } catch {
          // Ignore cross-origin closed checks if restricted
        }
      } else {
        popupBlocked = true;
      }
    } catch {
      popupBlocked = true;
    }

    const onTornComplete = () => {
      this.tearCompleteTimeout = null;
      if (!this.isTorn || this.isRejoining) return;

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
        const descEl = claimedReceipt.querySelector<HTMLElement>('.claimed-desc');
        if (descEl) {
          if (popupBlocked) {
            descEl.textContent = 'Admission stub detached. Browser popup blocked; click the red button below to register:';
          } else {
            descEl.textContent = 'Delegate admission submitted. KonfHub registration opened in new tab...';
          }
        }
      }

      // Automatically rejoin the ticket cleanly after 2.8 seconds
      this.clearAutoRejoin();
      this.autoRejoinTimeout = window.setTimeout(() => {
        this.autoRejoinTimeout = null;
        this.rejoinTicket();
      }, 2800);
    };

    // Detach stub with momentum animation
    this.tearCompleteTimeout = window.setTimeout(onTornComplete, 180);
  }

  public rejoinTicket() {
    this.clearAutoRejoin();
    this.clearTearCompleteTimeout();
    this.clearSnapBackTimeout();
    this.clearVisibilityRejoinTimeout();
    if (!this.isTorn || this.isRejoining) return;

    this.isRejoining = true;

    const card = this.container.querySelector<HTMLElement>('#ticket-stub-card');
    const stub = this.container.querySelector<HTMLElement>('#ticket-stub-aside');
    const ripFill = this.container.querySelector<HTMLElement>('#rip-fill');
    const scissor = this.container.querySelector<HTMLElement>('#perforation-scissor');
    const bladeA = this.container.querySelector<SVGGElement>('#scissor-blade-a');
    const bladeB = this.container.querySelector<SVGGElement>('#scissor-blade-b');
    const claimedReceipt = this.container.querySelector<HTMLElement>('#ticket-stub-claimed');
    const pricePill = this.container.querySelector<HTMLElement>('#ticket-price-pill');
    const stubStatus = this.container.querySelector<HTMLElement>('#stub-status-val');

    // Play crisp tactile snap audio
    sound.playClick(940, 0.035);

    // Hide claimed overlay
    if (claimedReceipt) {
      claimedReceipt.classList.remove('show-claimed');
      claimedReceipt.setAttribute('aria-hidden', 'true');
    }

    // Trigger rejoining animation
    if (card) {
      card.classList.remove('is-torn', 'is-tearing');
      card.classList.add('is-rejoining');
    }

    if (ripFill) {
      ripFill.style.transition = 'height 0.4s ease, width 0.4s ease';
      ripFill.style.height = '0%';
      ripFill.style.width = '0%';
    }

    if (pricePill) {
      pricePill.innerHTML = `
        <span class="price-status">[TICKET RE-ATTACHED // READY]</span>
        <span class="price-platform">[POWERED BY KONFHUB]</span>
      `;
    }

    this.clearRejoinCompleteTimeout();
    this.rejoinCompleteTimeout = window.setTimeout(() => {
      this.rejoinCompleteTimeout = null;
      this.isTorn = false;
      this.isRejoining = false;
      this.isDragging = false;
      this.suppressNextClick = false;
      this.currentProgress = 0;
      this.lastSoundProgress = 0;

      if (claimedReceipt) {
        claimedReceipt.classList.remove('show-claimed');
        claimedReceipt.setAttribute('aria-hidden', 'true');
      }
      if (stubStatus) {
        stubStatus.textContent = 'READY';
      }
      if (pricePill) {
        pricePill.innerHTML = `
          <span class="price-status">EARLY BIRD ADMISSION</span>
          <span class="price-platform">[PHASE 01 NOW LIVE]</span>
        `;
      }
      if (card) {
        card.classList.remove('is-rejoining', 'is-tearing', 'is-torn');
      }
      if (stub) {
        stub.style.transform = '';
        stub.style.boxShadow = '';
        stub.style.transition = '';
      }
      if (ripFill) {
        ripFill.style.transition = '';
        ripFill.style.height = '0%';
        ripFill.style.width = '0%';
      }
      if (scissor) {
        scissor.style.top = '';
        scissor.style.left = '';
        scissor.style.transition = '';
      }
      if (bladeA) bladeA.style.transform = '';
      if (bladeB) bladeB.style.transform = '';
    }, 550);
  }

  public destroy() {
    this.abortController.abort();
    this.clearAllTimers();
    this.isDragging = false;
    this.isRejoining = false;
    this.isTorn = false;
    this.suppressNextClick = false;
  }
}
