import { sound } from './audio';

export interface SponsorPartnerItem {
  id: string;
  name: string;
  category: 'SPONSOR' | 'COMMUNITY_PARTNER';
  tier: string;
  logoUrl: string;
  websiteUrl: string;
}

export interface FAQEntry {
  id: string;
  category: 'REGISTRATION' | 'LOGISTICS' | 'TECHNICAL' | 'GENERAL';
  question: string;
  answer: string;
}

export const OFFICIAL_SPONSORS: SponsorPartnerItem[] = [
  {
    id: 'sp-aws',
    name: 'Amazon Web Services',
    category: 'SPONSOR',
    tier: 'TITLE SPONSOR',
    logoUrl: './logos/aws-full.svg',
    websiteUrl: 'https://aws.amazon.com/'
  }
];

export const COMMUNITY_PARTNERS: SponsorPartnerItem[] = [
  {
    id: 'cp-awsug',
    name: 'AWS User Group Pune',
    category: 'COMMUNITY_PARTNER',
    tier: 'COMMUNITY PARTNER',
    logoUrl: './logos/aws-ug-pune.png',
    websiteUrl: 'https://www.awsugpune.in/'
  }
];

export const FAQ_LIST: FAQEntry[] = [
  {
    id: 'faq-1',
    category: 'REGISTRATION',
    question: 'Does a Meetup RSVP guarantee admission at the gate?',
    answer: 'No. A Meetup RSVP alone does not guarantee entry. You must complete official ticket registration at <a href="https://konfhub.com/aws-student-community-day-pune-2026" target="_blank" rel="noopener noreferrer" class="faq-contact-email"><strong>konfhub.com/aws-student-community-day-pune-2026</strong></a> and bring your confirmed ticket along with a valid college ID or government-issued ID card. Check-in opens at 8:00 AM IST.'
  },
  {
    id: 'faq-2',
    category: 'LOGISTICS',
    question: 'Where and when will the conference take place?',
    answer: 'The event takes place on 27 December 2026, 08:00 AM – 05:00 PM IST (check-in opens at 08:00 AM, programme begins at 09:00 AM) at Seasons 24, Wagholi, Pune, Maharashtra. The venue is located along the Pune-Ahmednagar highway, well connected by direct PMT transit, ride shares, and cabs from Pune Railway Station (15 km) and Pune International Airport (11 km).'
  },
  {
    id: 'faq-3',
    category: 'TECHNICAL',
    question: 'Do I need prior AWS cloud experience to attend?',
    answer: 'Not at all. The conference is engineered for builders at all stages—from beginners exploring cloud fundamentals and core architecture, to practitioners looking into modern cloud computing, real-world case studies, and scalable design.'
  },
  {
    id: 'faq-4',
    category: 'LOGISTICS',
    question: 'Will there be food, beverages, and conference swag?',
    answer: 'Yes. All verified attendees receive delicious buffet lunch, morning breakfast with coffee/tea, evening high-tea, and AWS exclusive swags for participating builders.'
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
    answer: 'Bringing your laptop and charger is recommended—we are planning 1–2 hands-on workshops alongside live cloud demos where you can build along in real time. However, it is completely up to you, and you can comfortably follow all talks and walkthroughs even if you prefer not to carry one.'
  },
  {
    id: 'faq-7',
    category: 'GENERAL',
    question: 'How can my college or club partner with AWS SCD Pune 2026?',
    answer: 'Student clubs and university technical societies can register as Community Outreach Partners by contacting awssbgbsiotr@gmail.com. Partner campuses receive reserved ticket allocations and community recognitions.'
  }
];

export class EcosystemController {
  private container: HTMLElement;
  private openFaqIds: Set<string> = new Set();
  private activeCategory: string = 'ALL';

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render() {
    const categories = ['ALL', 'REGISTRATION', 'LOGISTICS', 'TECHNICAL', 'GENERAL'];
    const filteredFaq = this.activeCategory === 'ALL' 
      ? FAQ_LIST 
      : FAQ_LIST.filter(f => f.category === this.activeCategory);

    this.container.innerHTML = `
      <div class="ecosystem-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">[AWS SCD 2026] // ECOSYSTEM & PROTOCOLS</span>
          <h2 class="section-headline">Partners, Sponsors & Field Protocols.</h2>
          <p class="section-sub">
            Supported by premier cloud technology leaders and academic partners for AWS Student Community Day 2026.
          </p>
        </div>

        <!-- 1. SPONSORS & COMMUNITY PARTNERS SHOWCASE -->
        <div class="sponsors-showcase-block mono">
          <!-- Tier A: Official Sponsors -->
          <div class="sponsors-subgroup">
            <div class="block-header">
              <span class="header-tag">OFFICIAL SPONSORS</span>
              <span class="header-meta">TITLE · CLOUD</span>
            </div>

            <div class="sponsors-logo-grid sponsors-grid-tier">
              ${OFFICIAL_SPONSORS.map(item => `
                <a 
                  href="${item.websiteUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="sponsor-logo-card tier-${item.tier.toLowerCase().replace(/[^a-z]/g, '')}" 
                  title="${item.name}">
                  <div class="logo-frame">
                    <img src="${item.logoUrl}" alt="${item.name}" class="sponsor-logo-img logo-${item.id}" loading="lazy" onerror="if (!this.dataset.fallback) { this.dataset.fallback = '1'; this.src = './assets/' + this.src.split('/').pop(); }" />
                  </div>
                  <span class="logo-brand-label mono">${item.name}</span>
                </a>
              `).join('')}
            </div>
          </div>

          <!-- Divider Between Sponsors & Community Partners -->
          <div class="sponsors-tier-divider"></div>

          <!-- Tier B: Community Partners -->
          <div class="sponsors-subgroup">
            <div class="block-header">
              <span class="header-tag">COMMUNITY PARTNERS</span>
              <span class="header-meta">ECOSYSTEM · COMMUNITY</span>
            </div>

            <div class="sponsors-logo-grid community-grid-tier">
              ${COMMUNITY_PARTNERS.map(item => `
                <a 
                  href="${item.websiteUrl}" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="sponsor-logo-card tier-communitypartner" 
                  title="${item.name}">
                  <div class="logo-frame">
                    <img src="${item.logoUrl}" alt="${item.name}" class="sponsor-logo-img logo-${item.id}" loading="lazy" onerror="if (!this.dataset.fallback) { this.dataset.fallback = '1'; this.src = './assets/' + this.src.split('/').pop(); }" />
                  </div>
                  <span class="logo-brand-label mono">${item.name}</span>
                </a>
              `).join('')}
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
            <span>NEED FURTHER CLARIFICATION? CONTACT ORGANIZERS: <a href="mailto:awssbgbsiotr@gmail.com" class="faq-contact-email"><strong>awssbgbsiotr@gmail.com</strong></a></span>
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
