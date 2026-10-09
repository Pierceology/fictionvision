/* eslint-env browser */
/** WBTH analytics (same as WBTH3/lib/wbth-analytics.js) — fires custom GA4 events; no-op if gtag missing */
(function () {
  'use strict';
  if (window.__wbthTrackInstalled) return;
  window.__wbthTrackInstalled = true;
  function trackWBTH(eventName, data) {
    try {
      var payload = data && typeof data === 'object' ? data : {};
      var name = eventName || 'wbth_event';
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, payload);
      }
      if (window.dataLayer && typeof window.dataLayer.push === 'function') {
        var row = {};
        for (var k in payload) {
          if (Object.prototype.hasOwnProperty.call(payload, k)) row[k] = payload[k];
        }
        row.event = name;
        window.dataLayer.push(row);
      }
      if (typeof console !== 'undefined' && typeof console.debug === 'function') {
        console.debug('[WBTH]', name, payload);
      }
    } catch (_) {}
  }
  if (typeof window.trackWBTH !== 'function') {
    window.trackWBTH = trackWBTH;
  }
})();

/**
 * Wishbones fullscreen document chrome — iPhone edge-to-edge, hidden scrollbars, viewport-fit=cover.
 * Bundled at the top of each Wix custom-element script so one file upload works.
 * API: window.WishbonesFullscreenChrome.attach({ documentBackground?: string }); detach();
 * Pass documentBackground for html/body (e.g. cork #9a6b3a); omit for no forced fill (host paints).
 */
(function () {
  'use strict';
  if (window.WishbonesFullscreenChrome) return;

  var STYLE_ID = 'wishbones-fullscreen-chrome';
  var LEGACY_ID = 'wishbones-doc-scrollbar-hide';
  var refCount = 0;

  function ensureViewportFitCover() {
    try {
      var m = document.querySelector('meta[name="viewport"]');
      var need = 'viewport-fit=cover';
      if (!m) {
        m = document.createElement('meta');
        m.setAttribute('name', 'viewport');
        m.setAttribute('content', 'width=device-width, initial-scale=1, ' + need);
        var head = document.head;
        if (head.firstChild) head.insertBefore(m, head.firstChild);
        else head.appendChild(m);
        return;
      }
      var c = (m.getAttribute('content') || '').trim();
      if (c.indexOf('viewport-fit') === -1) {
        m.setAttribute('content', c ? c + ', ' + need : need);
      }
    } catch (_) { /* noop */ }
  }

  function buildCss(documentBackground) {
    var bg = '';
    if (documentBackground != null && documentBackground !== '') {
      bg = '        background-color: ' + documentBackground + ' !important;\n';
    }
    return (
      '      html {\n' +
      '        margin: 0;\n' +
      '        padding: 0;\n' +
      '        height: 100%;\n' +
      '        min-height: 100%;\n' +
      '        min-height: 100dvh;\n' +
      '        min-height: 100svh;\n' +
      '        min-height: -webkit-fill-available;\n' +
      bg +
      '        -ms-overflow-style: none;\n' +
      '        scrollbar-width: none;\n' +
      '      }\n' +
      '      body {\n' +
      '        margin: 0;\n' +
      '        padding: 0;\n' +
      '        min-height: 100%;\n' +
      '        min-height: 100dvh;\n' +
      '        min-height: 100svh;\n' +
      '        min-height: -webkit-fill-available;\n' +
      bg +
      '        -ms-overflow-style: none;\n' +
      '        scrollbar-width: none;\n' +
      '      }\n' +
      '      html::-webkit-scrollbar,\n' +
      '      body::-webkit-scrollbar {\n' +
      '        display: none !important;\n' +
      '        width: 0 !important;\n' +
      '        height: 0 !important;\n' +
      '        background: transparent !important;\n' +
      '      }\n' +
      '      html {\n' +
      '        scrollbar-color: transparent transparent !important;\n' +
      '      }\n' +
      '      body {\n' +
      '        scrollbar-color: transparent transparent !important;\n' +
      '      }\n' +
      '      /* Wix shell / inner scroll — keep motion, kill visible bars (incl. Chrome desktop) */\n' +
      '      #SITE_CONTAINER,\n' +
      '      #site-root,\n' +
      '      #masterPage,\n' +
      '      main#main_MF,\n' +
      '      [data-site-scroll-container] {\n' +
      '        scrollbar-width: none !important;\n' +
      '        -ms-overflow-style: none !important;\n' +
      '        scrollbar-color: transparent transparent !important;\n' +
      '      }\n' +
      '      #SITE_CONTAINER::-webkit-scrollbar,\n' +
      '      #site-root::-webkit-scrollbar,\n' +
      '      #masterPage::-webkit-scrollbar,\n' +
      '      main#main_MF::-webkit-scrollbar,\n' +
      '      [data-site-scroll-container]::-webkit-scrollbar {\n' +
      '        display: none !important;\n' +
      '        appearance: none !important;\n' +
      '        -webkit-appearance: none !important;\n' +
      '        width: 0 !important;\n' +
      '        max-width: 0 !important;\n' +
      '        height: 0 !important;\n' +
      '        max-height: 0 !important;\n' +
      '        background: transparent !important;\n' +
      '      }\n' +
      '      #SITE_CONTAINER::-webkit-scrollbar-thumb,\n' +
      '      #site-root::-webkit-scrollbar-thumb,\n' +
      '      #masterPage::-webkit-scrollbar-thumb,\n' +
      '      main#main_MF::-webkit-scrollbar-thumb,\n' +
      '      [data-site-scroll-container]::-webkit-scrollbar-thumb {\n' +
      '        background: transparent !important;\n' +
      '      }\n' +
      '      #SITE_CONTAINER::-webkit-scrollbar-track,\n' +
      '      #site-root::-webkit-scrollbar-track,\n' +
      '      #masterPage::-webkit-scrollbar-track,\n' +
      '      main#main_MF::-webkit-scrollbar-track,\n' +
      '      [data-site-scroll-container]::-webkit-scrollbar-track {\n' +
      '        background: transparent !important;\n' +
      '      }\n' +
      '      #SITE_CONTAINER::-webkit-scrollbar-corner,\n' +
      '      #site-root::-webkit-scrollbar-corner,\n' +
      '      #masterPage::-webkit-scrollbar-corner,\n' +
      '      main#main_MF::-webkit-scrollbar-corner,\n' +
      '      [data-site-scroll-container]::-webkit-scrollbar-corner {\n' +
      '        background: transparent !important;\n' +
      '      }\n'
    );
  }

  function inject(documentBackground) {
    var legacy = document.getElementById(LEGACY_ID);
    if (legacy) legacy.remove();
    var el = document.getElementById(STYLE_ID);
    if (!el) {
      el = document.createElement('style');
      el.id = STYLE_ID;
      document.head.appendChild(el);
    }
    el.textContent = buildCss(documentBackground);
  }

  function removeStyle() {
    var s = document.getElementById(STYLE_ID);
    if (s) s.remove();
  }

  window.WishbonesFullscreenChrome = {
    attach: function (opts) {
      opts = opts || {};
      var bg = opts.documentBackground === undefined ? null : opts.documentBackground;
      if (refCount++ === 0) {
        ensureViewportFitCover();
        inject(bg);
      }
    },
    detach: function () {
      refCount = Math.max(0, refCount - 1);
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(function () {
          if (refCount === 0) removeStyle();
        });
      } else if (refCount === 0) {
        removeStyle();
      }
    },
  };
})();

/** Coin chrome — keep in sync: horsingaround, tornadomatic, galaxomatic, bogswampmarshbayouglade */
const WBT_COIN = {
  HIDE_AFTER_MS: 2500,
  HOME_URL: 'https://wishbonesandteehees.com',
  SPIN_DEG: 1080,
  SPIN_MS: 880,
};

/**
 * Planet card copy + circle-being icon — must match WBTH_BIBLE/PTU-MASTER-SOURCE.md §6 WORLD_REGISTRY and §7 circleBeingIcons.
 * (Flying asteroid PNGs in planetData stay asteroid-show-specific; this table is PTU canon only.)
 */
const ASTEROID_PLANET_CARD_BY_NAME = {
  'Planet Zee': {
    galaxy: 'Thalorian Arm',
    being: 'ZEEOMBIES',
    circleBeingIcon:
      'https://static.wixstatic.com/media/0caac7_d7f6919fb5844898933bcf6392e52192~mv2.png',
  },
  "Yaaargh's Revenge": {
    galaxy: 'Ekuiphoris',
    being: 'COPYCATS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_9ac8b2262b6d4e499504fc58632e19fa~mv2.png',
  },
  'OOGH-IV': {
    galaxy: 'Vortex-9',
    being: 'STONERS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/0caac7_84ce22d824aa42c59e74ae28531737f4~mv2.png',
  },
  Prearth: {
    galaxy: 'Salxith Expanse',
    being: 'APTORS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_dcb80a6e6a0b4f56904b154b52302ccf~mv2.png',
  },
  'That Other Planet': {
    galaxy: "Curie's Star Assembly",
    being: 'CAPITOLS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_e2cbdcbcf3bd4c12948f60a4df4cfb1c~mv2.png',
  },
  Figuria: {
    galaxy: 'The Astral Collective',
    being: 'FIGURIANS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_e7d6989b674c44c0bed90be9e5a25f6d~mv2.png',
  },
  "Den's Crevice": {
    galaxy: 'Blue Clueless Galaxy',
    being: 'DRAGOONS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_f704df33811041f19dbfc6900a852850~mv2.png',
  },
  Heliumdrum: {
    galaxy: 'NGC-3039',
    being: 'POPPIES',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_dd445f3a568d4b32b0a67a681d16ed81~mv2.png',
  },
  'Washy Washy II': {
    galaxy: 'Plynthar System',
    being: 'STRINGERS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_7bb09a142ffe4760a6236cbd376e8276~mv2.png',
  },
  Yarnia: {
    galaxy: 'Lovelace',
    being: 'YARNIANS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_cbc6a7a02f334ad7a124f2cfdbb8798a~mv2.png',
  },
  Hungary: {
    galaxy: 'Pinpoint Galaxy',
    being: 'HUNGARIANS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_e11582dcffa541eeb9c7b708e8f98d73~mv2.png',
  },
  'Guffaw-7': {
    galaxy: 'Laff Trak',
    being: 'COMEDIUMS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_3e39e7b310d643e29fa1389b917d09fe~mv2.png',
  },
  'Spee-ider Grove': {
    galaxy: "Widow's Peak",
    being: 'TIKATIKATIKAS',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_2601021603f84071b54c0cb89a3bab94~mv2.png',
  },
  /** PTU §6.2 optional locale — circle icon from §7.1 specialBeingIcons.vigilant */
  Vigilant: {
    galaxy: 'Salxith Expanse',
    being: '',
    circleBeingIcon:
      'https://static.wixstatic.com/media/6c593b_154f2cdeba9246c6ac6319254a358591~mv2.png',
  },
};

function getAsteroidPlanetCardMeta(planet) {
  const row = ASTEROID_PLANET_CARD_BY_NAME[planet.name];
  if (row) return row;
  return {
    galaxy: planet.region || '',
    being: '',
    circleBeingIcon: '',
  };
}

const AS_ATOM_SVG = `<svg class="patch-atom-svg as-atom-svg" viewBox="0 0 40 40" aria-hidden="true"><g class="as-atom-spin">
  <ellipse cx="20" cy="20" rx="14" ry="5" fill="none" stroke="currentColor" stroke-width="1.4" />
  <ellipse cx="20" cy="20" rx="14" ry="5" fill="none" stroke="currentColor" stroke-width="1.4" transform="rotate(60 20 20)" />
  <ellipse cx="20" cy="20" rx="14" ry="5" fill="none" stroke="currentColor" stroke-width="1.4" transform="rotate(120 20 20)" />
</g><circle cx="20" cy="20" r="4" fill="currentColor" /></svg>`;

const AS_SHARE_SVG = `<svg class="patch-share-dock-svg as-share-dock-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" aria-hidden="true">
  <circle cx="18" cy="5" r="2.35"/>
  <circle cx="6" cy="12" r="2.35"/>
  <circle cx="18" cy="19" r="2.35"/>
  <path d="M15.4 6.4l-6.8 3.1M8.6 14.5l6.8 3.1"/>
</svg>`;

const ASTEROID_PLANET_GLBS = {
  'Planet Zee': 'https://static.wixstatic.com/3d/f08d21_055a93fceeb74f938aaa267bd3817794.glb',
  "Yaaargh's Revenge": 'https://static.wixstatic.com/3d/f08d21_0fcfd26098094ec699a2f122853d5445.glb',
  Heliumdrum: 'https://static.wixstatic.com/3d/f08d21_c5ed79ed0b344730ad1df065134b1f5c.glb',
  'Washy Washy II': 'https://static.wixstatic.com/3d/f08d21_edecb6c106e3444bbd46c85b153bed4e.glb',
  'Spee-ider Grove': 'https://static.wixstatic.com/3d/f08d21_c753e53c84594c24bbff49124f522dec.glb',
  "Den's Crevice": 'https://static.wixstatic.com/3d/f08d21_9ce2a63ed41941aaac05f87bfef83322.glb',
  Figuria: 'https://static.wixstatic.com/3d/f08d21_e7cc04efc3d94efcb45e91edfc6ce1ba.glb',
  'OOGH-IV': 'https://static.wixstatic.com/3d/f08d21_a896933fe41f4ff4a83c5db3e8e78e00.glb',
  Prearth: 'https://static.wixstatic.com/3d/f08d21_a8ad456845154ac7886548a02948bae3.glb',
  'Guffaw-7': 'https://static.wixstatic.com/3d/f08d21_16b4b8cd124449f9ba98e9067e3862cd.glb',
  Hungary: 'https://static.wixstatic.com/3d/f08d21_3b022aa7afee4e53996744112d8c0159.glb',
  Yarnia: 'https://static.wixstatic.com/3d/f08d21_751cb89338b443369d8bbcb1c0adc044.glb',
  'That Other Planet': 'https://static.wixstatic.com/3d/f08d21_869c66cf8c984f0f96ad66ba65e68973.glb',
};

