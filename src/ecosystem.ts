import { sound } from './audio';

export interface SponsorItem {
  id: string;
  name: string;
  tier: 'Title' | 'Platinum' | 'Gold' | 'Community';
  tagline: string;
  description: string;
  booth: string;
  perk: string;
}

export interface FAQEntry {
  id: string;
  category: 'REGISTRATION' | 'LOGISTICS' | 'TECHNICAL' | 'GENERAL';
  question: string;
  answer: string;
}

export const SPONSORS_LIST: SponsorItem[] = [
  {
    id: 'sp-aws',
    name: 'Amazon Web Services',
    tier: 'Title',
    tagline: 'Build Without Limits',
    description: 'The world’s most comprehensive cloud platform, offering over 200 fully featured services globally.',
    booth: 'Hall A — Main Builder Showcase',
    perk: '$100 Cloud Credits + AWS Backpack'
  },
  {
    id: 'sp-datadog',
    name: 'Datadog Observability',
    tier: 'Platinum',
    tagline: 'Modern APM & Cloud Monitoring',
    description: 'Unified monitoring, trace observability, and real-time security postures for modern cloud systems.',
    booth: 'Hall B — Booth 101',
    perk: 'Custom Mechanical Keycaps & Swag'
  },
  {
    id: 'sp-hashi',
    name: 'HashiCorp / IBM',
    tier: 'Platinum',
    tagline: 'Infrastructure as Code at Scale',
    description: 'Empowering engineering teams to provision and secure multi-cloud infrastructure with Terraform and Vault.',
    booth: 'Hall B — Booth 102',
    perk: 'Terraform T-shirts & Dev Hoodies'
  },
  {
    id: 'sp-mongo',
    name: 'MongoDB Atlas',
    tier: 'Gold',
    tagline: 'Multi-Cloud Developer Data Platform',
    description: 'Integrated cloud database services for transactional data, vector search, and edge synchronization.',
    booth: 'Hall C — Booth 201',
    perk: 'Atlas Water Bottles & Desk Mats'
  },
  {
    id: 'sp-postman',
    name: 'Postman',
    tier: 'Gold',
    tagline: 'API Platform for Builders',
    description: 'The leading API platform used by over 30 million developers to build and test distributed REST & gRPC APIs.',
    booth: 'Hall C — Booth 202',
    perk: 'API Testing Kits & Stickers'
  }
];

export const FAQ_LIST: FAQEntry[] = [
  {
    id: 'faq-2',
    category: 'LOGISTICS',
    question: 'Where and when will the conference take place?',
    answer: 'The event takes place on 27 December 2026, 08:00 AM – 05:30 PM IST at Seasons 24, Wagholi, Pune, Maharashtra. The venue is located along the Pune-Ahmednagar highway, well connected by direct PMT transit, ride shares, and cabs from Pune Railway Station (15 km) and Pune International Airport (11 km).'
  },
  {
    id: 'faq-3',
    category: 'TECHNICAL',
    question: 'Do I need prior AWS cloud experience to attend?',
    answer: 'Not at all. We host parallel beginner-friendly tracks starting from cloud fundamentals and local dev loops (Zone 00: Localhost), alongside advanced architectures in Generative AI (Amazon Bedrock) and Kubernetes (Amazon EKS).'
  },
  {
    id: 'faq-4',
    category: 'LOGISTICS',
    question: 'Will there be food, beverages, and conference swag?',
    answer: 'Yes. All verified attendees receive catered lunch, morning coffee/tea, evening snacks, and an official AWS SCD Pune 2026 swag pack with t-shirts, stickers, notebooks, and sponsor giveaways.'
  },
  {
    id: 'faq-5',
    category: 'GENERAL',
    question: 'Will attendees receive certificates of participation?',
    answer: 'Yes! All attendees who check in at the venue and complete the post-event feedback survey will receive a digitally verifiable AWS Community Day Pune certificate of participation for LinkedIn and portfolios.'
  },
  {
    id: 'faq-6',
    category: 'TECHNICAL',
    question: 'Should I bring my laptop and charger?',
    answer: 'We strongly recommend bringing your laptop! Both Track A and Track B include hands-on breakout sessions, live cloud debugging challenges, and an on-site cloud trivia hackathon with exciting awards.'
  },
  {
    id: 'faq-7',
    category: 'GENERAL',
    question: 'How can my college or club partner with AWS SCD Pune 2026?',
    answer: 'Student clubs and university technical societies can register as Community Outreach Partners by contacting partner@awsugpune.in. Partner campuses receive reserved ticket allocations and community recognitions.'
  }
];

