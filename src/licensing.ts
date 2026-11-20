import confetti from 'canvas-confetti';
import { sound } from './audio';

export interface LicenseTier {
  id: string;
  name: string;
  basePrice: number;
  description: string;
  badge: string;
}

export interface TeamSizeOption {
  id: string;
  label: string;
  multiplier: number;
  desc: string;
}

export class LicensingController {
  private container: HTMLElement;

  // Selected state
  private selectedFonts: Set<string> = new Set(['ks-elastik', 'ks-morrow', 'ks-relay']); // Default to full bundle!
  private selectedLicenseId: string = 'desktop';
  private selectedTeamSizeId: string = '1-2';

  private readonly fontOptions = [
    { id: 'ks-elastik', name: 'AWS Elastik', personality: 'Stretch (5 Axes)', year: '2019' },
    { id: 'ks-morrow', name: 'AWS Morrow', personality: 'Honey (4 Axes)', year: '2021' },
    { id: 'ks-relay', name: 'AWS Relay', personality: 'Off duty (5 Axes)', year: '2024' }
  ];

  private readonly licenseTiers: LicenseTier[] = [
    {
      id: 'desktop',
      name: 'Desktop License',
      basePrice: 60,
      description: 'Local installation on workstations. Ideal for brand identities, logos, print editorial, packaging, signage, and static raster/vector artwork.',
      badge: '$60 / FAMILY'
    },
    {
      id: 'web',
      name: 'Web License',
      basePrice: 90,
      description: 'Self-hosted variable @font-face embedding for unlimited domains and pageviews. Zero telemetry scripts or tracking pixels.',
      badge: '$90 / FAMILY'
    },
    {
      id: 'app',
      name: 'App & Embedded',
      basePrice: 240,
      description: 'Binary embedding in iOS/Android mobile applications, desktop software, video game titles, and digital broadcasting hardware.',
      badge: '$240 / FAMILY'
    }
  ];

  private readonly teamSizes: TeamSizeOption[] = [
    { id: '1-2', label: '1–2 Users', multiplier: 1.0, desc: 'Independent designers, solo studios' },
    { id: '3-10', label: '3–10 Users', multiplier: 2.5, desc: 'Small design studios, creative boutiques' },
    { id: '11-50', label: '11–50 Users', multiplier: 5.0, desc: 'Mid-sized agency teams, brand departments' },
    { id: '51+', label: '51+ Users', multiplier: 10.0, desc: 'Global enterprises, multinational brands' }
  ];

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private calculatePricing() {
    const fontCount = this.selectedFonts.size;
    const license = this.licenseTiers.find(l => l.id === this.selectedLicenseId) || this.licenseTiers[0];
    const team = this.teamSizes.find(t => t.id === this.selectedTeamSizeId) || this.teamSizes[0];

    const isFullBundle = fontCount === 3;
    const rawSubtotal = fontCount * license.basePrice * team.multiplier;
    const discountRate = isFullBundle ? 0.30 : 0.0;
    const discountAmount = Math.round(rawSubtotal * discountRate);
    const finalTotal = rawSubtotal - discountAmount;

    return {
      fontCount,
      license,
      team,
      isFullBundle,
      rawSubtotal,
      discountAmount,
      finalTotal
    };
  }

