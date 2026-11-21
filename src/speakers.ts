import { sound } from './audio';

export interface SpeakerSession {
  id: string;
  name: string;
  photoUrl: string;
  linkedinUrl: string;
  badge: string;
  role: string;
  affiliation: string;
  topic: string;
  time: string;
  track: 'GenAI' | 'Serverless' | 'Architecture' | 'DevOps' | 'Security' | 'Community';
  location: string;
  description: string;
  tags: string[];
  slotId: string;
}

export const SESSIONS_DATA: SpeakerSession[] = [
  {
    id: 'spk-01',
    name: 'Dr. Elena Vance',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
    linkedinUrl: 'https://linkedin.com/in/aws-community-pune',
    badge: 'AWS LEADER',
    role: 'Principal Solutions Architect',
    affiliation: 'Amazon Web Services India',
    topic: 'Opening Keynote: Cloud Evolution & The Student Builder Era',
    time: '10:00 - 10:45 AM IST',
    track: 'Architecture',
    location: 'MAIN AUDITORIUM (HALL 1)',
    description: 'A comprehensive opening roadmap into modern cloud computing architectures, cloud economics, and how student developers can build global resilience from Pune.',
    tags: ['Cloud Architecture', 'AWS Well-Architected', 'Student Builders'],
    slotId: 'slot-04'
  },
  {
    id: 'spk-02',
    name: 'Marcus Chen',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    linkedinUrl: 'https://linkedin.com/in/aws-community-pune',
    badge: 'AWS COMMUNITY HERO',
    role: 'Senior Serverless Specialist',
    affiliation: 'Serverless Labs // Pune UG',
    topic: 'Event-Driven Microservices: Zero to 10M Requests with AWS Lambda & EventBridge',
    time: '12:30 - 01:15 PM IST',
    track: 'Serverless',
    location: 'MAIN AUDITORIUM (HALL 1)',
    description: 'Deep dive into event-driven design patterns, cold start mitigations, asynchronous decoupling with Amazon EventBridge, and cost-effective scaling.',
    tags: ['AWS Lambda', 'EventBridge', 'DynamoDB', 'Microservices'],
    slotId: 'slot-08'
  },
  {
    id: 'spk-03',
    name: 'Aria Thorne',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
    linkedinUrl: 'https://linkedin.com/in/aws-community-pune',
    badge: 'AI SPECIALIST',
    role: 'Head of Applied AI & LLM Systems',
    affiliation: 'Cognitive Cloud Systems',
    topic: 'Beyond Chatbots: Engineering Production AI Agents & LLM RAG',
    time: '10:45 - 11:30 AM IST',
    track: 'GenAI',
    location: 'MAIN AUDITORIUM (HALL 1)',
    description: 'End-to-end hands-on demonstration constructing multi-agent architectures, enterprise RAG, and foundation model tooling with Amazon Bedrock.',
    tags: ['Amazon Bedrock', 'Generative AI', 'AI Agents', 'RAG'],
    slotId: 'slot-05'
  },
  {
    id: 'spk-04',
    name: 'Rohan Kulkarni',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    linkedinUrl: 'https://linkedin.com/in/aws-community-pune',
    badge: 'PLATFORM LEAD',
    role: 'Lead Platform Engineer & SRE',
    affiliation: 'HyperScale Cloud Pune',
    topic: 'Containerization & GitOps with Amazon EKS and ArgoCD',
    time: '02:15 - 03:00 PM IST',
    track: 'DevOps',
    location: 'MAIN AUDITORIUM (HALL 1)',
    description: 'Demystifying production Kubernetes workflows on Amazon EKS, progressive rollouts with ArgoCD, Karpenter node autoscaling, and container security scanners.',
    tags: ['Amazon EKS', 'Kubernetes', 'Karpenter', 'GitOps'],
    slotId: 'slot-10'
  },
  {
    id: 'spk-05',
    name: 'Priya Sharma',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&auto=format&fit=crop&q=80',
    linkedinUrl: 'https://linkedin.com/in/aws-community-pune',
    badge: 'SECURITY CISO',
    role: 'Chief Information Security Officer',
    affiliation: 'CyberShield Pune Enclave',
    topic: 'Zero Trust Cloud Security & Threat Detection with AWS GuardDuty',
    time: '03:00 - 03:45 PM IST',
    track: 'Security',
    location: 'MAIN AUDITORIUM (HALL 1)',
    description: 'Real-world defensive blueprints implementing Zero Trust architectures, IAM policy boundaries, runtime anomaly detection with GuardDuty, and automated remediation via Step Functions.',
    tags: ['Zero Trust', 'IAM', 'GuardDuty', 'Security'],
    slotId: 'slot-11'
  },
  {
    id: 'spk-06',
    name: 'Vikram Joshi',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&auto=format&fit=crop&q=80',
    linkedinUrl: 'https://linkedin.com/in/aws-community-pune',
    badge: 'COMMUNITY BUILDER',
    role: 'AWS Community Builder & SRE',
    affiliation: 'OpenCloud Collective',
    topic: 'From Prototype to Production: Reliability & SRE on AWS',
    time: '04:00 - 04:45 PM IST',
    track: 'Community',
    location: 'MAIN AUDITORIUM (HALL 1)',
    description: 'The end-to-end playbook for production reliability: continuous delivery pipelines, real-time observability with OpenTelemetry and Amazon CloudWatch, and resilience engineering.',
    tags: ['CI/CD', 'OpenTelemetry', 'CloudWatch', 'SRE'],
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
          <span class="section-tag mono">(02) // FEATURED KEYNOTES & SPEAKERS</span>
          <h2 class="section-headline">THE ARCHITECTS & VISIONARIES.</h2>
          <p class="section-sub">
            Confirmed keynote leaders, AWS heroes, and technical specialists delivering production cloud architectures on 27 December 2026 at Seasons 24, Wagholi. One unified stage.
          </p>
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

        <!-- Speaker Cards Grid (Pixel-faithful to Idea 3 Mockup) -->
        <div class="speakers-grid">
          ${sessions.map(s => `
            <div class="speaker-card" id="card-${s.id}">
              <!-- Framed Photo Box with Black Border & Corner Pill -->
              <div class="speaker-photo-frame">
                <img src="${s.photoUrl}" alt="${s.name}" class="speaker-photo-img" loading="lazy" />
                <span class="speaker-track-tag mono">[${s.track.toUpperCase()}]</span>
              </div>

              <!-- Speaker Content -->
              <div class="speaker-content">
                <!-- Name & Rounded LinkedIn Pill Row -->
                <div class="speaker-header-row">
                  <h3 class="speaker-name">${s.name}</h3>
                  <a href="${s.linkedinUrl}" class="speaker-linkedin-pill mono" target="_blank" rel="noopener noreferrer">
                    [IN] LINKEDIN
                  </a>
                </div>

                <!-- Role & Affiliation -->
                <div class="speaker-role-line mono">
                  ${s.role} // ${s.affiliation}
                </div>

                <!-- Topic -->
                <h4 class="speaker-topic">${s.topic}</h4>

                <!-- Bottom Row: Direct Link to Scheduled Session Time in Schedule -->
                <div class="speaker-bottom-row mono">
                  <a href="#${s.slotId}" class="btn-speaker-schedule mono" data-slot="${s.slotId}">
                    [SCHEDULE: ${s.time.replace(' IST', '')} ->]
                  </a>
                </div>
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
    const scheduleLinks = this.container.querySelectorAll<HTMLAnchorElement>('.btn-speaker-schedule');
    scheduleLinks.forEach(link => {
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
            // Force reflow to re-trigger CSS keyframe pulse animation
            void targetSlot.offsetWidth;
            targetSlot.classList.add('is-target-highlight');
          }
        }
      });
    });
  }
}