export class EcosystemController {
  private container: HTMLElement;
  private openFaqIds: Set<string> = new Set(['faq-2']);
  private activeCategory: string = 'ALL';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render() {
    const categories = ['ALL', 'LOGISTICS', 'TECHNICAL', 'GENERAL'];
    const filteredFaq = this.activeCategory === 'ALL' 
      ? FAQ_LIST 
      : FAQ_LIST.filter(f => f.category === this.activeCategory);

    this.container.innerHTML = `
      <div class="ecosystem-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">[AWS SCD 2026] // ECOSYSTEM & PROTOCOLS</span>
          <h2 class="section-headline">Partners, Sponsors & Field Protocols.</h2>
          <p class="section-sub">
            Supported by premier cloud technology partners and designed to prepare 300+ student attendees for the Pune conference.
          </p>
        </div>

        <!-- 1. SPONSORS & PARTNERS SHOWCASE -->
        <div class="sponsors-showcase-block mono">
          <div class="block-header">
            <span class="header-tag">OFFICIAL CLOUD PARTNERS</span>
            <span class="header-meta">TITLE · PLATINUM · GOLD · COMMUNITY</span>
          </div>

          <div class="sponsors-matrix">
            ${SPONSORS_LIST.map(sp => `
              <div class="sponsor-card tier-${sp.tier.toLowerCase()}">
                <div class="card-tier-tag">[TIER: ${sp.tier.toUpperCase()}]</div>
                <h4 class="sponsor-brand">${sp.name}</h4>
                <div class="sponsor-tagline">${sp.tagline}</div>
                <p class="sponsor-desc">${sp.description}</p>
                <div class="sponsor-footer-meta">
                  <span>BOOTH: <strong>${sp.booth}</strong></span>
                  <span class="perk-highlight">PERK: ${sp.perk}</span>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Academic and Club Partners Banner -->
          <div class="academic-partners-strip">
            <span class="strip-label">UNIVERSITY COMMUNITY PARTNERS:</span>
            <div class="strip-names">
              <span>COEP TECH UNIVERSITY</span>
              <span class="sep">/</span>
              <span>PICT CLOUD CLUB</span>
              <span class="sep">/</span>
              <span>VIT PUNE BUILDERS</span>
              <span class="sep">/</span>
              <span>MIT-WPU AWS CHAPTER</span>
              <span class="sep">/</span>
              <span>AWS USER GROUP PUNE</span>
            </div>
          </div>
        </div>

        <!-- 2. FAQ TERMINAL ACCORDION -->
        <div class="faq-terminal-block mono">
          <div class="faq-terminal-top">
            <div class="terminal-title">
              <span>ATTENDEE FIELD PROTOCOLS & FAQ</span>
              <span class="terminal-status">[${filteredFaq.length} ENTRIES LOGGED]</span>
            </div>
            
            <div class="faq-category-filters">
              ${categories.map(cat => `
                <button 
                  class="btn-faq-cat ${this.activeCategory === cat ? 'is-active' : ''}" 
                  data-cat="${cat}">
                  ${cat}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="faq-accordion-container">
            ${filteredFaq.map(f => {
              const isOpen = this.openFaqIds.has(f.id);
              return `
                <div class="faq-item ${isOpen ? 'is-open' : ''}" id="faq-item-${f.id}">
                  <button class="faq-question-btn" data-id="${f.id}">
                    <div class="q-left">
                      <span class="q-prefix">[Q]</span>
                      <span class="q-cat">[${f.category}]</span>
                      <strong class="q-text">${f.question}</strong>
                    </div>
                    <span class="q-toggle-marker">${isOpen ? '[-]' : '[+]'}</span>
                  </button>

                  ${isOpen ? `
                    <div class="faq-answer-drawer">
                      <div class="a-left">
                        <span class="a-prefix text-accent">[A]</span>
                        <p class="a-text">${f.answer}</p>
                      </div>
                    </div>
                  ` : ''}
                </div>
              `;
            }).join('')}
          </div>

          <div class="faq-terminal-footer">
            <span>NEED FURTHER CLARIFICATION? CONTACT ORGANIZERS: <strong>team@awsugpune.in</strong></span>
            <a href="https://konfhub.com/aws-scd-pune-2026" target="_blank" rel="noopener noreferrer" class="btn-brutalist btn-accent scd-jump-pass-btn">
              GET PASS ON KONFHUB [EXT ->]
            </a>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents() {
    // Category filters
    const catBtns = this.container.querySelectorAll<HTMLButtonElement>('.btn-faq-cat');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        if (cat && cat !== this.activeCategory) {
          this.activeCategory = cat;
          sound.playClick(680, 0.03);
          this.render();
        }
      });
    });

    // Accordion toggle
    const questionBtns = this.container.querySelectorAll<HTMLButtonElement>('.faq-question-btn');
    questionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (!id) return;
        if (this.openFaqIds.has(id)) {
          this.openFaqIds.delete(id);
          sound.playClick(550, 0.03);
        } else {
          this.openFaqIds.add(id);
          sound.playClick(750, 0.03);
        }
        this.render();
      });
    });
  }
}
