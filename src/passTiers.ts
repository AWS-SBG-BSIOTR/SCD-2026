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
  hours: '09:00 AM – 04:00 PM IST',
  venue: 'SEASONS 24, WAGHOLI, PUNE',
  capacity: '300 STUDENT BUILDERS',
  konfhubUrl: 'https://konfhub.com/aws-scd-pune-2026',
  inclusions: [
    'Admission to all 24+ Keynotes & Cloud Architecture Tracks',
    'Full access to 5 interactive Cloud Checkpoint Zones & Expo',
    'High-speed conference WiFi & official digital verified credential',
    'Direct networking with 300+ student builders, AWS Heroes & sponsors',
    'Access to student hackathon showcase & cloud credit giveaways',
    'Entry to lightning architecture demos & community lounge'
  ]
};

export class PassTiersController {
  private container: HTMLElement;

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
          <span class="section-tag mono">(05) Tickets & Registration</span>
          <h2 class="section-headline">Official Admission Pass. Powered by KonfHub.</h2>
          <p class="section-sub">
            One single pass. All-inclusive in-person admission to all 24+ sessions, keynotes, hands-on workshops, and 5 Cloud Checkpoint Zones at Seasons 24, Wagholi on 27 December 2026.
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
          <div class="ticket-stub-card mono">
            <!-- Main Ticket Body (Left) -->
            <div class="ticket-main-body">
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
                <div class="ticket-price-pill">
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

            <!-- Vertical Perforation Divider with Physical Ticket Punches -->
            <div class="ticket-perforation-divider" aria-hidden="true">
              <div class="punch-notch punch-top"></div>
              <div class="perforation-dashed-line"></div>
              <div class="perforation-label">TEAR HERE</div>
              <div class="punch-notch punch-bottom"></div>
            </div>

            <!-- Tear-off Verification Stub (Right) -->
            <div class="ticket-stub-aside">
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
                  <strong class="text-accent">OPEN</strong>
                </div>
              </div>

              <div class="stub-verified-badge">
                <span>[VERIFIED: OFFICIAL KONFHUB ENGINE]</span>
              </div>

              <a 
                href="${pass.konfhubUrl}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn-brutalist btn-accent w-full text-center stub-cta-btn"
                id="btn-stub-konfhub-link">
                CLAIM ON KONFHUB ->
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents() {
    const konfhubLinks = this.container.querySelectorAll<HTMLAnchorElement>('#btn-konfhub-direct-link, #btn-stub-konfhub-link');
    konfhubLinks.forEach(link => {
      link.addEventListener('click', () => {
        sound.playSuccess();
        confetti({
          particleCount: 70,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#FD0B03', '#010101', '#DCD4C2', '#5C413C']
        });
      });
    });

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
  }
}