let asteroidModelViewerPromise = null;
function ensureAsteroidModelViewer() {
  if (typeof customElements !== 'undefined' && customElements.get('model-viewer')) {
    return Promise.resolve();
  }
  if (asteroidModelViewerPromise) return asteroidModelViewerPromise;
  asteroidModelViewerPromise = new Promise((resolve) => {
    const existing = document.querySelector('script[data-asteroid-model-viewer]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => resolve(), { once: true });
      return;
    }
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
    s.setAttribute('data-asteroid-model-viewer', '1');
    s.onload = () => resolve();
    s.onerror = () => resolve();
    document.head.appendChild(s);
  });
  return asteroidModelViewerPromise;
}

class AsteroidShow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const board = document.querySelector('custom-wishbonesandteehees');
    if (board && !board.contains(this)) {
      try {
        if (typeof window.trackWBTH === 'function') {
          window.trackWBTH('wbth_patch_suppressed', {
            patch_id: 'asteroidshow',
            custom_element: 'custom-asteroidshow',
          });
        }
      } catch (_) {}
      this.setAttribute('data-wbt-patch-suppressed', '1');
      this.style.setProperty('display', 'none', 'important');
      this.style.setProperty('visibility', 'hidden', 'important');
      this.style.setProperty('pointer-events', 'none', 'important');
      this.style.setProperty('height', '0', 'important');
      this.style.setProperty('min-height', '0', 'important');
      this.style.setProperty('overflow', 'hidden', 'important');
      return;
    }
    if (this._initialized) return;
    this._initialized = true;
    try {
      if (typeof window.trackWBTH === 'function') {
        window.trackWBTH('wbth_patch_loaded', {
          patch_id: 'asteroidshow',
          custom_element: 'custom-asteroidshow',
        });
      }
    } catch (_) {}
    ensureAsteroidModelViewer();
    window.WishbonesFullscreenChrome.attach({ documentBackground: '#030610' });
    this.injectStyles();
    this.injectHTML();
    this.initAsteroidShow();
  }

  disconnectedCallback() {
    if (this._syncAsViewport) {
      window.removeEventListener('resize', this._syncAsViewport);
      if (this._asOnOrientation) {
        window.removeEventListener('orientationchange', this._asOnOrientation);
        this._asOnOrientation = null;
      }
      if (window.visualViewport) {
        try {
          window.visualViewport.removeEventListener('resize', this._syncAsViewport);
        } catch (_) { /* noop */ }
      }
      this._syncAsViewport = null;
    }
    this.style.removeProperty('height');
    this.style.removeProperty('min-height');
    window.WishbonesFullscreenChrome.detach();
  }

  injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@700&family=Outfit:wght@400;600;700;800&display=swap');
      :host {
        display: block;
        width: 100%;
        max-width: 100%;
        min-height: 100vh;
        min-height: 100dvh;
        min-height: 100svh;
        min-height: -webkit-fill-available;
        margin: 0;
        overflow: hidden;
        background: #030610;
        position: relative;
        box-sizing: border-box;
        --gold: #d7b46a;
        --aqua: #00fff7;
        --panel: rgba(6, 10, 22, 0.78);
        --soft: #e2e9f5;
        --wbt-font-ui: 'Outfit', system-ui, -apple-system, sans-serif;
        --wbt-font-btn: 'Oswald', 'Bebas Neue', Impact, sans-serif;
        --wbt-ui-font: var(--wbt-font-ui);
        /* Share + ctl — top-right cluster (same treatment as other WBTH3 patches) */
        --wbt-accent-rgb: 45, 212, 191;
        --wbt-cyan: #99f6e4;
        --wbt-cyan-mid: #2dd4bf;
        --wbt-cyan-deep: #0f766e;
        font-family: var(--wbt-font-ui);
        color: var(--soft);
      }
      button, .asteroid-home-coin {
        font-family: var(--wbt-font-btn);
        font-weight: 700;
      }
      :host.asteroidshow--chrome-hidden {
        cursor: none !important;
      }
      :host.asteroidshow--chrome-hidden,
      :host.asteroidshow--chrome-hidden * {
        cursor: none !important;
        }
        #container {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            perspective: 1000px;
            perspective-origin: top right;
            transform-style: preserve-3d;
        }
        #scene {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            z-index: 0;
            transform-style: preserve-3d;
        }
        .bottom-image {
            position: fixed;
        bottom: 0; left: 50%;
            transform: translateX(-50%);
        width: 100%;
        max-width: 100%;
        height: auto;
            z-index: 100;
            pointer-events: none;
            object-fit: cover;
            object-position: bottom center;
            max-width: 100%;
        }
        @media (max-width: 768px) {
        .bottom-image { max-height: 40vh; object-fit: contain; }
        }
        .nebula {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            opacity: 0.8;
            z-index: 0;
            object-fit: cover;
        }
      .nebula::-webkit-media-controls,
      .nebula::-webkit-media-controls-enclosure { display: none !important; }
        .asteroid {
            position: absolute;
            background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
            z-index: 3;
        animation: moveAsteroid linear forwards;
            transform-origin: center;
            will-change: transform;
        }
        @keyframes moveAsteroid {
        0%   { transform: translateX(-100vw) translateY(50vh)  translateZ(500px)    scale(15)   rotate(0deg);   opacity: 1; }
        90%  { opacity: 1; }
        100% { transform: translateX(100vw)  translateY(-70vh) translateZ(-20000px) scale(10.5) rotate(360deg); opacity: 0; }
      }
        @keyframes moveAsteroidMobile {
        0%   { transform: translateX(-80vw)  translateY(65vh)  translateZ(500px)    scale(15)   rotate(0deg);   opacity: 1; }
        90%  { opacity: 1; }
        100% { transform: translateX(120vw)  translateY(-65vh) translateZ(-20000px) scale(10.5) rotate(360deg); opacity: 0; }
      }
        @media (max-width: 768px) {
        .asteroid { animation-name: moveAsteroidMobile; }
        }
        /* the sky breathes with the hit */
        .nebula { transition: filter .09s ease-out; }
        #container.beat .nebula { filter: brightness(1.14) saturate(1.08); }
      /* Share + ctl — top-right cluster (ctl flush right, share to its left) */
      .as-share-dock-svg { width: 22px; height: 22px; }
      @keyframes patchSharePulse {
        0%, 100% { transform: scale(1); filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.4)); }
        50% { transform: scale(1.1); filter: drop-shadow(0 0 9px rgba(125, 211, 252, 0.9)); }
      }
      .as-share-dock .as-share-dock-svg {
        animation: patchSharePulse 2.5s ease-in-out infinite;
      }
      .as-share-dock:hover .as-share-dock-svg {
        animation-play-state: paused;
      }
      @media (prefers-reduced-motion: reduce) {
        .as-share-dock .as-share-dock-svg { animation: none; }
      }
      .as-share-dock, .as-ctl-dock {
        position: fixed;
        z-index: 35;
        top: max(12px, env(safe-area-inset-top, 0px));
        transform: none;
        width: 46px;
        min-width: 46px;
        max-width: 46px;
        min-height: 46px;
        height: 46px;
        max-height: 46px;
        box-sizing: border-box;
        padding: 0;
        margin: 0;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0;
        font-family: var(--wbt-ui-font);
        color: #e8ffff;
        transition: opacity 0.3s ease, visibility 0.3s ease, filter 0.2s ease;
      }
      .as-ctl-dock {
        right: max(12px, env(safe-area-inset-right, 0px));
        background: linear-gradient(180deg, var(--wbt-cyan-mid) 0%, var(--wbt-cyan-deep) 100%);
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35), 0 0 22px rgba(var(--wbt-accent-rgb), 0.35);
      }
      .as-share-dock {
        right: calc(max(12px, env(safe-area-inset-right, 0px)) + 46px + 8px);
        background: linear-gradient(180deg, var(--wbt-cyan-deep) 0%, var(--wbt-cyan-mid) 100%);
        box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35), 0 0 22px rgba(var(--wbt-accent-rgb), 0.35);
      }
      .as-share-dock:hover, .as-ctl-dock:hover { filter: brightness(1.08); }
      .as-share-dock.hidden, .as-ctl-dock.hidden {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      @media (max-width: 1024px) {
        .as-share-dock {
          right: calc(max(12px, env(safe-area-inset-right, 0px)) + 44px + 8px);
        }
        .as-share-dock,
        .as-ctl-dock {
          width: 44px;
          min-width: 44px;
          max-width: 44px;
          min-height: 44px;
          height: 44px;
          max-height: 44px;
          padding: 0;
        }
      }
      /* Planet card + right-edge tab (peek when collapsed — tab-only strip pinned left). */
      #planet-info {
        position: fixed;
        left: max(14px, env(safe-area-inset-left, 0px));
        bottom: max(14px, env(safe-area-inset-bottom, 0px));
        /* Card (~312) + tab (~34); single footprint */
        width: min(346px, calc(100vw - 28px));
        z-index: 14;
        pointer-events: none;
        opacity: 1;
        visibility: visible;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        transition:
          opacity 0.3s,
          visibility 0.3s,
          transform 0.38s cubic-bezier(0.22, 1, 0.36, 1);
        font-family: var(--wbt-ui-font);
      }
      #planet-info * {
        pointer-events: auto;
      }
      @media (max-width: 768px) {
        #planet-info:not(.planet-info--collapsed) {
          left: 50%;
          right: auto;
          transform: translateX(-50%);
          width: min(346px, calc(100vw - 24px));
        }
      }
      .as-planet-card-with-tab {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        width: 100%;
        gap: 0;
        margin-bottom: 8px;
      }
      .as-planet-card-tab {
        appearance: none;
        cursor: pointer;
        flex: 0 0 34px;
        width: 34px;
        min-width: 34px;
        margin: 0;
        padding: 10px 5px;
        box-sizing: border-box;
        border: 1px solid rgba(215, 180, 106, 0.46);
        border-left: none;
        border-radius: 0 10px 10px 0;
        background: rgba(0, 0, 0, 0.82);
        color: rgba(0, 255, 247, 0.92);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease, border-color 0.2s ease;
        -webkit-tap-highlight-color: transparent;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.35);
        z-index: 5;
      }
      .as-planet-card-tab:hover {
        background: rgba(0, 255, 247, 0.08);
      }
      .as-planet-card-tab-lbl {
        display: block;
        font-family: 'Oswald', sans-serif;
        font-size: 9px;
        font-weight: 600;
        line-height: 1.05;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        white-space: nowrap;
        writing-mode: vertical-rl;
        text-orientation: mixed;
        transform: rotate(180deg);
        max-height: min(220px, 42vh);
        overflow: hidden;
      }
      /* Collapsed: only the tab — narrow strip, flush left, full tab border */
      #planet-info.planet-info--collapsed {
        width: 42px;
        max-width: 42px;
        min-width: 42px;
        left: max(8px, env(safe-area-inset-left, 0px));
        transform: none;
        z-index: 22;
        overflow: visible;
      }
      #planet-info.planet-info--collapsed .solace-shared-planet-card,
      #planet-info.planet-info--collapsed .as-planet-hint {
        display: none !important;
      }
      #planet-info.planet-info--collapsed .as-planet-card-with-tab {
        width: 100%;
      }
      #planet-info.planet-info--collapsed .as-planet-card-tab {
        flex: 1 1 auto;
        width: 100%;
        min-width: 0;
        border-left: 1px solid rgba(215, 180, 106, 0.46);
        border-radius: 10px;
        min-height: 120px;
      }
      #planet-info.planet-info--collapsed .as-planet-card-tab-lbl {
        max-height: min(280px, 50vh);
      }
      .solace-shared-planet-card {
        position: relative;
        flex: 1 1 auto;
        width: 1%;
        min-width: 0;
        margin: 0;
        border-radius: 10px 0 0 10px;
        overflow: hidden;
        border: 1px solid rgba(215, 180, 106, 0.46);
        background: rgba(0, 0, 0, 0.78);
        aspect-ratio: 1.22 / 1;
        box-shadow:
          0 2px 12px rgba(0, 0, 0, 0.35),
          0 0 28px rgba(215, 180, 106, 0.12),
          0 0 18px rgba(0, 255, 255, 0.08);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-sizing: border-box;
      }
      /* Same layers as findingSolaceGameSrcdoc (card build: bg video → shade → inner → model) */
      .solace-shared-planet-bg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover !important;
        opacity: 0.42;
        filter: saturate(1.2) contrast(1.05);
        pointer-events: none;
        background: #000;
      }
      .solace-shared-planet-shade {
        position: absolute;
        inset: 0;
        z-index: 1;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.86));
        pointer-events: none;
      }
      .solace-shared-planet-inner {
        position: relative;
        z-index: 2;
        display: flex;
        align-items: flex-start;
        gap: 9px;
        min-height: auto;
        padding: 10px;
        padding-bottom: 4px;
        color: #fff;
        pointer-events: none;
      }
      .solace-shared-planet-icon {
        flex: 0 0 auto;
        width: 52px;
        height: 52px;
        border-radius: 50%;
        object-fit: contain;
        filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.32));
      }
      .solace-shared-planet-meta {
        min-width: 0;
        padding-top: 2px;
      }
      .solace-shared-planet-being {
        margin: 0 0 3px;
        color: #fff;
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: clamp(10px, 2.4vw, 12px);
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      #planet-name.solace-shared-planet-name {
        margin: 0 0 4px;
        color: var(--aqua);
        font-family: 'Helvetica Neue', Arial, sans-serif;
        font-size: clamp(13px, 3vw, 16px);
        font-weight: 800;
        line-height: 1.08;
      }
      #planet-region.solace-shared-planet-galaxy {
        margin: 3px 0 0;
        color: var(--gold);
        font-size: clamp(10px, 2.2vw, 12px);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        line-height: 1.25;
      }
      model-viewer.solace-shared-planet-model,
      #planet-model.solace-shared-planet-model {
        position: absolute;
        z-index: 3;
        left: 3%;
        right: 3%;
        bottom: 4px;
        width: auto;
        height: 72%;
        margin: 0 auto;
        max-width: 96%;
        --poster-color: transparent;
        background: transparent;
        pointer-events: auto;
        filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.55));
      }
      model-viewer.solace-shared-planet-model::part(default-progress-bar),
      #planet-model.solace-shared-planet-model::part(default-progress-bar) {
        display: none;
      }
      .as-planet-hint {
        margin-top: 10px;
        font-size: clamp(9px, 2vw, 11px);
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(0, 255, 247, 0.55);
        font-family: 'Oswald', sans-serif;
      }
        .fade-overlay {
            position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
            background: black;
            opacity: 0;
            z-index: 9999;
            pointer-events: none;
            transition: opacity 2s ease-in-out;
        }
      .fade-overlay.active { opacity: 1; }
      .asteroid-fade-out { opacity: 0 !important; transition: opacity 1s; }
      /* ── Coin — pointerdown = three full rotations only ── */
      .asteroid-home-coin {
            position: fixed;
        top: max(14px, env(safe-area-inset-top, 0px));
        left: max(14px, env(safe-area-inset-left, 0px));
        right: auto;
        width: fit-content;
        height: fit-content;
        z-index: 30;
        cursor: pointer;
        background: none;
        border: none;
        padding: 0;
            opacity: 1;
        transition: opacity 0.5s ease-in-out, transform 0.4s ease;
        pointer-events: auto;
        display: block;
        text-decoration: none;
      }
      .asteroid-home-coin.hidden { opacity: 0; pointer-events: none; }
      .asteroid-home-coin img {
        width: 64px;
        height: auto;
        max-height: 64px;
        object-fit: contain;
            pointer-events: none;
        transform-origin: center center;
        transition: opacity 0.4s ease-in-out;
        display: block;
      }
      .asteroid-home-coin:hover { transform: scale(1.05); }
      @media (max-width: 450px) { .asteroid-home-coin img { width: 48px; max-height: 48px; } }
      @media (min-width: 451px) and (max-width: 768px) { .asteroid-home-coin img { width: 56px; max-height: 56px; } }
      @media (min-width: 1281px) { .asteroid-home-coin img { width: 72px; max-height: 72px; } }
      @media (min-width: 1921px) { .asteroid-home-coin img { width: 84px; max-height: 84px; } }

      @keyframes asAtomSpin { to { transform: rotate(360deg); } }
      .as-atom-spin { transform-origin: 20px 20px; animation: asAtomSpin 2.8s linear infinite; }
      .as-atom-svg { width: 26px; height: 26px; color: #fff; filter: drop-shadow(0 0 6px rgba(255,255,255,0.65)); display: block; }
      .as-ctl-backdrop {
        position: fixed;
        inset: 0;
        z-index: 34;
        background: rgba(0,0,0,0.35);
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      .as-ctl-backdrop.open { opacity: 1; visibility: visible; pointer-events: auto; }
      .as-ctl-flyout {
        position: fixed;
        top: calc(max(12px, env(safe-area-inset-top, 0px)) + 46px + 10px);
        right: max(12px, env(safe-area-inset-right, 0px));
        transform: scale(0.96);
        transform-origin: top right;
        z-index: 36;
        width: min(260px, calc(100vw - 100px));
        opacity: 0;
        visibility: hidden;
        pointer-events: none;
        transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
      }
      .as-ctl-flyout.open {
        opacity: 1;
        visibility: visible;
        pointer-events: auto;
        transform: scale(1);
      }
      .as-ctl-inner {
        background: rgba(0, 0, 0, 0.72);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-radius: 16px;
        border: 1px solid rgba(var(--wbt-accent-rgb), 0.28);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 32px rgba(0, 0, 0, 0.55);
        overflow: hidden;
        color: #fff;
        font-family: var(--wbt-ui-font);
      }
      @media (max-width: 900px) {
        .as-ctl-inner {
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          background: rgba(0, 0, 0, 0.94);
        }
      }
      .as-ctl-inner-hd {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .as-ctl-inner-title {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--wbt-cyan);
      }
      .as-ctl-hide-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: #e8ffff;
        line-height: 0;
        border-radius: 8px;
      }
      .as-ctl-hide-btn:hover { background: rgba(255,255,255,0.08); }
      .as-ctl-actions { display: flex; flex-direction: column; gap: 10px; padding: 12px; }
      .as-ctl-section--playlist { margin-bottom: 4px; }
      .as-ctl-section-label {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: rgba(0, 255, 247, 0.55);
        margin: 0 0 8px 2px;
      }
      .as-planet-pick-scroll {
        max-height: min(240px, 42vh);
        overflow-x: hidden;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 2px 6px 4px 2px;
        margin: 0 -4px 0 0;
        -webkit-overflow-scrolling: touch;
      }
      .as-planet-pick-scroll::-webkit-scrollbar { width: 5px; }
      .as-planet-pick-scroll::-webkit-scrollbar-thumb {
        background: rgba(0, 255, 247, 0.22);
        border-radius: 99px;
      }
      .as-planet-pick-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        text-align: left;
        padding: 9px 11px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(0, 0, 0, 0.4);
        color: #f1f5f9;
        cursor: pointer;
        font-family: var(--wbt-font-ui);
        transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .as-planet-pick-btn:hover {
        border-color: rgba(0, 255, 247, 0.35);
        background: rgba(0, 255, 247, 0.06);
      }
      .as-planet-pick-btn.is-current {
        border-color: rgba(0, 255, 247, 0.55);
        background: rgba(0, 255, 247, 0.09);
        box-shadow: 0 0 14px rgba(0, 255, 247, 0.12);
      }
      .as-planet-pick-idx {
        flex: 0 0 24px;
        font-family: var(--wbt-font-btn);
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.04em;
        color: var(--gold);
        opacity: 0.92;
      }
      .as-planet-pick-name {
        flex: 1 1 auto;
        font-size: 13px;
        font-weight: 600;
        line-height: 1.2;
        min-width: 0;
      }
      .as-ctl-divider {
        border: none;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin: 4px 0 2px;
      }
      .as-ctl-actions button {
        width: 100%;
        padding: 10px 14px;
        border-radius: 24px;
        border: 2px solid #fff;
        background: rgba(0, 0, 0, 0.45);
        color: #fff;
        font-size: 14px;
        font-weight: 700;
        font-family: var(--wbt-font-btn);
        cursor: pointer;
        transition: transform 0.2s ease, filter 0.2s ease, background 0.2s ease;
      }
      .as-ctl-actions button:hover {
        transform: scale(1.02);
        filter: brightness(1.06);
        background: rgba(0, 0, 0, 0.62);
      }
      .as-ctl-actions button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
        filter: none;
      }
      /* Center stack — Begin + Previous + Next; same pill spec as patch ctl flyout */
      .as-center-stack {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 110;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        pointer-events: none;
        transition: opacity 0.35s ease, visibility 0.35s ease;
      }
      .as-center-stack.hidden {
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      .as-center-stack button {
        pointer-events: auto;
        width: auto;
        min-width: min(168px, calc(100vw - 160px));
        max-width: min(220px, calc(100vw - 160px));
        padding: 8px 12px;
        border-radius: 24px;
        border: 2px solid #fff;
        background: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        color: #fff;
        font-family: var(--wbt-font-btn);
        font-size: 14px;
        font-weight: 700;
        line-height: 1.15;
        letter-spacing: 0.04em;
        cursor: pointer;
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 8px 32px rgba(0, 0, 0, 0.55);
        transition: transform 0.2s ease, filter 0.2s ease, background 0.2s ease, opacity 0.2s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .as-center-stack button:hover:not(:disabled) {
        transform: scale(1.02);
        filter: brightness(1.06);
        background: rgba(0, 0, 0, 0.62);
      }
      .as-center-stack button:disabled {
        opacity: 0.8;
        cursor: wait;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  injectHTML() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div id="container">
        <div id="scene">
            <video class="nebula" autoplay loop muted playsinline webkit-playsinline preload="metadata" id="nebula-video">
                <source src="https://video.wixstatic.com/video/0caac7_1ad5486d6a4e468085a5f03c1679f4dd/1080p/mp4/file.mp4" type="video/mp4" id="nebula-source">
            </video>
          <img src="https://static.wixstatic.com/media/0caac7_6d19c92636f0420aa9eb5cfc9122fb0e~mv2.png" class="bottom-image" id="bottom-image">
        </div>
    </div>
      <button type="button" class="as-share-dock" id="asteroidShareBtn" aria-label="Share this page" title="Share · copy link">${AS_SHARE_SVG}</button>
      <button type="button" class="as-ctl-dock" id="asteroidCtlDockBtn" aria-label="Open sound and fullscreen controls" title="Sound &amp; fullscreen">${AS_ATOM_SVG}</button>
      <div id="planet-info">
        <div class="as-planet-card-with-tab">
        <div class="solace-shared-planet-card has-live-glb is-current-glb" id="as-planet-card">
          <video
            class="solace-shared-planet-bg"
            id="card-nebula-video"
            autoplay
            loop
            muted
            playsinline
            webkit-playsinline
            preload="metadata"
          >
            <source
              id="card-nebula-source"
              src="https://video.wixstatic.com/video/0caac7_1ad5486d6a4e468085a5f03c1679f4dd/1080p/mp4/file.mp4"
              type="video/mp4"
            >
          </video>
          <div class="solace-shared-planet-shade" aria-hidden="true"></div>
          <div class="solace-shared-planet-inner">
            <img
              class="solace-shared-planet-icon"
              id="planet-avatar"
              src="${ASTEROID_PLANET_CARD_BY_NAME['Planet Zee'].circleBeingIcon}"
              alt=""
              decoding="async"
            >
            <div class="solace-shared-planet-meta">
              <div class="solace-shared-planet-being" id="planet-being">ZEEOMBIES</div>
              <div id="planet-name" class="solace-shared-planet-name">Planet Zee</div>
              <div id="planet-region" class="solace-shared-planet-galaxy">Thalorian Arm</div>
            </div>
          </div>
          <model-viewer
            id="planet-model"
            class="solace-shared-planet-model"
            src="${ASTEROID_PLANET_GLBS['Planet Zee']}"
            camera-controls
            touch-action="pan-y"
            interaction-prompt="none"
            shadow-intensity="1"
            exposure="0.9"
            disable-pan
            auto-rotate
            auto-rotate-delay="0"
            rotation-per-second="22deg"
          ></model-viewer>
        </div>
        <button type="button" class="as-planet-card-tab" id="asPlanetCardToggle" aria-pressed="true" aria-label="Hide planet card" title="Hide planet card">
          <span class="as-planet-card-tab-lbl" id="asPlanetCardToggleLbl">Hide planet card</span>
        </button>
        </div>
        <div id="planet-drag-hint" class="as-planet-hint">CLICK + DRAG PLANET</div>
      </div>
      <div class="fade-overlay" id="fade-overlay"></div>
      <div class="as-center-stack hidden" id="asteroidCenterStack" role="group" aria-label="Show controls">
        <button type="button" id="asteroidCenterPlayBtn" aria-label="Begin asteroid show">Begin show</button>
        <button type="button" id="asteroidCenterPrevBtn" aria-label="Previous planet">Previous</button>
        <button type="button" id="asteroidCenterNextBtn" aria-label="Next planet">Next</button>
      </div>
      <div class="as-ctl-backdrop" id="asteroidCtlBackdrop" aria-hidden="true"></div>
      <div class="as-ctl-flyout" id="asteroidCtlFlyout" role="dialog" aria-label="Sound &amp; fullscreen">
        <div class="as-ctl-inner">
          <div class="as-ctl-inner-hd">
            <h2 class="as-ctl-inner-title">Sound &amp; fullscreen</h2>
            <button type="button" class="as-ctl-hide-btn" id="asteroidCtlHideBtn" aria-label="Close controls panel">${AS_ATOM_SVG}</button>
          </div>
          <div class="as-ctl-actions">
            <div class="as-ctl-section as-ctl-section--playlist">
              <div class="as-ctl-section-label">Orbit playlist</div>
              <div class="as-planet-pick-scroll" id="asPlanetPickList" role="listbox" aria-label="Jump to a planet show"></div>
            </div>
            <hr class="as-ctl-divider" aria-hidden="true" />
            <button type="button" id="asteroidFlyoutSound" aria-label="Mute show audio">Mute</button>
            <button type="button" id="asteroidFlyoutFs">Fullscreen</button>
          </div>
        </div>
      </div>
      <a href="${WBT_COIN.HOME_URL}" class="asteroid-home-coin" id="asteroidHomeCoin" target="_top">
        <img id="asteroidCoinImg" src="https://static.wixstatic.com/media/c626e3_3084fcb3b7f64b0e80dd13df86fa5438~mv2.png" alt="Wishbones & TEE-HEES">
      </a>
    `;
    this.shadowRoot.appendChild(wrap);
  }

  initAsteroidShow() {
    const root = this.shadowRoot;
    const $ = (id) => root.getElementById(id);
    const $all = (sel) => Array.from(root.querySelectorAll(sel));
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        
    // ── Performance / connection detection ──────────────────────────────────
    let performanceLevel = 'high';
    let connectionSpeed = 'fast';
    try {
      const gl = document.createElement('canvas').getContext('webgl');
            const cores = navigator.hardwareConcurrency || 4;
      const mem = navigator.deviceMemory || 4;
      let s = (gl ? 2 : 0) + (cores >= 4 ? 2 : 0) + (cores >= 8 ? 1 : 0) + (mem >= 4 ? 2 : 0) + (mem >= 8 ? 1 : 0);
      performanceLevel = s >= 6 ? 'high' : s >= 3 ? 'medium' : 'low';
    } catch(e) {}
    try {
                const conn = navigator.connection;
      if (conn && conn.downlink) connectionSpeed = conn.downlink >= 10 ? 'fast' : conn.downlink >= 1.5 ? 'medium' : 'slow';
    } catch(e) {}

        function getVideoQuality(planet) {
      if (connectionSpeed === 'slow' || performanceLevel === 'low') return planet.nebulaUrl480p || planet.nebulaUrl;
      if (connectionSpeed === 'medium' || performanceLevel === 'medium') return planet.nebulaUrl720p || planet.nebulaUrl;
      return planet.nebulaUrl;
    }

    // ── Planet data ─────────────────────────────────────────────────────────
    /** 14 worlds × 3 song rounds each = 42 unique MP3s in rotation (Asteroid Show “jukebox” — not corkboard patch count). */
        const planetData = [
      { name: "Planet Zee", region: "Thalorian Arm",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_1ad5486d6a4e468085a5f03c1679f4dd/1080p/mp4/file.mp4",
                nebulaUrl720p: "https://video.wixstatic.com/video/0caac7_1ad5486d6a4e468085a5f03c1679f4dd/720p/mp4/file.mp4",
                nebulaUrl480p: "https://video.wixstatic.com/video/0caac7_1ad5486d6a4e468085a5f03c1679f4dd/480p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_6d19c92636f0420aa9eb5cfc9122fb0e~mv2.png","https://static.wixstatic.com/media/0caac7_7d4abf109ae84e8ab6f7d4f4ed32a994~mv2.png","https://static.wixstatic.com/media/0caac7_6d92962569374d3fb4131a945801718c~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_17751047b07d43a8b659666e6972ff88.mp3","https://static.wixstatic.com/mp3/f08d21_c324c5edd2b84e20b2a926ccceb3ff13.mp3","https://static.wixstatic.com/mp3/f08d21_b7fc3bb1162846828c7480ce627afa2b.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_7e6793a4b6604777a18ec01bf64da789~mv2.png','https://static.wixstatic.com/media/0caac7_83d6ecf42f6f4a719afd7b2f8326b757~mv2.png','https://static.wixstatic.com/media/0caac7_5d1e7ad6b4cc4562887836b7e90c656c~mv2.png','https://static.wixstatic.com/media/0caac7_010c7f03ad3b4056a3d4bf96a1a128d2~mv2.png','https://static.wixstatic.com/media/0caac7_e6b80874900442d5a797a51f512af6ca~mv2.png','https://static.wixstatic.com/media/0caac7_0c85ba8f954144a783bceda639f46132~mv2.png','https://static.wixstatic.com/media/0caac7_52bce97962e3499a9e25871f3a6952b5~mv2.png','https://static.wixstatic.com/media/0caac7_4f8e3ea6f58d41d5bd9729d8d7d5b40c~mv2.png','https://static.wixstatic.com/media/0caac7_69c6786e5da94a49aef266ff0df83cb5~mv2.png','https://static.wixstatic.com/media/0caac7_13e85aef490f44c0b12267fb37d8825b~mv2.png','https://static.wixstatic.com/media/0caac7_6531bd7f100047f4b9608e534a1fffb6~mv2.png','https://static.wixstatic.com/media/0caac7_e6dd38b4795d42b18cd05a49f5361706~mv2.png','https://static.wixstatic.com/media/0caac7_95179d8d22dc4e7b90cc1a220fd39b82~mv2.png','https://static.wixstatic.com/media/0caac7_0b3a5bd797ae4667b01a3ceebedaf811~mv2.png','https://static.wixstatic.com/media/0caac7_7baf305f3b754197908c7cd19be95412~mv2.png','https://static.wixstatic.com/media/0caac7_5eb09e3fa03b4fa9b5fc3742061b9b7a~mv2.png','https://static.wixstatic.com/media/0caac7_7956096ec7c047c28fec21968c857df4~mv2.png','https://static.wixstatic.com/media/0caac7_6f2d18f541e2408ba45c8e35bfbc0bed~mv2.png','https://static.wixstatic.com/media/0caac7_ae76753dbf5a4e359e3698122f98b114~mv2.png','https://static.wixstatic.com/media/0caac7_7f58f23bd69e480b84b2e9e1ac8aaa3c~mv2.png'] },
      { name: "Yaaargh's Revenge", region: "Ekuiphoris",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_c5660e50c7554142876e739c94d5d3f2/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_eef0e6073b204612a2aa3236479faba8~mv2.png","https://static.wixstatic.com/media/0caac7_ce680e4bf06a449fb21b89f8b4e71b57~mv2.png","https://static.wixstatic.com/media/0caac7_7a6d62a3603f44c1be2ad5cca1221eaf~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_589c4d28c0a943bcbff580b1e8da1ac2.mp3","https://static.wixstatic.com/mp3/f08d21_40377246f5d54b9294a485197828782c.mp3","https://static.wixstatic.com/mp3/f08d21_c677c13674b44d6aa90c2be1d798d968.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_212e0ef2331c4a309ff2db0c73433769~mv2.png','https://static.wixstatic.com/media/0caac7_38a794af0adc49d89be3cbeb18008d9d~mv2.png','https://static.wixstatic.com/media/0caac7_72a06d1eb9044a2f979e2d6819f971ec~mv2.png','https://static.wixstatic.com/media/0caac7_c47284677be7427ca713840aa36e66ad~mv2.png','https://static.wixstatic.com/media/0caac7_2478b1ea03854b13a4dda3dff2f04b07~mv2.png','https://static.wixstatic.com/media/0caac7_0a4938f221a44e98bb645364e9d57cdf~mv2.png','https://static.wixstatic.com/media/0caac7_e570e47329ba471f8edfdafe6355a7cc~mv2.png','https://static.wixstatic.com/media/0caac7_99a4acd71c8844acafdf181d2757f4e1~mv2.png','https://static.wixstatic.com/media/0caac7_4c4d47e6c6e44a3fbe7495b574e929b8~mv2.png','https://static.wixstatic.com/media/0caac7_3285483f8f914eb58386725dfa3803e6~mv2.png','https://static.wixstatic.com/media/0caac7_d279537ce5b14dfd9242e45b3fe95df7~mv2.png','https://static.wixstatic.com/media/0caac7_1ba89e7dc9994dde98f75c2b7a81a762~mv2.png','https://static.wixstatic.com/media/0caac7_56a5b1da72c04060b6e9ef31e002debe~mv2.png','https://static.wixstatic.com/media/0caac7_97e06eee65e14ca5aa35dc754279b87f~mv2.png','https://static.wixstatic.com/media/0caac7_ab4a3720bc424304a0497494945dd150~mv2.png','https://static.wixstatic.com/media/0caac7_5afe7d64a61142279590af3a9a8774c7~mv2.png','https://static.wixstatic.com/media/0caac7_13ecb25ed72c4d9ea59dc8586de82fbc~mv2.png','https://static.wixstatic.com/media/0caac7_47e5a2c077fd48a295f9284717ff8c24~mv2.png','https://static.wixstatic.com/media/0caac7_8174242245ae4726bf62dee09ef1fbd8~mv2.png','https://static.wixstatic.com/media/0caac7_461b8df179734681a7355304b5987436~mv2.png'] },
      { name: "OOGH-IV", region: "Vortex-9",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_7d77935a01554f969893c190c60c756b/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_a46d6e273f4642a8838049132725bf93~mv2.png","https://static.wixstatic.com/media/0caac7_374d0f18733442f984dc9cab90e2ef66~mv2.png","https://static.wixstatic.com/media/0caac7_a2c25e5f676144579aebb05e1e9ea2ef~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/6c593b_532ce0fa71194abba19f40d1837d0488.mp3","https://static.wixstatic.com/mp3/f08d21_5a56382595a24171812fd5fc7f74d078.mp3","https://static.wixstatic.com/mp3/f08d21_673ac841761f4124918c5566b770d53e.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_6ff3ad472cd841bfb2651b9bbc945169~mv2.png','https://static.wixstatic.com/media/0caac7_529dd41189c94b1c92ac3eaae01e6ce2~mv2.png','https://static.wixstatic.com/media/0caac7_d10752308fb747349bef31cebc75eef4~mv2.png','https://static.wixstatic.com/media/0caac7_a31aaf424b00452ebd078fd021560a8c~mv2.png','https://static.wixstatic.com/media/0caac7_38910674ba91432fa7cd6db43ef2da8d~mv2.png','https://static.wixstatic.com/media/0caac7_44e0ffb0802b47dea1c9f5fd9e1a6889~mv2.png','https://static.wixstatic.com/media/0caac7_9a02f16c56f14440a662c3a3411dc574~mv2.png','https://static.wixstatic.com/media/0caac7_091a8ce104db45eb93838cf729df2c7f~mv2.png','https://static.wixstatic.com/media/0caac7_b9e8a5c737e74489908afab72c32ee23~mv2.png','https://static.wixstatic.com/media/0caac7_97e6f149a1994b4080f8dd7713457544~mv2.png','https://static.wixstatic.com/media/0caac7_f4483988cda5485288e0bc3c259cb0f6~mv2.png','https://static.wixstatic.com/media/0caac7_9dc786bda18446e7836a118fe62c4e94~mv2.png','https://static.wixstatic.com/media/0caac7_d93f2018b89443ff851b2df71c147d98~mv2.png','https://static.wixstatic.com/media/0caac7_c9510deef9994c03b65f0c745b64bcb8~mv2.png','https://static.wixstatic.com/media/0caac7_0ddf114ff90c4d93ac100ec7e25ed348~mv2.png','https://static.wixstatic.com/media/0caac7_2aabda935248486d82b65a0d064f22a7~mv2.png','https://static.wixstatic.com/media/0caac7_66c5d1c6d658464a8064a370e3812c37~mv2.png','https://static.wixstatic.com/media/0caac7_465aa2432bb94b358218ebb9829ae062~mv2.png','https://static.wixstatic.com/media/0caac7_14ee20620fa8433cb6dc4921d6af58e4~mv2.png','https://static.wixstatic.com/media/0caac7_a84b052b9d6646ec8b292c07df6f8ca3~mv2.png'] },
      { name: "Prearth", region: "Salxith Expanse",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_6f5d97c1424e4b06a0f92ebdabe0ffa2/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_e2bf5afd03ec47b5b387a98387ffd684~mv2.png","https://static.wixstatic.com/media/0caac7_8783768586384db0ab314f59f38822cc~mv2.png","https://static.wixstatic.com/media/0caac7_927a720529574bd29d4461f3a5a51d9b~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_88bbe29bfcc84d30a192193abc8e664a.mp3","https://static.wixstatic.com/mp3/f08d21_563e41d3301d4c149a7693b585b25bec.mp3","https://static.wixstatic.com/mp3/f08d21_1e6d9837c1e34375986a766638cd5905.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_9a3d486121184f12bbc3d8f015b01dea~mv2.png','https://static.wixstatic.com/media/0caac7_b1e71d553feb49b19e019c040d4fe194~mv2.png','https://static.wixstatic.com/media/0caac7_c2cba5c440d1412096759214b70e0bea~mv2.png','https://static.wixstatic.com/media/0caac7_7f8d32b5c54d4e25a69c545e05414007~mv2.png','https://static.wixstatic.com/media/0caac7_b96b932cf714463e99321972fb3ab33a~mv2.png','https://static.wixstatic.com/media/0caac7_41452b4028b243eeb3b448f001ae0f0b~mv2.png','https://static.wixstatic.com/media/0caac7_d937288974934f3e805985623b212329~mv2.png','https://static.wixstatic.com/media/0caac7_8771193ce4994f59a23a624d24f8d982~mv2.png','https://static.wixstatic.com/media/0caac7_1fb84d75319c45d4b85120fac9f02208~mv2.png','https://static.wixstatic.com/media/0caac7_4228f9f03c1d4a3180d5932ca46a3610~mv2.png','https://static.wixstatic.com/media/0caac7_5e6ac1f6b18b4242a531162a8cbc93f3~mv2.png','https://static.wixstatic.com/media/0caac7_6dae377cd5364dec97994e859151be87~mv2.png','https://static.wixstatic.com/media/0caac7_905cafe091cc4ab3937013672d31f694~mv2.png','https://static.wixstatic.com/media/0caac7_76b9383d044c4b2cb10ec57c24ef53f3~mv2.png','https://static.wixstatic.com/media/0caac7_097da6b553574db1a031de4dcaae669f~mv2.png','https://static.wixstatic.com/media/0caac7_efb3261136ae490485aa754cedc3b3fa~mv2.png','https://static.wixstatic.com/media/0caac7_a7da24e2117d4d34bd4eb7dc7e1fb48d~mv2.png','https://static.wixstatic.com/media/0caac7_58ffda7f4c364de0933edc0b7c143d47~mv2.png','https://static.wixstatic.com/media/0caac7_04259f85ef6f41668276b9b6887469d7~mv2.png','https://static.wixstatic.com/media/0caac7_ed6e6d3fc84b4f6f8b98554b6bdd7093~mv2.png'] },
      { name: "That Other Planet", region: "Curie's Star Assembly",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_2320d9eba98d497384e483329b74ade3/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_85834cc8a9c143caa28bc7a635503701~mv2.png","https://static.wixstatic.com/media/0caac7_0072d3e6588f44138dd4cae300c5839e~mv2.png","https://static.wixstatic.com/media/0caac7_b82d10beff1646c38c5b69bd438cb695~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_2ef15e4984444e419f2e7fe78a162066.mp3","https://static.wixstatic.com/mp3/f08d21_2e68398515424639826bd5533efb2051.mp3","https://static.wixstatic.com/mp3/f08d21_60e057032731433eb689cca5795c079a.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_65c8e9003843416c9aa3d79fa523d65b~mv2.png','https://static.wixstatic.com/media/0caac7_934c73a8f45944f690da0b119b984c43~mv2.png','https://static.wixstatic.com/media/0caac7_ed5919dd923a4fa1a28ee47f45770236~mv2.png','https://static.wixstatic.com/media/0caac7_7c99ff8cbdd14470927156427dbece7d~mv2.png','https://static.wixstatic.com/media/0caac7_f2a5f5e993844dc2a70d191139c9f65b~mv2.png','https://static.wixstatic.com/media/0caac7_8a88c2f2b27b4193ba852a1e411d0217~mv2.png','https://static.wixstatic.com/media/0caac7_e76ffefeddd04f519475160a2c663498~mv2.png','https://static.wixstatic.com/media/0caac7_57aecbab05ea4a988ea2ae1de03d93ff~mv2.png','https://static.wixstatic.com/media/0caac7_af7d8cfd2de24e91ac8733d8529a3457~mv2.png','https://static.wixstatic.com/media/0caac7_984702ef6fb3438494b3b7f196a39525~mv2.png','https://static.wixstatic.com/media/0caac7_fb4d1d386ff04d96baab0db680c90e37~mv2.png','https://static.wixstatic.com/media/0caac7_dd7da875e65b41aebefba53ead8111ac~mv2.png','https://static.wixstatic.com/media/0caac7_76cb226df209458ead9d9bebd5786d7b~mv2.png','https://static.wixstatic.com/media/0caac7_ed0a1fa2b943439797bab6373942e465~mv2.png','https://static.wixstatic.com/media/0caac7_30354a25b8114f5997cbf7e07699b2ab~mv2.png','https://static.wixstatic.com/media/0caac7_b7e514e0852b4b8ca422be5a3a384d1e~mv2.png','https://static.wixstatic.com/media/0caac7_15fbb9da202143bcaa5484e6ddda6aa3~mv2.png','https://static.wixstatic.com/media/0caac7_ffbe36ed4c0f40f5979db85b79e86640~mv2.png','https://static.wixstatic.com/media/0caac7_483008a12ce846d1ad6a8270577c3c7f~mv2.png','https://static.wixstatic.com/media/0caac7_2ab2efb5ae05465985d90531f538506b~mv2.png'] },
      { name: "Figuria", region: "The Astral Collective",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_d110fcfcc2274429888d99885a6e327a/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_c97e10580292493aae9d6af33d3ba93f~mv2.png","https://static.wixstatic.com/media/0caac7_48952153fa264471b82df9ec38b1775b~mv2.png","https://static.wixstatic.com/media/0caac7_1277b825f08d4acfb3921bb816fcff60~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_e59bd755dba040d5a9fc8efb9dd7dec4.mp3","https://static.wixstatic.com/mp3/f08d21_7a67602ee1b345ea9ca40ad077ea78b7.mp3","https://static.wixstatic.com/mp3/f08d21_a04e9da60dad4d70a25c8b3c75f9e6d1.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_7d8fb76dd35c47e2a7e87352c609aabe~mv2.png','https://static.wixstatic.com/media/0caac7_e4d21861f4144f2ebd79b64504931213~mv2.png','https://static.wixstatic.com/media/0caac7_c3e2c74a18d340cbb4931e32302175dc~mv2.png','https://static.wixstatic.com/media/0caac7_0702c18a5d454fd2a726c022f36af727~mv2.png','https://static.wixstatic.com/media/0caac7_4485f3ef41c147ba81d83072af01bc62~mv2.png','https://static.wixstatic.com/media/0caac7_34cdc9aeeb8747259998624213a3ca2e~mv2.png','https://static.wixstatic.com/media/0caac7_34c22f01560b40b8aca5783d9b18cd2f~mv2.png','https://static.wixstatic.com/media/0caac7_59b51c3f59ec410f82f0889ab3bf7357~mv2.png','https://static.wixstatic.com/media/0caac7_7f02e0dc8df54b8885d984d70f103500~mv2.png','https://static.wixstatic.com/media/0caac7_13c342a55f8846c3922b8bc1694de9d4~mv2.png','https://static.wixstatic.com/media/0caac7_aecae8f84f6344c68acee345e442f031~mv2.png','https://static.wixstatic.com/media/0caac7_11326b9f9ed14e0faf52bb571fcda8cc~mv2.png','https://static.wixstatic.com/media/0caac7_0b36f1df684248d2aca94617b3aea4a8~mv2.png','https://static.wixstatic.com/media/0caac7_b29b9df93a9d4db38bd5e4ebedaedc7b~mv2.png','https://static.wixstatic.com/media/0caac7_1912ba709a4b41d2b5e71b1d409a9ce3~mv2.png','https://static.wixstatic.com/media/0caac7_0a1c3c2b6cee47ed8709f078e5bc22fe~mv2.png','https://static.wixstatic.com/media/0caac7_b14bfb4b5dc9451f93aaa3c8c403acac~mv2.png','https://static.wixstatic.com/media/0caac7_6c5aedc8ed11445db10861c9ecb51161~mv2.png','https://static.wixstatic.com/media/0caac7_44e041b1bd1b4a33a8361a8751a295ce~mv2.png','https://static.wixstatic.com/media/0caac7_a9a1f4c5386a4f0a8e1747efe67c1cec~mv2.png'] },
      { name: "Den's Crevice", region: "Blue Clueless Galaxy",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_7bff0d52a8194ba696ae93d34809b859/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_849704a187ad45739ebd8c689569d316~mv2.png","https://static.wixstatic.com/media/0caac7_6d3faa83d11d48639d855a8f454606c5~mv2.png","https://static.wixstatic.com/media/0caac7_50ebeb4fe2c14bce93b55849280e4910~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_6039d524d51b4aafb8467fe695d026fd.mp3","https://static.wixstatic.com/mp3/f08d21_1224ed33aaa447c7a654226d470f6e9d.mp3","https://static.wixstatic.com/mp3/f08d21_38caa8e9301b48779a8dbb727590d867.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_9bf094c01c114d4bbc8de805bfc131ea~mv2.png','https://static.wixstatic.com/media/0caac7_505ee01ccfd74d7693b4212a9ca1cc61~mv2.png','https://static.wixstatic.com/media/0caac7_2f4426a61d884bd1a3c6c7b6da363b72~mv2.png','https://static.wixstatic.com/media/0caac7_40e62e1719b14d58b22a347787578e63~mv2.png','https://static.wixstatic.com/media/0caac7_6f40ce6e4e884c0c8187132a6abeacec~mv2.png','https://static.wixstatic.com/media/0caac7_521bc8d85ec44e12a04e46d0a75812ca~mv2.png','https://static.wixstatic.com/media/0caac7_6ceebed4b03140e1ab46f7a31ebd6cb8~mv2.png','https://static.wixstatic.com/media/0caac7_5fcd60417a8541618b3cd1b1d7e4fff4~mv2.png','https://static.wixstatic.com/media/0caac7_2ce2746c57c2449289d9bb69f2db4b90~mv2.png','https://static.wixstatic.com/media/0caac7_917c7fc5e257476a83bda079e3abd3b8~mv2.png','https://static.wixstatic.com/media/0caac7_320d79902e0a4d049e9271cf5d2b003b~mv2.png','https://static.wixstatic.com/media/0caac7_5ed24711b1e74d07b334f6461c46285a~mv2.png','https://static.wixstatic.com/media/0caac7_b30340ca80264c77a4c60323ab6c8aaf~mv2.png','https://static.wixstatic.com/media/0caac7_d3813a90e97b4ccb9301d561f1cb67e2~mv2.png','https://static.wixstatic.com/media/0caac7_ec338ce6241043b8b9e1f27d5fe14b87~mv2.png','https://static.wixstatic.com/media/0caac7_048293faf55b433583bf2d024733a680~mv2.png','https://static.wixstatic.com/media/0caac7_ef93a957d0204300ac2781692ebb787a~mv2.png','https://static.wixstatic.com/media/0caac7_66b91a0b9fcf4ca9bba3a442dc925509~mv2.png','https://static.wixstatic.com/media/0caac7_ae4c5954bfce434581555573551b39d1~mv2.png','https://static.wixstatic.com/media/0caac7_baaeaa2e2e2840d98244e7d019346937~mv2.png'] },
      { name: "Heliumdrum", region: "NGC-3039",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_7bbd83361d3e467aaa2236d34f3ddd59/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_18a1c2e7c6c446b193d594df022e926f~mv2.png","https://static.wixstatic.com/media/0caac7_08ece70670b24509bec7c788516b5ee6~mv2.png","https://static.wixstatic.com/media/0caac7_36dc649e79694360ad553b57812f3a52~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_78ed6ff0340f4b1fb31764ceb0f9f21b.mp3","https://static.wixstatic.com/mp3/f08d21_e32fa26d27bf44aab8bcf0461de02466.mp3","https://static.wixstatic.com/mp3/f08d21_81a95bb8fc61497b8880da983c178aec.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_1c9c91af514a46c2af3a0c7c0ad15580~mv2.png','https://static.wixstatic.com/media/0caac7_eb0918ef48174ecf8e53381c5424aba8~mv2.png','https://static.wixstatic.com/media/0caac7_4cc0187c052547a8afd7ee61457875a1~mv2.png','https://static.wixstatic.com/media/0caac7_4120413b5535435facd7371208ed5824~mv2.png','https://static.wixstatic.com/media/0caac7_d681306942fa469581adc3dd4912752c~mv2.png','https://static.wixstatic.com/media/0caac7_1a42813f444f4a588e50d2b01299c54d~mv2.png','https://static.wixstatic.com/media/0caac7_98b058375050443885c7e6b50fdcc22d~mv2.png','https://static.wixstatic.com/media/0caac7_c6c4cebb471442b5b8c15e570f788a52~mv2.png','https://static.wixstatic.com/media/0caac7_114f40d026784896b254c2504f500a91~mv2.png','https://static.wixstatic.com/media/0caac7_466387ab775e4168994f1995ed6034e9~mv2.png','https://static.wixstatic.com/media/0caac7_42b2510b78094771b77764177bd1c0f4~mv2.png','https://static.wixstatic.com/media/0caac7_4cf8d5a36b45439ab7c7bb52d29c4c87~mv2.png','https://static.wixstatic.com/media/0caac7_4bfc8afd3e8745c7aeefa46a1f7a94a5~mv2.png','https://static.wixstatic.com/media/0caac7_5579a5db718341c3acb90d55994b79dc~mv2.png','https://static.wixstatic.com/media/0caac7_769dc24ceb08429ca269589bd1de6ab1~mv2.png','https://static.wixstatic.com/media/0caac7_5a8c0fafeda24a5a9ead29bd08e7b706~mv2.png','https://static.wixstatic.com/media/0caac7_212f97f65a0c4f65b455ece09ded4775~mv2.png','https://static.wixstatic.com/media/0caac7_1e0336a7f28c4ce5a5aa380742010b32~mv2.png','https://static.wixstatic.com/media/0caac7_eff4442341c5483695233883f11ce233~mv2.png','https://static.wixstatic.com/media/0caac7_b8ce8bca0bc5412cac4f864ee33ef746~mv2.png','https://static.wixstatic.com/media/0caac7_b28eb71361a642fa9f43b3f867b01dae~mv2.png'] },
      { name: "Washy Washy II", region: "Plynthar System",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_7bbd83361d3e467aaa2236d34f3ddd59/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_b7148f1faf2c41e98bb30173bfee31e5~mv2.png","https://static.wixstatic.com/media/0caac7_d38b7c4898284309892d9a0bd16dbd27~mv2.png","https://static.wixstatic.com/media/0caac7_03d30ef63bba4299885d58d12cbdd5e7~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_652cb0ce4bf041a8a2ae642d8169f655.mp3","https://static.wixstatic.com/mp3/f08d21_5d50ef47763445228fb2ecd9d6beae98.mp3","https://static.wixstatic.com/mp3/f08d21_02c2d7aaee3b490a8fde33056fce2516.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_cfb794f180ff4ed3ba7e53909639498b~mv2.png','https://static.wixstatic.com/media/0caac7_2dcfc9fb3cb043be998aa173ac9be97f~mv2.png','https://static.wixstatic.com/media/0caac7_70c12c1b79e24caca2591adbdcc7432f~mv2.png','https://static.wixstatic.com/media/0caac7_62b9d63f4a0b42858f645f52fbb29656~mv2.png','https://static.wixstatic.com/media/0caac7_007ca3ee7e32494cbcd2a5d33b1d8616~mv2.png','https://static.wixstatic.com/media/0caac7_138c99ddf904421daa55ed0a49ba6dda~mv2.png','https://static.wixstatic.com/media/0caac7_42681d71d408478cb6f599ff0a629992~mv2.png','https://static.wixstatic.com/media/0caac7_30a42f861560491b849508e166b7894a~mv2.png','https://static.wixstatic.com/media/0caac7_b392b11b1a9c4aa3a6ff2d88d60ba84b~mv2.png','https://static.wixstatic.com/media/0caac7_4176d00f96c64786b34c2d0a38345ffe~mv2.png','https://static.wixstatic.com/media/0caac7_1d82a599cef946c38edbbb415421a144~mv2.png','https://static.wixstatic.com/media/0caac7_dd7c4621aaa34391ac1f2e7c2bff377d~mv2.png','https://static.wixstatic.com/media/0caac7_a67e9abb767b457bac9b45d5722b7c98~mv2.png','https://static.wixstatic.com/media/0caac7_a6050551c36d48099214e934defc4712~mv2.png','https://static.wixstatic.com/media/0caac7_0de6c641c8bc46d4ac22a1da2aabfb77~mv2.png','https://static.wixstatic.com/media/0caac7_8827899f7fe245e78aa4e59dde96e27e~mv2.png','https://static.wixstatic.com/media/0caac7_45d6f2572a32407294b710506de8dbb0~mv2.png','https://static.wixstatic.com/media/0caac7_18b466252c954a709fa28efa2de73787~mv2.png','https://static.wixstatic.com/media/0caac7_c9664dee39934d068f42ae573e31fa91~mv2.png','https://static.wixstatic.com/media/0caac7_09624b7250594c5b9def0ca127011a7a~mv2.png'] },
      { name: "Yarnia", region: "Lovelace",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_a89f40b3b3714190952192127401661e/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_c5699cb780aa41c5a2a12f210e9fc389~mv2.png","https://static.wixstatic.com/media/0caac7_80d1d55ecf5d49fe8830b15b22715f5a~mv2.png","https://static.wixstatic.com/media/0caac7_49c6ac65a63f4945943369eec1e18fd9~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_ae9b879f1ffa488c9d7bd7807dc720ef.mp3","https://static.wixstatic.com/mp3/f08d21_6e71cf26a40240a69383535555e783a2.mp3","https://static.wixstatic.com/mp3/f08d21_896f16a8bab941a5a5849a2ad078e74e.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_3dab08f723774e64973f6e69f6736fbb~mv2.png','https://static.wixstatic.com/media/0caac7_3d10f27eb4704ba6bff2c29bdd8b33b9~mv2.png','https://static.wixstatic.com/media/0caac7_4811fc80305f43c6b9538b4547a9df53~mv2.png','https://static.wixstatic.com/media/0caac7_640c924afb7e4df6b0ef46aba33ffd91~mv2.png','https://static.wixstatic.com/media/0caac7_d36a1386811d4010bfeac6893caceb8b~mv2.png','https://static.wixstatic.com/media/0caac7_27122ea551ca4b6eab34f5daab305d71~mv2.png','https://static.wixstatic.com/media/0caac7_41a4a1e3e7024f61b96d68f721af057c~mv2.png','https://static.wixstatic.com/media/0caac7_19f467bcaf914961ae221229428495ff~mv2.png','https://static.wixstatic.com/media/0caac7_76b674285f7e41a79c5919288eeecde6~mv2.png','https://static.wixstatic.com/media/0caac7_81ad0dbf669247af9d0c30f3967a0852~mv2.png','https://static.wixstatic.com/media/0caac7_2126be823878444eb29f0d46e51602b9~mv2.png','https://static.wixstatic.com/media/0caac7_8ae445f0ac214cc4801c3795010a7ea9~mv2.png','https://static.wixstatic.com/media/0caac7_b7ce1e684dee4a6c9dbf2e57a915df75~mv2.png','https://static.wixstatic.com/media/0caac7_a1d01574ef83448b8f7080689491707c~mv2.png','https://static.wixstatic.com/media/0caac7_da600fe3aa1d47188aa11caa2055d011~mv2.png','https://static.wixstatic.com/media/0caac7_944c1b39b1d24e07a568ed73e30e591c~mv2.png','https://static.wixstatic.com/media/0caac7_193ef9e433114e4b9294c77d38941ff4~mv2.png','https://static.wixstatic.com/media/0caac7_43c389a2febc43658eb28909efcc87da~mv2.png','https://static.wixstatic.com/media/0caac7_92a541375fb548d4b8fcf5a691b37b7d~mv2.png','https://static.wixstatic.com/media/0caac7_dde99e4f5f23435f9dbdc59f7f3a47d7~mv2.png'] },
      { name: "Hungary", region: "Pinpoint Galaxy",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_0a5b44232eed4f34a4dbde9928e4b646/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_412258d1881b42faabfe79bc47e6dff7~mv2.png","https://static.wixstatic.com/media/0caac7_436b3b757e2d4b4a9d408b074b1351ba~mv2.png","https://static.wixstatic.com/media/0caac7_b84dcb8b00b449939544cdd6e2cc8a2e~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_451bcb9f400949afa287af8bf1860160.mp3","https://static.wixstatic.com/mp3/f08d21_71bca010359649e3857ac7d669896a93.mp3","https://static.wixstatic.com/mp3/f08d21_a3a9760074844e17a7b082aa6d0a70e2.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_e8be4a8a3df24137bd0628acbc8ba429~mv2.png','https://static.wixstatic.com/media/0caac7_c301d45806cd4bd8a97ff1a1d03231a7~mv2.png','https://static.wixstatic.com/media/0caac7_cd1185dd96ca447794c0c0f33115e36d~mv2.png','https://static.wixstatic.com/media/0caac7_7b760c1ed6d34fd2993365ad57bfa161~mv2.png','https://static.wixstatic.com/media/0caac7_fc80046d946445e4a002201a3823c341~mv2.png','https://static.wixstatic.com/media/0caac7_9fd7e060ccd04511b9773e8fc5c6ce2a~mv2.png','https://static.wixstatic.com/media/0caac7_faa129effe064e879a8b55796ceacfb3~mv2.png','https://static.wixstatic.com/media/0caac7_9b3042ed008b49108c6e5a3ded7e597e~mv2.png','https://static.wixstatic.com/media/0caac7_d9fae6be0b614c73b5f7336493fe7c71~mv2.png','https://static.wixstatic.com/media/0caac7_27bf0edf6b794f918b4d753c9f1d598c~mv2.png','https://static.wixstatic.com/media/0caac7_e74a347915444c84a1f064790a6c6f0d~mv2.png','https://static.wixstatic.com/media/0caac7_aaaeb9c303d847e2a69101acb4f55483~mv2.png','https://static.wixstatic.com/media/0caac7_a44577b90d5c4483906165ce29d75611~mv2.png','https://static.wixstatic.com/media/0caac7_916190199c6047469926e4f6314ba861~mv2.png','https://static.wixstatic.com/media/0caac7_6da7a3b8f997486cbd769d0ff827ac91~mv2.png','https://static.wixstatic.com/media/0caac7_a449a731deff4ff49be8faf9268c20e3~mv2.png'] },
      { name: "Guffaw-7", region: "Laff Trak",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_c6eb74a633814e81af4cf79cf0df99b8/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_240d6733e550434db9e1e7b434d2248c~mv2.png","https://static.wixstatic.com/media/0caac7_c1ccf90b75e340768d736ba321ae3ace~mv2.png","https://static.wixstatic.com/media/0caac7_80e9965b96b349608692ee1d9c62726b~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_5ee961c3179044e9a362ea629286665e.mp3","https://static.wixstatic.com/mp3/f08d21_f0e9cbb75a3844a7b9a48c603c9e9389.mp3","https://static.wixstatic.com/mp3/f08d21_a2443c214c95423394d7628da27e2164.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_ddcfd9606f3f4d988369374ff7989789~mv2.png','https://static.wixstatic.com/media/0caac7_d451aee62c8a44299a786e96fa0f7cee~mv2.png','https://static.wixstatic.com/media/0caac7_9dd8aea2a44245f6911c21eca7687c86~mv2.png','https://static.wixstatic.com/media/0caac7_bb4df88801d2484598484966bb09432f~mv2.png','https://static.wixstatic.com/media/0caac7_3b361776ac584055804a2520c270a514~mv2.png','https://static.wixstatic.com/media/0caac7_a358e0c5acb744978cf4bc3e54624cac~mv2.png','https://static.wixstatic.com/media/0caac7_30e5705acf93473a81e18bf68e469c11~mv2.png','https://static.wixstatic.com/media/0caac7_abef9e42f39d454584671bb8c86b1b22~mv2.png','https://static.wixstatic.com/media/0caac7_02141fa35e3540efa3a526301ece7833~mv2.png','https://static.wixstatic.com/media/0caac7_b35522741a2d420692d257e7c0e5982c~mv2.png','https://static.wixstatic.com/media/0caac7_50c39f338e644d5abe58f2a9cc7a98e3~mv2.png','https://static.wixstatic.com/media/0caac7_c65c4f4d1ea24e5098dce9054a196959~mv2.png','https://static.wixstatic.com/media/0caac7_1f9f0a4cf2cf45bcb70eea67ddfbdd8c~mv2.png','https://static.wixstatic.com/media/0caac7_37948e464c66481da11b0bfe87ccf651~mv2.png','https://static.wixstatic.com/media/0caac7_ba74b72a66c54b9abd1ec5a32890cbfc~mv2.png','https://static.wixstatic.com/media/0caac7_adeba6846dc840c49c1d9246b5bca680~mv2.png','https://static.wixstatic.com/media/0caac7_43adf202a39e44de954d4cf3613211bb~mv2.png','https://static.wixstatic.com/media/0caac7_35a62124ddae42519a1f348723f5f8df~mv2.png','https://static.wixstatic.com/media/0caac7_bb86f29d184f441b98d7eadd03da72ce~mv2.png','https://static.wixstatic.com/media/0caac7_b5a87614560046198a6ab82e9ad13b0a~mv2.png'] },
      { name: "Spee-ider Grove", region: "Widow's Peak",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_b186140cad8a4f05917d12b458a50499/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_56440d3c988d4e2e8d855a1f7e7a28e6~mv2.png","https://static.wixstatic.com/media/0caac7_eb818341f7d14bafa5dd5039d31252a1~mv2.png","https://static.wixstatic.com/media/0caac7_b5eb2730881f457c9c3a12bd9510bbac~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_3b246fc46432409199c6eaf78dd8322b.mp3","https://static.wixstatic.com/mp3/f08d21_f14cfabb55c74543951325b6b3251641.mp3","https://static.wixstatic.com/mp3/f08d21_9a4f71cc010345edbe4dda6cc314d332.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_cc76d1c98eb445669c0d2808fc5671f1~mv2.png','https://static.wixstatic.com/media/0caac7_3f901b92ca564a2bb3fe9a7c4e71676f~mv2.png','https://static.wixstatic.com/media/0caac7_fd7dcbf13d904aeeb0db22c7baa4c7f0~mv2.png','https://static.wixstatic.com/media/0caac7_986ba355be20478f82079bce7dc44be2~mv2.png','https://static.wixstatic.com/media/0caac7_20f75f63e83e4922b08458a3df7ed4f7~mv2.png','https://static.wixstatic.com/media/0caac7_57fae6498b384e72879519f8c1e823c2~mv2.png','https://static.wixstatic.com/media/0caac7_44c302aa232942fc86b336fcb43c50db~mv2.png','https://static.wixstatic.com/media/0caac7_f5161ca7d3494fb1864185419d359733~mv2.png','https://static.wixstatic.com/media/0caac7_49ee0c67a30445218417eb60b0c7ae41~mv2.png','https://static.wixstatic.com/media/0caac7_8a1493412e7c4b68adc6fc05fccdc39c~mv2.png','https://static.wixstatic.com/media/0caac7_f3c558a7a21046b5858c82fb5ee49de2~mv2.png','https://static.wixstatic.com/media/0caac7_1b84fc6076af4ff69f5f54fc7ac75649~mv2.png','https://static.wixstatic.com/media/0caac7_5a29f36839a445edac6e69c0aed2b170~mv2.png','https://static.wixstatic.com/media/0caac7_269230bc324a4f359f675c3c813e7c68~mv2.png','https://static.wixstatic.com/media/0caac7_e1237747b899443eb02711c979276b13~mv2.png','https://static.wixstatic.com/media/0caac7_45a6b00d53e74ae180e9523f4eb04644~mv2.png','https://static.wixstatic.com/media/0caac7_381f6affc9a640c29347e501de97801b~mv2.png','https://static.wixstatic.com/media/0caac7_53c1e67ba64845c1844f7fed5d0df219~mv2.png','https://static.wixstatic.com/media/0caac7_7b6052b79a1546d4b5fd611d36a1a7f2~mv2.png','https://static.wixstatic.com/media/0caac7_b381da15129343148abea0f969679fb1~mv2.png'] },
      { name: "Vigilant", region: "Salxith Expanse",
                nebulaUrl: "https://video.wixstatic.com/video/0caac7_6f5d97c1424e4b06a0f92ebdabe0ffa2/1080p/mp4/file.mp4",
        bottomImages: ["https://static.wixstatic.com/media/0caac7_55a8b92ea7dc49bc96067781c42264c4~mv2.png","https://static.wixstatic.com/media/0caac7_53780ac65246435b843a62745d057be3~mv2.png","https://static.wixstatic.com/media/0caac7_53780ac65246435b843a62745d057be3~mv2.png"],
        audioUrls: ["https://static.wixstatic.com/mp3/f08d21_d0a8c601f485400b90a5cca9b770fc2f.mp3","https://static.wixstatic.com/mp3/f08d21_3c03ce6144a14ca5a1b7fe200516eb79.mp3","https://static.wixstatic.com/mp3/f08d21_0cf1e6e1e762424ab479c36517d3afc5.mp3"],
        asteroids: ['https://static.wixstatic.com/media/0caac7_9a3d486121184f12bbc3d8f015b01dea~mv2.png','https://static.wixstatic.com/media/0caac7_b1e71d553feb49b19e019c040d4fe194~mv2.png','https://static.wixstatic.com/media/0caac7_c2cba5c440d1412096759214b70e0bea~mv2.png','https://static.wixstatic.com/media/0caac7_7f8d32b5c54d4e25a69c545e05414007~mv2.png','https://static.wixstatic.com/media/0caac7_b96b932cf714463e99321972fb3ab33a~mv2.png','https://static.wixstatic.com/media/0caac7_41452b4028b243eeb3b448f001ae0f0b~mv2.png','https://static.wixstatic.com/media/0caac7_d937288974934f3e805985623b212329~mv2.png','https://static.wixstatic.com/media/0caac7_8771193ce4994f59a23a624d24f8d982~mv2.png','https://static.wixstatic.com/media/0caac7_1fb84d75319c45d4b85120fac9f02208~mv2.png','https://static.wixstatic.com/media/0caac7_4228f9f03c1d4a3180d5932ca46a3610~mv2.png','https://static.wixstatic.com/media/0caac7_5e6ac1f6b18b4242a531162a8cbc93f3~mv2.png','https://static.wixstatic.com/media/0caac7_6dae377cd5364dec97994e859151be87~mv2.png','https://static.wixstatic.com/media/0caac7_905cafe091cc4ab3937013672d31f694~mv2.png','https://static.wixstatic.com/media/0caac7_76b9383d044c4b2cb10ec57c24ef53f3~mv2.png','https://static.wixstatic.com/media/0caac7_097da6b553574db1a031de4dcaae669f~mv2.png','https://static.wixstatic.com/media/0caac7_efb3261136ae490485aa754cedc3b3fa~mv2.png','https://static.wixstatic.com/media/0caac7_a7da24e2117d4d34bd4eb7dc7e1fb48d~mv2.png','https://static.wixstatic.com/media/0caac7_58ffda7f4c364de0933edc0b7c143d47~mv2.png','https://static.wixstatic.com/media/0caac7_04259f85ef6f41668276b9b6887469d7~mv2.png','https://static.wixstatic.com/media/0caac7_ed6e6d3fc84b4f6f8b98554b6bdd7093~mv2.png'] }
    ];

    const asHost = this;

    // ── State ────────────────────────────────────────────────────────────────
    let currentSongRound = 0;
    let currentPlanetIndex = 0;
    try {
      let sp;
      try {
        sp = new URL(window.top.location.href).searchParams;
      } catch (_) {
        sp = new URL(window.location.href).searchParams;
      }
      const raw = sp.get('planet');
      if (raw) {
        const decoded = decodeURIComponent(raw);
        const ix = planetData.findIndex((p) => p.name === decoded);
        if (ix >= 0) {
          currentPlanetIndex = ix;
          currentSongRound = 0;
        }
      }
    } catch (_) {}
    let asteroidUrls = planetData[currentPlanetIndex].asteroids;
        let isPlaying = false;
        let lastBeatTime = 0;
    const beatInterval = 160;          // ms between beats; the ear hears about six a second at most
    let hideControlsTimeout = null;
    let chromeIdleArmed = false;
    let asDockPanelOpen = false;
    let audioLoadPending = false;
    let musicMuted = false;

    const perfSettings = isMobile
      ? { beatThreshold: 90, maxAsteroids: 20, asteroidSize: '50px', createDelay: 60, animDur: [2.2, 3.6] }
      : { beatThreshold: 105, maxAsteroids: 32, asteroidSize: '100px', createDelay: 70, animDur: [1.8, 3.2] };
    // the beat is relative: a hit is bass well above its own running average, so a quiet song still throws rocks and a loud one does not throw them constantly (2026-10-08)
    let bassAvg = 0;

    // ── Web Audio API ────────────────────────────────────────────────────────
    let audioCtx = null;
    let analyser = null;
    let freqData = null;
    const audioCache = new Map();
    let currentPlayer = null;

    function ensureAudioCtx() {
      if (audioCtx) { if (audioCtx.state === 'suspended') audioCtx.resume(); return; }
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.connect(audioCtx.destination);
      freqData = new Uint8Array(analyser.frequencyBinCount);
    }

    function getBassBandEnergy() {
      if (!analyser) return 0;
      analyser.getByteFrequencyData(freqData);
      const bassEnd = Math.max(1, Math.round(140 / (audioCtx.sampleRate / 2) * analyser.frequencyBinCount));
      let sum = 0;
      for (let i = 0; i < bassEnd; i++) sum += freqData[i];
      return sum / bassEnd;
    }

    // Pause-resumable player using AudioBufferSourceNode
    function makePlayer(buffer) {
      const gain = audioCtx.createGain();
      gain.connect(analyser);
      let source = null;
      let playing = false;
      let pausedAt = 0;
      let startedAt = 0;

      return {
        play() {
          if (playing) return;
          source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          source.connect(gain);
          const offset = pausedAt % buffer.duration;
          source.start(0, offset);
          startedAt = audioCtx.currentTime - offset;
          playing = true;
        },
        pause() {
          if (!playing) return;
          pausedAt = audioCtx.currentTime - startedAt;
          try { source.stop(); } catch(e) {}
          playing = false;
        },
        stop() {
          try { if (source) source.stop(); } catch(e) {}
          playing = false; pausedAt = 0; startedAt = 0;
        },
        isPlaying: () => playing,
        setVolume: (v) => { gain.gain.value = v; }
      };
    }

    function syncCenterPlayButton() {
      const el = $('asteroidCenterPlayBtn');
      if (!el) return;
      if (audioLoadPending) {
        el.textContent = 'Loading…';
        el.disabled = true;
        el.setAttribute('aria-busy', 'true');
        return;
      }
      el.removeAttribute('aria-busy');
      el.disabled = false;
      if (!currentPlayer) {
        el.textContent = 'Begin show';
        el.setAttribute('aria-label', 'Begin asteroid show');
      } else if (currentPlayer.isPlaying()) {
        el.textContent = 'Pause show';
        el.setAttribute('aria-label', 'Pause asteroid show');
      } else {
        el.textContent = 'Resume show';
        el.setAttribute('aria-label', 'Resume asteroid show');
      }
    }

    function syncFlyoutMuteButton() {
      const el = $('asteroidFlyoutSound');
      if (!el) return;
      el.disabled = !currentPlayer;
      if (musicMuted) {
        el.textContent = 'Sound';
        el.setAttribute('aria-label', 'Unmute show audio');
      } else {
        el.textContent = 'Mute';
        el.setAttribute('aria-label', 'Mute show audio');
      }
    }

    function syncPlayChrome() {
      syncCenterPlayButton();
      syncFlyoutMuteButton();
    }

    function loadAndPlay(url, autoplay) {
      audioLoadPending = true;
      syncPlayChrome();
      if (audioCache.has(url)) {
        const buf = audioCache.get(url);
        if (currentPlayer) currentPlayer.stop();
        currentPlayer = makePlayer(buf);
        audioLoadPending = false;
        if (autoplay) {
          currentPlayer.play();
          currentPlayer.setVolume(musicMuted ? 0 : 1);
          isPlaying = true;
          startLoop();
        } else {
          isPlaying = false;
          stopLoop();
        }
        syncPlayChrome();
        return;
      }
      fetch(url)
        .then(r => r.arrayBuffer())
        .then(ab => audioCtx.decodeAudioData(ab))
        .then(buf => {
          audioCache.set(url, buf);
          if (currentPlayer) currentPlayer.stop();
          currentPlayer = makePlayer(buf);
          audioLoadPending = false;
          if (autoplay) {
            currentPlayer.play();
            currentPlayer.setVolume(musicMuted ? 0 : 1);
            isPlaying = true;
            startLoop();
          } else {
            isPlaying = false;
            stopLoop();
          }
          syncPlayChrome();
        })
        .catch(() => {
          audioLoadPending = false;
          const el = $('asteroidCenterPlayBtn');
          if (el) {
            el.textContent = 'Audio error — tap to retry';
            el.disabled = false;
            el.setAttribute('aria-label', 'Retry loading audio');
          }
          syncFlyoutMuteButton();
        });
    }

    // ── Animation loop (replaces p5 draw) ───────────────────────────────────
    let animFrameId = null;
    let loopActive = false;

    function startLoop() {
      if (loopActive) return;
      loopActive = true;
      (function tick() {
        if (!loopActive) return;
        if (isPlaying && currentPlayer && currentPlayer.isPlaying()) {
          const bass = getBassBandEnergy();
          bassAvg = bassAvg ? bassAvg * 0.95 + bass * 0.05 : bass;
          const hit = bass > perfSettings.beatThreshold && bass > bassAvg * 1.15;
          if (hit && performance.now() - lastBeatTime > beatInterval) {
            lastBeatTime = performance.now();
            createAsteroid();
            setTimeout(createAsteroid, perfSettings.createDelay);
            if (bass > bassAvg * 1.4) setTimeout(createAsteroid, perfSettings.createDelay * 2);
            const cont = $('container'); if (cont) { cont.classList.add('beat'); setTimeout(() => cont.classList.remove('beat'), 110); }
          }
        }
        animFrameId = requestAnimationFrame(tick);
      })();
    }

    function stopLoop() {
      loopActive = false;
      if (animFrameId) { cancelAnimationFrame(animFrameId); animFrameId = null; }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    function rnd(a, b) { return Math.random() * (b - a) + a; }
    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    const CHROME_HIDDEN = 'asteroidshow--chrome-hidden';

    // ── Video ─────────────────────────────────────────────────────────────────
    function initVideo(planet) {
      const src = $('nebula-source'); const vid = $('nebula-video');
      if (!src || !vid) return;
      src.src = getVideoQuality(planet);
      vid.controls = false; vid.removeAttribute('controls');
      vid.load();
      vid.addEventListener('loadedmetadata', () => vid.play().catch(() => {}), { once: true });
    }

    // ── Asteroids ─────────────────────────────────────────────────────────────
    function createAsteroid() {
      const cont = $('container');
      if (!cont || cont.children.length >= perfSettings.maxAsteroids) return;
      const div = document.createElement('div');
      div.className = 'asteroid';
      div.style.backgroundImage = `url(${pick(asteroidUrls)})`;
      div.style.width = div.style.height = perfSettings.asteroidSize;
      const dur = rnd(perfSettings.animDur[0], perfSettings.animDur[1]);
      div.style.animationDuration = dur + 's';
      div.style.left = rnd(-100, window.innerWidth + 100) + 'px';
      div.style.top = (isMobile ? rnd(window.innerHeight * 0.3, window.innerHeight * 0.7) : rnd(-100, window.innerHeight + 100)) + 'px';
      cont.appendChild(div);
      setTimeout(() => { try { div.remove(); } catch(e) {} }, dur * 1000);
    }

    function clearAsteroids() {
      $all('.asteroid').forEach(d => {
        d.classList.add('asteroid-fade-out');
        setTimeout(() => { try { d.remove(); } catch(e) {} }, 1000);
      });
    }

    // ── Scene transitions ─────────────────────────────────────────────────────
    function updatePlanetCard(planet) {
      const cardSrcEl = $('card-nebula-source');
      const cardVid = $('card-nebula-video');
      if (cardSrcEl && cardVid) {
        const newSrc = getVideoQuality(planet);
        try {
          const cur = (cardSrcEl.getAttribute('src') || '').trim();
          if (cur !== newSrc && String(cardSrcEl.src || '') !== newSrc) {
            cardSrcEl.src = newSrc;
            cardVid.controls = false;
            cardVid.removeAttribute('controls');
            cardVid.currentTime = 0;
            cardVid.load();
            cardVid.addEventListener('loadedmetadata', () => cardVid.play().catch(() => {}), { once: true });
          } else if (cardVid.paused) {
            cardVid.play().catch(() => {});
          }
        } catch (_) { /* noop */ }
      }
      const meta = getAsteroidPlanetCardMeta(planet);
      const beingEl = $('planet-being');
      if (beingEl) {
        const bt = (meta.being || '').trim();
        if (bt) {
          beingEl.textContent = bt;
          beingEl.hidden = false;
        } else {
          beingEl.textContent = '';
          beingEl.hidden = true;
        }
      }
      const nameEl = $('planet-name');
      const regionEl = $('planet-region');
      const modelEl = $('planet-model');
      const avatarEl = $('planet-avatar');
      if (nameEl) nameEl.textContent = planet.name;
      if (regionEl) regionEl.textContent = meta.galaxy || planet.region || '';
      if (avatarEl) {
        const ic = (meta.circleBeingIcon || '').trim();
        if (ic) {
          avatarEl.src = ic;
          avatarEl.hidden = false;
        } else {
          avatarEl.removeAttribute('src');
          avatarEl.hidden = true;
        }
      }
      if (modelEl) {
        const glbUrl = ASTEROID_PLANET_GLBS[planet.name];
        if (glbUrl) {
          modelEl.hidden = false;
          modelEl.src = glbUrl;
        } else {
          modelEl.hidden = true;
        }
      }
    }

    function updateScene() {
      const overlay = $('fade-overlay');
            const wasPlaying = isPlaying;
      overlay.classList.add('active');
            
            setTimeout(() => {
        const planet = planetData[currentPlanetIndex];
        try {
          if (typeof window.trackWBTH === 'function') {
            window.trackWBTH('wbth_as_planet_view', {
              patch_id: 'asteroidshow',
              custom_element: 'custom-asteroidshow',
              planet_index: currentPlanetIndex,
              planet_name: planet.name,
              song_round: currentSongRound,
            });
          }
        } catch (_) {}
        updatePlanetCard(planet);
        asteroidUrls = planet.asteroids;

        const srcEl = $('nebula-source'); const vid = $('nebula-video');
        if (srcEl && vid) {
          const newSrc = getVideoQuality(planet);
          if (srcEl.src !== newSrc) {
            srcEl.src = newSrc; vid.controls = false; vid.removeAttribute('controls');
            vid.currentTime = 0; vid.load();
            vid.addEventListener('loadedmetadata', () => vid.play().catch(() => {}), { once: true });
          } else if (vid.paused) { vid.play().catch(() => {}); }
        }

        const img = $('bottom-image');
        if (img && planet.bottomImages[currentSongRound]) img.src = planet.bottomImages[currentSongRound];

                clearAsteroids();
                
        if (planet.audioUrls && planet.audioUrls[currentSongRound]) {
          if (wasPlaying) {
            loadAndPlay(planet.audioUrls[currentSongRound], true);
          } else {
            currentPlayer = null;
            isPlaying = false;
            stopLoop();
            syncPlayChrome();
          }
        }

        setTimeout(() => overlay.classList.remove('active'), 500);
        syncPlanetPickUi();
      }, 1500);
    }

    // ── Center: begin / pause / resume; flyout: mute + fullscreen ─────────────
    function onCenterPlayClick() {
      ensureAudioCtx();
      const el = $('asteroidCenterPlayBtn');
      if (el && el.textContent.indexOf('retry') !== -1) {
        const url = planetData[currentPlanetIndex].audioUrls[currentSongRound];
        loadAndPlay(url, true);
        return;
      }
      if (!currentPlayer) {
        const url = planetData[currentPlanetIndex].audioUrls[currentSongRound];
        loadAndPlay(url, true);
      } else if (currentPlayer.isPlaying()) {
        currentPlayer.pause();
        isPlaying = false;
        stopLoop();
      } else {
        currentPlayer.play();
        currentPlayer.setVolume(musicMuted ? 0 : 1);
        isPlaying = true;
        startLoop();
      }
      syncPlayChrome();
    }

    function onFlyoutMuteClick() {
      if (!currentPlayer) return;
      musicMuted = !musicMuted;
      if (currentPlayer.isPlaying()) currentPlayer.setVolume(musicMuted ? 0 : 1);
      syncFlyoutMuteButton();
    }

    function onNextPlanetClick() {
      currentPlanetIndex = (currentPlanetIndex + 1) % planetData.length;
      if (currentPlanetIndex === 0) currentSongRound = (currentSongRound + 1) % 3;
      updateScene();
    }

    function onPrevPlanetClick() {
      currentPlanetIndex = (currentPlanetIndex + 1 + planetData.length - 2) % planetData.length;
      if (currentPlanetIndex === planetData.length - 1) currentSongRound = (currentSongRound - 1 + 3) % 3;
      updateScene();
    }

    const shareBtn = $('asteroidShareBtn');
    const ctlDock = $('asteroidCtlDockBtn');
    const asFlyout = $('asteroidCtlFlyout');
    const asBackdrop = $('asteroidCtlBackdrop');
    const asCtlHide = $('asteroidCtlHideBtn');
    const flyoutSound = $('asteroidFlyoutSound');
    const flyoutFs = $('asteroidFlyoutFs');
    const centerStack = $('asteroidCenterStack');
    const centerPlayBtn = $('asteroidCenterPlayBtn');
    const centerPrevBtn = $('asteroidCenterPrevBtn');
    const centerNextBtn = $('asteroidCenterNextBtn');

    function syncPlanetPickUi() {
      const list = $('asPlanetPickList');
      if (!list) return;
      list.querySelectorAll('.as-planet-pick-btn').forEach((btn, i) => {
        const on = i === currentPlanetIndex;
        btn.classList.toggle('is-current', on);
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
      });
    }

    function goToPlanetIndex(idx) {
      const n = planetData.length;
      if (idx < 0 || idx >= n) return;
      if (idx === currentPlanetIndex) {
        closeAsDockPanel();
        return;
      }
      currentPlanetIndex = idx;
      currentSongRound = 0;
      updateScene();
      chromeIdleArmed = true;
      showControls();
      closeAsDockPanel();
      syncPlanetPickUi();
    }

    const closeAsDockPanel = (opts) => {
      const restoreCtl = !opts || opts.restoreCtl !== false;
      asDockPanelOpen = false;
      if (asFlyout) asFlyout.classList.remove('open');
      if (asBackdrop) asBackdrop.classList.remove('open');
      if (restoreCtl && ctlDock) ctlDock.classList.remove('hidden');
    };
    const openAsDockPanel = () => {
      asDockPanelOpen = true;
      if (asFlyout) asFlyout.classList.add('open');
      if (asBackdrop) asBackdrop.classList.add('open');
      if (ctlDock) ctlDock.classList.add('hidden');
    };

    if (ctlDock) {
      ctlDock.addEventListener('click', (e) => {
        e.stopPropagation();
        openAsDockPanel();
      });
    }
    if (asCtlHide) {
      asCtlHide.addEventListener('click', (e) => {
        e.stopPropagation();
        closeAsDockPanel();
      });
    }
    if (asBackdrop) {
      asBackdrop.addEventListener('click', () => closeAsDockPanel());
    }

    const pickList = $('asPlanetPickList');
    if (pickList) {
      planetData.forEach((p, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'as-planet-pick-btn';
        btn.setAttribute('role', 'option');
        btn.setAttribute('aria-selected', i === currentPlanetIndex ? 'true' : 'false');
        const ix = document.createElement('span');
        ix.className = 'as-planet-pick-idx';
        ix.textContent = String(i + 1);
        const nm = document.createElement('span');
        nm.className = 'as-planet-pick-name';
        nm.textContent = p.name;
        btn.appendChild(ix);
        btn.appendChild(nm);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          goToPlanetIndex(i);
        });
        pickList.appendChild(btn);
      });
      syncPlanetPickUi();
    }

    if (centerPlayBtn) {
      centerPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onCenterPlayClick();
        chromeIdleArmed = true;
        showControls();
      });
    }
    if (centerPrevBtn) {
      centerPrevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onPrevPlanetClick();
        chromeIdleArmed = true;
        showControls();
      });
    }
    if (centerNextBtn) {
      centerNextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onNextPlanetClick();
        chromeIdleArmed = true;
        showControls();
      });
    }
    if (flyoutSound) {
      flyoutSound.addEventListener('click', (e) => {
        e.stopPropagation();
        onFlyoutMuteClick();
      });
    }
    if (flyoutFs) {
      flyoutFs.addEventListener('click', (e) => {
        e.stopPropagation();
        const hostEl = root.host;
        const req = hostEl.requestFullscreen || hostEl.webkitRequestFullscreen;
        if (req) req.call(hostEl);
      });
    }

    const flashShare = (t) => {
      if (!shareBtn) return;
      const prevTitle = shareBtn.getAttribute('title') || 'Share';
      shareBtn.setAttribute('title', t || 'Share');
      setTimeout(() => shareBtn.setAttribute('title', prevTitle), 1700);
    };
    if (shareBtn) {
      shareBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        let url;
        const planetName = planetData[currentPlanetIndex].name;
        try {
          const u = new URL(window.top.location.href);
          u.searchParams.set('planet', planetName);
          url = u.toString();
        } catch (_) {
          try {
            const u = new URL(window.location.href);
            u.searchParams.set('planet', planetName);
            url = u.toString();
          } catch (_2) {
            url = window.location.href;
          }
        }
        try {
          if (typeof navigator.share === 'function') {
            await navigator.share({ title: document.title, url });
            flashShare('Copied · ok');
            return;
          }
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
        try {
          await navigator.clipboard.writeText(url);
          flashShare('Copied · link');
        } catch (_) {
          window.prompt('Copy this link:', url);
          flashShare('Copy link');
        }
      });
    }

    const planetCardToggle = $('asPlanetCardToggle');
    const planetCardToggleLbl = $('asPlanetCardToggleLbl');
    const planetInfoEl = $('planet-info');
    function syncPlanetPinUi() {
      if (!planetCardToggle || !planetInfoEl) return;
      const collapsed = planetInfoEl.classList.contains('planet-info--collapsed');
      const labelHide = 'Hide planet card';
      const labelShow = 'Show planet card';
      const t = collapsed ? labelShow : labelHide;
      planetCardToggle.setAttribute('aria-pressed', collapsed ? 'false' : 'true');
      planetCardToggle.setAttribute('aria-label', t);
      planetCardToggle.setAttribute('title', t);
      if (planetCardToggleLbl) planetCardToggleLbl.textContent = t;
    }
    if (planetCardToggle && planetInfoEl) {
      planetCardToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        planetInfoEl.classList.toggle('planet-info--collapsed');
        syncPlanetPinUi();
        chromeIdleArmed = true;
        showControls();
      });
      syncPlanetPinUi();
    }

    const coinImgForSpin = $('asteroidCoinImg');
    let accDeg = 0;
    const bumpCoinSpin = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!coinImgForSpin) return;
      accDeg += WBT_COIN.SPIN_DEG;
      coinImgForSpin.style.transition = `transform ${WBT_COIN.SPIN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
      coinImgForSpin.style.transform = `rotate(${accDeg}deg)`;
    };
    document.addEventListener('pointerdown', bumpCoinSpin, { capture: true });

    // Coin link
    const coin = $('asteroidHomeCoin');
    if (coin) {
      coin.addEventListener('click', (e) => {
        e.preventDefault();
        try { window.top.location.href = WBT_COIN.HOME_URL; }
        catch (_) { window.location.href = WBT_COIN.HOME_URL; }
      });
    }

    // ── Activity listeners (show controls + coin) ─────────────────────────────
    /** Planet card + coin + share/ctl visible on load; center stack only after first interaction. After arm, idle timer hides chrome. */
    function showControls() {
      const pi = $('planet-info');
      if (pi) {
        pi.style.opacity = '1';
        pi.style.visibility = 'visible';
      }
      root.host.classList.remove(CHROME_HIDDEN);
      if (coin) coin.classList.remove('hidden');
      if (shareBtn) shareBtn.classList.remove('hidden');
      if (!asDockPanelOpen && ctlDock) ctlDock.classList.remove('hidden');
      if (centerStack) {
        if (chromeIdleArmed) centerStack.classList.remove('hidden');
        else centerStack.classList.add('hidden');
      }
      clearTimeout(hideControlsTimeout);
      if (!chromeIdleArmed) return;
      hideControlsTimeout = setTimeout(() => {
        if (pi) {
          pi.style.opacity = '0';
          pi.style.visibility = 'hidden';
        }
        root.host.classList.add(CHROME_HIDDEN);
        if (coin) coin.classList.add('hidden');
        if (shareBtn) shareBtn.classList.add('hidden');
        if (ctlDock) ctlDock.classList.add('hidden');
        if (centerStack) centerStack.classList.add('hidden');
        closeAsDockPanel({ restoreCtl: false });
      }, WBT_COIN.HIDE_AFTER_MS);
    }

    const onChromeActivity = () => {
      chromeIdleArmed = true;
      showControls();
    };

    document.addEventListener('mousemove', onChromeActivity);
    document.addEventListener('pointerdown', onChromeActivity, { passive: true });
    document.addEventListener('touchstart', onChromeActivity, { passive: true });
    document.addEventListener('touchmove', onChromeActivity, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (e.defaultPrevented) return;
      const t = e.target;
      const tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onPrevPlanetClick();
        onChromeActivity();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNextPlanetClick();
        onChromeActivity();
      }
    });

    chromeIdleArmed = false;
    showControls();

    const syncAsViewport = () => {
      try {
        let h = 0;
        const vv = window.visualViewport;
        if (vv && vv.height) {
          h = Math.round(vv.height);
        }
        if (!h) {
          h = Math.round(
            window.innerHeight ||
            (document.documentElement && document.documentElement.clientHeight) ||
            600
          );
        }
        asHost.style.height = `${h}px`;
        asHost.style.minHeight = `${h}px`;
      } catch (_) { /* noop */ }
    };
    asHost._syncAsViewport = syncAsViewport;
    asHost._asOnOrientation = () => {
      setTimeout(syncAsViewport, 150);
    };
    syncAsViewport();
    window.addEventListener('resize', syncAsViewport);
    window.addEventListener('orientationchange', asHost._asOnOrientation);
    if (window.visualViewport) {
      try {
        window.visualViewport.addEventListener('resize', syncAsViewport);
      } catch (_) { /* noop */ }
    }

    // ── Boot ──────────────────────────────────────────────────────────────────
    updatePlanetCard(planetData[currentPlanetIndex]);
    initVideo(planetData[currentPlanetIndex]);
    syncPlayChrome();
    syncPlanetPickUi();
  }
}

customElements.define('custom-asteroidshow', AsteroidShow);
