/* The engine: Lozza, running in a Web Worker.
   Lozza is a UCI engine written in JavaScript by Colin Jenkins. Its releases 2 to 10 carry the GPLv3, so this game does NOT
   load a release. It loads the commit below, which is after the author's own "change to MIT lic" commit of 28 March 2026
   (df1e4f8), and pinned by full commit hash so what is served can never change under us.
   A worker must be same-origin, so a tiny Blob worker pulls the script in from the CDN with importScripts. */

export const LOZZA_URL = 'https://cdn.jsdelivr.net/gh/op12no2/lozza@35b11d6ba9f04af38f2af0b5853b6de1a7aef26d/lozza.js';
export const MATE = 100000;

const toCp = (kind, v) => (kind === 'mate' ? (v > 0 ? MATE - v : -MATE - v) : v);

export class Engine {
  constructor(url = LOZZA_URL) {
    this.url = url;
    this.w = null;
    this.queue = [];          // jobs waiting for their bestmove, in order
    this.cur = null;
    this.ready = null;
    this.waiter = null;
    this.dead = false;
  }

  start() {
    if (this.ready) return this.ready;
    this.ready = new Promise((resolve, reject) => {
      let blob;
      try {
        blob = URL.createObjectURL(new Blob([`importScripts(${JSON.stringify(this.url)});`], { type: 'text/javascript' }));
        this.w = new Worker(blob);
      } catch (e) { reject(e); return; }
      const t = setTimeout(() => reject(new Error('The engine took too long to start.')), 25000);
      this.w.onerror = e => { clearTimeout(t); this.fail = new Error(e.message || 'The engine could not start.'); reject(this.fail); this._flush(this.fail); };
      this.w.onmessage = e => { if (blob) { URL.revokeObjectURL(blob); blob = null; } this._line(String(e.data)); };
      this.waiter = line => { if (/^readyok/.test(line)) { clearTimeout(t); resolve(); return true; } return false; };
      this.w.postMessage('uci');
      this.w.postMessage('setoption name Hash value 16');
      this.w.postMessage('ucinewgame');
      this.w.postMessage('isready');
    });
    return this.ready;
  }

  newGame() { if (this.w) this.w.postMessage('ucinewgame'); }

  terminate() {
    this.dead = true;
    if (this.w) { try { this.w.terminate(); } catch (e) { } this.w = null; }
    this._flush(new Error('closed'));
  }

  _flush(err) { const q = this.queue.splice(0); if (this.cur) q.unshift(this.cur); this.cur = null; q.forEach(j => j.reject(err)); }

  _line(line) {
    if (this.waiter && this.waiter(line)) { this.waiter = null; return; }
    const job = this.cur || (this.cur = this.queue[0] || null);
    if (!job) return;
    if (line.startsWith('info ')) {
      if (/ upperbound| lowerbound/.test(line)) return;
      const t = line.split(/\s+/);
      const at = k => t.indexOf(k);
      const di = at('depth'), si = at('score'), pi = at('pv');
      if (di < 0 || si < 0) return;
      const depth = +t[di + 1];
      const mp = at('multipv') >= 0 ? +t[at('multipv') + 1] : 1;
      const cp = toCp(t[si + 1], +t[si + 2]);
      const move = pi >= 0 ? t[pi + 1] : null;
      if (depth > job.maxDepth) { job.maxDepth = depth; job.mpv = {}; }
      job.mpv[mp] = { move, cp };
      const nodes = at('nodes'); if (nodes >= 0) job.nodes = +t[nodes + 1];
    } else if (line.startsWith('bestmove')) {
      const best = line.split(/\s+/)[1] || null;
      this.queue.shift(); this.cur = null;
      const lines = Object.keys(job.mpv).map(Number).sort((a, b) => a - b).map(k => job.mpv[k]).filter(x => x.move);
      job.resolve({ best, cp: lines.length ? lines[0].cp : 0, depth: job.maxDepth, lines, nodes: job.nodes || 0 });
    }
  }

  /* jobs: [{ moves: ['e2e4', ...], depth, nodes?, multipv?, fen? }]. Every job is a search of the position reached from the start
     (or from fen) by those moves. They are sent in one go and answered in order, so there is no round trip between searches. */
  run(jobs) {
    if (this.dead || !this.w) return Promise.reject(new Error('closed'));
    return Promise.all(jobs.map(j => new Promise((resolve, reject) => {
      const job = { resolve, reject, maxDepth: 0, mpv: {}, nodes: 0 };
      this.queue.push(job);
      this.w.postMessage(`setoption name MultiPV value ${j.multipv || 1}`);
      this.w.postMessage(`position ${j.fen ? 'fen ' + j.fen : 'startpos'}${j.moves && j.moves.length ? ' moves ' + j.moves.join(' ') : ''}`);
      this.w.postMessage(`go depth ${Math.max(1, j.depth | 0)}${j.nodes ? ' nodes ' + j.nodes : ''}`);
    })));
  }
}
