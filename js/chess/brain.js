/* The brain: turns a being's play style into a move.
   The engine says how good each candidate move is. The style only chooses among moves that are close enough in value,
   so a being plays like itself without ever making a move no person would make.
   Order of play: opening shelf, then a quick look, then the being's mood for this move, then a search, then the style picks. */
import { MATE } from './engine.js';

const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const strip = s => s.replace(/[+#!?]/g, '');
const key = m => m.from + m.to + (m.promotion || '');
export const mirrorSq = sq => sq[0] + (9 - +sq[1]);

export class Brain {
  constructor(being, engine, Chess) {
    this.b = being; this.engine = engine; this.Chess = Chess;
    this.reset();
  }

  reset() {
    this.S = { bookLine: null, expect: null, grudge: null, fired: new Set(), resignRun: 0, evalCp: 0, plies: 0, newGrudge: false };
  }

  /* -------------------------------------------------------------- the opening shelf */
  book(color, sanHist) {
    const lines = (this.b.openings && this.b.openings[color === 'w' ? 'white' : 'black']) || [];
    const fits = l => { const a = l.split(' '); return a.length > sanHist.length && sanHist.every((s, i) => strip(s) === strip(a[i])); };
    let line = this.S.bookLine && fits(this.S.bookLine) ? this.S.bookLine : null;
    if (!line) {
      const ok = lines.filter(fits);
      if (!ok.length) return null;
      line = ok[Math.floor(Math.random() * ok.length)];
    }
    this.S.bookLine = line;
    return line.split(' ')[sanHist.length];
  }

  /* game: the live chess.js game; uci: the moves so far as e2e4 strings.
     Returns { move, kind, evalCp, event, info } or { resign: true } */
  async choose(game, uci, startFen = null) {
    const b = this.b, st = b.style, S = this.S;
    const color = game.turn(), opp = color === 'w' ? 'b' : 'w';
    const g = new this.Chess(game.fen());
    const legal = g.moves({ verbose: true });
    const hist = game.history({ verbose: true });
    const moveNo = Math.floor(hist.length / 2) + 1;
    S.plies++;

    if (legal.length === 1) return { move: legal[0], kind: 'only', evalCp: S.evalCp };

    // 1. the opening shelf
    const san = startFen ? null : this.book(color, hist.map(m => m.san));
    if (san) {
      const m = legal.find(x => strip(x.san) === strip(san));
      if (m) return { move: m, kind: 'book', evalCp: S.evalCp };
      S.bookLine = null;
    }

    // 2. the grudge: follow the piece that took one of ours
    if (st.grudge) {
      const last = hist[hist.length - 1];
      if (last && last.captured && last.color === opp) { S.grudge = last.to; S.newGrudge = true; }
      else if (last && S.grudge && last.from === S.grudge) S.grudge = last.to;
      if (S.grudge) { const p = g.get(S.grudge); if (!p || p.color !== opp) S.grudge = null; }
    }

    // 3. a quick look, to know how the game stands and whether you just slipped
    const [quick] = await this.engine.run([{ moves: uci, fen: startFen, depth: Math.min(4, Math.max(2, st.look)) }]);
    const ctx = { moveNo, plies: S.plies, evalCp: quick.cp, blunder: false, swing: 0 };
    if (S.expect != null && Math.abs(quick.cp) < MATE / 2 && Math.abs(S.expect) < MATE / 2) { ctx.swing = quick.cp - S.expect; ctx.blunder = ctx.swing >= 200; }

    // 4. the being's mood for this move
    let P = { look: st.look, root: st.root || 0, nodes: st.nodes || 0, trust: st.trust, slop: st.slop, temp: st.temp, agg: st.agg || 0, event: null };
    const o = st.adjust ? st.adjust(ctx) : null;
    if (o) P = { ...P, ...o };

    // 5. search, and score the candidates
    const cands = await this._probe(g, legal, uci, P, startFen);
    const evalNow = Math.max(...cands.map(c => c.s));
    S.evalCp = evalNow;

    // 6. resign?
    if (st.resign) {
      const [cp, runLen, after] = st.resign;
      if (moveNo >= after && evalNow <= cp) S.resignRun++; else S.resignRun = 0;
      if (S.resignRun >= runLen) return { resign: true, kind: 'resign', evalCp: evalNow };
    }

    // 7. the style picks. A copycat plays your last move back at you if it can do that without losing the game;
    //    failing that, it steals the idea from the move before, one move late.
    let pick = null, copied = false;
    if (st.mirror) {
      const best = Math.max(...cands.map(c => c.s));
      for (const h of [hist[hist.length - 1], hist[hist.length - 3]]) {
        if (!h) continue;
        const from = mirrorSq(h.from), to = mirrorSq(h.to);
        const c = cands.find(x => x.mv.from === from && x.mv.to === to && (!x.mv.promotion || x.mv.promotion === 'q'));
        if (c && c.s >= best - st.mirror) { pick = c; copied = true; break; }
      }
    }
    if (!pick) {
      for (const c of cands) c.bonus = this._bonus(g, c.mv, P, st, color, opp);
      pick = this._pick(cands, P);
    }
    S.expect = pick.s;

    let event = null;
    const fire = e => { if (e && b.lines.event && !S.fired.has(e)) { S.fired.add(e); event = e; } };
    fire(P.event);
    if (!event && S.newGrudge && S.grudge) fire('grudge');
    S.newGrudge = false;
    if (!event && st.eventOn === 'sac' && pick.s < evalNow - 50 && (pick.mv.captured || pick.mv.san.includes('+'))) fire('sac');
    if (!event && st.eventOn === 'trade' && pick.mv.captured && pick.bonus >= 50) fire('trade');
    return { move: pick.mv, kind: copied ? 'mirror' : 'search', evalCp: evalNow, event, swing: ctx.swing, info: { look: P.look, root: P.root, lost: evalNow - pick.s } };
  }

  /* Score the candidates. Returns [{mv, s}] with s the value for the side to move, in centipawns. */
  async _probe(g, legal, uci, P, startFen) {
    const out = new Map();
    // a being never plays into a mate in one, whatever its depth: no person would
    const outcome = m => {
      g.move(m);
      const r = g.isCheckmate() ? 'mate' : (g.isDraw() || g.isStalemate()) ? 'draw' : g.moves({ verbose: true }).some(x => x.san.endsWith('#')) ? 'walks into mate' : null;
      g.undo(); return r;
    };
    let pool = legal, rootBest = null;
    if (P.root > 0) {
      // search the whole position first: its best moves are the candidates worth weighing
      const [root] = await this.engine.run([{ moves: uci, fen: startFen, depth: P.root, nodes: P.nodes, multipv: 4 }]);
      rootBest = root.best;
      const keep = new Set([root.best, ...root.lines.map(l => l.move)].filter(Boolean));
      legal.filter(m => m.captured || m.san.includes('+') || m.promotion)
        .sort((a, c) => (VAL[c.captured] || 0) - (VAL[a.captured] || 0)).slice(0, P.look >= 5 ? 2 : 6).forEach(m => keep.add(key(m)));
      pool = legal.filter(m => keep.has(key(m)));
      if (!pool.length) pool = legal.slice(0, 1);
    }
    const sub = Math.max(1, P.look);
    const jobs = [], jobFor = [];
    for (const m of pool) {
      const o = outcome(m);
      if (o === 'mate') { out.set(key(m), { mv: m, s: MATE }); continue; }
      if (o === 'draw') { out.set(key(m), { mv: m, s: 0 }); continue; }
      if (o === 'walks into mate') { out.set(key(m), { mv: m, s: -MATE + 1 }); continue; }
      jobs.push({ moves: [...uci, key(m)], fen: startFen, depth: sub, nodes: sub >= 5 ? 40000 : 0 });
      jobFor.push(m);
    }
    const res = jobs.length ? await this.engine.run(jobs) : [];
    res.forEach((r, i) => out.set(key(jobFor[i]), { mv: jobFor[i], s: -r.cp }));
    if (rootBest && out.has(rootBest)) out.get(rootBest).s += (P.trust != null ? P.trust : Math.round(P.slop * 0.6));   // trust the deep search: only a clearly better shallow score overrides it
    return [...out.values()];
  }

  _bonus(g, m, P, st, color, opp) {
    let b = 0;
    const cap = !!m.captured, chk = m.san.includes('+') || m.san.includes('#');
    const agg = P.agg || 0;
    if (agg) b += agg * ((cap ? 38 + (VAL[m.captured] || 0) / 20 : 0) + (chk ? 34 : 0) + (m.promotion ? 50 : 0));
    if (st.trade || st.safe || (st.grudge && this.S.grudge)) {
      g.move(m);
      if (st.trade && cap && g.isAttacked(m.to, opp) && (VAL[m.captured] || 0) >= VAL[m.piece] * 0.7) b += st.trade;
      if (st.safe) {
        let exposed = 0;
        for (const row of g.board()) for (const sq of row) if (sq && sq.color === color && sq.type !== 'k' && sq.type !== 'p' && g.isAttacked(sq.square, opp)) exposed++;
        b -= st.safe * exposed;
      }
      if (st.grudge && this.S.grudge) {
        if (m.to === this.S.grudge) b += st.grudge * 1.4;
        else if (g.isAttacked(this.S.grudge, color)) b += st.grudge;
      }
      g.undo();
    }
    if (st.push && m.piece === 'p') b += st.push * (color === 'w' ? +m.to[1] - 2 : 7 - +m.to[1]) / 4;
    return b;
  }

  _pick(cands, P) {
    const forced = cands.find(c => c.s >= MATE - 5);
    if (forced) return forced;
    const best = Math.max(...cands.map(c => c.s));
    let pool = cands.filter(c => c.s >= best - P.slop && c.s > -MATE / 2);
    if (!pool.length) pool = cands.filter(c => c.s === best);
    if (!P.temp) return pool.reduce((a, c) => (c.s + c.bonus > a.s + a.bonus ? c : a));
    const w = pool.map(c => Math.exp((c.s - best + c.bonus) / P.temp));
    const sum = w.reduce((a, x) => a + x, 0);
    let r = Math.random() * sum;
    for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }
}
