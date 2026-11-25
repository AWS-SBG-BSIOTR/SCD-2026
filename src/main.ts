import './style.css';
import { sound } from './audio';
import { HeroVariableController } from './hero-variable';
import { TickerController } from './ticker';
import { OverviewController } from './overview';
import { SpeakersController } from './speakers';
import { ScheduleController } from './schedule';
import { PassGeneratorController } from './passGenerator';
import { PassTiersController } from './passTiers';
import { VenueController } from './venue';
import { EcosystemController } from './ecosystem';
import { ScrollRevealController } from './scrollReveal';

type Destroyable = { destroy?: () => void };

const initApp = () => {
  const abortController = new AbortController();
  const { signal } = abortController;
  const controllers: Destroyable[] = [];

  // 1. Navigation Drawer Toggle (with scroll lock, focus/inert containment & Escape key)
  const menuToggle = document.getElementById('menu-drawer-toggle');
  const menuDrawer = document.getElementById('menu-drawer');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerLinks = document.querySelectorAll('.drawer-nav-item, .drawer-social-btn');
  const mainEl = document.querySelector<HTMLElement>('main');
  const footerEl = document.getElementById('footer');

  const setBackgroundInert = (isInert: boolean) => {
    const supportsInert = 'inert' in HTMLElement.prototype;
    [mainEl, footerEl].forEach((el) => {
      if (!el) return;
      if (supportsInert) {
        el.inert = isInert;
      } else if (isInert) {
        el.setAttribute('aria-hidden', 'true');
      } else {
        el.removeAttribute('aria-hidden');
      }
    });
  };

  const openDrawer = () => {
    if (!menuDrawer) return;
    menuDrawer.classList.add('is-open');
    menuDrawer.setAttribute('aria-hidden', 'false');
    menuToggle?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    setBackgroundInert(true);
    sound.playClick(600, 0.04);
    drawerCloseBtn?.focus({ preventScroll: true });
  };

  const closeDrawer = (silent = false) => {
    const wasOpen = Boolean(menuDrawer?.classList.contains('is-open'));
    if (menuDrawer) {
      menuDrawer.classList.remove('is-open');
      menuDrawer.setAttribute('aria-hidden', 'true');
    }
    menuToggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    setBackgroundInert(false);
    if (wasOpen && !silent) {
      sound.playClick(500, 0.03);
    }
  };

  menuToggle?.addEventListener('click', openDrawer, { signal });
  drawerCloseBtn?.addEventListener('click', () => {
    closeDrawer();
    menuToggle?.focus({ preventScroll: true });
  }, { signal });
  drawerBackdrop?.addEventListener('click', () => closeDrawer(), { signal });
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => closeDrawer(true), { signal });
  });

  document.addEventListener(
    'keydown',
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuDrawer?.classList.contains('is-open')) {
        closeDrawer();
        menuToggle?.focus({ preventScroll: true });
      }
    },
    { signal }
  );

  // Release drawer scroll lock & inert state on desktop resize, hash navigation, or pagehide
  const desktopMediaQuery = window.matchMedia('(min-width: 769px)');
  const onDesktopMatchChange = (e: MediaQueryListEvent | MediaQueryList) => {
    if (e.matches) {
      closeDrawer(true);
    }
  };
  if (typeof desktopMediaQuery.addEventListener === 'function') {
    desktopMediaQuery.addEventListener('change', onDesktopMatchChange, { signal });
  } else if (typeof desktopMediaQuery.addListener === 'function') {
    desktopMediaQuery.addListener(onDesktopMatchChange);
  }

  window.addEventListener('hashchange', () => closeDrawer(true), { signal });
  window.addEventListener(
    'pagehide',
    () => {
      closeDrawer(true);
      document.body.style.overflow = '';
    },
    { signal }
  );

  // 4. Initialize Hero Proximity Variable Typography
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    controllers.push(new HeroVariableController(heroEl));
  }

  // 5. Initialize Identity Ticker
  const tickerEl = document.getElementById('ticker');
  if (tickerEl) {
    controllers.push(new TickerController(tickerEl));
  }

  // 6. Initialize Event Overview, Countdown & Attendee Perks
  const overviewEl = document.getElementById('overview');
  if (overviewEl) {
    controllers.push(new OverviewController(overviewEl));
  }

  // 7. Initialize AWS SCD Speakers & Keynotes
  const speakersEl = document.getElementById('speakers');
  if (speakersEl) {
    new SpeakersController(speakersEl);
  }

  // 8. Initialize 08:00 AM – 05:00 PM Master Schedule
  const scheduleEl = document.getElementById('schedule');
  if (scheduleEl) {
    controllers.push(new ScheduleController(scheduleEl));
  }

  // 9. Initialize AWS SCD Attendee Pass Generator
  const passEl = document.getElementById('pass-generator');
  if (passEl) {
    controllers.push(new PassGeneratorController(passEl));
  }

  // 10. Initialize KonfHub Pass & Registration Tiers
  const passesEl = document.getElementById('passes');
  if (passesEl) {
    controllers.push(new PassTiersController(passesEl));
  }

  // 11. Initialize Venue & Wayfinding (Seasons 24 Wagholi)
  const venueEl = document.getElementById('venue');
  if (venueEl) {
    controllers.push(new VenueController(venueEl));
  }

  // 12. Initialize AWS SCD Ecosystem & FAQ Terminal
  const ecoEl = document.getElementById('ecosystem');
  if (ecoEl) {
    controllers.push(new EcosystemController(ecoEl));
  }

  // 13. Initialize Scroll Reveal Controller right after all section controllers render
  const scrollReveal = new ScrollRevealController();
  controllers.push(scrollReveal);

  // Header & Hero Register Buttons sound/drawer feedback
  const headerTrialBtn = document.getElementById('header-trial-trigger');
  if (headerTrialBtn) {
    headerTrialBtn.addEventListener(
      'click',
      () => {
        closeDrawer(true);
        sound.playClick(720, 0.04);
      },
      { signal }
    );
  }

  const heroRegisterBtn = document.getElementById('hero-register-btn');
  if (heroRegisterBtn) {
    heroRegisterBtn.addEventListener(
      'click',
      () => {
        sound.playClick(720, 0.04);
      },
      { signal }
    );
  }

  // 14. Back to Top Button
  const backToTopBtn = document.getElementById('btn-back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener(
      'click',
      () => {
        sound.playClick(800, 0.04);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
      { signal }
    );
  }

  document.querySelectorAll('.footer-social-icon-btn, #btn-footer-register').forEach(el => {
    el.addEventListener(
      'click',
      () => {
        sound.playClick(760, 0.03);
      },
      { signal }
    );
  });

  // Delegated smooth anchor scrolling & sound feedback (supports dynamically rendered sections)
  document.addEventListener(
    'click',
    (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || !href.startsWith('#') || href.length <= 1) return;

      let target: Element | null = document.getElementById(href.slice(1));
      if (!target) {
        try {
          target = document.querySelector(href);
        } catch {
          return;
        }
      }
      if (target) {
        e.preventDefault();
        closeDrawer(true);
        sound.playClick(700, 0.02);
        target.scrollIntoView({ behavior: 'smooth' });
      }
    },
    { signal }
  );

  const teardown = () => {
    closeDrawer(true);
    document.body.style.overflow = '';
    abortController.abort();
    if (typeof desktopMediaQuery.removeListener === 'function') {
      desktopMediaQuery.removeListener(onDesktopMatchChange);
    }
    for (const ctrl of controllers) {
      ctrl.destroy?.();
    }
    controllers.length = 0;
  };

  window.addEventListener('beforeunload', teardown, { once: true });
  const hot = (import.meta as ImportMeta & { hot?: { dispose: (cb: () => void) => void } }).hot;
  hot?.dispose(teardown);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp, { once: true });
} else {
  initApp();
}
