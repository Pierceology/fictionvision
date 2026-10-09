/* OVER THE BOARD: the thirteen beings, in canon order (PTU Radio order, 12A to 12M), easiest to hardest.
   Each one has a face (its Review Crew member), a play style made of engine settings, an opening shelf, and a voice.
   Lines are written for the beings, not generated. {piece} is replaced with the piece that was taken.
   Line kinds: greet, think (thinking aloud), capture (it takes), lose (it loses a piece), check (it gives check), checked (you give check),
   win (it mates you), lost (you mate it), resign (it resigns), taken (you resign), draw, and event (its own moment: panic, fire, grudge...).
   Play styles are proposals taken from the canon notes and need Pierce's yes.

   style:  look     how many plies it looks ahead after each candidate move (the real strength dial)
           root     depth of a full search of the position first (0 = none, it weighs every legal move instead)
           nodes    optional ceiling on that search, so a phone never waits long
           trust    centipawns of credit the deep search's choice gets over the shallow scoring (default 0.6 x slop)
           slop     how many centipawns worse than its best move it is willing to play
           temp     how loosely it chooses inside that margin (0 = always the move it likes most)
           agg      -1 hates captures and checks, +1 loves them (only ever among moves inside the margin)
           trade    bonus (or penalty) for an even exchange
           push     bonus for pawn pushes
           safe     penalty for each of its own pieces left where it can be taken
           mirror   plays your last move back at you, flipped across the board, if that costs no more than this many centipawns
           grudge   bonus for going after the piece that took one of its own
           think    least number of milliseconds it "thinks" before it moves
           talk     how often it comments on an ordinary move
           resign   [centipawns, own turns in a row, not before move] or null
           adjust   (c) => overrides for this move: {look, root, slop, temp, agg, event}
           eventOn  'sac' or 'trade': says its event line the first time it plays that kind of move
*/

import { LINES } from './lines.js';

export const PIECE_NAME = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };

