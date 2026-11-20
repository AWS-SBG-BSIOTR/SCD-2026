import { sound } from './audio';

export interface ScheduleItem {
  id: string;
  timeStart: string;
  timeEnd: string;
  title: string;
  speaker?: string;
  speakerRole?: string;
  stage: string;
  track: 'KEYNOTE' | 'SERVERLESS' | 'GENAI & LLMS' | 'SECURITY' | 'DEVOPS' | 'COMMUNITY' | 'WORKSHOP';
  level?: string;
  abstract: string;
  highlights: string[];
}

export const SCHEDULE_DATA: ScheduleItem[] = [
  {
    id: 'slot-01',
    timeStart: '09:00 AM',
    timeEnd: '09:45 AM',
    title: 'Attendee Check-in, Badge Pickup & Breakfast',
    stage: 'Seasons 24 Reception & Expo Lawn',
    track: 'COMMUNITY',
    abstract: 'Arrive early at Seasons 24 Wagholi. Collect your personalized printed badge, physical swag kit, enjoy the hot breakfast buffet, and network with 300+ student cloud builders.',
    highlights: ['Badge Collection Desk', 'Swag Kit Distribution', 'Light Breakfast & Coffee']
  },
  {
    id: 'slot-02',
    timeStart: '09:45 AM',
    timeEnd: '10:30 AM',
    title: 'Opening Keynote: Scaling The Next Cloud Generation',
    speaker: 'AWS User Group Pune Council',
    speakerRole: 'AWS Community Organizers & AWS Heroes',
    stage: 'Main Stage (Seasons Hall 1)',
    track: 'KEYNOTE',
    level: 'ALL LEVELS',
    abstract: 'Welcome address detailing the state of Pune\'s thriving cloud developer ecosystem, student builder initiatives, cloud certifications, and how students can transition from localhost prototypes to global distributed architectures.',
    highlights: ['State of Pune Cloud Community', 'Roadmap for Student Builders', 'AWS Cloud Credit Vouchers']
  },
  {
    id: 'slot-03',
    timeStart: '10:30 AM',
    timeEnd: '11:15 AM',
    title: 'Scaling Event-Driven Microservices to 100k TPS on AWS Lambda',
    speaker: 'Aarav Deshmukh',
    speakerRole: 'Principal Architect @ CloudForge',
    stage: 'Main Stage (Seasons Hall 1)',
    track: 'SERVERLESS',
    level: 'L300 - ADVANCED',
    abstract: 'Deep dive into event-driven design patterns with Amazon EventBridge, SQS FIFO queues, and Lambda provisioned concurrency. Learn how to eliminate cold starts and architect resilient asynchronous pipelines handling 100k transactions per second.',
    highlights: ['Cold start latency mitigation', 'Dead-letter queue handling', 'Distributed tracing with AWS X-Ray']
  },
  {
    id: 'slot-04',
    timeStart: '11:15 AM',
    timeEnd: '11:30 AM',
    title: 'Mid-Morning Networking & Cloud Checkpoint Hub',
    stage: 'Expo Atrium & Checkpoint Corridor',
    track: 'COMMUNITY',
    abstract: 'Grab refreshments, explore the 5 interactive Cloud Checkpoint Zones, meet sponsor teams, and connect with peer student architects.',
    highlights: ['High-speed WiFi Hub', 'Sponsor Booth Walkthrough', 'Architecture Blueprint Demos']
  },
  {
    id: 'slot-05',
    timeStart: '11:30 AM',
    timeEnd: '12:15 PM',
    title: 'Fine-Tuning Enterprise RAG Pipelines with Amazon Bedrock',
    speaker: 'Pooja Iyer',
    speakerRole: 'Senior Generative AI Specialist @ Bedrock Labs',
    stage: 'Main Stage (Seasons Hall 1)',
    track: 'GENAI & LLMS',
    level: 'L300 - ADVANCED',
    abstract: 'Step-by-step walkthrough of building cost-effective Retrieval-Augmented Generation (RAG) pipelines using Amazon Bedrock foundation models, Amazon OpenSearch Serverless vector indices, and LangChain.',
    highlights: ['Hybrid semantic & keyword search', 'Vector embedding latency tuning', 'Hallucination guards with Bedrock Guardrails']
  },
  {
    id: 'slot-06',
    timeStart: '12:15 PM',
    timeEnd: '01:15 PM',
    title: 'Banquet Lunch, Community Mixer & Sponsor Expo',
    stage: 'Seasons 24 Dining Bay & Grand Lawn',
    track: 'COMMUNITY',
    abstract: 'Full multi-cuisine buffet lunch provided for all registered attendees. Visit partner booths, drop resumes at hiring kiosks, and participate in rapid lightning quizzes.',
    highlights: ['Catered Buffet Lunch', 'Hiring & Internship Desk', 'Hands-on Cloud Quizzes']
  },
  {
    id: 'slot-07',
    timeStart: '01:15 PM',
    timeEnd: '02:00 PM',
    title: 'Zero-Trust Sentinel Mesh & GuardDuty Cloud Security',
    speaker: 'Sneha Patel',
    speakerRole: 'Cloud Security Lead @ FinShield',
    stage: 'Main Stage (Seasons Hall 1)',
    track: 'SECURITY',
    level: 'L200 - INTERMEDIATE',
    abstract: 'Hands-on breakdown of automated threat detection and incident remediation across multi-account AWS Organizations using Amazon GuardDuty, AWS Security Hub, and Lambda event triggers.',
    highlights: ['Least-privilege IAM policies', 'Automated security response runbooks', 'CloudTrail anomaly detection']
  },
  {
    id: 'slot-08',
    timeStart: '02:00 PM',
    timeEnd: '02:45 PM',
    title: 'Hands-On Workshop: Multi-Cluster Kubernetes on AWS EKS with GitOps',
    speaker: 'Vikram Joshi',
    speakerRole: 'DevOps Lead @ HyperScale India',
    stage: 'Workshop Lab (Hall 2)',
    track: 'DEVOPS',
    level: 'L300 - ADVANCED',
    abstract: 'Live interactive coding workshop. Set up multi-region EKS clusters, configure Karpenter for auto-scaling spot compute, and implement declarative continuous deployments with ArgoCD.',
    highlights: ['Karpenter dynamic provisioning', 'ArgoCD sync strategies', 'Observability via AWS Distro for OpenTelemetry']
  },
  {
    id: 'slot-09',
    timeStart: '02:45 PM',
    timeEnd: '03:15 PM',
    title: 'Student Builder Arena: Top 5 Hackathon Lightning Demos',
    speaker: 'Finalist Student Teams',
    speakerRole: 'Selected from 300+ Hackathon Entries',
    stage: 'Main Stage (Seasons Hall 1)',
    track: 'COMMUNITY',
    level: 'ALL LEVELS',
    abstract: 'The top 5 collegiate engineering teams take the main stage for 5-minute rapid-fire live demos of their cloud-native projects built during the 24-hour pre-conference hackathon.',
    highlights: ['Live interactive voting', 'Autonomous cloud AI projects', 'Real-world impact solutions']
  },
  {
    id: 'slot-10',
    timeStart: '03:15 PM',
    timeEnd: '03:45 PM',
    title: 'Closing Ceremony, Awards & AWS Credits Distribution',
    speaker: 'Distinguished Guests & AWS Leaders',
    speakerRole: 'Community Mentors & Judges',
    stage: 'Main Stage (Seasons Hall 1)',
    track: 'KEYNOTE',
    level: 'ALL LEVELS',
    abstract: 'Announcement of Hackathon winners, distribution of ₹500,000+ prize pool and $10,000 in AWS cloud credits, certificate presentations, and closing remarks.',
    highlights: ['Grand Prize Awards', 'AWS Certification Exam Vouchers', 'Mega Swag Raffle']
  },
  {
    id: 'slot-11',
    timeStart: '03:45 PM',
    timeEnd: '04:00 PM',
    title: 'Community Group Photograph & Farewell',
    stage: 'Seasons 24 Grand Lawn',
    track: 'COMMUNITY',
    abstract: 'The official group photo with all 300+ builders, volunteers, speakers, and sponsors. Final networking and event wrap-up.',
    highlights: ['Official 2026 Group Photo', 'Speaker Networking Circle', 'Safe Travel Dismissal']
  }
];

