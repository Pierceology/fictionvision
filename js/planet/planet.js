/* NAME THAT PLANET: twelve seconds of a song from PTU Radio, four planets, pick the one it came from.
   Thirteen rounds, one song from each station, in a shuffled order. The being from the right planet tells you how you did.
   Sound only after you press Play the clip, like everywhere on the site. The radio player goes quiet while you play. */
import { BEINGS, BY_ID } from '../chess/beings.js';
import { albums } from '../radio.js';
import { bus } from '../bus.js';

export const HOME = '#/games/name-that-planet';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const mp3 = u => `https://static.wixstatic.com/mp3/${u}.mp3`;
const store = {
  get(k, d) { try { const v = localStorage.getItem('fv.planet.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('fv.planet.' + k, JSON.stringify(v)); } catch (e) { } },
};
const CLIP = 12;
const HOST = BY_ID['prearth'];          // PTU Radio broadcasts from Prearth's crater: Rapour Riptalon hosts between rounds
const V = {
  'planet-zee': { right: ['Correct. Planet Zee. The slow one. You noticed.'], wrong: ['That was Planet Zee. Nothing on it hurries, including the song.'] },
  'yaaarghs-revenge': { right: ['Aye. Yaaargh\'s Revenge. Ye have an ear. I\'ll be takin it.'], wrong: ['That was Yaaargh\'s Revenge. The pirate station. Copied from a better one.'] },
  'oogh-iv': { right: ['Yes! OOGH-IV! Zug song! Zug clap!'], wrong: ['That was OOGH-IV. Zug station. Rocks and drums. Zug sad you miss.'] },
  'prearth': { right: ['Prearth. Right. The crater station. Loud, like me.'], wrong: ['That was Prearth. My station. The sky falls on the downbeat.'] },
  'that-other-planet': { right: ['Correct. That Other Planet. The licence fee is noted.'], wrong: ['That was That Other Planet. Corporate Frequency. Invoice to follow.'] },
  'figuria': { right: ['Figuria. Right. Action hero hits. Snap.'], wrong: ['That was Figuria. The hero music. Every part in place.'] },
  'dens-crevice': { right: ['Den\'s Crevice. Correct. The cave has acoustics.'], wrong: ['That was Den\'s Crevice. My cave. Crystal and fire.'] },
  'heliumdrum': { right: ['Oh! Heliumdrum. Yes. Softly, yes.'], wrong: ['That was Heliumdrum. Helium Heights. It floats, you see.'] },
  'washy-washy-ii': { right: ['Washy Washy II. Right. The back room has a jukebox.'], wrong: ['That was Washy Washy II. Puppet Master Mix. Ledgered.'] },
  'yarnia': { right: ['Yarnia, dear. Correct. Textile tunes.'], wrong: ['That was Yarnia, love. I will remember you missed it.'] },
  'hungary': { right: ['Hungary. Right. Fresh out of the oven.'], wrong: ['That was Hungary. Going stale while you guessed.'] },
  'guffaw-7': { right: ['Guffaw-7. Correct. The room laughed. Quietly.'], wrong: ['That was Guffaw-7. Tough room. Tougher ear.'] },
  'spee-ider-grove': { right: ['Spee-ider Grove. Right. Fast ears.'], wrong: ['That was Spee-ider Grove. The web hums in that key.'] },
};
const HOSTLINES = { greet: ['Thirteen songs, thirteen planets, one each. Press play. The sky can wait.', 'PTU Radio quiz. Twelve seconds a song. Pick the planet. Loud guesses count double. They do not.'], next: ['Next song. Claws on the dial.', 'Another station. Keep the beat.', 'Twelve seconds. Go.'], end: ['Thirteen done. The dial is yours.'] };

function planetOf(slug) { return (window.FV && window.FV.planets || []).find(p => p.slug === slug) || {}; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function pageHTML() {
  const best = store.get('best', null);
  return `<div class="page otb-page otb-table np-table" style="--bc:${HOST.color}">
    <div class="otb-head"><a class="back" href="#/games"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg><span>Games</span></a><span class="lvl" id="npLvl">Round 1 of 13</span></div>
    <div class="otb-grid">
      <section class="otb-talk" aria-label="The host"><div class="face"><img src="${HOST.face}" alt="${esc(HOST.name)}" width="360" height="351" decoding="async" id="npFace"></div>
        <div class="bubble" id="bubble"><span class="who" id="npWho">${esc(HOST.name)}</span><p id="say" aria-live="polite"></p><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></div></section>
      <section class="otb-boardcol">
        <div class="otb-strip opp"><span class="who">PTU Radio HQ</span><span class="tray np-score" id="score">0 right</span></div>
        <div class="otb-boardwrap np-stage" id="stage">
          <div class="np-dial" id="dial"><button class="cta np-play" type="button" id="btnPlay">Play the clip</button><div class="np-bar"><i id="bar"></i></div><span class="np-t" id="left">${CLIP}s</span></div>
          <div class="np-choices" id="choices"></div>
          <div class="np-reveal" id="reveal" hidden></div>
        </div>
        <div class="otb-strip me"><span class="who">You</span><span class="status" id="status" role="status"></span></div>
      </section>
      <aside class="otb-side"><div class="meta"><b>NAME THAT PLANET</b><span>Deck 12 · PTU Radio</span><span class="tg">Thirteen songs, one from every station. Twelve seconds each. Four planets to choose from.</span></div>
        <dl class="de-times" id="times"><div><dt>Your best</dt><dd>${best ? best + ' of 13' : 'Not yet'}</dd></div><div><dt>This round</dt><dd id="roundN">1 of 13</dd></div></dl>
        <div class="actions"><button class="ghost" type="button" id="btnNew">Start over</button></div></aside>
      <div class="otb-over" id="over" hidden role="region" aria-labelledby="overTitle"></div>
    </div></div>`;
}

class Quiz {
  constructor(root) {
    this.root = root; this.dead = false; this.timers = new Set(); this.said = [];
    root.innerHTML = pageHTML();
    const q = id => $('#' + id, root);
    this.el = { lvl: q('npLvl'), face: q('npFace'), who: q('npWho'), say: q('say'), bubble: q('bubble'), score: q('score'), play: q('btnPlay'), bar: q('bar'), left: q('left'), choices: q('choices'), reveal: q('reveal'), status: q('status'), roundN: q('roundN'), over: q('over'), neu: q('btnNew') };
    this.audio = new Audio(); this.audio.preload = 'auto';
    this.bind(); this.newGame();
    document.title = 'NAME THAT PLANET · FictionVision';
    window.__np = this.handle();
  }
  later(fn, ms) { const t = setTimeout(() => { this.timers.delete(t); if (!this.dead) fn(); }, ms); this.timers.add(t); return t; }
  say(who, text, kind = '') { const e = this.el; e.face.src = who.face; e.face.alt = who.name; e.who.textContent = who.name; this.root.firstElementChild.style.setProperty('--bc', who.color); e.say.textContent = text; e.bubble.dataset.kind = kind; e.bubble.classList.remove('pop'); void e.bubble.offsetWidth; e.bubble.classList.add('pop'); const fc = $('.otb-talk .face', this.root); if (fc) { fc.classList.remove('bump'); void fc.offsetWidth; fc.classList.add('bump'); } this.said.push({ who: who.id, text }); }
  host(kind) { const L = HOSTLINES[kind]; this.say(HOST, L[Math.floor(Math.random() * L.length)], kind); }
  newGame() {
    this.stop();
    this.order = shuffle(albums.map(a => a.slug)); this.k = 0; this.right = 0; this.answered = false; this.over = false;
    this.el.over.hidden = true; this.el.score.textContent = '0 right';
    this.host('greet'); this.round();
  }
  round() {
    this.answered = false; this.stop();
    const slug = this.order[this.k]; const album = albums.find(a => a.slug === slug); const t = album.tracks[Math.floor(Math.random() * album.tracks.length)];
    this.cur = { slug, album, track: t, start: Math.max(0, Math.min((t.d || 120) - CLIP - 2, Math.round((t.d || 120) * (0.25 + Math.random() * 0.4)))) };
    this.audio.src = mp3(t.u); this.audio.load();
    const others = shuffle(albums.filter(a => a.slug !== slug).map(a => a.slug)).slice(0, 3);
    const opts = shuffle([slug, ...others]);
    this.el.choices.innerHTML = opts.map(s => { const p = planetOf(s); return `<button type="button" class="np-opt" data-slug="${s}"><img src="${p.mark || ''}" alt=""><span>${esc(p.name || s)}</span></button>`; }).join('');
    this.el.lvl.textContent = `Round ${this.k + 1} of 13`; this.el.roundN.textContent = `${this.k + 1} of 13`;
    this.el.reveal.hidden = true; this.el.play.disabled = false; this.el.play.textContent = 'Play the clip'; this.el.left.textContent = CLIP + 's'; this.el.bar.style.width = '0%'; this.el.status.textContent = '';
  }
  play() {
    const a = this.audio, c = this.cur; if (!c) return;
    bus.claim('quiz');
    try { a.currentTime = c.start; } catch (e) { }
    a.volume = 0.9; a.play().catch(() => { this.el.status.textContent = 'The song did not arrive. Try the clip again.'; });
    this.el.play.textContent = 'Playing'; this.el.play.disabled = true;
    const t0 = performance.now();
    const tick = () => { if (this.dead) return; const s = (performance.now() - t0) / 1000; this.el.bar.style.width = Math.min(100, s / CLIP * 100) + '%'; this.el.left.textContent = Math.max(0, Math.ceil(CLIP - s)) + 's'; if (s >= CLIP) { this.stop(); this.el.play.textContent = 'Play it again'; this.el.play.disabled = false; return; } this.raf = requestAnimationFrame(tick); };
    this.raf = requestAnimationFrame(tick);
  }
  stop() { cancelAnimationFrame(this.raf); try { this.audio.pause(); } catch (e) { } bus.release('quiz'); }
  answer(slug) {
    if (this.answered || this.over) return; this.answered = true; this.stop();
    const ok = slug === this.cur.slug, being = BY_ID[this.cur.slug], p = planetOf(this.cur.slug);
    if (ok) this.right++;
    document.dispatchEvent(new CustomEvent('fv:sfx', { detail: ok ? { kind: 'win' } : { kind: 'lose' } }));
    this.el.score.textContent = `${this.right} right`;
    [...this.el.choices.children].forEach(b => { b.disabled = true; if (b.dataset.slug === this.cur.slug) b.classList.add('yes'); else if (b.dataset.slug === slug) b.classList.add('no'); });
    this.say(being, (V[this.cur.slug] || {})[ok ? 'right' : 'wrong'][0], ok ? 'win' : 'lose');
    const last = this.k >= 12;
    this.el.reveal.innerHTML = `<img src="${p.mark || ''}" alt=""><div><span class="kicker">${ok ? 'Right' : 'That was'}</span><b>${esc(p.name)}</b><small>${esc(this.cur.track.t)} · ${esc(this.cur.album.station.replace(/\s+-\s+/, ' · '))}</small></div><button class="cta" type="button" id="btnNext">${last ? 'See the score' : 'Next song'}</button>`;
    this.el.reveal.hidden = false; this.el.play.disabled = false; this.el.play.textContent = 'Play it again';
    $('#btnNext', this.el.reveal).addEventListener('click', () => { if (last) this.finish(); else { this.k++; this.host('next'); this.round(); } });
    $('#btnNext', this.el.reveal).focus({ preventScroll: true });
  }
  finish() {
    this.over = true; this.stop();
    const n = this.right, best = store.get('best', 0); const improved = n > best; if (improved) store.set('best', n);
    $('#times dd', this.root).textContent = Math.max(n, best) + ' of 13';
    this.host('end');
    const verdict = n === 13 ? 'Every station. You could run Deck 12.' : n >= 10 ? 'That is a regular listener.' : n >= 6 ? 'Half the dial. The other half is waiting.' : 'The dial won. It usually does the first time.';
    this.el.over.innerHTML = `<div class="ov-card" data-kind="${n >= 7 ? 'win' : 'loss'}"><span class="kicker">PTU Radio</span><h2 id="overTitle">${n} of 13.</h2><p>${esc(verdict)}${improved ? ' Your best.' : ''}</p>
      <div class="btns"><button class="cta" type="button" id="ovAgain">Play again</button><a class="ghost" href="#/music">Open PTU Radio HQ</a><a class="ghost" href="#/games">All games</a></div></div>`;
    this.el.over.hidden = false; $('#ovAgain', this.el.over).addEventListener('click', () => this.newGame());
    const r = this.el.over.getBoundingClientRect(); if (r.bottom > innerHeight || r.top < 0) this.el.over.scrollIntoView({ block: 'nearest', behavior: calm() ? 'auto' : 'smooth' });
  }
  bind() {
    this.el.play.addEventListener('click', () => this.play());
    this.el.choices.addEventListener('click', e => { const b = e.target.closest('.np-opt'); if (b) this.answer(b.dataset.slug); });
    this.el.neu.addEventListener('click', () => this.newGame());
    this.onVis = () => { if (document.hidden) this.stop(); }; document.addEventListener('visibilitychange', this.onVis);
  }
  handle() { const t = this; return { get round() { return t.k; }, get right() { return t.right; }, get current() { return t.cur && t.cur.slug; }, get choices() { return [...t.el.choices.children].map(b => b.dataset.slug); }, get bubble() { return t.el.say.textContent; }, answer(s) { t.answer(s); }, next() { const b = $('#btnNext', t.el.reveal); if (b) b.click(); } }; }
  destroy() { this.dead = true; this.stop(); this.timers.forEach(t => clearTimeout(t)); document.removeEventListener('visibilitychange', this.onVis); try { this.audio.removeAttribute('src'); this.audio.load(); } catch (e) { } if (window.__np) delete window.__np; }
}

export function mount(root) { const q = new Quiz(root); return () => q.destroy(); }
