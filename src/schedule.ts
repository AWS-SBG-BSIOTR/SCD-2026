import { sound } from './audio';

export interface ScheduleItem {
  id: string;
  timeStart: string;
  timeEnd: string;
  title: string;
  speaker?: string;
  speakerRole?: string;
  stage: string;
  track: string;
  abstract: string;
  highlights: string[];
  isPending?: boolean;
}

export const SCHEDULE_DATA: ScheduleItem[] = [
  {
    id: 'slot-01',
    timeStart: '08:00 AM',
    timeEnd: '09:00 AM',
    title: 'Registration, Check-in & Breakfast',
    stage: 'Seasons 24 Reception & Expo Lawn',
    track: 'COMMUNITY',
    abstract: 'Gate check-in opens at 8:00 AM IST with ticket verification, attendee badge pickup, and morning breakfast with chai & coffee while networking before programme kickoff.',
    highlights: ['Gate Check-in Opens 8:00 AM', 'Badge Verification & Pickup', 'Breakfast Buffet & Chai/Coffee', 'Networking & Photo Zone']
  },
  {
    id: 'slot-02',
    timeStart: '09:00 AM',
    timeEnd: '09:45 AM',
    title: 'Opening Ceremony & Programme Kickoff',
    stage: 'Hall 1',
    track: 'COMMUNITY',
    abstract: 'Programme commences at 9:00 AM IST with the opening address, welcome remarks, and official introduction to AWS Student Builder Group (SBG) BSIOTR and AWS Student Community Day Pune 2026.',
    highlights: ['Programme Begins 9:00 AM IST', 'Introduction to AWS SBG BSIOTR', 'SCD Pune 2026 Vision']
  },
  {
    id: 'slot-03',
    timeStart: '09:45 AM',
    timeEnd: '10:00 AM',
    title: 'Inaugural Address & Guest Felicitation',
    speaker: 'Invited AWS Dignitaries',
    speakerRole: 'AWS Leadership & Institutional Guests',
    stage: 'Hall 1',
    track: 'KEYNOTE',
    abstract: 'Official address by invited AWS representative and institutional leadership, followed by guest introduction, lighting of the lamp, and felicitation ceremony.',
    highlights: ['Invited AWS Representative Address', 'Institutional Leadership Remarks', 'Dignitary Felicitation']
  },
  {
    id: 'slot-pending',
    timeStart: '10:00 AM',
    timeEnd: '04:15 PM',
    title: 'Keynotes, Technical Sessions, Community Panel & Lunch — Releasing Soon',
    speaker: 'Confirmed Speakers & Session Lineup',
    speakerRole: 'Cloud · AI/GenAI · DevOps · Cloud Native · Security',
    stage: 'Hall 1 & Dining Lawn',
    track: 'RELEASING SOON',
    isPending: true,
    abstract: 'The detailed session-by-session lineup (speaker talks, technical deep-dives, community panel, tea breaks, and buffet lunch timings) will be published shortly and shared with all registered delegates.',
    highlights: ['7+ Keynote & Technical Talks', 'Community Panel Discussion', 'Chai Breaks & Delicious Buffet Lunch', 'Final Timings Unlocking Soon']
  },
  {
    id: 'slot-closing',
    timeStart: '04:15 PM',
    timeEnd: '04:40 PM',
    title: 'Closing Ceremony & Commemorative Group Photos',
    speaker: 'Organizing Council & Volunteers',
    speakerRole: 'AWS SCD Pune 2026 Core Team',
    stage: 'Hall 1',
    track: 'KEYNOTE',
    abstract: 'Closing remarks, sponsor & volunteer felicitation, vote of thanks, and the official commemorative group photograph with all attendees and community leaders.',
    highlights: ['Volunteer & Sponsor Felicitation', 'Vote of Thanks', 'Official Full-Hall Group Photograph']
  },
  {
    id: 'slot-swag',
    timeStart: '04:40 PM',
    timeEnd: '05:00 PM',
    title: 'Swag Kit Distribution & Event Wrap-up',
    stage: 'Seasons 24 Exit & Distribution Counters',
    track: 'COMMUNITY',
    abstract: 'Exclusive event swag and AWS goodies distribution at designated exit counters (first-come, first-served subject to availability), along with Credly badge & digital certificate instructions.',
    highlights: ['AWS Swags & Event Goodies (FCFS)', 'Credly Badge & Certificate Guidance', 'Final Community Networking']
  }
];

