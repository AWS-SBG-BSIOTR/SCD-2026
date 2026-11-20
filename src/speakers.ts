import { sound } from './audio';

export interface SpeakerSession {
  id: string;
  codeName: string;
  telemetryId: string;
  badge: string;
  roleHint: string;
  affiliationHint: string;
  topic: string;
  time: string;
  track: 'GenAI' | 'Serverless' | 'Architecture' | 'DevOps' | 'Security' | 'Community';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  location: string;
  description: string;
  tags: string[];
  revealWave: string;
}

export const SESSIONS_DATA: SpeakerSession[] = [
  {
    id: 'spk-01',
    codeName: 'SPEAKER // DOSSIER 01',
    telemetryId: '0x7F2A',
    badge: 'AWS LEADER',
    roleHint: 'Principal Solutions Architect',
    affiliationHint: 'Amazon Web Services India',
    topic: 'Opening Keynote: Cloud Evolution & The Student Builder Era',
    time: '09:45 - 10:30 IST',
    track: 'Architecture',
    level: 'Beginner',
    location: 'Main Auditorium (Localhost Arena)',
    description: 'A comprehensive opening roadmap into modern cloud computing architectures, cloud economics, and how student developers can build global resilience from Pune.',
    tags: ['Cloud Architecture', 'AWS Well-Architected', 'Student Builders'],
    revealWave: 'DROP 01 // WAVE 1'
  },
  {
    id: 'spk-02',
    codeName: 'SPEAKER // DOSSIER 02',
    telemetryId: '0x9E1B',
    badge: 'AWS COMMUNITY HERO',
    roleHint: 'Senior Serverless Specialist',
    affiliationHint: 'Serverless Labs / Pune UG Council',
    topic: 'Event-Driven Microservices: Zero to 10M Requests with AWS Lambda & EventBridge',
    time: '10:30 - 11:15 IST',
    track: 'Serverless',
    level: 'Intermediate',
    location: 'Track A (Serverless Bastion)',
    description: 'Deep dive into event-driven design patterns, cold start mitigations, asynchronous decoupling with Amazon EventBridge, and cost-effective scaling.',
    tags: ['AWS Lambda', 'EventBridge', 'DynamoDB', 'Microservices'],
    revealWave: 'DROP 01 // WAVE 1'
  },
  {
    id: 'spk-03',
    codeName: 'SPEAKER // DOSSIER 03',
    telemetryId: '0x4C8D',
    badge: 'AWS AMBASSADOR',
    roleHint: 'Head of Applied AI & LLM Systems',
    affiliationHint: 'Cognitive Cloud Systems',
    topic: 'Generative AI on AWS: Building Multi-Modal RAG Pipelines with Amazon Bedrock',
    time: '11:30 - 12:15 IST',
    track: 'GenAI',
    level: 'Advanced',
    location: 'Track B (AI Nexus)',
    description: 'End-to-end hands-on demonstration constructing Retrieval-Augmented Generation (RAG) applications using Amazon Bedrock, Claude 3.5 Sonnet, and OpenSearch Serverless vector indices.',
    tags: ['Amazon Bedrock', 'RAG', 'Vector Search', 'Claude 3.5'],
    revealWave: 'DROP 01 // WAVE 1'
  },
  {
    id: 'spk-04',
    codeName: 'SPEAKER // DOSSIER 04',
    telemetryId: '0x2A0F',
    badge: 'PLATFORM LEAD',
    roleHint: 'Lead Platform Engineer & SRE',
    affiliationHint: 'HyperScale Cloud Pune',
    topic: 'Containerization & GitOps with Amazon EKS and ArgoCD',
    time: '13:15 - 14:00 IST',
    track: 'DevOps',
    level: 'Intermediate',
    location: 'Track A (Container Harbor)',
    description: 'Demystifying production Kubernetes workflows on Amazon EKS, progressive rollouts with ArgoCD, Karpenter node autoscaling, and container security scanners.',
    tags: ['Amazon EKS', 'Kubernetes', 'Karpenter', 'GitOps'],
    revealWave: 'DROP 02 // WAVE 2'
  },
  {
    id: 'spk-05',
    codeName: 'SPEAKER // DOSSIER 05',
    telemetryId: '0x6D1E',
    badge: 'SECURITY CISO',
    roleHint: 'Chief Information Security Officer',
    affiliationHint: 'CyberShield Pune Enclave',
    topic: 'Zero Trust Cloud Security & Threat Detection with AWS GuardDuty',
    time: '14:00 - 14:45 IST',
    track: 'Security',
    level: 'Advanced',
    location: 'Track B (Security Citadel)',
    description: 'Real-world defensive blueprints implementing Zero Trust architectures, IAM policy boundaries, runtime anomaly detection with GuardDuty, and automated remediation via Step Functions.',
    tags: ['Zero Trust', 'IAM', 'GuardDuty', 'Security'],
    revealWave: 'DROP 02 // WAVE 2'
  },
  {
    id: 'spk-06',
    codeName: 'SPEAKER // DOSSIER 06',
    telemetryId: '0x83B7',
    badge: 'COMMUNITY BUILDER',
    roleHint: 'AWS Community Builder & Core Maintainer',
    affiliationHint: 'OpenCloud Collective',
    topic: 'Open Source in the Cloud: Contributing to AWS SDKs & CDK Constructs',
    time: '14:45 - 15:15 IST',
    track: 'Community',
    level: 'Beginner',
    location: 'Track A (Builder Workshop)',
    description: 'How undergraduate students can kickstart meaningful open-source contributions to AWS CDK, local testing frameworks, and community libraries.',
    tags: ['Open Source', 'AWS CDK', 'TypeScript', 'Community'],
    revealWave: 'DROP 02 // WAVE 2'
  }
];

