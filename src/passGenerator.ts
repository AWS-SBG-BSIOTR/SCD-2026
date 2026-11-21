import confetti from 'canvas-confetti';
import { sound } from './audio';

export interface PassConfig {
  name: string;
  college: string;
  role: string;
  track: string;
  tier: 'STUDENT BUILDER' | 'COMMUNITY' | 'SPEAKER';
  passNumber: string;
}

export class PassGeneratorController {
  private container: HTMLElement;
  private config: PassConfig = {
    name: '',
    college: '',
    role: 'STUDENT ATTENDEE',
    track: 'GENAI & BEDROCK',
    tier: 'STUDENT BUILDER',
    passNumber: 'SCD26-PUNE-4892'
  };

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private generateNewPassNumber(): string {
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `SCD26-PUNE-${randomHex}`;
  }

  private render() {
    this.container.innerHTML = `
      <div class="pass-generator-section-wrapper">
        <div class="section-meta-header">
          <span class="section-tag mono">(05) // ATTENDEE BADGE GENERATOR</span>
          <h2 class="section-headline">Generate Your Builder Pass.</h2>
          <p class="section-sub">
            Customize and generate your official social credential for AWS Student Community Day 2026 Pune. Personalized with variable typography and unique telemetry hash.
          </p>
        </div>

        <div class="pass-generator-grid">
          <!-- Left: Customizer Form -->
          <div class="pass-controls-card mono">
            <div class="controls-card-header">
              <span>PASS CUSTOMIZATION RIG</span>
              <span class="text-accent">[OFFICIAL BADGE]</span>
            </div>

            <form id="pass-customizer-form" class="customizer-form">
              <div class="form-field">
                <label for="inp-attendee-name">BUILDER FULL NAME:</label>
                <input 
                  type="text" 
                  id="inp-attendee-name" 
                  class="brutalist-input" 
                  value="${this.config.name}" 
                  placeholder="AARAV SHARMA"
                  maxlength="28" 
                  required>
              </div>

              <div class="form-field">
                <label for="inp-attendee-college">INSTITUTION / UNIVERSITY:</label>
                <input 
                  type="text" 
                  id="inp-attendee-college" 
                  class="brutalist-input" 
                  value="${this.config.college}" 
                  placeholder="JSPM BSIOTR, WAGHOLI, PUNE"
                  maxlength="40" 
                  required>
              </div>

              <div class="form-field">
                <label for="sel-attendee-role">BUILDER ROLE:</label>
                <select id="sel-attendee-role" class="brutalist-select w-full">
                  <option value="STUDENT ATTENDEE" ${this.config.role === 'STUDENT ATTENDEE' ? 'selected' : ''}>STUDENT ATTENDEE</option>
                  <option value="KEYNOTE SPEAKER" ${this.config.role === 'KEYNOTE SPEAKER' ? 'selected' : ''}>KEYNOTE SPEAKER</option>
                  <option value="IT PROFESSIONAL" ${this.config.role === 'IT PROFESSIONAL' ? 'selected' : ''}>IT PROFESSIONAL</option>
                </select>
              </div>

              <div class="form-actions-strip">
                <button type="button" class="btn-brutalist btn-accent w-full" id="btn-download-pass-png">
                  DOWNLOAD BADGE (PNG) [v]
                </button>
                <button type="button" class="btn-brutalist btn-secondary w-full" id="btn-regen-pass">
                  [REGENERATE PASS ID]
                </button>
              </div>

              <div class="pass-legal-note">
                [NOTICE] THIS BADGE IS STRICTLY FOR SOCIAL MEDIA &amp; LINKEDIN SHARING. IT DOES NOT GRANT IN-PERSON ENTRY AT SEASONS 24. OFFICIAL ADMISSION PASSES ARE ISSUED EXCLUSIVELY UPON KONFHUB REGISTRATION.
              </div>
            </form>
          </div>

          <!-- Right: Interactive Live Physical Badge Preview -->
          <div class="pass-preview-stage">
            <div class="pass-badge-lanyard">
              <div class="lanyard-strap mono">AWS COMMUNITY PUNE // STUDENT BUILDER PASS</div>
              <div class="lanyard-clip"></div>
            </div>
            <div class="pass-gyro-hint mono">[TILT PHONE OR SWIPE TO SWING BADGE]</div>

            <!-- The Authentic Brutalist Pass Card -->
            <div class="physical-pass-card" id="physical-pass-card">
              <div class="pass-top-accent"></div>
              
              <div class="pass-inner-container mono">
                <!-- Header -->
                <div class="pass-card-header">
                  <div class="header-brand">
                    <span class="p-brand">AWS SCD BSIOTR 2026</span>
                  </div>
                  <div class="header-tier-tag">
                    <span id="pass-tier-display" class="pass-tier-badge">${this.config.role}</span>
                  </div>
                </div>

                <!-- Main Name Block (Dynamic Variable Typeface) -->
                <div class="pass-name-block">
                  <span class="p-label">OFFICIAL ATTENDEE:</span>
                  <div class="pass-display-name" id="pass-name-display">
                    ${this.config.name || 'YOUR FULL NAME'}
                  </div>
                  <div class="pass-college-name" id="pass-college-display">
                    ${this.config.college || 'YOUR INSTITUTION / UNIVERSITY'}
                  </div>
                </div>

                <!-- Details Grid -->
                <div class="pass-meta-grid">
                  <div class="meta-cell">
                    <span class="lbl">ASSIGNED ROLE:</span>
                    <strong class="val" id="pass-role-display">${this.config.role}</strong>
                  </div>
                  <div class="meta-cell">
                    <span class="lbl">ADMISSION STATUS:</span>
                    <strong class="val text-vermilion">[VERIFIED] ALL-ACCESS</strong>
                  </div>
                  <div class="meta-cell">
                    <span class="lbl">VENUE:</span>
                    <strong class="val">SEASONS 24, WAGHOLI, PUNE</strong>
                  </div>
                  <div class="meta-cell">
                    <span class="lbl">EVENT HOURS:</span>
                    <strong class="val">27 DEC · 08:00–17:30 IST</strong>
                  </div>
                </div>

                <!-- Event Details Strip -->
                <div class="pass-route-strip">
                  <span class="route-lbl">EVENT:</span>
                  <span class="route-path">SEASONS 24, WAGHOLI, PUNE // 27 DEC 2026</span>
                </div>

                <!-- Footer with Barcode and Hash -->
                <div class="pass-footer-strip">
                  <div class="barcode-box">
                    <div class="fake-ascii-barcode">|||| || | ||||| || |||| ||| || |||||| || | ||||</div>
                    <span class="pass-hash-label" id="pass-number-display">${this.config.passNumber}</span>
                  </div>
                  <div class="pass-security-seal">
                    <span>STATUS: [VERIFIED]</span>
                    <span>ALL ACCESS</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pass Download Confirmation Toast -->
            <div id="pass-claim-toast" class="pass-toast mono" style="display: none;">
              [SUCCESS] PASS CONFIRMED: #${this.config.passNumber} HAS BEEN ISSUED TO ${this.config.name || 'DELEGATE'}. SEE YOU IN PUNE!
            </div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private updatePassDisplay() {
    const nameDisp = this.container.querySelector('#pass-name-display');
    const collegeDisp = this.container.querySelector('#pass-college-display');
    const roleDisp = this.container.querySelector('#pass-role-display');
    const tierDisp = this.container.querySelector('#pass-tier-display');
    const numDisp = this.container.querySelector('#pass-number-display');

    if (nameDisp) nameDisp.textContent = this.config.name || 'YOUR FULL NAME';
    if (collegeDisp) collegeDisp.textContent = this.config.college || 'YOUR INSTITUTION / UNIVERSITY';
    if (roleDisp) roleDisp.textContent = this.config.role;
    if (tierDisp) tierDisp.textContent = this.config.role;
    if (numDisp) numDisp.textContent = this.config.passNumber;
  }

  private attachEvents() {
    // Name input
    const nameInp = this.container.querySelector<HTMLInputElement>('#inp-attendee-name');
    if (nameInp) {
      nameInp.addEventListener('input', () => {
        this.config.name = nameInp.value.toUpperCase();
        sound.playTypewriter(Math.random() * 200 + 400);
        this.updatePassDisplay();
      });
    }

    // College input
    const collegeInp = this.container.querySelector<HTMLInputElement>('#inp-attendee-college');
    if (collegeInp) {
      collegeInp.addEventListener('input', () => {
        this.config.college = collegeInp.value.toUpperCase();
        sound.playTypewriter(Math.random() * 200 + 400);
        this.updatePassDisplay();
      });
    }

    // Role select
    const roleSel = this.container.querySelector<HTMLSelectElement>('#sel-attendee-role');
    if (roleSel) {
      roleSel.addEventListener('change', () => {
        this.config.role = roleSel.value;
        sound.playClick(650, 0.03);
        this.updatePassDisplay();
      });
    }

    // Download Badge PNG button
    const dlBtn = this.container.querySelector<HTMLButtonElement>('#btn-download-pass-png');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        this.downloadPassPNG();
      });
    }

    // Regenerate Pass button
    const regenBtn = this.container.querySelector<HTMLButtonElement>('#btn-regen-pass');
    if (regenBtn) {
      regenBtn.addEventListener('click', () => {
        this.config.passNumber = this.generateNewPassNumber();
        sound.playClick(900, 0.04);
        this.updatePassDisplay();
      });
    }

    // Interactive Dangling Lanyard Card Physics (Mouse, Mobile Touch & Gyro)
    const card = this.container.querySelector<HTMLElement>('#physical-pass-card');
    const stage = this.container.querySelector<HTMLElement>('.pass-preview-stage');
    if (card && stage) {
      let isInteracting = false;
      let isTouchDragging = false;
      let touchStartX = 0;
      let touchDeltaX = 0;
      let dampTimeout: number | null = null;
      let gyroActive = false;
      let targetAngle = 0;
      let currentAngle = 0;

      const triggerDangle = () => {
        card.style.transform = '';
        card.style.boxShadow = '';
        card.classList.add('is-dangling');
        if (dampTimeout) clearTimeout(dampTimeout);
        dampTimeout = window.setTimeout(() => {
          card.classList.remove('is-dangling');
        }, 1400);
      };

      const applyPhysics = (angleDeg: number, tiltYDeg: number) => {
        const shadowX = 10 - angleDeg * 0.75;
        const shadowY = 10 + Math.abs(angleDeg) * 0.25;
        card.style.transform = `perspective(900px) rotateZ(${angleDeg.toFixed(2)}deg) rotateY(${tiltYDeg.toFixed(2)}deg)`;
        card.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 0px var(--color-black)`;
      };

