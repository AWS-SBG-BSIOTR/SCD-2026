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

document.addEventListener('DOMContentLoaded', () => {
  // 1. Navigation Drawer Toggle (with scroll lock & Escape key)
  const menuToggle = document.getElementById('menu-drawer-toggle');
  const menuDrawer = document.getElementById('menu-drawer');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  const drawerBackdrop = document.getElementById('drawer-backdrop');
  const drawerLinks = document.querySelectorAll('.drawer-nav-item');

  const openDrawer = () => {
    if (menuDrawer) {
      menuDrawer.classList.add('is-open');
      menuDrawer.setAttribute('aria-hidden', 'false');
      menuToggle?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      sound.playClick(600, 0.04);
    }
  };

  const closeDrawer = () => {
    if (menuDrawer) {
      menuDrawer.classList.remove('is-open');
      menuDrawer.setAttribute('aria-hidden', 'true');
      menuToggle?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      sound.playClick(500, 0.03);
    }
  };

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && menuDrawer?.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  // 4. Initialize Hero Proximity Variable Typography
  const heroEl = document.getElementById('hero');
  if (heroEl) {
    new HeroVariableController(heroEl);
  }

  // 5. Initialize Identity Ticker
  const tickerEl = document.getElementById('ticker');
  if (tickerEl) {
    new TickerController(tickerEl);
  }

  // 6. Initialize Event Overview, Countdown & Attendee Perks
  const overviewEl = document.getElementById('overview');
  if (overviewEl) {
    new OverviewController(overviewEl);
  }

  // 7. Initialize AWS SCD Speakers & Keynotes
  const speakersEl = document.getElementById('speakers');
  if (speakersEl) {
    new SpeakersController(speakersEl);
  }

  // 8. Initialize 08:00 AM – 05:00 PM Master Schedule
  const scheduleEl = document.getElementById('schedule');
  if (scheduleEl) {
    new ScheduleController(scheduleEl);
  }

  // 9. Initialize AWS SCD Attendee Pass Generator
  const passEl = document.getElementById('pass-generator');
  if (passEl) {
    new PassGeneratorController(passEl);
  }

  // 10. Initialize KonfHub Pass & Registration Tiers
  const passesEl = document.getElementById('passes');
  if (passesEl) {
    new PassTiersController(passesEl);
  }

  // 11. Initialize Venue & Wayfinding (Seasons 24 Wagholi)
  const venueEl = document.getElementById('venue');
  if (venueEl) {
    new VenueController(venueEl);
  }

  // 12. Initialize AWS SCD Ecosystem & FAQ Terminal
  const ecoEl = document.getElementById('ecosystem');
  if (ecoEl) {
    new EcosystemController(ecoEl);
  }

  // Header & Hero Register Buttons sound/drawer feedback
  const headerTrialBtn = document.getElementById('header-trial-trigger');
  if (headerTrialBtn) {
    headerTrialBtn.addEventListener('click', () => {
      closeDrawer();
      sound.playClick(720, 0.04);
    });
  }

  const heroRegisterBtn = document.getElementById('hero-register-btn');
  if (heroRegisterBtn) {
    heroRegisterBtn.addEventListener('click', () => {
      sound.playClick(720, 0.04);
    });
  }

  // 13. Back to Top Button
  const backToTopBtn = document.getElementById('btn-back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      sound.playClick(800, 0.04);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('.footer-social-icon-btn, #btn-footer-register').forEach(el => {
    el.addEventListener('click', () => {
      sound.playClick(760, 0.03);
    });
  });

  // Smooth keyboard anchor scrolling
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          sound.playClick(700, 0.02);
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
});