export class SpeakersController {
  private container: HTMLElement;
  private currentTrackFilter: string = 'ALL';
  private expandedSessionIds: Set<string> = new Set();
  private savedSessions: Set<string> = new Set();
  private cipherIntervals: Map<string, number> = new Map();

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
          <span class="section-tag mono">(03) Classified Keynotes & Breakouts</span>
          <h2 class="section-headline">The Architects & Visionaries.</h2>
          <p class="section-sub">
            Session intelligence confirmed. 24+ deep dives across GenAI, Serverless, and Kubernetes at Seasons 24, Wagholi. Speaker identities currently under classified protocol.
          </p>
        </div>

        <!-- Classified Status Telemetry Banner -->
        <div class="classified-status-banner mono">
          <div class="csb-left">
            <span class="csb-blip">●</span>
            <span class="csb-title">TRANSMISSION PROTOCOL: CLASSIFIED</span>
            <span class="csb-sep">//</span>
            <span class="csb-count">6 OF 6 SLOTS LOCKED</span>
          </div>
          <div class="csb-right">
            <span class="csb-status-pill">[DROP 01 IMMINENT · KONFHUB PRIORITY]</span>
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

        <!-- Speaker Cards Grid -->
        <div class="speakers-grid">
          ${sessions.map(s => {
            const isExpanded = this.expandedSessionIds.has(s.id);
            const isBookmarked = this.savedSessions.has(s.id);
            return `
              <div class="speaker-card ${isExpanded ? 'is-expanded' : ''}" id="card-${s.id}">
                <div class="speaker-card-top mono">
                  <div class="badge-row">
                    <span class="badge-role">${s.badge}</span>
                    <span class="badge-track track-${s.track.toLowerCase()}">[${s.track.toUpperCase()}]</span>
                  </div>
                  <span class="badge-level level-${s.level.toLowerCase()}">${s.level}</span>
                </div>

                <!-- Encrypted Profile Dossier Row -->
                <div class="speaker-profile-row">
                  <div class="profile-avatar-box avatar-classified-box mono" data-id="${s.id}">
                    <span class="enc-hash-text">${s.telemetryId}</span>
                    <span class="enc-sub-tag">[ENC]</span>
                  </div>
                  <div class="profile-text">
                    <div class="classified-name-row mono">
                      <span class="redacted-bar mono" data-id="${s.id}" data-original="████████████████">
                        ████████████████
                      </span>
                      <span class="classified-pill">[TOP SECRET]</span>
                    </div>
                    <span class="speaker-role mono">${s.roleHint}</span>
                    <span class="speaker-company mono">${s.affiliationHint}</span>
                  </div>
                </div>

                <div class="session-brief">
                  <h4 class="session-topic">${s.topic}</h4>
                  <div class="session-meta-strip mono">
                    <span class="meta-time">[TIME] ${s.time}</span>
                    <span class="meta-loc">[LOC] ${s.location}</span>
                  </div>
                </div>

                ${isExpanded ? `
                  <div class="session-expanded-content">
                    <div class="classified-clearance-stamp mono">
                      <span class="stamp-pill">[CLEARANCE: PUBLIC BRIEFING]</span>
                      <span class="stamp-wave text-accent">${s.revealWave}</span>
                    </div>
                    <p class="session-desc">${s.description}</p>
                    <div class="session-tags-row mono">
                      ${s.tags.map(tag => `<span class="tag-chip">#${tag}</span>`).join('')}
                    </div>
                    <div class="classified-notice-strip mono">
                      <span class="text-accent">[REVEAL PROTOCOL]</span> Full speaker identity, headshot and credentials unlock in Drop 01. Registered KonfHub ticket holders receive priority reveal.
                    </div>
                  </div>
                ` : ''}

                <div class="speaker-card-footer mono">
                  <button class="btn-toggle-abstract" data-id="${s.id}">
                    ${isExpanded ? '[-] LESS DETAILS' : '[+] SESSION ABSTRACT'}
                  </button>
                  <button class="btn-bookmark-session ${isBookmarked ? 'is-bookmarked' : ''}" data-id="${s.id}">
                    ${isBookmarked ? '[OK] IN SCHEDULE' : '+ ADD TO SCHEDULE'}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="speakers-footer-status mono">
          <span>LINEUP PROTOCOL: 24 KEYNOTES & BREAKOUTS // 2 PARALLEL TRACKS // 100% CONFIRMED</span>
          <a href="#passes" class="scd-claim-ticket-link">GET PASS ON KONFHUB FOR FIRST REVEAL -></a>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private startCipherGlitch(element: HTMLElement, originalText: string) {
    const chars = '0123456789ABCDEF!#@$%&?/*+';
    let iterations = 0;
    const maxIterations = 14;

    const intervalId = window.setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((_, idx) => {
          if (idx < iterations) return '█';
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      iterations++;
      sound.playTypewriter(Math.random() * 250 + 700);

      if (iterations >= maxIterations) {
        clearInterval(intervalId);
        element.textContent = originalText;
      }
    }, 45);

    this.cipherIntervals.set(element.dataset.id || 'cipher', intervalId);
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

    // Expand / collapse abstract
    const toggleBtns = this.container.querySelectorAll<HTMLButtonElement>('.btn-toggle-abstract');
    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (this.expandedSessionIds.has(id)) {
          this.expandedSessionIds.delete(id);
        } else {
          this.expandedSessionIds.add(id);
        }
        sound.playClick(750, 0.03);
        this.render();
      });
    });

    // Bookmark / schedule button
    const bookmarkBtns = this.container.querySelectorAll<HTMLButtonElement>('.btn-bookmark-session');
    bookmarkBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (this.savedSessions.has(id)) {
          this.savedSessions.delete(id);
          sound.playClick(500, 0.04);
        } else {
          this.savedSessions.add(id);
          sound.playSuccess();
        }
        this.render();
      });
    });

    // Redacted Bar hover scramble
    const redactedBars = this.container.querySelectorAll<HTMLElement>('.redacted-bar, .avatar-classified-box');
    redactedBars.forEach(bar => {
      bar.addEventListener('mouseenter', () => {
        const original = bar.getAttribute('data-original') || '████████████████';
        const target = bar.classList.contains('redacted-bar') 
          ? bar 
          : bar.querySelector<HTMLElement>('.enc-hash-text');
        if (target) {
          this.startCipherGlitch(target, original);
        }
      });
    });
  }
}
