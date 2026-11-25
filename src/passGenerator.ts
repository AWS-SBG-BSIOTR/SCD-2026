import { sound } from './audio';

export interface PassConfig {
  name: string;
  college: string;
  role: string;
  track: string;
  tier: 'STUDENT BUILDER' | 'COMMUNITY' | 'SPEAKER';
  passNumber: string;
  photoDataUrl: string;
}

export class PassGeneratorController {
  private container: HTMLElement;
  private stageObserver: IntersectionObserver | null = null;
  private isStageVisible: boolean = true;
  private physicsRafId: number | null = null;
  private orientationHandler: ((e: DeviceOrientationEvent) => void) | null = null;
  private windowMoveHandler: ((e: PointerEvent) => void) | null = null;
  private windowUpHandler: ((e: PointerEvent) => void) | null = null;
  private pageshowHandler: ((e: PageTransitionEvent) => void) | null = null;
  private roleFlashTimeout: number | null = null;
  private toastTimeout: number | null = null;
  private photoUploadSeq: number = 0;
  private activeObjectUrl: string | null = null;
  private inputPulseToggle: boolean = false;
  private triggerInputNudge: (() => void) | null = null;
  private triggerRoleNudge: (() => void) | null = null;
  private config: PassConfig = {
    name: '',
    college: '',
    role: 'STUDENT ATTENDEE',
    track: 'GENAI & BEDROCK',
    tier: 'STUDENT BUILDER',
    passNumber: 'SCD26-PUNE-4892',
    photoDataUrl: ''
  };

  constructor(container: HTMLElement) {
    this.container = container;
    try {
      localStorage.removeItem('scd26_badge_config');
    } catch {
      // Ignore storage failures in restricted contexts
    }
    this.render();
  }

