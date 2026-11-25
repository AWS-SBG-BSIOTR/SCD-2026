import { sound } from './audio';

export interface MetricCard {
  value: string;
  tag: string;
  desc: string;
}

export interface WhyAttendCard {
  index: string;
  title: string;
  desc: string;
}

export const METRICS_DATA: MetricCard[] = [
  {
    value: '300+',
    tag: '[BUILDERS]',
    desc: 'STUDENT BUILDERS & DEVELOPERS'
  },
  {
    value: '7+',
    tag: '[SPEAKERS]',
    desc: 'KEYNOTES, TECH TALKS & PANEL'
  },
  {
    value: '8+',
    tag: '[DURATION]',
    desc: 'HOURS OF CONTINUOUS IMMERSION'
  }
];

export const WHY_ATTEND_DATA: WhyAttendCard[] = [
  {
    index: '[01 // NETWORKING]',
    title: 'Social Networking & Industry Connects',
    desc: 'Connect directly with working AWS professionals, cloud architects, speakers, and fellow student developers across Pune.'
  },
  {
    index: '[02 // CREDLY BADGE]',
    title: 'Official Credly Badge',
    desc: 'Earn a verifiable digital Credly badge recognizing your participation at AWS Student Community Day Pune 2026.'
  },
  {
    index: '[03 // CERTIFICATION]',
    title: 'Attending Certification',
    desc: 'Receive an official digital Certificate of Participation to showcase on LinkedIn, resumes, and portfolios.'
  },
  {
    index: '[04 // HOSPITALITY]',
    title: 'Breakfast & Delicious Lunch',
    desc: 'Complimentary morning breakfast, wholesome conference buffet lunch, and refreshing tea/coffee breaks included.'
  },
  {
    index: '[05 // SWAG KIT]',
    title: 'Exclusive AWS Swag Kits',
    desc: 'Curated AWS Community Day goodies, stickers, and builder swag packs prepared for participating attendees.'
  },
  {
    index: '[06 // WORKSHOPS]',
    title: 'Hands-On Cloud Learning',
    desc: 'Explore 1–2 practical workshops, live serverless & GenAI architecture demos, and real-world engineering talks.'
  }
];

export class OverviewController {
  private container: HTMLElement;
  private timerInterval: number | null = null;
  private abortController: AbortController = new AbortController();
  // Target: 27 December 2026, 08:00 AM IST (Indian Standard Time UTC+05:30)
  private targetDate: number = new Date('2026-12-27T08:00:00+05:30').getTime();

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
    this.startCountdown();
    this.bindEvents();
  }

  private startCountdown(): void {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const update = (): number => {
      const now = Date.now();
      const diff = Math.max(0, this.targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const daysEl = this.container.querySelector('#countdown-days');
      const hoursEl = this.container.querySelector('#countdown-hours');
      const minsEl = this.container.querySelector('#countdown-mins');
      const secsEl = this.container.querySelector('#countdown-secs');

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');

      if (diff <= 0 && this.timerInterval !== null) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      return diff;
    };

    const initialDiff = update();
    if (initialDiff > 0) {
      this.timerInterval = window.setInterval(update, 1000);
    }
  }

  private bindEvents(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
    const { signal } = this.abortController;

    const cards = this.container.querySelectorAll('.metric-card, .overview-countdown-panel, .why-attend-card');
    cards.forEach(card => {
      card.addEventListener(
        'mouseenter',
        () => {
          sound.playHover(460, 0.02);
        },
        { signal }
      );
      card.addEventListener(
        'click',
        () => {
          sound.playClick(680, 0.03);
        },
        { signal }
      );
    });

    const ctaBtns = this.container.querySelectorAll('.overview-cta-btn');
    ctaBtns.forEach(btn => {
      btn.addEventListener(
        'mouseenter',
        () => {
          sound.playHover(520, 0.02);
        },
        { signal }
      );
    });
  }

  public destroy(): void {
    this.abortController.abort();
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="overview-inner">
        <!-- Section Metadata Header -->
        <div class="section-meta-header">
          <div class="overview-header-tagline mono">
            <span class="bullet">[*]</span> (01) // EVENT ROADMAP & OVERVIEW
          </div>
          <h2 class="section-headline">BUILT FOR STUDENT BUILDERS.</h2>
          <p class="section-sub">
            Join fellow student developers, cloud architects, and tech leaders at Seasons 24, Wagholi for Pune's premier community-driven cloud conference on 27 December 2026.
          </p>
        </div>

        <!-- Live Monospaced Countdown Terminal (The Original First Terminal) -->
        <div class="overview-countdown-panel mono" aria-label="Live Event Countdown to 27 December 2026">
          <div class="countdown-panel-top">
            <span class="countdown-label">
              <span class="status-pulse-dot"></span> LIVE COUNTDOWN // TARGET: 27 DEC 2026, 08:00 AM IST
            </span>
            <span class="countdown-location">VENUE: SEASONS 24, WAGHOLI, PUNE</span>
          </div>

          <div class="countdown-display-grid">
            <div class="countdown-digit-block">
              <span class="countdown-number" id="countdown-days">--</span>
              <span class="countdown-unit">DAYS</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-digit-block">
              <span class="countdown-number" id="countdown-hours">--</span>
              <span class="countdown-unit">HOURS</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-digit-block">
              <span class="countdown-number" id="countdown-mins">--</span>
              <span class="countdown-unit">MINUTES</span>
            </div>
            <div class="countdown-sep">:</div>
            <div class="countdown-digit-block">
              <span class="countdown-number" id="countdown-secs">--</span>
              <span class="countdown-unit">SECONDS</span>
            </div>
          </div>
        </div>

        <!-- 3 Impact Metrics Cards (High Contrast White Blocks) -->
        <div class="overview-metrics-grid mono" aria-label="Conference Impact Metrics">
          ${METRICS_DATA.map(m => `
            <div class="metric-card">
              <div class="metric-value">${m.value}</div>
              <div class="metric-tag">${m.tag}</div>
              <div class="metric-desc">${m.desc}</div>
            </div>
          `).join('')}
        </div>

        <!-- Why Attend AWS SCD Block -->
        <div class="why-attend-section" aria-label="Why Attend AWS Student Community Day Pune 2026">
          <div class="why-attend-header">
            <div class="why-attend-tag mono">[WHY ATTEND // BUILDER ADVANTAGES]</div>
            <h3 class="why-attend-title">WHY ATTEND AWS SCD PUNE 2026?</h3>
            <p class="why-attend-sub mono">
              Six builder-first advantages waiting for every participant at Seasons 24, Wagholi on 27 December 2026.
            </p>
          </div>

          <div class="why-attend-grid">
            ${WHY_ATTEND_DATA.map(item => `
              <article class="why-attend-card">
                <span class="why-card-index mono">${item.index}</span>
                <h4 class="why-card-title">${item.title}</h4>
                <p class="why-card-desc">${item.desc}</p>
              </article>
            `).join('')}
          </div>
        </div>

        <!-- Quick Section Actions -->
        <div class="overview-actions-row">
          <a href="#schedule" class="btn-brutalist btn-secondary overview-cta-btn">
            EXPLORE SCHEDULE [v]
          </a>
        </div>
      </div>
    `;
  }
}