export class ScheduleController {
  private container: HTMLElement;
  private expandedIds: Set<string> = new Set();
  private abortController: AbortController = new AbortController();

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private parseTimeToMinutes(timeStr: string): number {
    const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return -1;
    let hours = Number(match[1]);
    const mins = Number(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + mins;
  }

  private getCurrentIstSlotInfo(): { isEventDay: boolean; nowMinutes: number } {
    try {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23'
      }).formatToParts(now);

      const getPart = (type: string) => parts.find(p => p.type === type)?.value || '';
      const dateKey = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
      const hour = Number(getPart('hour')) % 24;
      const nowMinutes = hour * 60 + Number(getPart('minute'));
      return { isEventDay: dateKey === '2026-12-27', nowMinutes };
    } catch {
      return { isEventDay: false, nowMinutes: -1 };
    }
  }

  private render() {
    const sessions = SCHEDULE_DATA;
    const { isEventDay, nowMinutes } = this.getCurrentIstSlotInfo();
    const allExpanded = sessions.length > 0 && sessions.every(item => this.expandedIds.has(item.id));

    this.container.innerHTML = `
      <div class="schedule-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">(03) Conference Timeline</span>
          <h2 class="section-headline">08:00 AM to 05:00 PM. Learn Cloud, Build Together.</h2>
          <p class="section-sub">
            A full day dedicated to AWS cloud computing, AI, DevOps, security, and hands-on community learning at Seasons 24, Wagholi, Pune—built for curious developers and cloud builders.
          </p>
        </div>

        <!-- Sleek Horizontal Telemetry Strip -->
        <div class="schedule-telemetry-strip mono">
          <span class="st-item"><strong class="st-lbl">DATE:</strong> 27 DEC 2026</span>
          <span class="st-sep">//</span>
          <span class="st-item"><strong class="st-lbl">CONFERENCE HOURS:</strong> <span class="text-accent">08:00 AM – 05:00 PM IST</span></span>
          <span class="st-sep">//</span>
          <span class="st-item"><strong class="st-lbl">VENUE:</strong> SEASONS 24, WAGHOLI, PUNE</span>
          <span class="st-sep">//</span>
          <span class="st-item"><strong class="st-lbl">AGENDA:</strong> <span class="text-accent">RELEASING SOON</span></span>
        </div>

        <!-- Utility Actions Toolbar -->
        <div class="schedule-toolbar-row mono">
          <button type="button" class="schedule-action-btn" id="btn-toggle-expand-all">
            ${allExpanded ? '[- COLLAPSE ALL]' : '[+ EXPAND ALL DETAILS]'}
          </button>
        </div>

        <!-- Flight-Board Compact Ledger Table -->
        <div class="flightboard-container mono">
          <div class="flightboard-table-header">
            <div class="fb-col fb-col-time">TIMING (IST)</div>
            <div class="fb-col fb-col-title">PROGRAMME FLOW</div>
            <div class="fb-col fb-col-track">STATUS / TRACK</div>
            <div class="fb-col fb-col-action">DETAILS</div>
          </div>

          <div class="flightboard-body">
            ${sessions.map((item) => {
              const isExpanded = this.expandedIds.has(item.id);
              const startMins = this.parseTimeToMinutes(item.timeStart);
              const endMins = this.parseTimeToMinutes(item.timeEnd);
              const isLiveNow = isEventDay && startMins >= 0 && nowMinutes >= startMins && nowMinutes < endMins;
              return `
                <article class="flightboard-row ${item.isPending ? 'is-pending-row' : ''} ${isExpanded ? 'is-expanded' : ''} ${isLiveNow ? 'is-live-now' : ''}" id="${item.id}" data-slot-id="${item.id}">
                  <div class="fb-row-main" role="button" tabindex="0" aria-expanded="${isExpanded}" title="Click to view details">
                    <div class="fb-col-time">
                      <span class="fb-time-range mono">${item.timeStart} — ${item.timeEnd}</span>
                      ${isLiveNow ? '<span class="badge-live-now mono">[● LIVE NOW]</span>' : ''}
                    </div>

                    <div class="fb-col-title">
                      <h4 class="fb-session-heading">${item.title}</h4>
                      ${item.speaker ? `
                        <div class="fb-session-speaker mono">
                          ${item.speaker}${item.speakerRole ? ` · ${item.speakerRole}` : ''}
                        </div>
                      ` : ''}
                    </div>

                    <div class="fb-col-track">
                      <span class="badge-track ${item.isPending ? 'badge-track-pending' : ''} mono">[${item.track}]</span>
                    </div>

                    <div class="fb-col-action">
                      <span class="fb-expand-indicator mono">${isExpanded ? '[-]' : '[+]'}</span>
                    </div>
                  </div>

                  <!-- Collapsible Abstract Drawer -->
                  <div class="flightboard-drawer ${isExpanded ? 'is-open' : ''}" id="drawer-${item.id}">
                    <p class="drawer-abstract">${item.abstract}</p>
                    ${item.highlights && item.highlights.length ? `
                      <div class="drawer-highlights">
                        <span class="hl-tag">HIGHLIGHTS:</span>
                        ${item.highlights.map(h => `<span class="hl-item">* ${h}</span>`).join(' ')}
                      </div>
                    ` : ''}
                  </div>
                </article>
              `;
            }).join('')}
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

    const expandAllBtn = this.container.querySelector<HTMLButtonElement>('#btn-toggle-expand-all');
    if (expandAllBtn) {
      expandAllBtn.addEventListener(
        'click',
        () => {
          const visible = SCHEDULE_DATA;
          const allExpanded = visible.length > 0 && visible.every(item => this.expandedIds.has(item.id));
          if (allExpanded) {
            visible.forEach(item => this.expandedIds.delete(item.id));
            sound.playClick(500, 0.03);
          } else {
            visible.forEach(item => this.expandedIds.add(item.id));
            sound.playClick(760, 0.035);
          }
          this.render();
        },
        { signal }
      );
    }

    const rowMains = this.container.querySelectorAll<HTMLElement>('.fb-row-main');
    rowMains.forEach(rowMain => {
      const row = rowMain.closest('.flightboard-row');
      if (!row) return;
      const id = row.getAttribute('data-slot-id');
      if (!id) return;

      const toggleAction = (e?: Event) => {
        if (e) e.stopPropagation();
        const drawer = row.querySelector('.flightboard-drawer');
        const icon = row.querySelector('.fb-expand-indicator');
        const isOpen = this.expandedIds.has(id);

        if (isOpen) {
          this.expandedIds.delete(id);
          row.classList.remove('is-expanded');
          if (drawer) drawer.classList.remove('is-open');
          if (icon) icon.textContent = '[+]';
          rowMain.setAttribute('aria-expanded', 'false');
          sound.playClick(450, 0.03);
        } else {
          this.expandedIds.add(id);
          row.classList.add('is-expanded');
          if (drawer) drawer.classList.add('is-open');
          if (icon) icon.textContent = '[-]';
          rowMain.setAttribute('aria-expanded', 'true');
          sound.playClick(750, 0.04);
        }

        const allExpanded = SCHEDULE_DATA.length > 0 && SCHEDULE_DATA.every(item => this.expandedIds.has(item.id));
        if (expandAllBtn) {
          expandAllBtn.textContent = allExpanded ? '[- COLLAPSE ALL]' : '[+ EXPAND ALL DETAILS]';
        }
      };

      rowMain.addEventListener('click', toggleAction, { signal });
      rowMain.addEventListener(
        'keydown',
        (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleAction();
          }
        },
        { signal }
      );
    });
  }

  public destroy() {
    this.abortController.abort();
  }
}