  private revokeActiveObjectUrl() {
    if (this.activeObjectUrl) {
      URL.revokeObjectURL(this.activeObjectUrl);
      this.activeObjectUrl = null;
    }
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

            <form id="pass-customizer-form" class="customizer-form" autocomplete="off">
              <div class="form-field">
                <label for="inp-attendee-name">BUILDER FULL NAME:</label>
                <input 
                  type="text" 
                  id="inp-attendee-name" 
                  class="brutalist-input" 
                  value="${this.escapeHtml(this.config.name)}" 
                  placeholder="AARAV SHARMA"
                  maxlength="28" 
                  autocomplete="off"
                  required>
              </div>

              <div class="form-field">
                <label for="inp-attendee-college">INSTITUTION / UNIVERSITY:</label>
                <input 
                  type="text" 
                  id="inp-attendee-college" 
                  class="brutalist-input" 
                  value="${this.escapeHtml(this.config.college)}" 
                  placeholder="JSPM BSIOTR, WAGHOLI, PUNE"
                  maxlength="40" 
                  autocomplete="off"
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

              <div class="form-field">
                <label for="inp-attendee-photo">PROFILE PHOTO (OPTIONAL):</label>
                <input
                  type="file"
                  id="inp-attendee-photo"
                  class="sr-only-file-input"
                  accept="image/*" />
                <div class="photo-upload-row">
                  <div class="photo-upload-thumb" id="form-photo-thumb" aria-hidden="true">
                    ${this.renderFormThumbMarkup()}
                  </div>
                  <div class="photo-upload-actions">
                    <div class="photo-upload-btns">
                      <button type="button" class="btn-brutalist btn-secondary btn-photo-pick" id="btn-choose-photo">
                        ${this.config.photoDataUrl ? 'CHANGE PHOTO [->]' : 'UPLOAD PHOTO [+]'}
                      </button>
                      <button
                        type="button"
                        class="btn-brutalist btn-photo-clear"
                        id="btn-clear-photo"
                        ${this.config.photoDataUrl ? '' : 'style="display: none;"'}>
                        REMOVE [X]
                      </button>
                    </div>
                    <span class="photo-upload-hint" id="photo-upload-status">
                      ${this.config.photoDataUrl ? 'PHOTO ATTACHED TO BADGE [OK]' : 'SQUARE / PORTRAIT RECOMMENDED · PROCESSED LOCALLY'}
                    </span>
                  </div>
                </div>
              </div>

              <div class="form-actions-strip">
                <button type="button" class="btn-brutalist btn-accent w-full" id="btn-download-pass-png">
                  DOWNLOAD BADGE (PNG) [v]
                </button>
                <button type="button" class="btn-brutalist btn-secondary w-full" id="btn-share-pass">
                  SHARE BADGE [->]
                </button>
                <button type="button" class="btn-brutalist btn-photo-clear w-full" id="btn-reset-badge">
                  RESET BADGE [X]
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
              <div class="pass-foil-glare" aria-hidden="true"></div>
              
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

                <!-- Big Centered Identity Stage: Hero Photo + Attendee Name -->
                <div class="pass-identity-hero">
                  <div class="pass-photo-frame" id="pass-photo-frame">
                    ${this.renderPhotoMarkup()}
                  </div>

                  <div class="pass-name-block">
                    <span class="p-label">I AM ATTENDING // OFFICIAL BUILDER</span>
                    <div class="pass-display-name" id="pass-name-display">
                      ${this.escapeHtml(this.config.name) || 'YOUR FULL NAME'}
                    </div>
                    <div class="pass-college-name" id="pass-college-display">
                      ${this.escapeHtml(this.config.college) || 'YOUR INSTITUTION / UNIVERSITY'}
                    </div>
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
                    <strong class="val">27 DEC 2026 · 08:00–17:00 IST</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pass Download Confirmation Toast -->
            <div id="pass-claim-toast" class="pass-toast mono" style="display: none;" role="status" aria-live="polite"></div>
          </div>
        </div>
      </div>
    `;

    this.attachEvents();
  }

  private renderFormThumbMarkup(): string {
    return this.config.photoDataUrl
      ? `<img src="${this.escapeHtml(this.config.photoDataUrl)}" alt="Uploaded attendee preview" class="pass-photo-img" />`
      : `<svg viewBox="0 0 36 36" width="28" height="28" fill="none" aria-hidden="true">
           <circle cx="18" cy="13" r="6" stroke="#010101" stroke-width="2" />
           <path d="M7 31C7 24.9 11.9 21 18 21C24.1 21 29 24.9 29 31" stroke="#010101" stroke-width="2" stroke-linecap="square" />
         </svg>`;
  }

  private renderPhotoMarkup(): string {
    if (this.config.photoDataUrl) {
      return `
        <img src="${this.escapeHtml(this.config.photoDataUrl)}" alt="Attendee profile photo" class="pass-photo-img" />
        <span class="photo-corner-tag">[BUILDER ID]</span>
      `;
    }
    return `
      <div class="pass-photo-placeholder" aria-hidden="true">
        <span class="photo-corner-tag">[BUILDER ID]</span>
        <svg viewBox="0 0 64 64" width="76" height="76" fill="none">
          <circle cx="32" cy="22" r="10.5" stroke="#010101" stroke-width="2.6" />
          <path d="M12 54C12 43.2 20.8 36 32 36C43.2 36 52 43.2 52 54" stroke="#010101" stroke-width="2.6" stroke-linecap="square" />
        </svg>
        <span class="photo-empty-lbl">UPLOAD YOUR PHOTO</span>
      </div>
    `;
  }

  private async processUploadedPhoto(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      this.revokeActiveObjectUrl();
      const objectUrl = URL.createObjectURL(file);
      this.activeObjectUrl = objectUrl;
      const cleanupObjectUrl = () => {
        URL.revokeObjectURL(objectUrl);
        if (this.activeObjectUrl === objectUrl) {
          this.activeObjectUrl = null;
        }
      };

      const img = new Image();
      img.onload = () => {
        try {
          const targetSize = 440;
          const canvas = document.createElement('canvas');
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            cleanupObjectUrl();
            reject(new Error('Canvas context unavailable'));
            return;
          }

          // Center-crop cover fit into square badge portrait
          const minSide = Math.min(img.naturalWidth || img.width, img.naturalHeight || img.height);
          const sx = ((img.naturalWidth || img.width) - minSide) / 2;
          const sy = Math.max(0, ((img.naturalHeight || img.height) - minSide) * 0.25);

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetSize, targetSize);
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, targetSize, targetSize);

          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          cleanupObjectUrl();
          resolve(dataUrl);
        } catch (err) {
          cleanupObjectUrl();
          reject(err);
        }
      };
      img.onerror = () => {
        cleanupObjectUrl();
        reject(new Error('Failed to load selected image'));
      };
      img.src = objectUrl;
    });
  }

  private updatePassDisplay() {
    const nameDisp = this.container.querySelector('#pass-name-display');
    const collegeDisp = this.container.querySelector('#pass-college-display');
    const roleDisp = this.container.querySelector('#pass-role-display');
    const tierDisp = this.container.querySelector('#pass-tier-display');
    const photoFrame = this.container.querySelector('#pass-photo-frame');
    const formThumb = this.container.querySelector('#form-photo-thumb');
    const pickBtn = this.container.querySelector<HTMLButtonElement>('#btn-choose-photo');
    const clearBtn = this.container.querySelector<HTMLButtonElement>('#btn-clear-photo');
    const statusLbl = this.container.querySelector<HTMLElement>('#photo-upload-status');

    if (nameDisp) nameDisp.textContent = this.config.name || 'YOUR FULL NAME';
    if (collegeDisp) collegeDisp.textContent = this.config.college || 'YOUR INSTITUTION / UNIVERSITY';
    if (roleDisp) roleDisp.textContent = this.config.role;
    if (tierDisp) tierDisp.textContent = this.config.role;
    if (photoFrame) photoFrame.innerHTML = this.renderPhotoMarkup();
    if (formThumb) {
      formThumb.innerHTML = this.renderFormThumbMarkup();
    }
    if (pickBtn) {
      pickBtn.textContent = this.config.photoDataUrl ? 'CHANGE PHOTO [->]' : 'UPLOAD PHOTO [+]';
    }
    if (clearBtn) {
      clearBtn.style.display = this.config.photoDataUrl ? 'inline-flex' : 'none';
    }
    if (statusLbl) {
      statusLbl.textContent = this.config.photoDataUrl
        ? 'PHOTO ATTACHED TO BADGE [OK]'
        : 'SQUARE / PORTRAIT RECOMMENDED · PROCESSED LOCALLY';
    }
  }

  public resetBadge() {
    this.photoUploadSeq++;
    this.revokeActiveObjectUrl();

    this.config.name = '';
    this.config.college = '';
    this.config.role = 'STUDENT ATTENDEE';
    this.config.photoDataUrl = '';

    const nameInp = this.container.querySelector<HTMLInputElement>('#inp-attendee-name');
    const collegeInp = this.container.querySelector<HTMLInputElement>('#inp-attendee-college');
    const roleSel = this.container.querySelector<HTMLSelectElement>('#sel-attendee-role');
    const photoInp = this.container.querySelector<HTMLInputElement>('#inp-attendee-photo');
    const toast = this.container.querySelector<HTMLElement>('#pass-claim-toast');

    if (nameInp) nameInp.value = '';
    if (collegeInp) collegeInp.value = '';
    if (roleSel) roleSel.value = 'STUDENT ATTENDEE';
    if (photoInp) photoInp.value = '';

    if (this.toastTimeout !== null) {
      window.clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    if (toast) {
      toast.style.display = 'none';
      toast.textContent = '';
    }

    this.updatePassDisplay();
  }

  private attachEvents() {
    const form = this.container.querySelector<HTMLFormElement>('#pass-customizer-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
      });
    }

    // Name input
    const nameInp = this.container.querySelector<HTMLInputElement>('#inp-attendee-name');
    if (nameInp) {
      nameInp.addEventListener('input', () => {
        this.config.name = nameInp.value.toUpperCase();
        sound.playTypewriter(Math.random() * 200 + 400);
        this.updatePassDisplay();
        this.triggerInputNudge?.();
      });
    }

    // College input
    const collegeInp = this.container.querySelector<HTMLInputElement>('#inp-attendee-college');
    if (collegeInp) {
      collegeInp.addEventListener('input', () => {
        this.config.college = collegeInp.value.toUpperCase();
        sound.playTypewriter(Math.random() * 200 + 400);
        this.updatePassDisplay();
        this.triggerInputNudge?.();
      });
    }

    // Role select
    const roleSel = this.container.querySelector<HTMLSelectElement>('#sel-attendee-role');
    if (roleSel) {
      roleSel.addEventListener('change', () => {
        this.config.role = roleSel.value;
        sound.playClick(650, 0.03);
        this.updatePassDisplay();
        this.triggerRoleNudge?.();
      });
    }

    // Profile photo upload & remove
    const photoInp = this.container.querySelector<HTMLInputElement>('#inp-attendee-photo');
    const choosePhotoBtn = this.container.querySelector<HTMLButtonElement>('#btn-choose-photo');
    const clearPhotoBtn = this.container.querySelector<HTMLButtonElement>('#btn-clear-photo');
    const statusLbl = this.container.querySelector<HTMLElement>('#photo-upload-status');

    if (choosePhotoBtn && photoInp) {
      choosePhotoBtn.addEventListener('click', () => {
        sound.playClick(720, 0.03);
        photoInp.click();
      });
    }

    if (photoInp) {
      photoInp.addEventListener('change', () => {
        const file = photoInp.files?.[0];
        if (!file) return;
        const seq = ++this.photoUploadSeq;
        if (!file.type.startsWith('image/')) {
          this.revokeActiveObjectUrl();
          if (statusLbl) statusLbl.textContent = 'PLEASE SELECT A VALID IMAGE FILE (PNG/JPG/WEBP)';
          photoInp.value = '';
          return;
        }
        if (file.size > 12 * 1024 * 1024) {
          this.revokeActiveObjectUrl();
          if (statusLbl) statusLbl.textContent = 'IMAGE TOO LARGE (MAX 12 MB)';
          photoInp.value = '';
          return;
        }
        if (statusLbl) statusLbl.textContent = 'PROCESSING PHOTO...';
        void this.processUploadedPhoto(file)
          .then((dataUrl) => {
            if (seq !== this.photoUploadSeq) return;
            this.config.photoDataUrl = dataUrl;
            sound.playSuccess();
            this.updatePassDisplay();
            this.triggerRoleNudge?.();
            photoInp.value = '';
          })
          .catch(() => {
            if (seq !== this.photoUploadSeq) return;
            if (statusLbl) statusLbl.textContent = 'COULD NOT READ IMAGE · TRY ANOTHER JPG OR PNG';
            photoInp.value = '';
          });
      });
    }

    if (clearPhotoBtn) {
      clearPhotoBtn.addEventListener('click', () => {
        this.photoUploadSeq++;
        this.revokeActiveObjectUrl();
        this.config.photoDataUrl = '';
        if (photoInp) photoInp.value = '';
        sound.playClick(520, 0.03);
        this.updatePassDisplay();
        this.triggerInputNudge?.();
      });
    }

    // Reset entire badge back to clean defaults
    const resetBadgeBtn = this.container.querySelector<HTMLButtonElement>('#btn-reset-badge');
    if (resetBadgeBtn) {
      resetBadgeBtn.addEventListener('click', () => {
        sound.playClick(520, 0.03);
        this.resetBadge();
        this.triggerInputNudge?.();
      });
    }

    // Download Badge PNG button
    const dlBtn = this.container.querySelector<HTMLButtonElement>('#btn-download-pass-png');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        void this.downloadPassPNG();
      });
    }

    // Share Badge button (Native Web Share on mobile, PNG fallback on desktop)
    const shareBtn = this.container.querySelector<HTMLButtonElement>('#btn-share-pass');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        void this.sharePassBadge();
      });
    }

    if (this.pageshowHandler) {
      window.removeEventListener('pageshow', this.pageshowHandler);
    }
    this.pageshowHandler = (e: PageTransitionEvent) => {
      if (e.persisted) {
        this.resetBadge();
      }
    };
    window.addEventListener('pageshow', this.pageshowHandler);

    this.initBadgePhysics();
  }

  private teardownPhysicsListeners() {
    if (this.orientationHandler) {
      window.removeEventListener('deviceorientation', this.orientationHandler);
      this.orientationHandler = null;
    }
    if (this.windowMoveHandler) {
      window.removeEventListener('pointermove', this.windowMoveHandler);
      this.windowMoveHandler = null;
    }
    if (this.windowUpHandler) {
      window.removeEventListener('pointerup', this.windowUpHandler);
      window.removeEventListener('pointercancel', this.windowUpHandler);
      this.windowUpHandler = null;
    }
    if (this.roleFlashTimeout !== null) {
      window.clearTimeout(this.roleFlashTimeout);
      this.roleFlashTimeout = null;
    }
    if (this.stageObserver) {
      this.stageObserver.disconnect();
      this.stageObserver = null;
    }
    if (this.physicsRafId !== null) {
      cancelAnimationFrame(this.physicsRafId);
      this.physicsRafId = null;
    }
  }

  private initBadgePhysics() {
    this.teardownPhysicsListeners();
    const card = this.container.querySelector<HTMLElement>('#physical-pass-card');
    const stage = this.container.querySelector<HTMLElement>('.pass-preview-stage');
    const clip = this.container.querySelector<HTMLElement>('.lanyard-clip');
    const glare = card?.querySelector<HTMLElement>('.pass-foil-glare') ?? null;
    if (!card || !stage) return;

    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

    // Damped harmonic spring state (degrees & deg/s)
    let angleZ = 0;
    let velZ = 0;
    let targetZ = 0;
    let tiltX = 0;
    let velX = 0;
    let targetX = 0;
    let tiltY = 0;
    let velY = 0;
    let targetY = 0;

    // Unified pointer & gyro tracking state
    let isHovering = false;
    let isDragging = false;
    let activePointerId: number | null = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragBaseAngleZ = 0;
    let dragGrabRadius = 220;
    let dragMovedDist = 0;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastPointerTime = 0;
    let dragVelX = 0;
    let dragVelY = 0;
    let lastMoveTime = 0;
    let lastFrameTime = 0;
    let gyroActive = false;
    let gyroTargetZ = 0;
    let gyroTargetX = 0;
    let gyroTargetY = 0;
    let gyroPermissionRequested = false;

    const clearInlineStyles = () => {
      card.style.transform = '';
      card.style.boxShadow = '';
      if (clip) clip.style.transform = '';
      if (glare) {
        glare.style.transform = '';
        glare.style.opacity = '0';
      }
    };

    const applyPhysics = (zDeg: number, xDeg: number, yDeg: number) => {
      const baseShadow = card.clientWidth > 0 && card.clientWidth <= 350 ? 5 : 10;
      const shadowX = baseShadow - yDeg * 0.72 - zDeg * 0.35;
      const shadowY = baseShadow + Math.abs(zDeg) * 0.22 + xDeg * 0.45;

      card.style.transform = `perspective(950px) rotateZ(${zDeg.toFixed(2)}deg) rotateX(${xDeg.toFixed(2)}deg) rotateY(${yDeg.toFixed(2)}deg)`;
      card.style.boxShadow = `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px 0px var(--color-black)`;

      if (clip) {
        const clipAngle = zDeg * 0.38;
        const clipScale = 1 + Math.min(0.06, Math.abs(zDeg) * 0.003 + (isDragging ? 0.045 : 0));
        clip.style.transform = `rotate(${clipAngle.toFixed(2)}deg) scale(${clipScale.toFixed(3)})`;
      }

      if (glare) {
        const tiltMag = clamp((Math.abs(xDeg) + Math.abs(yDeg) + Math.abs(zDeg) * 0.4) / 11, 0, 1);
        const glareOpacity = isHovering ? Math.max(0.18, tiltMag * 0.82) : tiltMag * 0.72;
        const glareX = yDeg * 2.4 + zDeg * 0.9;
        const glareY = -xDeg * 2.2;
        glare.style.transform = `translate3d(${glareX.toFixed(2)}%, ${glareY.toFixed(2)}%, 0)`;
        glare.style.opacity = glareOpacity.toFixed(3);
      }
    };

    const hasPendingMotion = (): boolean =>
      isDragging ||
      Math.abs(angleZ - targetZ) >= 0.01 ||
      Math.abs(velZ) >= 0.01 ||
      Math.abs(tiltX - targetX) >= 0.01 ||
      Math.abs(velX) >= 0.01 ||
      Math.abs(tiltY - targetY) >= 0.01 ||
      Math.abs(velY) >= 0.01;

    const stepPhysics = (now: number) => {
      this.physicsRafId = null;
      if (!this.isStageVisible) {
        lastFrameTime = 0;
        return;
      }

      const rawDt = lastFrameTime > 0 ? (now - lastFrameTime) / 1000 : 1 / 60;
      lastFrameTime = now;
      const dt = clamp(rawDt, 0.001, 0.032);
      const steps = dt > 0.018 ? 2 : 1;
      const subDt = dt / steps;

      const kZ = isDragging ? 320 : isHovering ? 160 : 115;
      const cZ = isDragging ? 28 : isHovering ? 17 : 3.1;
      const kX = isDragging ? 320 : isHovering ? 170 : 140;
      const cX = isDragging ? 28 : isHovering ? 18 : 7.2;
      const kY = isDragging ? 320 : isHovering ? 170 : 125;
      const cY = isDragging ? 28 : isHovering ? 18 : 5.4;

      for (let i = 0; i < steps; i++) {
        const accelZ = -kZ * (angleZ - targetZ) - cZ * velZ;
        velZ += accelZ * subDt;
        angleZ += velZ * subDt;

        const accelX = -kX * (tiltX - targetX) - cX * velX;
        velX += accelX * subDt;
        tiltX += velX * subDt;

        const accelY = -kY * (tiltY - targetY) - cY * velY;
        velY += accelY * subDt;
        tiltY += velY * subDt;
      }

      const pointerRecentlyActive = now - lastMoveTime < 120;
      if (!pointerRecentlyActive && !hasPendingMotion()) {
        angleZ = targetZ;
        tiltX = targetX;
        tiltY = targetY;
        velZ = 0;
        velX = 0;
        velY = 0;

        if (targetZ === 0 && targetX === 0 && targetY === 0 && !isHovering) {
          clearInlineStyles();
        } else {
          applyPhysics(angleZ, tiltX, tiltY);
        }
        lastFrameTime = 0;
        return;
      }

      applyPhysics(angleZ, tiltX, tiltY);
      this.physicsRafId = requestAnimationFrame(stepPhysics);
    };

    const ensurePhysicsLoop = () => {
      if (!this.isStageVisible || this.physicsRafId !== null) return;
      lastFrameTime = 0;
      this.physicsRafId = requestAnimationFrame(stepPhysics);
    };

    const getNormalizedPointer = (clientX: number, clientY: number) => {
      const stageRect = stage.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const cardWidth = card.offsetWidth || 320;
      const cardHeight = card.offsetHeight || 420;
      const centerX = stageRect.left + stageRect.width / 2;
      const centerY = cardRect.top + cardHeight / 2;
      return {
        nx: clamp((clientX - centerX) / (cardWidth * 0.55), -1, 1),
        ny: clamp((clientY - centerY) / (cardHeight * 0.55), -1, 1),
        stageRect,
        cardRect
      };
    };

    const resetTargetsToRest = () => {
      targetZ = gyroActive ? gyroTargetZ : 0;
      targetX = gyroActive ? gyroTargetX : 0;
      targetY = gyroActive ? gyroTargetY : 0;
    };

    this.triggerInputNudge = () => {
      if (!this.isStageVisible || isDragging) return;
      const dir = (this.inputPulseToggle = !this.inputPulseToggle) ? 1 : -1;
      velZ = clamp(velZ + dir * 13, -32, 32);
      velY = clamp(velY + dir * 11, -28, 28);
      velX = clamp(velX - 8, -22, 22);
      lastMoveTime = performance.now();
      ensurePhysicsLoop();
    };

    this.triggerRoleNudge = () => {
      const tierDisp = this.container.querySelector<HTMLElement>('#pass-tier-display');
      if (tierDisp) {
        tierDisp.classList.remove('is-role-flashing');
        void tierDisp.offsetWidth;
        tierDisp.classList.add('is-role-flashing');
        if (this.roleFlashTimeout !== null) {
          window.clearTimeout(this.roleFlashTimeout);
        }
        this.roleFlashTimeout = window.setTimeout(() => {
          tierDisp.classList.remove('is-role-flashing');
          this.roleFlashTimeout = null;
        }, 350);
      }

      if (!this.isStageVisible || isDragging) return;
      const dir = (this.inputPulseToggle = !this.inputPulseToggle) ? 1 : -1;
      velZ = clamp(velZ + dir * 38, -55, 55);
      velY = clamp(velY + dir * 32, -45, 45);
      velX = clamp(velX - 28, -40, 40);
      lastMoveTime = performance.now();
      ensurePhysicsLoop();
    };

    // 1. Desktop Hover Tracking (pointer events on stage to avoid edge flicker)
    stage.addEventListener('pointerenter', (e: PointerEvent) => {
      if (e.pointerType === 'touch' || isDragging) return;
      isHovering = true;
      const { nx, ny } = getNormalizedPointer(e.clientX, e.clientY);
      targetZ = -nx * 5.4;
      targetY = nx * 10.5;
      targetX = -ny * 7.5;
      lastMoveTime = performance.now();
      sound.playHover(480, 0.02);
      ensurePhysicsLoop();
    });

    stage.addEventListener('pointermove', (e: PointerEvent) => {
      if (e.pointerType === 'touch' || isDragging) return;
      isHovering = true;
      const { nx, ny } = getNormalizedPointer(e.clientX, e.clientY);
      targetZ = -nx * 5.4;
      targetY = nx * 10.5;
      targetX = -ny * 7.5;
      lastMoveTime = performance.now();
      ensurePhysicsLoop();
    });

    stage.addEventListener('pointerleave', (e: PointerEvent) => {
      if (e.pointerType === 'touch' || isDragging) return;
      isHovering = false;
      resetTargetsToRest();
      sound.playHover(540, 0.015);
      ensurePhysicsLoop();
    });

    // 2. Unified Grab, Drag, Flick & Click Impulse on Card
    card.addEventListener('pointerdown', (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      // Request DeviceOrientation permission on iOS Safari on first touch gesture
      if (e.pointerType === 'touch' && !gyroPermissionRequested) {
        gyroPermissionRequested = true;
        if (typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })?.requestPermission === 'function') {
          (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
            .requestPermission()
            .then((res: string) => {
              if (res === 'granted') gyroActive = true;
            })
            .catch(() => {});
        }
      }

      if (e.pointerType === 'mouse') {
        e.preventDefault();
        try {
          card.setPointerCapture(e.pointerId);
        } catch {
          // Ignore pointer capture errors on synthetic events
        }
      }

      isDragging = true;
      activePointerId = e.pointerId;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      const now = performance.now();
      lastPointerTime = now;
      lastMoveTime = now;
      dragMovedDist = 0;
      dragVelX = 0;
      dragVelY = 0;
      dragBaseAngleZ = angleZ;

      const { nx, ny, cardRect } = getNormalizedPointer(e.clientX, e.clientY);
      dragGrabRadius = Math.max(130, e.clientY - cardRect.top);
      card.classList.add('is-dragging');
      targetZ = angleZ;
      targetY = nx * 10.5;
      targetX = -ny * 7.5;
      sound.playHover(480, 0.02);
      ensurePhysicsLoop();
    });

    this.windowMoveHandler = (e: PointerEvent) => {
      if (!isDragging || e.pointerId !== activePointerId) return;

      const now = performance.now();
      const dtMs = Math.max(1, now - lastPointerTime);
      const stepDx = e.clientX - lastPointerX;
      const stepDy = e.clientY - lastPointerY;
      dragMovedDist += Math.hypot(stepDx, stepDy);

      const instVx = (stepDx / dtMs) * 1000;
      const instVy = (stepDy / dtMs) * 1000;
      dragVelX = dragVelX * 0.55 + instVx * 0.45;
      dragVelY = dragVelY * 0.55 + instVy * 0.45;

      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastPointerTime = now;
      lastMoveTime = now;

      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      const rawSwingDeg = -(Math.atan2(dx, dragGrabRadius) * 180) / Math.PI;
      const maxDragAngle = 18;
      targetZ = maxDragAngle * Math.tanh((dragBaseAngleZ + rawSwingDeg) / maxDragAngle);

      const { nx, ny, cardRect } = getNormalizedPointer(e.clientX, e.clientY);
      targetY = clamp(nx * 10.5 + (dragVelX / 1200) * 7.5, -15, 15);
      targetX = clamp(-ny * 7.5 - (dy / Math.max(180, cardRect.height)) * 5.0, -11, 11);
      ensurePhysicsLoop();
    };

    this.windowUpHandler = (e: PointerEvent) => {
      if (!isDragging || e.pointerId !== activePointerId) return;

      if (e.pointerType === 'mouse') {
        try {
          if (card.hasPointerCapture?.(e.pointerId)) {
            card.releasePointerCapture(e.pointerId);
          }
        } catch {
          // Ignore pointer release errors
        }
      }

      const wasCancel = e.type === 'pointercancel';
      const totalDragDx = e.clientX - dragStartX;
      const totalDragDy = e.clientY - dragStartY;
      const isTap = !wasCancel && dragMovedDist < 8 && Math.hypot(totalDragDx, totalDragDy) < 8;
      const timeSinceMove = performance.now() - lastPointerTime;

      isDragging = false;
      activePointerId = null;
      card.classList.remove('is-dragging');

      const { nx, ny, stageRect } = getNormalizedPointer(e.clientX, e.clientY);
      const pointerStillInsideStage =
        !wasCancel &&
        e.pointerType !== 'touch' &&
        e.clientX >= stageRect.left &&
        e.clientX <= stageRect.right &&
        e.clientY >= stageRect.top &&
        e.clientY <= stageRect.bottom;

      if (isTap) {
        const dir = Math.abs(nx) > 0.14 ? Math.sign(nx) : (this.inputPulseToggle = !this.inputPulseToggle) ? 1 : -1;
        const arm = Math.max(0.45, Math.abs(nx));
        velZ += -dir * arm * 92;
        velY += dir * arm * 105;
        velX += (ny >= 0 ? -1 : 1) * 70;
        sound.playClick(850, 0.04);

        if (pointerStillInsideStage) {
          isHovering = true;
          targetZ = -nx * 5.4;
          targetY = nx * 10.5;
          targetX = -ny * 7.5;
        } else {
          isHovering = false;
          resetTargetsToRest();
        }
      } else {
        const freshness = timeSinceMove > 75 ? 0 : Math.max(0, 1 - timeSinceMove / 75);
        const releaseVelZ = -((dragVelX * freshness) / dragGrabRadius) * (180 / Math.PI) * 0.85;
        const releaseVelY = ((dragVelX * freshness) / 600) * 45;
        const releaseVelX = -((dragVelY * freshness) / 600) * 35;

        velZ = clamp(velZ * 0.35 + releaseVelZ, -230, 230);
        velY = clamp(velY * 0.35 + releaseVelY, -160, 160);
        velX = clamp(velX * 0.35 + releaseVelX, -130, 130);

        if (pointerStillInsideStage) {
          isHovering = true;
          targetZ = -nx * 5.4;
          targetY = nx * 10.5;
          targetX = -ny * 7.5;
        } else {
          isHovering = false;
          resetTargetsToRest();
        }

        if (!wasCancel && Math.abs(releaseVelZ) > 35) {
          sound.playHover(580, 0.015);
        }
      }

      lastMoveTime = performance.now();
      ensurePhysicsLoop();
    };

    window.addEventListener('pointermove', this.windowMoveHandler);
    window.addEventListener('pointerup', this.windowUpHandler);
    window.addEventListener('pointercancel', this.windowUpHandler);

    // 3. Gyroscope / Device Tilt Physics (visibility-aware)
    this.orientationHandler = (e: DeviceOrientationEvent) => {
      if (isDragging || isHovering || !this.isStageVisible) return;
      if (e.gamma !== null && e.gamma !== undefined) {
        gyroActive = true;
        const isLandscape =
          (typeof screen !== 'undefined' && screen.orientation?.type?.includes('landscape')) ||
          Math.abs((window as unknown as { orientation?: number }).orientation ?? 0) === 90;
        const rollAngle = isLandscape ? (e.beta ?? 0) : e.gamma;
        const clampedGamma = clamp(rollAngle, -25, 25);
        const nextZ = -(clampedGamma / 25) * 8.0;
        const nextY = (clampedGamma / 25) * 5.5;
        const clampedBeta = clamp((e.beta ?? 35) - 35, -20, 20);
        const nextX = -(clampedBeta / 20) * 4.5;

        if (
          Math.abs(nextZ - gyroTargetZ) > 0.05 ||
          Math.abs(nextX - gyroTargetX) > 0.05 ||
          Math.abs(nextY - gyroTargetY) > 0.05
        ) {
          gyroTargetZ = nextZ;
          gyroTargetX = nextX;
          gyroTargetY = nextY;
          targetZ = gyroTargetZ;
          targetX = gyroTargetX;
          targetY = gyroTargetY;
          lastMoveTime = performance.now();
          ensurePhysicsLoop();
        }
      }
    };

    if ('IntersectionObserver' in window) {
      this.stageObserver = new IntersectionObserver(
        (entries) => {
          this.isStageVisible = entries.some((entry) => entry.isIntersecting);
          if (this.isStageVisible) {
            if (isHovering || hasPendingMotion()) {
              ensurePhysicsLoop();
            }
          } else if (this.physicsRafId !== null) {
            cancelAnimationFrame(this.physicsRafId);
            this.physicsRafId = null;
            lastFrameTime = 0;
          }
        },
        { threshold: 0.01 }
      );
      this.stageObserver.observe(stage);
    }

    window.addEventListener('deviceorientation', this.orientationHandler, { passive: true });
  }

  private showToast(message: string) {
    const toast = this.container.querySelector<HTMLElement>('#pass-claim-toast');
    if (!toast) return;
    if (this.toastTimeout !== null) {
      window.clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    toast.textContent = message;
    toast.style.display = 'block';
    this.toastTimeout = window.setTimeout(() => {
      toast.style.display = 'none';
      this.toastTimeout = null;
    }, 4500);
  }

  private async renderPassCanvas(): Promise<HTMLCanvasElement | null> {
    if (document.fonts && document.fonts.ready) {
      try {
        await document.fonts.ready;
      } catch {
        // Proceed with fallback fonts if font loading settles with error
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

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

    // Header brand & role pill
    ctx.fillStyle = '#010101';
    ctx.font = '700 28px "Space Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('AWS SCD BSIOTR 2026', 50, 88);

    ctx.fillStyle = '#010101';
    ctx.fillRect(50, 102, 260, 28);
    ctx.fillStyle = '#DCD4C2';
    ctx.font = '700 15px "Space Mono", monospace';
    ctx.fillText(this.config.role, 62, 121);

    // Divider
    ctx.strokeStyle = '#010101';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(50, 148);
    ctx.lineTo(750, 148);
    ctx.stroke();

    // Huge Centered Hero Portrait Frame
    const photoSize = 356;
    const photoX = (canvas.width - photoSize) / 2;
    const photoY = 176;

    // Brutalist hard shadow under portrait
    ctx.fillStyle = '#010101';
    ctx.fillRect(photoX + 10, photoY + 10, photoSize, photoSize);

    // Portrait frame background
    ctx.fillStyle = '#ECE6D8';
    ctx.fillRect(photoX, photoY, photoSize, photoSize);

    if (this.config.photoDataUrl) {
      const loadedImg = await new Promise<HTMLImageElement | null>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = this.config.photoDataUrl;
      });
      if (loadedImg) {
        const minSide = Math.min(loadedImg.naturalWidth || loadedImg.width, loadedImg.naturalHeight || loadedImg.height);
        const sx = ((loadedImg.naturalWidth || loadedImg.width) - minSide) / 2;
        const sy = Math.max(0, ((loadedImg.naturalHeight || loadedImg.height) - minSide) * 0.25);
        ctx.drawImage(loadedImg, sx, sy, minSide, minSide, photoX, photoY, photoSize, photoSize);
      }
    } else {
      // Minimalist geometric builder silhouette placeholder
      ctx.strokeStyle = '#010101';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + 132, 54, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(photoX + photoSize / 2, photoY + 312, 100, Math.PI, 0, false);
      ctx.stroke();
    }

    // Crisp portrait border + [BUILDER ID] corner badge
    ctx.strokeStyle = '#010101';
    ctx.lineWidth = 5;
    ctx.strokeRect(photoX, photoY, photoSize, photoSize);

    ctx.fillStyle = '#FD0B03';
    ctx.fillRect(photoX, photoY, 136, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 14px "Space Mono", monospace';
    ctx.fillText('[BUILDER ID]', photoX + 12, photoY + 20);

    // Centered Attendee Identity Block below Photo
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5A554A';
    ctx.font = '700 16px "Space Mono", monospace';
    ctx.fillText('I AM ATTENDING // OFFICIAL BUILDER', canvas.width / 2, 578);

    ctx.fillStyle = '#010101';
    ctx.font = '900 48px "Roboto Flex", sans-serif';
    ctx.fillText(attendeeName, canvas.width / 2, 636, 680);

    ctx.fillStyle = '#5A554A';
    ctx.font = '700 21px "Space Mono", monospace';
    ctx.fillText(collegeName, canvas.width / 2, 676, 680);

    // Clean Details Grid Box
    ctx.textAlign = 'left';
    ctx.fillStyle = '#EDE7D8';
    ctx.fillRect(50, 712, 700, 206);
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 712, 700, 206);

    ctx.fillStyle = '#5A554A';
    ctx.font = '15px "Space Mono", monospace';
    ctx.fillText('ASSIGNED ROLE:', 75, 754);
    ctx.fillStyle = '#010101';
    ctx.font = '700 19px "Space Mono", monospace';
    ctx.fillText(this.config.role, 75, 784, 310);

    ctx.fillStyle = '#5A554A';
    ctx.font = '15px "Space Mono", monospace';
    ctx.fillText('ADMISSION STATUS:', 75, 842);
    ctx.fillStyle = '#FD0B03';
    ctx.font = '700 19px "Space Mono", monospace';
    ctx.fillText('[VERIFIED] ALL-ACCESS', 75, 872);

    ctx.fillStyle = '#5A554A';
    ctx.font = '15px "Space Mono", monospace';
    ctx.fillText('VENUE / LOCATION:', 420, 754);
    ctx.fillStyle = '#010101';
    ctx.font = '700 17px "Space Mono", monospace';
    ctx.fillText('SEASONS 24, WAGHOLI', 420, 784, 310);

    ctx.fillStyle = '#5A554A';
    ctx.font = '15px "Space Mono", monospace';
    ctx.fillText('EVENT DATE & TIME:', 420, 842);
    ctx.fillStyle = '#010101';
    ctx.font = '700 17px "Space Mono", monospace';
    ctx.fillText('27 DEC 2026 // 08:00–17:00 IST', 420, 872, 310);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#5A554A';
    ctx.font = '700 14px "Space Mono", monospace';
    ctx.fillText('AWS STUDENT COMMUNITY DAY 2026 // PUNE EDITION', canvas.width / 2, 954);
    ctx.textAlign = 'left';

    return canvas;
  }

  private async downloadPassPNG() {
    sound.playClick(950, 0.05);
    const canvas = await this.renderPassCanvas();
    if (!canvas) return;

    const attendeeName = (this.config.name || 'STUDENT BUILDER').toUpperCase();
    const link = document.createElement('a');
    link.download = `AWS-SCD-2026-PASS-${attendeeName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    this.showToast(`[SUCCESS] BADGE PNG DOWNLOADED FOR ${attendeeName} (#${this.config.passNumber}).`);
  }

  private async sharePassBadge() {
    sound.playClick(950, 0.05);
    const canvas = await this.renderPassCanvas();
    if (!canvas) return;

    const attendeeName = (this.config.name || 'STUDENT BUILDER').toUpperCase();
    const filename = `AWS-SCD-2026-PASS-${attendeeName.replace(/\s+/g, '_')}.png`;
    const shareText = `Excited to attend AWS Student Community Day Pune 2026 on 27 Dec at Seasons 24, Wagholi! #AWSSCD2026 #AWSSBG #Pune`;

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (blob && typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      const file = new File([blob], filename, { type: 'image/png' });
      try {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'AWS SCD Pune 2026 — Builder Badge',
            text: shareText,
            files: [file]
          });
          this.showToast(`[SHARED] BADGE SHARED SUCCESSFULLY (#${this.config.passNumber}).`);
          return;
        }
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    // Fallback when Web Share with files is unsupported (e.g., desktop browsers)
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    this.showToast('[SAVED] BADGE DOWNLOADED AS PNG — READY TO POST ON LINKEDIN / INSTAGRAM.');
  }

  public destroy() {
    this.photoUploadSeq++;
    this.revokeActiveObjectUrl();
    if (this.pageshowHandler) {
      window.removeEventListener('pageshow', this.pageshowHandler);
      this.pageshowHandler = null;
    }
    if (this.toastTimeout !== null) {
      window.clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    this.teardownPhysicsListeners();
  }
}
