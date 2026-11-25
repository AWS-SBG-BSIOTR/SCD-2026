export interface SpeakerSession {
  id: string;
  badge: string;
  title: string;
  topicNote: string;
  meta: string;
  photoUrl: string;
}

export const SESSIONS_DATA: SpeakerSession[] = [
  {
    id: 'spk-01',
    badge: 'LINEUP DROP 01',
    title: 'SPEAKER 01',
    topicNote: 'Topic & Session Details Releasing Soon',
    meta: 'HALL 1 // LINEUP REVEAL UNDERWAY',
    photoUrl: './assets/avatars/drop-01.svg?v=3'
  },
  {
    id: 'spk-02',
    badge: 'LINEUP DROP 02',
    title: 'SPEAKER 02',
    topicNote: 'Topic & Session Details Releasing Soon',
    meta: 'HALL 1 // LINEUP REVEAL UNDERWAY',
    photoUrl: './assets/avatars/drop-02.svg?v=3'
  },
  {
    id: 'spk-03',
    badge: 'LINEUP DROP 03',
    title: 'SPEAKER 03',
    topicNote: 'Topic & Session Details Releasing Soon',
    meta: 'HALL 1 // LINEUP REVEAL UNDERWAY',
    photoUrl: './assets/avatars/drop-03.svg?v=3'
  },
  {
    id: 'spk-04',
    badge: 'LINEUP DROP 04',
    title: 'SPEAKER 04',
    topicNote: 'Topic & Session Details Releasing Soon',
    meta: 'HALL 1 // LINEUP REVEAL UNDERWAY',
    photoUrl: './assets/avatars/drop-04.svg?v=3'
  }
];

export class SpeakersController {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <div class="speakers-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">(02) // FEATURED KEYNOTES & TECHNICAL SESSIONS</span>
          <h2 class="section-headline">MEET THE SPEAKERS.</h2>
          <p class="section-sub">
            Confirmed keynote leaders, AWS specialists, and technical architects joining us on 27 December 2026 at Seasons 24, Wagholi. Official speaker names and session topics releasing soon.
          </p>
        </div>

        <!-- Telemetry Status Strip -->
        <div class="speakers-status-banner mono">
          <div class="csb-left">
            <span class="csb-title">[STATUS: LINEUP ANNOUNCEMENT UNDERWAY]</span>
            <span class="csb-sep">//</span>
            <span>SPEAKERS ANNOUNCING SOON</span>
          </div>
          <div class="csb-right">
            <span class="csb-status-pill">[RELEASING SOON]</span>
          </div>
        </div>

        <!-- Speaker Cards Grid (4 Clean Teaser Cards) -->
        <div class="speakers-grid speakers-grid-four">
          ${SESSIONS_DATA.map(s => `
            <div class="speaker-card" id="card-${s.id}">
              <!-- Framed Classified Avatar Box -->
              <div class="speaker-photo-frame">
                <img
                  src="${s.photoUrl}"
                  alt="${s.title} — Topic Releasing Soon"
                  class="speaker-photo-img"
                  loading="lazy"
                  onerror="this.onerror=null; this.src='./assets/avatars/${s.id.replace('spk-', 'drop-')}.svg';"
                />
              </div>

              <!-- Spacious Minimal Content -->
              <div class="speaker-content">
                <span class="speaker-drop-tag mono">[${s.badge}]</span>
                <h3 class="speaker-title">${s.title}</h3>
                <p class="speaker-topic-placeholder">${s.topicNote}</p>

                <div class="speaker-meta-strip mono">
                  <span>${s.meta}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}
