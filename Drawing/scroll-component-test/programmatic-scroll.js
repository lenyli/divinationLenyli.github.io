const template = document.createElement('template');

template.innerHTML = `
  <style>
    :host {
      --scroll-height: 260px;
      --scroll-paper-color: #ead39d;
      --scroll-ink-color: #58251f;
      --scroll-rod-color: #71301e;
      --scroll-gold-color: #d1a24e;
      --scroll-paper-image: none;
      --scroll-roll-image: none;
      --scroll-max-width: 680px;
      --scroll-closed-width: 42px;
      display: block;
      contain: layout paint;
    }
    * { box-sizing: border-box; }
    .scroll {
      --p: 0;
      --paper-progress-width: var(--scroll-closed-width);
      --paper-width: clamp(var(--scroll-closed-width), var(--paper-progress-width), min(100%, var(--scroll-max-width)));
      --roll-width: 40px;
      --left-texture-x: 50%;
      --right-texture-x: 50%;
      --left-turn-x: 0px;
      --right-turn-x: 0px;
      position: relative;
      width: 100%;
      height: calc(var(--scroll-height) + 60px);
      isolation: isolate;
    }
    .paper-mask {
      position: absolute;
      z-index: 1;
      left: 50%;
      top: 30px;
      width: var(--paper-width);
      height: var(--scroll-height);
      overflow: hidden;
      transform: translateX(-50%);
      transition: width 70ms linear;
      filter: drop-shadow(0 14px 15px rgba(0, 0, 0, .38));
    }
    .paper {
      position: absolute;
      left: 50%;
      top: 0;
      width: var(--scroll-max-width);
      height: 100%;
      transform: translateX(-50%);
      color: var(--scroll-ink-color);
      background:
        linear-gradient(rgba(235, 190, 105, .06), rgba(117, 57, 18, .09)),
        var(--scroll-paper-image) center 61% / 147% auto no-repeat,
        repeating-linear-gradient(0deg, transparent 0 17px, rgba(103, 58, 26, .045) 18px),
        radial-gradient(ellipse at 30% 20%, rgba(255, 252, 222, .72), transparent 38%),
        linear-gradient(90deg, #c9a96d, var(--scroll-paper-color) 7% 93%, #c7a468);
      border-block: 4px solid #9f6d31;
    }
    .paper::before {
      content: "";
      position: absolute;
      inset: 10px 18px;
      border: 1px solid rgba(115, 53, 31, .34);
      box-shadow: inset 0 0 0 3px rgba(248, 228, 173, .3);
    }
    .content {
      position: absolute;
      inset: 0;
      display: grid;
      place-content: center;
      gap: 16px;
      text-align: center;
      white-space: nowrap;
      opacity: var(--content-opacity, 0);
      transform: scale(var(--content-scale, .94));
    }
    .title { font-size: clamp(25px, 5vw, 48px); font-weight: 700; letter-spacing: .38em; text-indent: .38em; }
    .body { font-size: clamp(13px, 2vw, 18px); letter-spacing: .22em; text-indent: .22em; opacity: .74; }
    .roll {
      position: absolute;
      z-index: 3;
      top: 18px;
      width: var(--roll-width);
      height: calc(var(--scroll-height) + 24px);
      overflow: hidden;
      border-radius: 4px;
      background:
        linear-gradient(90deg, rgba(19, 5, 2, .3), transparent 30%, rgba(255, 220, 146, .14) 50%, transparent 72%, rgba(18, 4, 2, .36)),
        var(--scroll-roll-image) var(--texture-x) center / auto 126% no-repeat,
        linear-gradient(var(--scroll-rod-color), #a2532a 48%, #572113);
      border: 1px solid rgba(60, 18, 11, .72);
      box-shadow: 0 12px 14px rgba(0, 0, 0, .48), inset 0 0 7px rgba(0, 0, 0, .3);
      transition: width 70ms linear;
    }
    .roll::before {
      content: "";
      position: absolute;
      z-index: 1;
      inset: 0;
      background:
        repeating-linear-gradient(90deg,
          rgba(38, 10, 3, .34) 0 3px,
          transparent 4px 10px,
          rgba(255, 224, 147, .2) 11px 13px,
          transparent 14px 21px);
      background-position: var(--turn-x) 0;
      background-size: 22px 100%;
      mix-blend-mode: soft-light;
    }
    .roll::after {
      content: "";
      position: absolute;
      z-index: 2;
      inset: 0;
      background: linear-gradient(90deg, rgba(0, 0, 0, .42), transparent 25%, rgba(255, 239, 180, .34) 48%, transparent 68%, rgba(0, 0, 0, .5));
      transform: translateX(var(--sheen-x, 0%));
      opacity: .72;
    }
    .roll.left {
      --texture-x: var(--left-texture-x);
      --turn-x: var(--left-turn-x);
      right: calc(50% + var(--paper-width) / 2 - 4px);
    }
    .roll.right {
      --texture-x: var(--right-texture-x);
      --turn-x: var(--right-turn-x);
      left: calc(50% + var(--paper-width) / 2 - 4px);
    }
    .lighting {
      position: absolute;
      z-index: 2;
      left: 50%;
      top: 30px;
      width: var(--paper-width);
      height: var(--scroll-height);
      overflow: hidden;
      pointer-events: none;
      transform: translateX(-50%);
      transition: width 70ms linear;
    }
    .lighting::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        linear-gradient(90deg,
          rgba(43, 17, 5, var(--edge-shadow, .58)) 0,
          rgba(65, 27, 8, .18) 4%,
          rgba(255, 247, 198, var(--edge-highlight, .14)) 10%,
          transparent 18% 82%,
          rgba(255, 247, 198, var(--edge-highlight, .14)) 90%,
          rgba(65, 27, 8, .18) 96%,
          rgba(43, 17, 5, var(--edge-shadow, .58)) 100%);
      mix-blend-mode: multiply;
    }
    .lighting::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(100deg, transparent 20%, rgba(255, 250, 215, .24) 45%, transparent 63%);
      transform: translateX(var(--light-position, -65%));
      opacity: var(--light-opacity, .24);
      mix-blend-mode: screen;
    }
    @media (prefers-reduced-motion: reduce) {
      .paper-mask, .roll, .lighting { transition: none; }
    }
  </style>
  <div class="scroll" part="root">
    <div class="paper-mask" part="paper-mask">
      <div class="paper" part="paper">
        <div class="content" part="content">
          <div class="title"><slot name="title"></slot></div>
          <div class="body"><slot name="body"></slot></div>
        </div>
      </div>
    </div>
    <div class="lighting" part="lighting"></div>
    <div class="roll left" part="left-roll"></div>
    <div class="roll right" part="right-roll"></div>
  </div>
`;

