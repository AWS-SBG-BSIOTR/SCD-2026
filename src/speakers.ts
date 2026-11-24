import { sound } from './audio';

export interface SpeakerSession {
  id: string;
  badge: string;
  title: string;
  time: string;
  stage: string;
  track: 'GenAI' | 'Serverless' | 'Architecture' | 'DevOps' | 'Security' | 'Community';
  photoUrl: string;
  slotId: string;
}

export const SESSIONS_DATA: SpeakerSession[] = [
  {
    id: 'spk-01',
    badge: 'LINEUP DROP 01',
    title: 'The Next Era of Cloud',
    time: '10:00 AM IST',
    stage: 'HALL 1',
    track: 'Architecture',
    photoUrl: './assets/avatars/drop-01.svg?v=2',
    slotId: 'slot-04'
  },
  {
    id: 'spk-02',
    badge: 'LINEUP DROP 02',
    title: 'Building Autonomous AI',
    time: '10:45 AM IST',
    stage: 'HALL 1',
    track: 'GenAI',
    photoUrl: './assets/avatars/drop-02.svg?v=2',
    slotId: 'slot-05'
  },
  {
    id: 'spk-03',
    badge: 'LINEUP DROP 03',
    title: 'Serverless at Scale',
    time: '12:30 PM IST',
    stage: 'HALL 1',
    track: 'Serverless',
    photoUrl: './assets/avatars/drop-03.svg?v=2',
    slotId: 'slot-08'
  },
  {
    id: 'spk-04',
    badge: 'LINEUP DROP 04',
    title: 'Modern Cloud Delivery',
    time: '02:15 PM IST',
    stage: 'HALL 1',
    track: 'DevOps',
    photoUrl: './assets/avatars/drop-04.svg?v=2',
    slotId: 'slot-10'
  },
  {
    id: 'spk-05',
    badge: 'LINEUP DROP 05',
    title: 'Zero Trust & Cloud Defense',
    time: '03:00 PM IST',
    stage: 'HALL 1',
    track: 'Security',
    photoUrl: './assets/avatars/drop-05.svg?v=2',
    slotId: 'slot-11'
  },
  {
    id: 'spk-06',
    badge: 'LINEUP DROP 06',
    title: 'Production SRE Playbook',
    time: '04:00 PM IST',
    stage: 'HALL 1',
    track: 'Community',
    photoUrl: './assets/avatars/drop-06.svg?v=2',
    slotId: 'slot-13'
  }
];

export class SpeakersController {
  private container: HTMLElement;
  private currentTrackFilter: string = 'ALL';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private filterSessions(): SpeakerSession[] {
    if (this.currentTrackFilter === 'ALL') {
      return SESSIONS_DATA;
    }
    return SESSIONS_DATA.filter(s => s.track.toUpperCase() === this.currentTrackFilter.toUpperCase());
  }

  private render() {
    const sessions = this.filterSessions();
    const tracks = ['ALL', 'GENAI', 'SERVERLESS', 'ARCHITECTURE', 'DEVOPS', 'SECURITY', 'COMMUNITY'];

    this.container.innerHTML = `
      <div class="speakers-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">(02) // FEATURED KEYNOTES & TECHNICAL SESSIONS</span>
          <h2 class="section-headline">THE ARCHITECTS & VISIONARIES.</h2>
          <p class="section-sub">
            Confirmed keynote leaders, AWS specialists, and technical architects delivering production cloud architectures on 27 December 2026 at Seasons 24, Wagholi. Official speaker announcements releasing soon.
          </p>
        </div>

        <!-- Telemetry Status Strip -->
        <div class="speakers-status-banner mono">
          <div class="csb-left">
            <span class="csb-title">[STATUS: LINEUP ANNOUNCEMENT UNDERWAY]</span>
            <span class="csb-sep">//</span>
            <span>6 SESSIONS LOCKED</span>
          </div>
          <div class="csb-right">
            <span class="csb-status-pill">[RELEASING SOON]</span>
          </div>
        </div>

        <!-- Track Filter Bar -->
        <div class="tracks-filter-bar mono" role="tablist">
          <span class="filter-label">FILTER TRACK:</span>
          ${tracks.map(t => `
            <button 
              class="track-filter-btn ${this.currentTrackFilter === t ? 'is-active' : ''}" 
              data-track="${t}">
              ${t}
            </button>
          `).join('')}
        </div>

        <!-- Speaker Cards Grid (Clean & Spacious Brutalist) -->
        <div class="speakers-grid">
          ${sessions.map(s => `
            <div class="speaker-card" id="card-${s.id}">
              <!-- Framed Classified Avatar Box -->
              <div class="speaker-photo-frame">
                <img 
                  src="${s.photoUrl}" 
                  alt="${s.title}" 
                  class="speaker-photo-img" 
                  loading="lazy" 
                  onerror="this.onerror=null; this.src='./assets/avatars/${s.id === 'spk-01' ? 'drop-01.svg' : s.id === 'spk-02' ? 'drop-02.svg' : s.id === 'spk-03' ? 'drop-03.svg' : s.id === 'spk-04' ? 'drop-04.svg' : s.id === 'spk-05' ? 'drop-05.svg' : 'drop-06.svg'}';"
                />
              </div>

              <!-- Spacious Minimal Content -->
              <div class="speaker-content">
                <span class="speaker-drop-tag mono">[${s.badge} // ${s.track.toUpperCase()}]</span>
                <h3 class="speaker-title">${s.title}</h3>
                
                <div class="speaker-meta-strip mono">
                  <span>${s.time}</span>
                  <span class="meta-dot">·</span>
                  <span>${s.stage}</span>
                </div>

                <a href="#${s.slotId}" class="speaker-topic-link" data-slot="${s.slotId}" title="View session on flightboard schedule">
                  <span class="speaker-jump-badge mono">[-> VIEW ON SCHEDULE]</span>
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents() {
    // Track filters
    const filterBtns = this.container.querySelectorAll<HTMLButtonElement>('.track-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const track = btn.getAttribute('data-track');
        if (track && track !== this.currentTrackFilter) {
          this.currentTrackFilter = track;
          sound.playClick(680, 0.03);
          this.render();
        }
      });
    });

    // Jump to schedule slot
    const slotLinks = this.container.querySelectorAll<HTMLAnchorElement>('.speaker-topic-link');
    slotLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const slotId = link.getAttribute('data-slot');
        if (slotId) {
          const targetSlot = document.getElementById(slotId);
          if (targetSlot) {
            e.preventDefault();
            sound.playClick(720, 0.04);
            targetSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Auto-expand drawer
            targetSlot.classList.add('is-expanded');
            const drawer = targetSlot.querySelector('.flightboard-drawer');
            if (drawer) drawer.classList.add('is-open');
            const toggleBtn = targetSlot.querySelector('.btn-fb-abstract-toggle');
            if (toggleBtn) {
              toggleBtn.textContent = '[-] HIDE';
              toggleBtn.setAttribute('aria-expanded', 'true');
            }

            targetSlot.classList.remove('is-target-highlight');
            void targetSlot.offsetWidth;
            targetSlot.classList.add('is-target-highlight');
          }
        }
      });
    });
  }
}
