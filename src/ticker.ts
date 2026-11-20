export class TickerController {
  private tickerElement: HTMLElement;
  private track: HTMLElement | null = null;
  private isPaused: boolean = false;

  constructor(tickerElement: HTMLElement) {
    this.tickerElement = tickerElement;
    this.track = this.tickerElement.querySelector('.ticker-track');
    this.attachEvents();
  }

  private attachEvents() {
    this.tickerElement.addEventListener('mouseenter', () => {
      this.isPaused = true;
      if (this.track) this.track.style.animationPlayState = 'paused';
    });

    this.tickerElement.addEventListener('mouseleave', () => {
      this.isPaused = false;
      if (this.track) this.track.style.animationPlayState = 'running';
    });
  }
}