export class ProgrammaticScroll extends HTMLElement {
  static observedAttributes = ['progress'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).append(template.content.cloneNode(true));
    this.root = this.shadowRoot.querySelector('.scroll');
  }

  connectedCallback() {
    this.#renderProgress();
  }

  attributeChangedCallback() {
    this.#renderProgress();
  }

  get progress() {
    return this.#clamp(this.getAttribute('progress'));
  }

  set progress(value) {
    this.setAttribute('progress', this.#clamp(value).toFixed(4));
  }

  #clamp(value) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(1, Math.max(0, number)) : 0;
  }

  #renderProgress() {
    if (!this.root) return;
    const progress = this.progress;
    const closedWidth = Number.parseFloat(
      getComputedStyle(this).getPropertyValue('--scroll-closed-width')
    ) || 42;
    this.root.style.setProperty('--p', progress);
    this.root.style.setProperty('--paper-progress-width', `calc(${progress * 100}% + ${(1 - progress) * closedWidth}px)`);
    this.root.style.setProperty('--roll-width', `${40 - 12 * progress}px`);
    const turn = progress * 88;
    const textureSwing = Math.sin(progress * Math.PI * 8) * 8;
    this.root.style.setProperty('--left-turn-x', `${turn}px`);
    this.root.style.setProperty('--right-turn-x', `${-turn}px`);
    this.root.style.setProperty('--left-texture-x', `${50 + textureSwing}%`);
    this.root.style.setProperty('--right-texture-x', `${50 - textureSwing}%`);
    this.root.style.setProperty('--sheen-x', `${Math.sin(progress * Math.PI * 8) * 16}%`);
    this.root.style.setProperty('--content-opacity', Math.min(1, Math.max(0, (progress - .28) * 2.4)));
    this.root.style.setProperty('--content-scale', .94 + .06 * progress);
    this.root.style.setProperty('--edge-shadow', .58 - .28 * progress);
    this.root.style.setProperty('--edge-highlight', .14 + .12 * progress);
    this.root.style.setProperty('--light-position', `${-65 + 95 * progress}%`);
    this.root.style.setProperty('--light-opacity', .24 + .5 * progress);
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '1');
    this.setAttribute('aria-valuenow', progress.toFixed(3));
  }
}

customElements.define('programmatic-scroll', ProgrammaticScroll);
