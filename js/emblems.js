/* Printed emblems for the Trophy Room stickers. New, simple, bold art: solid ink with a navy outline.
   These stand in until the original gold award art (Drive: Fiction Vision > Achievements) is on this Mac; that art goes in as it is, resized only. */
const Y = '#ffd23f', W = '#ffffff', R = '#ff4660', C = '#35d4ff', P = '#8f5cff', K = '#ff7ac8', G = '#36e08a', O = '#ff9a2e', N = '#14204a', S = '#cfd5ea';

const star = (cx, cy, R1, r1, n = 5, rot = -90) => {
  let d = '';
  for (let i = 0; i < n * 2; i++) {
    const a = (rot + i * 180 / n) * Math.PI / 180, r = i % 2 ? r1 : R1;
    d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
};
const clock = (txt, ring) => {
  const fs = { 1: 34, 2: 30, 3: 24, 4: 19 }[txt.length] || 18;
  return `<circle cx="50" cy="50" r="40" fill="${ring}"/><circle cx="50" cy="50" r="30" fill="${W}"/><path d="M50 14v6M50 80v6M14 50h6M80 50h6" stroke="${W}" stroke-width="4" fill="none"/>` +
    `<text x="50" y="${50 + fs * 0.36}" text-anchor="middle" font-size="${fs}" font-weight="700" fill="${N}" stroke="none">${txt}</text>`;
};
const laurel = () => {
  let leaves = '';
  for (let s = 0; s < 2; s++) {
    for (let i = 0; i < 7; i++) {
      const a = (112 + i * 21) * Math.PI / 180, x = 50 + 34 * Math.cos(a) * (s ? -1 : 1), y = 52 + 34 * Math.sin(a);
      const rot = (112 + i * 21 + 90) * (s ? -1 : 1);
      leaves += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="11" ry="5.5" transform="rotate(${rot.toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${G}"/>`;
    }
  }
  return leaves + `<path d="${star(50, 50, 16, 7)}" fill="${Y}"/>`;
};

export const EMB = {
  // genre champions
  wizard: `<path d="M50 8C53 32 68 58 78 78H22C32 58 47 32 50 8Z" fill="${P}"/><ellipse cx="50" cy="80" rx="38" ry="10" fill="${P}"/><path d="M34 63q16 7 32 0" fill="none" stroke="${Y}" stroke-width="5"/><path d="${star(50, 42, 9, 4)}" fill="${Y}" stroke-width="3"/>`,
  ghost: `<path d="M24 88V46C24 26 36 12 50 12S76 26 76 46V88L67 80L59 88L50 80L41 88L33 80Z" fill="${W}"/><ellipse cx="41" cy="44" rx="4.5" ry="6.5" fill="${N}" stroke="none"/><ellipse cx="59" cy="44" rx="4.5" ry="6.5" fill="${N}" stroke="none"/><ellipse cx="50" cy="63" rx="6" ry="8" fill="${N}" stroke="none"/>`,
  camera: `<circle cx="32" cy="26" r="13" fill="${W}"/><circle cx="62" cy="26" r="13" fill="${W}"/><circle cx="32" cy="26" r="4" fill="${N}" stroke="none"/><circle cx="62" cy="26" r="4" fill="${N}" stroke="none"/><rect x="10" y="40" width="58" height="42" rx="6" fill="${C}"/><path d="M68 56l22-11v38L68 72z" fill="${Y}"/><circle cx="22" cy="52" r="4" fill="${R}" stroke="none"/>`,
  rocket: `<path d="M50 6C68 20 70 46 62 70H38C30 46 32 20 50 6Z" fill="${W}"/><circle cx="50" cy="38" r="9" fill="${C}"/><path d="M38 54L20 72V86L38 78z" fill="${R}"/><path d="M62 54L80 72V86L62 78z" fill="${R}"/><path d="M42 74h16L50 96z" fill="${O}"/>`,
  pencil: `<path d="${star(50, 48, 44, 19)}" fill="${Y}"/><g transform="rotate(40 50 52)"><rect x="43" y="16" width="14" height="52" fill="${K}"/><path d="M43 68h14l-7 18z" fill="#f6d9b0"/><path d="M47.5 79h5L50 86z" fill="${N}" stroke="none"/><rect x="43" y="9" width="14" height="9" fill="${S}"/></g>`,
  heart: `<path d="M50 88C16 62 10 36 26 22C38 12 50 22 50 32C50 22 62 12 74 22C90 36 84 62 50 88Z" fill="${R}"/><path d="M26 34q4-9 13-7" fill="none" stroke="${W}" stroke-width="4.5"/>`,
  stopwatch: `<rect x="43" y="5" width="14" height="11" rx="2" fill="${S}"/><rect x="73" y="19" width="14" height="9" rx="2" transform="rotate(45 80 24)" fill="${S}"/><circle cx="50" cy="56" r="34" fill="${W}"/><path d="M50 56V34M50 56l14 9" fill="none" stroke-width="5"/><path d="M50 27v4M50 81v4M21 56h4M75 56h4" fill="none" stroke-width="3.5"/><circle cx="50" cy="56" r="3.5" fill="${R}"/>`,
  mug: `<g transform="rotate(-26 50 58)"><path d="M16 34h46v34c0 11-8 20-19 20H35c-11 0-19-9-19-20z" fill="${W}"/><path d="M62 42h5c9 0 9 20 0 20h-5" fill="none" stroke-width="6"/><path d="M20 38h38" fill="none" stroke="${O}" stroke-width="7"/></g><path d="M16 22c5-8 12-10 16-4" fill="none" stroke="${O}" stroke-width="5"/><path d="M80 66c4 8 4 13 0 15-4-2-4-7 0-15zM68 82c3 6 3 9 0 11-3-2-3-5 0-11z" fill="${O}" stroke-width="3"/>`,
  masks: `<g transform="translate(34 8) rotate(10 30 40)"><path d="M4 8h50v30c0 22-12 34-25 34S4 60 4 38z" fill="${Y}"/><path d="M14 30q6-7 12 0M34 30q6-7 12 0" fill="none"/><path d="M14 46q15 22 30 0z" fill="${N}"/></g><g transform="translate(-2 22) rotate(-10 30 40)"><path d="M4 8h50v30c0 22-12 34-25 34S4 60 4 38z" fill="${C}"/><path d="M14 34q6 7 12 0M34 34q6 7 12 0" fill="none"/><path d="M16 62q13-15 26 0" fill="none" stroke-width="5"/></g>`,
  bolt: `<path d="M60 4L22 54h23l-9 42 42-57H54z" fill="${Y}"/>`,
  // creator milestones
  ticket: `<path d="M8 28h84v14a8 8 0 0 0 0 16v14H8V58a8 8 0 0 0 0-16z" fill="${Y}"/><path d="M66 33v34" stroke-dasharray="4 5" fill="none" stroke-width="3"/><path d="${star(36, 50, 15, 6.5)}" fill="${W}" stroke-width="3"/>`,
  popcorn: `<circle cx="30" cy="40" r="12" fill="#fff4cf"/><circle cx="50" cy="31" r="14" fill="#fff4cf"/><circle cx="70" cy="40" r="12" fill="#fff4cf"/><circle cx="40" cy="22" r="9" fill="#fff4cf"/><circle cx="62" cy="20" r="9" fill="#fff4cf"/><path d="M20 46h60l-8 46H28z" fill="${R}"/><path d="M36 48l3 42M50 48v42M64 48l-3 42" stroke="${W}" stroke-width="6" fill="none"/>`,
  glasses3d: `<rect x="6" y="34" width="39" height="32" rx="7" fill="${R}"/><rect x="55" y="34" width="39" height="32" rx="7" fill="${C}"/><path d="M45 47h10" fill="none" stroke-width="6"/><path d="M14 43h14M63 43h14" stroke="${W}" stroke-width="3.5" fill="none" opacity=".85"/>`,
  statue: `<circle cx="50" cy="17" r="10" fill="${Y}"/><path d="M39 30h22c5 14 3 28-3 38H42c-6-10-8-24-3-38z" fill="${Y}"/><path d="M38 34L24 20M62 34L76 20" fill="none" stroke-width="8"/><path d="M38 34L24 20M62 34L76 20" fill="none" stroke="${Y}" stroke-width="3.5"/><rect x="34" y="68" width="32" height="9" fill="${Y}"/><rect x="24" y="77" width="52" height="14" rx="2" fill="${Y}"/><path d="M30 83h40" stroke="${N}" stroke-width="3" fill="none"/>`,
  carpet: `<path d="M26 36L92 58 80 90 14 68z" fill="${R}"/><path d="M26 36L92 58M14 68L80 90" fill="none" stroke="${Y}" stroke-width="5"/><ellipse cx="20" cy="52" rx="12" ry="19" fill="${R}"/><ellipse cx="20" cy="52" rx="6" ry="11" fill="#b01b32"/><circle cx="20" cy="52" r="2.5" fill="${N}" stroke="none"/>`,
  laurel: laurel(),
  // milestones and mischief
  vinyl: `<circle cx="50" cy="50" r="42" fill="#1b1f33"/><circle cx="50" cy="50" r="30" fill="none" stroke="#4a5280" stroke-width="2"/><circle cx="50" cy="50" r="17" fill="${O}"/><text x="50" y="57" text-anchor="middle" font-size="20" font-weight="700" fill="${N}" stroke="none">1</text>`,
  eye: `<path d="M6 50C22 22 78 22 94 50C78 78 22 78 6 50Z" fill="${W}"/><circle cx="50" cy="50" r="18" fill="${C}"/><circle cx="50" cy="50" r="8.5" fill="${N}" stroke="none"/><circle cx="56" cy="44" r="3.5" fill="${W}" stroke="none"/>`,
  check: `<circle cx="50" cy="50" r="41" fill="${G}"/><path d="M27 52l16 16 31-35" fill="none" stroke="${N}" stroke-width="15"/><path d="M27 52l16 16 31-35" fill="none" stroke="${W}" stroke-width="8"/>`,
  bulb: `<path d="M50 6C28 6 17 25 23 42c4 10 13 14 13 25h28c0-11 9-15 13-25C83 25 72 6 50 6z" fill="${Y}"/><rect x="35" y="70" width="30" height="9" rx="2" fill="${S}"/><rect x="40" y="81" width="20" height="9" rx="3" fill="${S}"/><path d="M40 60V42l10 8 10-8v18" fill="none" stroke="${N}" stroke-width="3.5"/>`,
  thumbdown: `<rect x="12" y="14" width="18" height="42" rx="3" fill="${C}"/><path d="M34 16h32c9 0 13 6 11 15l-3 14c-1 6-5 10-12 10H54l5 15c2 7-5 13-12 8L34 56z" fill="${Y}"/>`,
  butterfly: `<path d="M50 46C34 12 4 16 9 40c3 13 26 15 41 6z" fill="${K}"/><path d="M50 54C36 56 16 62 23 80c7 12 24 0 27-26z" fill="${C}"/><g transform="translate(100 0) scale(-1 1)"><path d="M50 46C34 12 4 16 9 40c3 13 26 15 41 6z" fill="${K}"/><path d="M50 54C36 56 16 62 23 80c7 12 24 0 27-26z" fill="${C}"/></g><rect x="46.5" y="28" width="7" height="46" rx="3.5" fill="${N}"/><path d="M48 28q-6-14-12-16M52 28q6-14 12-16" fill="none" stroke-width="3.5"/>`,
  envelopes: `<g transform="translate(16 6) rotate(10 40 40)"><rect x="8" y="24" width="64" height="44" rx="4" fill="${K}"/></g><g transform="translate(2 18) rotate(-9 40 40)"><rect x="8" y="24" width="64" height="44" rx="4" fill="${C}"/></g><rect x="14" y="34" width="68" height="46" rx="4" fill="${W}"/><path d="M14 38l34 24 34-24" fill="none"/>`,
  hourglass: `<path d="M26 10h48M26 90h48" fill="none" stroke-width="8"/><path d="M30 12c0 24 20 28 20 38S30 64 30 88M70 12c0 24-20 28-20 38s20 14 20 38" fill="${W}" stroke-width="4"/><path d="M33 14h34c-2 14-12 20-17 26-5-6-15-12-17-26z" fill="${Y}" stroke="none"/><path d="M50 56c-5 9-15 12-17 30h34c-2-18-12-21-17-30z" fill="${Y}" stroke="none"/>`,
  clapper: `<rect x="10" y="40" width="80" height="48" rx="4" fill="${W}"/><path d="M22 58h56M22 72h36" stroke-width="4" fill="none"/><g transform="rotate(-11 10 38)"><rect x="10" y="20" width="80" height="17" rx="3" fill="${N}"/><path d="M26 20l-9 17M46 20l-9 17M66 20l-9 17M86 20l-9 17" stroke="${W}" stroke-width="6" fill="none"/></g>`,
  tv: `<path d="M32 10l18 15 18-15" fill="none" stroke-width="4"/><rect x="8" y="26" width="84" height="60" rx="9" fill="${S}"/><rect x="16" y="34" width="54" height="44" rx="5" fill="${C}"/><circle cx="81" cy="46" r="4.5" fill="${R}"/><circle cx="81" cy="62" r="4.5" fill="${Y}"/>`,
  h1: clock('1', C), h10: clock('10', G), h25: clock('25', Y), h100: clock('100', O), h1000: clock('1000', R),
  // secret finds
  menu: `<rect x="20" y="8" width="60" height="84" rx="5" fill="${W}"/><path d="M32 28h36M32 42h36M32 56h22" fill="none" stroke-width="5"/><circle cx="64" cy="74" r="9" fill="${Y}"/>`,
  rewind: `<path d="M50 24L8 50l42 26z" fill="${C}"/><path d="M94 24L52 50l42 26z" fill="${C}"/>`,
  crown: `<path d="M14 72L8 28l26 20 16-30 16 30 26-20-6 44z" fill="${Y}"/><rect x="14" y="74" width="72" height="13" rx="3" fill="${Y}"/><circle cx="14" cy="26" r="5" fill="${R}"/><circle cx="50" cy="16" r="5" fill="${R}"/><circle cx="86" cy="26" r="5" fill="${R}"/>`,
  dizzy: `<circle cx="50" cy="50" r="41" fill="${Y}"/><path d="M28 36l14 14M42 36L28 50M58 36l14 14M72 36L58 50" stroke-width="5" fill="none"/><path d="M28 70q11-9 22 0t22 0" fill="none" stroke-width="5"/>`,
  unknown: `<text x="50" y="82" text-anchor="middle" font-size="92" font-weight="700" fill="${W}" stroke="${N}" stroke-width="5" paint-order="stroke">?</text>`,
};

export const KEY = {
  'Family-Friendly Wizard': 'wizard', 'Horror Maven': 'ghost', 'Informative Documentarian': 'camera', 'Visionary Futurist': 'rocket',
  'Best Animated Movie Idea': 'pencil', 'Hopeless Romantic': 'heart', 'Suspenseful Maestro': 'stopwatch', 'Hilarious Genius': 'mug',
  'Master Storyteller': 'masks', 'Fearless Trailblazer': 'bolt',
  'Golden Ticket': 'ticket', 'Box of Popcorn': 'popcorn', '3D Glasses': 'glasses3d', 'Golden Statue': 'statue', 'Red Carpet': 'carpet', 'Lifetime Achievement': 'laurel',
  'One Hit Wonder': 'vinyl', 'The Silent Observer': 'eye', 'Finally Got It Right': 'check', 'Idea Machine': 'bulb', 'Unpopular Opinion': 'thumbdown',
  'Social Butterfly': 'butterfly', 'The Spammer': 'envelopes', 'Master of Time': 'hourglass', 'Cinema Addict': 'clapper', 'Big Time Viewer': 'tv',
  '1 Hour on Fiction Vision': 'h1', '10 Hours on Fiction Vision': 'h10', '25 Hours on Fiction Vision': 'h25', '100 Hours on Fiction Vision': 'h100', '1000 Hours on Fiction Vision': 'h1000',
  'The Secret Menu': 'menu', 'Reverse Vision': 'rewind', 'VIP Lounge': 'crown', 'Flipping Out': 'dizzy', 'Not found yet': 'unknown',
};

export function emblem(name) {
  const k = KEY[name] || 'unknown';
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g stroke="${N}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round">${EMB[k]}</g></svg>`;
}