export class ScheduleController {
  private container: HTMLElement;
  private activeTrackFilter: string = 'ALL';
  private bookmarkedIds: Set<string> = new Set();
  private expandedId: string | null = 'slot-02';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private filterSessions(): ScheduleItem[] {
    if (this.activeTrackFilter === 'ALL') return SCHEDULE_DATA;
    return SCHEDULE_DATA.filter(item => item.track === this.activeTrackFilter);
  }

  private render() {
    const sessions = this.filterSessions();
    const tracks: string[] = ['ALL', 'KEYNOTE', 'SERVERLESS', 'GENAI & LLMS', 'SECURITY', 'DEVOPS', 'COMMUNITY'];

    this.container.innerHTML = `
      <div class="schedule-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">(03) Conference Timeline</span>
          <h2 class="section-headline">09:00 AM to 04:00 PM. Every minute packed.</h2>
          <p class="section-sub">
            The official master schedule for AWS Student Community Day 2026 at Seasons 24, Wagholi, Pune. Featuring opening keynotes, technical deep-dives, hands-on labs, and hackathon demos.
          </p>
        </div>

        <!-- Venue & Time Overview Pill Bar -->
        <div class="schedule-overview-banner mono">
          <div class="overview-item">
            <span class="label">DATE:</span>
            <span class="val">27 DECEMBER 2026</span>
          </div>
          <div class="overview-item">
            <span class="label">CONFERENCE HOURS:</span>
            <span class="val text-vermilion">09:00 AM – 04:00 PM IST</span>
          </div>
          <div class="overview-item">
            <span class="label">VENUE:</span>
            <span class="val">SEASONS 24, WAGHOLI, PUNE</span>
          </div>
          <div class="overview-item">
            <span class="label">PLATFORM:</span>
            <span class="val">POWERED BY KONFHUB</span>
          </div>
        </div>

        <!-- Filter Chips Bar -->
        <div class="schedule-filter-bar mono" role="tablist" aria-label="Schedule Filter Chips">
          <span class="filter-label">FILTER TRACK:</span>
          ${tracks.map(t => {
            const isActive = this.activeTrackFilter === t;
            return `
              <button 
                class="schedule-filter-chip ${isActive ? 'is-active' : ''}" 
                data-track="${t}"
                role="tab"
                aria-selected="${isActive}">
                ${t === 'ALL' ? '[ALL SESSIONS]' : `[${t}]`}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Timeline Grid -->
        <div class="schedule-timeline-grid mono">
          ${sessions.map((item, idx) => {
            const isExpanded = this.expandedId === item.id;
            const isBookmarked = this.bookmarkedIds.has(item.id);

            return `
              <article class="timeline-slot-card ${isExpanded ? 'is-expanded' : ''}" data-slot-id="${item.id}">
                <div class="slot-time-col">
                  <div class="time-block">
                    <span class="t-start">${item.timeStart}</span>
                    <span class="t-connector mono">TO</span>
                    <span class="t-end">${item.timeEnd}</span>
                  </div>
                  <span class="slot-idx">#${String(idx + 1).padStart(2, '0')}</span>
                </div>

                <div class="slot-content-col">
                  <div class="slot-meta-badges">
                    <span class="badge-track track-${item.track.replace(/[^a-zA-Z]/g, '').toLowerCase()}">[${item.track}]</span>
                    ${item.level ? `<span class="badge-level">[${item.level}]</span>` : ''}
                    <span class="badge-stage">[LOC: ${item.stage}]</span>
                  </div>

                  <h3 class="slot-title">${item.title}</h3>

                  ${item.speaker ? `
                    <div class="slot-speaker-line">
                      <span class="spk-name">SPEAKER: ${item.speaker}</span>
                      <span class="spk-sep">//</span>
                      <span class="spk-role">${item.speakerRole}</span>
                    </div>
                  ` : ''}

                  <!-- Collapsible Extended Details -->
                  <div class="slot-expanded-drawer ${isExpanded ? 'is-open' : ''}">
                    <p class="slot-abstract">${item.abstract}</p>
                    <div class="slot-highlights">
                      <span class="hl-tag">KEY TOPICS:</span>
                      ${item.highlights.map(h => `<span class="hl-item">* ${h}</span>`).join(' ')}
                    </div>
                  </div>

                  <div class="slot-actions-bar">
                    <button class="btn-toggle-slot-detail" data-slot-id="${item.id}">
                      ${isExpanded ? '[-] HIDE ABSTRACT' : '[+] VIEW ABSTRACT & TOPICS'}
                    </button>
                    <button class="btn-bookmark-slot ${isBookmarked ? 'is-active' : ''}" data-slot-id="${item.id}">
                      ${isBookmarked ? '[SAVED TO BOOKMARKS]' : '[+ BOOKMARK SESSION]'}
                    </button>
                  </div>
                </div>
              </article>
            `;
          }).join('')}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents() {
    // Track filter chips
    const filterBtns = this.container.querySelectorAll<HTMLButtonElement>('.schedule-filter-chip');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const track = btn.getAttribute('data-track');
        if (track) {
          this.activeTrackFilter = track;
          sound.playClick(650, 0.04);
          this.render();
        }
      });
    });

    // Detail toggles
    const detailBtns = this.container.querySelectorAll<HTMLButtonElement>('.btn-toggle-slot-detail');
    detailBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slotId = btn.getAttribute('data-slot-id');
        if (slotId) {
          this.expandedId = this.expandedId === slotId ? null : slotId;
          sound.playClick(750, 0.03);
          this.render();
        }
      });
    });

    // Bookmark toggles
    const bookmarkBtns = this.container.querySelectorAll<HTMLButtonElement>('.btn-bookmark-slot');
    bookmarkBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const slotId = btn.getAttribute('data-slot-id');
        if (slotId) {
          if (this.bookmarkedIds.has(slotId)) {
            this.bookmarkedIds.delete(slotId);
            sound.playClick(400, 0.03);
          } else {
            this.bookmarkedIds.add(slotId);
            sound.playClick(850, 0.04);
          }
          this.render();
        }
      });
    });
  }
}