export const BEINGS = [
  {
    id: 'planet-zee', n: 1, species: 'ZEEOMBIES', planet: 'Planet Zee', name: 'Ledger DeMort', robot: 'Archive-7',
    face: 'img/crew/ledger-de-mort.webp', mark: 'img/mark/planet-zee.png', color: '#9ad06a',
    tag: 'Never hurries, never trades. Waits for you to slip.',
    style: { look: 1, root: 0, slop: 270, temp: 120, agg: -0.5, trade: -50, think: 1500, talk: 0.55, resign: [-900, 2, 14] },
    openings: {
      black: [
        'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5 Ng3 Bg6 h4 h6 Nf3 Nd7',
        'e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2 c5',
        'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 Nbd7',
        'd4 d5 c4 c6 Nf3 Nf6 Nc3 e6 e3 Nbd7',
        'c4 e6 Nc3 d5 d4 Nf6 Bg5 Be7',
        'Nf3 d5 g3 Nf6 Bg2 e6 O-O Be7 d3 O-O',
      ],
      white: ['Nf3 d5 g3 Nf6 Bg2 e6 O-O Be7 d3 O-O Nbd2 c5', 'c4 e6 Nc3 d5 d4 Nf6 Bg5 Be7 e3 O-O Nf3 h6'],
    },
    lines: { ...LINES['planet-zee'] },
  },
  {
    id: 'yaaarghs-revenge', n: 2, species: 'COPYCATS', planet: "Yaaargh's Revenge", name: 'Calico Jack', robot: 'Trust-Earned',
    face: 'img/crew/calico-jack.webp', mark: 'img/mark/yaaarghs-revenge.png', color: '#e0453a',
    tag: 'Plays your last move back at you whenever it can.',
    style: { look: 1, root: 0, slop: 220, temp: 85, agg: 0, mirror: 130, think: 1000, talk: 0.5, resign: [-900, 2, 14] },
    openings: {
      black: ['e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5', 'Nf3 Nf6 c4 c5 Nc3 Nc6 g3 g6', 'Nf3 Nf6 g3 g6 Bg2 Bg7 O-O O-O'],
      white: ['e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6 d4 exd4 cxd4 Bb4+'],
    },
    lines: { ...LINES['yaaarghs-revenge'] },
  },
  {
    id: 'oogh-iv', n: 3, species: 'STONERS', planet: 'OOGH-IV', name: 'Zug', robot: 'Joy-Metric-3',
    face: 'img/crew/zug.webp', mark: 'img/mark/oogh-iv.png', color: '#c98a3c',
    tag: 'Grabs anything shiny. Comes apart around move eleven.',
    style: {
      look: 2, root: 0, slop: 170, temp: 65, agg: 0.5, think: 900, talk: 0.55, resign: null,
      adjust: c => (c.moveNo >= 11 ? { look: 1, temp: 90, slop: 220, event: 'panic' } : null),
    },
    openings: {
      black: [
        'e4 d5 exd5 Qxd5 Nc3 Qa5 d4 Nf6 Nf3 c6 Bc4 Bf5',
        'd4 d5 c4 dxc4 Nf3 Nf6 e3 e6 Bxc4 c5 O-O a6',
        'e4 e5 f4 exf4 Nf3 g5 h4 g4 Ne5 Nf6',
      ],
      white: ['e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7'],
    },
    lines: { ...LINES['oogh-iv'], event: ['Eleven. Zug not like eleven. Zug remember fire.'] },
  },
  {
    id: 'prearth', n: 4, species: 'APTORS', planet: 'Prearth', name: 'Rapour Riptalon', robot: 'Wind-Scale-1',
    face: 'img/crew/rapour-riptalon.webp', mark: 'img/mark/prearth.png', color: '#ff7a2e',
    tag: 'All attack. Throws pieces at you. The sky is falling anyway.',
    style: { look: 2, root: 0, slop: 200, temp: 85, agg: 1, eventOn: 'sac', think: 800, talk: 0.5, resign: [-1100, 3, 20] },
    openings: {
      black: [
        'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6',
        'd4 Nf6 c4 c5 d5 b5 cxb5 a6 bxa6 Bxa6 Nc3 d6',
        'c4 e5 Nc3 Nf6 Nf3 Nc6 g3 d5 cxd5 Nxd5 Bg2 Nb6',
        'Nf3 f5 d4 Nf6 g3 e6 Bg2 Be7 O-O O-O',
      ],
      white: ['e4 e5 f4 exf4 Nf3 g5 h4 g4 Ne5 Nf6 Bc4 d5 exd5 Bd6'],
    },
    lines: { ...LINES['prearth'], event: ["I gave you that on purpose. The rock's coming anyway. Keep it."] },
  },
  {
    id: 'that-other-planet', n: 5, species: 'CAPITOLS', planet: 'That Other Planet', name: 'Unit 7', robot: 'Efficiency-Node',
    face: 'img/crew/unit-7.webp', mark: 'img/mark/that-other-planet.png', color: '#7fd0ff',
    tag: 'Calm and exact. Explains every move, then sends a bill.',
    style: { look: 2, root: 0, slop: 120, temp: 42, agg: 0, think: 1300, talk: 0.6, resign: [-800, 2, 18] },
    openings: {
      black: [
        'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Nb8',
        'd4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5',
        'c4 Nf6 Nc3 e6 Nf3 d5 d4 Be7 Bg5 O-O',
        'Nf3 Nf6 c4 e6 Nc3 d5 d4 Be7 Bf4 O-O',
      ],
      white: ['d4 Nf6 c4 e6 Nc3 Bb4 e3 O-O Bd3 d5 Nf3 c5', 'e4 e5 Nf3 Nc6 Bb5 a6 Ba4 Nf6 O-O Be7 Re1 b5 Bb3 d6 c3 O-O h3 Nb8'],
    },
    lines: { ...LINES['that-other-planet'] },
  },
  {
    id: 'figuria', n: 6, species: 'FIGURIANS', planet: 'Figuria', name: 'Stu', robot: 'Modular-Integrity',
    face: 'img/crew/stu.webp', mark: 'img/mark/figuria.png', color: '#38c7a0',
    tag: 'Trades pieces like limbs and keeps pushing pawns.',
    style: { look: 3, root: 0, slop: 175, temp: 68, agg: 0.3, trade: 55, push: 22, think: 900, talk: 0.5, resign: [-900, 3, 20] },
    openings: {
      black: [
        'e4 e6 d4 d5 exd5 exd5 Nf3 Nf6 Bd3 Bd6 O-O O-O',
        'd4 d5 c4 e6 cxd5 exd5 Nc3 Nf6 Bg5 Be7',
        'e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3 Qb6 a3 Nh6',
        'c4 e5 Nc3 Nf6 Nf3 Nc6 e4 Bb4 Nd5 Nxd5 cxd5 Nd4',
      ],
      white: ['d4 d5 c4 e6 Nc3 Nf6 cxd5 exd5 Bg5 Be7'],
    },
    lines: { ...LINES['figuria'] },
  },
  {
    id: 'dens-crevice', n: 7, species: 'DRAGOONS', planet: "Den's Crevice", name: 'Ignis Ignitus', robot: 'Opulence-Scan',
    face: 'img/crew/ignis-ignitus.webp', mark: 'img/mark/dens-crevice.png', color: '#ff5a1f',
    tag: 'Loud opening. Falls apart against a quiet defense.',
    style: {
      look: 3, root: 0, slop: 135, temp: 50, agg: 1, think: 800, talk: 0.55, resign: null,
      adjust: c => (c.moveNo <= 13 ? { agg: 1.2, slop: 165 } : (c.evalCp < -60 ? { agg: -0.3, look: 2, root: 0, slop: 150, temp: 60, event: 'fire' } : null)),
    },
    openings: {
      black: [
        'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6 Be3 Bg7 f3 O-O Qd2 Nc6',
        'd4 Nf6 c4 g6 Nc3 Bg7 e4 d6 Nf3 O-O Be2 e5',
        'c4 Nf6 Nc3 g6 e4 d6 d4 Bg7 Nf3 O-O Be2 e5',
        'Nf3 Nf6 g3 g6 Bg2 Bg7 O-O O-O d3 d6 Nbd2 Nc6',
      ],
      white: ['e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6'],
    },
    lines: { ...LINES['dens-crevice'], event: ["Where did my fire go? Don't answer that."] },
  },
  {
    id: 'heliumdrum', n: 8, species: 'POPPIES', planet: 'Heliumdrum', name: 'Patch Adams (No relation)', short: 'Patch', robot: 'Seal-Integrity',
    face: 'img/crew/patch-adams.webp', mark: 'img/mark/heliumdrum.png', color: '#7aa7ff',
    tag: 'Keeps everything away from anything sharp.',
    style: { look: 3, root: 0, slop: 110, temp: 38, agg: -0.5, safe: 40, think: 1000, talk: 0.55, resign: [-800, 2, 18] },
    openings: {
      black: [
        'e4 e5 Nf3 Nf6 Nxe5 d6 Nf3 Nxe4 d4 d5 Bd3 Nc6 O-O Be7',
        'd4 d5 Nf3 Nf6 e3 e6 Bd3 c5 c3 Nc6 Nbd2 Bd6',
        'e4 e5 Nf3 d6 d4 Nf6 Nc3 Nbd7 Bc4 Be7 O-O O-O',
        'c4 e6 Nf3 d5 g3 Nf6 Bg2 Be7 O-O O-O',
      ],
      white: ['d4 d5 Nf3 Nf6 e3 e6 Bd3 c5 c3 Nc6 Nbd2 Bd6 O-O O-O', 'e4 e5 Nf3 Nf6 d4 Nxe4 Bd3 d5 Nxe5 Nd7'],
    },
    lines: { ...LINES['heliumdrum'] },
  },
  {
    id: 'washy-washy-ii', n: 9, species: 'STRINGERS', planet: 'Washy Washy II', name: 'Argyle', robot: 'Backdoor-Scout',
    face: 'img/crew/argyle.webp', mark: 'img/mark/washy-washy-ii.png', color: '#ff5fa8',
    tag: 'Street fighter. Trades down and keeps score.',
    style: { look: 3, root: 0, slop: 70, temp: 22, agg: 0.6, trade: 60, eventOn: 'trade', think: 900, talk: 0.5, resign: [-900, 3, 22] },
    openings: {
      black: [
        'e4 c5 Nf3 Nc6 d4 cxd4 Nxd4 Nf6 Nc3 e5 Ndb5 d6 Bg5 a6 Na3 b5',
        'e4 e5 Nf3 Nc6 d4 exd4 Nxd4 Nf6 Nxc6 bxc6 e5 Qe7 Qe2 Nd5',
        'd4 Nf6 c4 e6 Nc3 Bb4 Qc2 O-O a3 Bxc3+ Qxc3 b6',
        'c4 e5 Nc3 Nf6 Nf3 Nc6 e3 Bb4 Qc2 Bxc3 bxc3 d6',
      ],
      white: ['f4 d5 Nf3 Nf6 e3 g6 Be2 Bg7 O-O O-O d3 c5'],
    },
    lines: { ...LINES['washy-washy-ii'], event: ["Even trade. Let's keep going until it hurts."] },
  },
  {
    id: 'yarnia', n: 10, species: 'YARNIANS', planet: 'Yarnia', name: 'Bobbin Goodstitch', short: 'Bobbin', robot: 'Symmetry-Unit',
    face: 'img/crew/bobbin-goodstitch.webp', mark: 'img/mark/yarnia.png', color: '#6fdc7a',
    tag: 'Never forgets which piece took one of hers.',
    style: { look: 4, root: 0, slop: 60, temp: 20, agg: 0, grudge: 70, think: 1100, talk: 0.5, resign: [-900, 3, 22] },
    openings: {
      black: [
        'e4 d6 d4 Nf6 Nc3 g6 Nf3 Bg7 Be2 O-O O-O c6',
        'd4 Nf6 c4 g6 Nc3 d5 cxd5 Nxd5 e4 Nxc3 bxc3 Bg7',
        'c4 c5 Nf3 Nf6 Nc3 e6 g3 b6 Bg2 Bb7',
        'Nf3 g6 e4 Bg7 d4 d6 Nc3 Nf6 Be2 O-O',
      ],
      white: ['e4 e5 Nf3 Nc6 Bb5 Nf6 O-O Nxe4 d4 Nd6 Bxc6 dxc6 dxe5 Nf5'],
    },
    lines: { ...LINES['yarnia'], event: ["That piece took mine. I haven't forgotten it."] },
  },
  {
    id: 'hungary', n: 11, species: 'HUNGARIANS', planet: 'Hungary', name: "Chip O'Block", short: 'Chip', robot: 'Ingredient-Array',
    face: 'img/crew/chip-o-block.webp', mark: 'img/mark/hungary.png', color: '#ffc84a',
    tag: 'Starts sharp. Spoils the longer you wait.',
    style: {
      look: 5, root: 7, nodes: 60000, slop: 30, temp: 6, agg: 0, think: 700, talk: 0.5, resign: [-900, 3, 24],
      adjust: c => {
        const k = Math.max(0, c.moveNo - 24);              // fresh for twenty-four moves, then it turns
        if (!k) return null;
        const root = Math.max(2, 7 - Math.floor(k / 5)), look = Math.max(2, 5 - Math.floor(k / 10));
        return { root, look, slop: 30 + k * 6, temp: 6 + k * 3, event: k >= 8 ? 'spoil' : null };
      },
    },
    openings: {
      black: [
        'e4 e5 Nf3 Nc6 Bc4 Be7 d4 d6 Nc3 Nf6 O-O O-O',
        'd4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6',
        'c4 e5 Nc3 Nf6 g3 d5 cxd5 Nxd5 Bg2 Nb6',
        'Nf3 d5 d4 Nf6 c4 e6 Nc3 Be7 Bg5 O-O',
      ],
      white: ['d4 d5 c4 e6 Nc3 Nf6 Bg5 Be7 e3 O-O Nf3 h6 Bh4 b6'],
    },
    lines: { ...LINES['hungary'], event: ["I don't feel fresh. I think I'm starting to turn."] },
  },
  {
    id: 'guffaw-7', n: 12, species: 'COMEDIUMS', planet: 'Guffaw-7', name: 'Finn Heckleberry', short: 'Finn', robot: 'Cliché-Detector',
    face: 'img/crew/finn-heckleberry.webp', mark: 'img/mark/guffaw-7.png', color: '#ff6b5b',
    tag: 'Talks through every move. Blunder once and the room turns.',
    style: {
      look: 5, root: 9, nodes: 110000, trust: 25, slop: 22, temp: 4, agg: 0.2, think: 800, talk: 1, resign: [-1000, 3, 26],
      adjust: c => (c.blunder ? { root: 10, slop: 10, temp: 0, event: 'room' } : null),
    },
    openings: {
      black: [
        'e4 b6 d4 Bb7 Bd3 e6 Nf3 Nf6 Nbd2 c5',
        'e4 a6 d4 b5 Nf3 Bb7 Bd3 e6 O-O Nf6',
        'd4 e5 dxe5 Nc6 Nf3 Qe7 Bf4 Qb4+ Bd2 Qxb2 Bc3 Bb4 Qd2 Bxc3 Nxc3 Nf6',
      ],
      white: ['b3 e5 Bb2 Nc6 e3 d5 Bb5 Bd6 Ne2 Nge7'],
    },
    lines: { ...LINES['guffaw-7'], event: ['Oh, you blew that one. And the whole room saw. Let me work with that.'] },
  },
  {
    id: 'spee-ider-grove', n: 13, species: 'TIKATIKATIKAS', planet: 'Spee-ider Grove', name: 'Webebster Longstein', short: 'Webebster', robot: 'Engagement-Tracker',
    face: 'img/crew/webebster-longstein.webp', mark: 'img/mark/spee-ider-grove.png', color: '#b78bff',
    tag: 'Fast, with traps. If the web fails, it comes apart.',
    style: {
      look: 6, root: 11, nodes: 250000, trust: 40, slop: 16, temp: 2, agg: 0.7, think: 450, talk: 0.6, resign: [-1200, 4, 30],
      adjust: c => (c.evalCp < -320 ? { look: 2, root: 0, slop: 160, temp: 60, event: 'web' } : null),
    },
    openings: {
      black: [
        'e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Na5 Bb5+ c6 dxc6 bxc6 Be2 h6 Nf3 e4',
        'd4 Nf6 c4 e5 dxe5 Ng4 Bf4 Nc6 Nf3 Bb4+ Nbd2 Qe7',
        'd4 d5 c4 e5 dxe5 d4 Nf3 Nc6 g3 Be6 Nbd2 Qd7',
        'e4 c5 Nf3 e6 d4 cxd4 Nxd4 Nc6 Nc3 Qc7',
      ],
      white: ['e4 e5 Nf3 Nc6 Bc4 Nf6 Ng5 d5 exd5 Nxd5 Nxf7 Kxf7 Qf3+ Ke6 Nc3 Ncb4'],
    },
    lines: { ...LINES['spee-ider-grove'], event: ["The web's coming apart. Everyone stay calm. I'm calm. This is calm."] },
  },
];

export const BY_ID = Object.fromEntries(BEINGS.map(b => [b.id, b]));
export const lineCount = b => Object.values(b.lines).reduce((n, a) => n + a.length, 0);