      // 1. Mouse Events (Desktop)
      stage.addEventListener('mouseenter', () => {
        isInteracting = true;
        if (dampTimeout) clearTimeout(dampTimeout);
        card.classList.remove('is-dangling');
        sound.playHover(480, 0.02);
      });

      stage.addEventListener('mousemove', (e: MouseEvent) => {
        if (!isInteracting || isTouchDragging) return;
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const mouseX = e.clientX - centerX;
        const normalizedX = Math.max(-1, Math.min(1, mouseX / (rect.width / 2)));

        const angle = normalizedX * 7.5;
        const tiltY = normalizedX * 4.5;
        applyPhysics(angle, tiltY);
      });

      stage.addEventListener('mouseleave', () => {
        isInteracting = false;
        triggerDangle();
        sound.playHover(540, 0.02);
      });

      // 2. Mobile Touch Events (Swipe, Drag & Tap Jiggle)
      stage.addEventListener('touchstart', (e: TouchEvent) => {
        if (e.touches.length > 0) {
          isInteracting = true;
          isTouchDragging = true;
          touchStartX = e.touches[0].clientX;
          touchDeltaX = 0;
          if (dampTimeout) clearTimeout(dampTimeout);
          card.classList.remove('is-dangling');
          sound.playHover(480, 0.02);

          // Request DeviceOrientation permission on iOS Safari if required
          if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })?.requestPermission === 'function') {
            (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission().then((res: string) => {
              if (res === 'granted') gyroActive = true;
            }).catch(() => {});
          }
        }
      }, { passive: true });

      stage.addEventListener('touchmove', (e: TouchEvent) => {
        if (!isTouchDragging || e.touches.length === 0) return;
        const currentX = e.touches[0].clientX;
        touchDeltaX = currentX - touchStartX;
        const rect = card.getBoundingClientRect();
        const normalizedX = Math.max(-1, Math.min(1, touchDeltaX / (rect.width * 0.45)));
        const angle = normalizedX * 8.5;
        const tiltY = normalizedX * 5.5;
        applyPhysics(angle, tiltY);
      }, { passive: true });

      stage.addEventListener('touchend', () => {
        isInteracting = false;
        isTouchDragging = false;
        // If it was a quick tap (< 10px movement), play click audio for tactile feedback
        if (Math.abs(touchDeltaX) < 10) {
          sound.playClick(850, 0.04);
        }
        triggerDangle();
      }, { passive: true });

      // 3. Gyroscope / Device Tilt Physics
      const handleOrientation = (e: DeviceOrientationEvent) => {
        if (isInteracting || isTouchDragging) return;
        if (e.gamma !== null && e.gamma !== undefined) {
          gyroActive = true;
          // Clamp gamma tilt between -25 and +25 degrees
          const clampedGamma = Math.max(-25, Math.min(25, e.gamma));
          targetAngle = (clampedGamma / 25) * 8.0;
        }
      };

      const gyroLoop = () => {
        if (gyroActive && !isInteracting && !isTouchDragging) {
          currentAngle += (targetAngle - currentAngle) * 0.12;
          if (Math.abs(currentAngle) > 0.05) {
            const tiltY = (currentAngle / 8.0) * 5.0;
            applyPhysics(currentAngle, tiltY);
          }
        }
        requestAnimationFrame(gyroLoop);
      };

      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      requestAnimationFrame(gyroLoop);
    }
  }

  private downloadPassPNG() {
    sound.playClick(950, 0.05);
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const attendeeName = (this.config.name || 'STUDENT BUILDER').toUpperCase();
    const collegeName = (this.config.college || 'COLLEGE / INSTITUTION').toUpperCase();

    // Background Warm Cream
    ctx.fillStyle = '#DCD4C2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border Near Black
    ctx.strokeStyle = '#010101';
    ctx.lineWidth = 12;
    ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

    // Top Header Banner
    ctx.fillStyle = '#FD0B03';
    ctx.fillRect(24, 24, canvas.width - 48, 16);

    // Header brand
    ctx.fillStyle = '#010101';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('AWS SCD BSIOTR 2026', 50, 85);

    ctx.fillStyle = '#FD0B03';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`[${this.config.role}]`, 50, 120);

    // Divider
    ctx.strokeStyle = '#010101';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, 145);
    ctx.lineTo(750, 145);
    ctx.stroke();

    // Attendee Label & Name
    ctx.fillStyle = '#5A554A';
    ctx.font = '16px monospace';
    ctx.fillText('OFFICIAL ATTENDEE:', 50, 185);

    ctx.fillStyle = '#010101';
    ctx.font = '900 44px sans-serif';
    ctx.fillText(attendeeName, 50, 245);

    ctx.fillStyle = '#5A554A';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(collegeName, 50, 290);

    // Details Grid Box
    ctx.fillStyle = '#EDE7D8';
    ctx.fillRect(50, 330, 700, 230);
    ctx.strokeRect(50, 330, 700, 230);

    ctx.fillStyle = '#5A554A';
    ctx.font = '15px monospace';
    ctx.fillText('ASSIGNED ROLE:', 75, 375);
    ctx.fillStyle = '#010101';
    ctx.font = 'bold 19px monospace';
    ctx.fillText(this.config.role, 75, 405);

    ctx.fillStyle = '#5A554A';
    ctx.font = '15px monospace';
    ctx.fillText('ADMISSION STATUS:', 75, 460);
    ctx.fillStyle = '#FD0B03';
    ctx.font = 'bold 19px monospace';
    ctx.fillText('[VERIFIED] ALL-ACCESS', 75, 490);

    ctx.fillStyle = '#5A554A';
    ctx.font = '15px monospace';
    ctx.fillText('VENUE / LOCATION:', 420, 375);
    ctx.fillStyle = '#010101';
    ctx.font = 'bold 17px monospace';
    ctx.fillText('SEASONS 24, WAGHOLI', 420, 405);

    ctx.fillStyle = '#5A554A';
    ctx.font = '15px monospace';
    ctx.fillText('EVENT DATE & TIME:', 420, 460);
    ctx.fillStyle = '#010101';
    ctx.font = 'bold 17px monospace';
    ctx.fillText('27 DEC 2026 // 08:00–17:30 IST', 420, 490);

    // Event details strip
    ctx.fillStyle = '#010101';
    ctx.fillRect(50, 595, 700, 45);
    ctx.fillStyle = '#DCD4C2';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('EVENT: SEASONS 24, WAGHOLI, PUNE // 27 DEC 2026', 75, 624);

    // Barcode block
    ctx.fillStyle = '#010101';
    ctx.font = '40px monospace';
    ctx.fillText('||||||| | |||| ||| || |||||| || | |||| |||||', 50, 720);

    ctx.font = 'bold 20px monospace';
    ctx.fillText(`PASS NUMBER: #${this.config.passNumber}`, 50, 770);

    ctx.fillStyle = '#5A554A';
    ctx.font = '14px monospace';
    ctx.fillText(`SHA256: 0x${this.config.passNumber}F9B3C2A1E8D7654... [OFFICIAL KONFHUB PASS]`, 50, 805);
    ctx.fillText('POWERED BY AWS STUDENT COMMUNITY DAY 2026 (PUNE)', 50, 850);

    // Trigger download
    const link = document.createElement('a');
    link.download = `AWS-SCD-2026-PASS-${attendeeName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
}