  private render() {
    const { fontCount, license, team, isFullBundle, rawSubtotal, discountAmount, finalTotal } = this.calculatePricing();

    this.container.innerHTML = `
      <div class="licensing-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">(06) Licensing</span>
          <h2 class="section-headline">Pricing, in large print.</h2>
          <p class="section-sub">Transparent, perpetual licensing. No recurring subscriptions. All axes, weights, and future minor releases included.</p>
        </div>

        <div class="licensing-grid">
          <!-- Left: 3-Step Configuration Flow -->
          <div class="licensing-config-panel">
            <!-- Step 1: Select Typefaces -->
            <div class="step-card">
              <div class="step-header mono">
                <span class="step-num">STEP 01</span>
                <span class="step-title">SELECT TYPEFACE FAMILIES</span>
                ${isFullBundle ? '<span class="badge-discount">30% BUNDLE ACTIVE</span>' : ''}
              </div>
              <div class="font-select-list">
                ${this.fontOptions.map(f => {
                  const isChecked = this.selectedFonts.has(f.id);
                  return `
                    <label class="font-checkbox-item ${isChecked ? 'is-selected' : ''}">
                      <input 
                        type="checkbox" 
                        class="chk-font" 
                        data-font-id="${f.id}" 
                        ${isChecked ? 'checked' : ''}>
                      <span class="chk-box"></span>
                      <div class="chk-info">
                        <strong class="font-opt-title">${f.name}</strong>
                        <span class="font-opt-meta mono">${f.personality} · ${f.year}</span>
                      </div>
                      <span class="chk-price mono">$${license.basePrice}</span>
                    </label>
                  `;
                }).join('')}
              </div>
              <div class="bundle-banner mono">
                <span class="star">[*]</span>
                <span><strong>Full Cloud Bundle:</strong> Select all 3 families to automatically unlock 30% off your entire license package.</span>
              </div>
            </div>

            <!-- Step 2: Choose License Type -->
            <div class="step-card">
              <div class="step-header mono">
                <span class="step-num">STEP 02</span>
                <span class="step-title">CHOOSE LICENSE TYPE</span>
              </div>
              <div class="license-tiers-grid">
                ${this.licenseTiers.map(tier => {
                  const isSelected = tier.id === this.selectedLicenseId;
                  return `
                    <button 
                      class="license-tier-box ${isSelected ? 'is-selected' : ''}" 
                      data-license-id="${tier.id}">
                      <div class="tier-top">
                        <strong class="tier-name">${tier.name}</strong>
                        <span class="tier-badge mono">${tier.badge}</span>
                      </div>
                      <p class="tier-desc">${tier.description}</p>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Step 3: Choose Team Size -->
            <div class="step-card">
              <div class="step-header mono">
                <span class="step-num">STEP 03</span>
                <span class="step-title">CHOOSE TEAM SIZE TIER</span>
              </div>
              <div class="team-sizes-row">
                ${this.teamSizes.map(t => {
                  const isSelected = t.id === this.selectedTeamSizeId;
                  return `
                    <button 
                      class="team-btn ${isSelected ? 'is-selected' : ''}" 
                      data-team-id="${t.id}">
                      <strong class="team-label">${t.label}</strong>
                      <span class="team-mul mono">${t.multiplier}x multiplier</span>
                    </button>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Right: Summary Checkout Receipt Card -->
          <div class="licensing-summary-panel">
            <div class="summary-card mono">
              <div class="receipt-header">
                <div class="receipt-brand">AWS SCD 2026 // PASS & SPEC</div>
                <div class="receipt-date">PERPETUAL LICENSE · USD</div>
              </div>

              <div class="receipt-line-items">
                <div class="receipt-row">
                  <span>FAMILIES SELECTED:</span>
                  <strong>${fontCount} of 3</strong>
                </div>
                <div class="receipt-sub-list">
                  ${Array.from(this.selectedFonts).map(id => {
                    const f = this.fontOptions.find(opt => opt.id === id);
                    return `<div>· ${f?.name || id} [Variable OTF/WOFF2]</div>`;
                  }).join('')}
                  ${fontCount === 0 ? '<div class="text-error">! Please select at least 1 family</div>' : ''}
                </div>

                <div class="receipt-divider">────────────────────────────</div>

                <div class="receipt-row">
                  <span>LICENSE SCOPE:</span>
                  <strong>${license.name}</strong>
                </div>
                <div class="receipt-row">
                  <span>TEAM TIER:</span>
                  <strong>${team.label} (${team.multiplier}x)</strong>
                </div>
                <div class="receipt-row">
                  <span>SUBTOTAL:</span>
                  <span>$${rawSubtotal} USD</span>
                </div>

                ${isFullBundle ? `
                  <div class="receipt-row discount-row">
                    <span>BUNDLE SAVINGS (-30%):</span>
                    <span>-$${discountAmount} USD</span>
                  </div>
                ` : ''}

                <div class="receipt-divider double-divider">════════════════════════════</div>

                <div class="receipt-total-row">
                  <span class="total-label">TOTAL AMOUNT</span>
                  <div class="total-price-box">
                    <span class="currency">$</span>
                    <span class="price-val">${fontCount === 0 ? '0' : finalTotal}</span>
                    <span class="tax-tag">USD</span>
                  </div>
                </div>
              </div>

              <div class="receipt-cta-block">
                <button 
                  class="btn-brutalist btn-accent btn-buy-license" 
                  id="btn-buy-license"
                  ${fontCount === 0 ? 'disabled' : ''}>
                  BUY LICENSE NOW ->
                </button>
                <button class="btn-brutalist btn-secondary btn-trial-fonts" id="btn-open-trials">
                  REQUEST TRIAL FONTS (.ZIP)
                </button>
              </div>

              <div class="receipt-disclaimer">
                <span>[INFO] DEMO CHECKOUT: NO PAYMENT IS CHARGED. INSTANT SIMULATED INVOICE.</span>
                <span>[INFO] ALL PURCHASES INCLUDE VARIABLE & STATIC OTF, TTF, WOFF, WOFF2.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Demo Checkout Modal -->
      <div class="ks-modal" id="checkout-modal" aria-hidden="true" role="dialog">
        <div class="ks-modal-backdrop"></div>
        <div class="ks-modal-window mono">
          <div class="modal-header">
            <span class="modal-title">AWS SCD 2026 // PASS RESERVATION DEMO</span>
            <button class="modal-close-btn" id="close-checkout-modal" aria-label="Close modal">X</button>
          </div>
          <div class="modal-body">
            <div class="demo-badge-notice">
              [NOTICE] THIS IS A DEMONSTRATION CHECKOUT. NO ACTUAL PAYMENT IS PROCESSED.
            </div>

            <div class="invoice-summary">
              <h3>LICENSE INVOICE PREVIEW</h3>
              <div class="inv-row"><span>PRODUCT:</span> <strong>${fontCount}x Typeface Master Package</strong></div>
              <div class="inv-row"><span>LICENSE:</span> <strong>${license.name}</strong></div>
              <div class="inv-row"><span>TEAM:</span> <strong>${team.label}</strong></div>
              <div class="inv-row"><span>AMOUNT DUE:</span> <strong class="text-accent">$${finalTotal} USD</strong></div>
            </div>

            <form id="checkout-form" class="checkout-form">
              <div class="form-group">
                <label>LICENSEE NAME / STUDIO:</label>
                <input type="text" class="modal-input" placeholder="e.g. Studio Pentagram" required value="Experimental Design Lab">
              </div>
              <div class="form-group">
                <label>DELIVERY EMAIL ADDRESS:</label>
                <input type="email" class="modal-input" placeholder="design@restless.com" required value="builder@awsscdpune.dev">
              </div>
              <button type="submit" class="btn-brutalist btn-accent modal-submit-btn">
                COMPLETE ORDER & DOWNLOAD SPECIMEN PACKAGE ->
              </button>
            </form>

            <div id="checkout-success" class="checkout-success-view" style="display: none;">
              <div class="success-icon">[SUCCESS]</div>
              <h3>ORDER COMPLETED SUCCESSFULLY!</h3>
              <p>Simulated order #SCD-${Math.floor(100000 + Math.random() * 900000)} has been processed.</p>
              <div class="success-links">
                <button class="btn-brutalist btn-accent" id="btn-download-order-zip">
                  DOWNLOAD FONTS BUNDLE (.ZIP)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Trial Fonts Modal -->
      <div class="ks-modal" id="trial-modal" aria-hidden="true" role="dialog">
        <div class="ks-modal-backdrop"></div>
        <div class="ks-modal-window mono">
          <div class="modal-header">
            <span class="modal-title">AWS SCD 2026 // FREE BUILDER SPECIMEN KIT</span>
            <button class="modal-close-btn" id="close-trial-modal" aria-label="Close modal">X</button>
          </div>
          <div class="modal-body">
            <p class="trial-intro">
              Test all three families in your actual client pitch decks, Figma mockups, and local test rigs. Free for non-commercial evaluation.
            </p>
            <div class="trial-package-details">
              <div class="pkg-item">[OK] <strong>AWS Elastik</strong> Variable WOFF2 (Full 5 axes)</div>
              <div class="pkg-item">[OK] <strong>AWS Morrow</strong> Variable WOFF2 (Full 4 axes)</div>
              <div class="pkg-item">[OK] <strong>AWS Relay</strong> Variable WOFF2 (Full 5 axes)</div>
              <div class="pkg-item">[OK] Complete PDF Specimen Sheets & Font-Variation Cheatsheet</div>
            </div>
            <form id="trial-form" class="trial-form">
              <div class="form-group">
                <label>YOUR WORK EMAIL:</label>
                <input type="email" class="modal-input" placeholder="designer@studio.com" required value="typography@student.edu">
              </div>
              <button type="submit" class="btn-brutalist btn-accent modal-submit-btn">
                DOWNLOAD FREE TRIAL KIT (.ZIP) ->
              </button>
            </form>
            <div id="trial-success" class="checkout-success-view" style="display: none;">
              <div class="success-icon">[SUCCESS]</div>
              <h3>TRIAL PACKAGE READY!</h3>
              <p>Your trial archive contains variable desktop & webfont formats for internal prototyping.</p>
              <button class="btn-brutalist btn-accent" id="btn-sim-trial-download">
                DOWNLOAD TRIAL ARCHIVE (840 KB)
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private attachEvents() {
    // Checkbox changes for font selection
    const chkFonts = this.container.querySelectorAll<HTMLInputElement>('.chk-font');
    chkFonts.forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.getAttribute('data-font-id');
        if (!id) return;
        if (chk.checked) {
          this.selectedFonts.add(id);
        } else {
          this.selectedFonts.delete(id);
        }
        sound.playClick(chk.checked ? 780 : 520, 0.03);
        this.render();
      });
    });

    // License tier buttons
    const tierBoxes = this.container.querySelectorAll<HTMLButtonElement>('.license-tier-box');
    tierBoxes.forEach(box => {
      box.addEventListener('click', () => {
        const id = box.getAttribute('data-license-id');
        if (id && id !== this.selectedLicenseId) {
          this.selectedLicenseId = id;
          sound.playClick(680, 0.03);
          this.render();
        }
      });
    });

    // Team size buttons
    const teamBtns = this.container.querySelectorAll<HTMLButtonElement>('.team-btn');
    teamBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-team-id');
        if (id && id !== this.selectedTeamSizeId) {
          this.selectedTeamSizeId = id;
          sound.playClick(720, 0.03);
          this.render();
        }
      });
    });

    // Checkout modal openers and closers
    const buyBtn = this.container.querySelector<HTMLButtonElement>('#btn-buy-license');
    const checkoutModal = this.container.querySelector<HTMLElement>('#checkout-modal');
    const closeCheckoutBtn = this.container.querySelector<HTMLButtonElement>('#close-checkout-modal');
    const checkoutBackdrop = checkoutModal?.querySelector('.ks-modal-backdrop');

    if (buyBtn && checkoutModal) {
      buyBtn.addEventListener('click', () => {
        checkoutModal.classList.add('is-open');
        sound.playClick(800, 0.04);
      });
    }

    const closeCheckout = () => {
      if (checkoutModal) checkoutModal.classList.remove('is-open');
    };
    if (closeCheckoutBtn) closeCheckoutBtn.addEventListener('click', closeCheckout);
    if (checkoutBackdrop) checkoutBackdrop.addEventListener('click', closeCheckout);

    // Checkout form submit
    const checkoutForm = this.container.querySelector<HTMLFormElement>('#checkout-form');
    const checkoutSuccess = this.container.querySelector<HTMLElement>('#checkout-success');
    if (checkoutForm && checkoutSuccess) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playSuccess();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FD0B03', '#010101', '#DCD4C2', '#9F180F']
        });
        checkoutForm.style.display = 'none';
        checkoutSuccess.style.display = 'block';
      });
    }

    // Trial modal openers and closers
    const trialBtn = this.container.querySelector<HTMLButtonElement>('#btn-open-trials');
    const trialModal = this.container.querySelector<HTMLElement>('#trial-modal');
    const closeTrialBtn = this.container.querySelector<HTMLButtonElement>('#close-trial-modal');
    const trialBackdrop = trialModal?.querySelector('.ks-modal-backdrop');

    if (trialBtn && trialModal) {
      trialBtn.addEventListener('click', () => {
        trialModal.classList.add('is-open');
        sound.playClick(700, 0.04);
      });
    }

    const closeTrial = () => {
      if (trialModal) trialModal.classList.remove('is-open');
    };
    if (closeTrialBtn) closeTrialBtn.addEventListener('click', closeTrial);
    if (trialBackdrop) trialBackdrop.addEventListener('click', closeTrial);

    // Trial form submit
    const trialForm = this.container.querySelector<HTMLFormElement>('#trial-form');
    const trialSuccess = this.container.querySelector<HTMLElement>('#trial-success');
    if (trialForm && trialSuccess) {
      trialForm.addEventListener('submit', (e) => {
        e.preventDefault();
        sound.playSuccess();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#FD0B03', '#5C413C', '#DCD4C2']
        });
        trialForm.style.display = 'none';
        trialSuccess.style.display = 'block';
      });
    }

    // Download mock buttons
    const dlOrder = this.container.querySelector('#btn-download-order-zip');
    if (dlOrder) {
      dlOrder.addEventListener('click', () => {
        sound.playClick(900, 0.05);
        alert('Downloading AWS SCD 2026 License Package (.ZIP)... Variable OTF/WOFF2 + Specimen sheets included.');
        closeCheckout();
      });
    }

    const dlTrial = this.container.querySelector('#btn-sim-trial-download');
    if (dlTrial) {
      dlTrial.addEventListener('click', () => {
        sound.playClick(900, 0.05);
        alert('Downloading AWS SCD 2026 Free Builder Kit (.ZIP)...');
        closeTrial();
      });
    }
  }
}
