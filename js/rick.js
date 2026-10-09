/* Rick, for hire. Rick reviews every title on FictionVision. For an idea saved on this device, the submitter can request Rick once:
   it costs five dollars, there are no re-rolls, and the submitter decides afterward whether the review shows under the idea (Pierce,
   2026-10-08). Rick rates in TEE-HEEs, one to five; an idea that earns no TEE-HEE gets PFFFFTs instead, one to three. The review is
   composed here, on the device, from Rick's own habits: a seat, a count, a hat, a kid, a tax audit, and one concrete thing from the idea.
   The same idea always gets the same review (that is the one shot). */

export const HOW = [
  'Rick rates in TEE-HEEs, one to five. An idea that does not earn a single TEE-HEE gets PFFFFTs instead, one to three. Some people frame those.',
  'One request per idea, five dollars, no re-rolls. You read the review first, then decide whether it shows under your idea.',
  'Some say Rick has started a competing review company. He reviewed that claim himself and gave it four TEE-HEEs. It goes deep.',
];

const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const pick = (arr, h, k) => arr[(h >>> (k % 24)) % arr.length];
const STOP = new Set(['I', 'The', 'A', 'An', 'It', 'In', 'On', 'At', 'He', 'She', 'They', 'We', 'You', 'My', 'His', 'Her', 'Their', 'Our', 'But', 'And', 'Or', 'So', 'When', 'Then', 'There', 'This', 'That', 'These', 'Those', 'What', 'Who', 'Why', 'How', 'If', 'As', 'After', 'Before', 'One', 'Two', 'Every', 'Each', 'No', 'Not', 'Its', 'Of', 'To', 'For', 'With', 'From', 'By', 'Meanwhile', 'Now', 'Once', 'Because', 'Until', 'While', 'Also', 'All', 'Some', 'Only', 'Just', 'Even', 'Still']);
const NOUNY = /^(a|an|the|his|her|their|its|one)\s+([a-z][a-z-]{2,}(?:\s+[a-z][a-z-]{2,})?)$/i;

/* what Rick noticed: a name from the idea, a thing from the idea, a number from the idea */
function notice(title, story) {
  const text = String(story || '');
  const sentences = text.split(/(?<=[.!?])\s+/);
  const names = [];
  for (const s of sentences) s.split(/\s+/).forEach((w, i) => { const c = w.replace(/[^A-Za-z'-]/g, ''); if (i > 0 && /^[A-Z][a-z]{2,}$/.test(c) && !STOP.has(c) && !names.includes(c)) names.push(c); });
  const things = [];
  const re = /\b(a|an|the|his|her|their|its|one)\s+([a-z][a-z-]{2,}(?:\s+(?!(?:for|of|to|in|on|at|with|and|but|or|that|who|which|from|by|as|is|was|are|were|the|an?)\b)[a-z][a-z-]{2,})?)\b/g; let m;
  while ((m = re.exec(text)) && things.length < 12) { const ph = m[2].toLowerCase(); if (!/^(and|but|that|this|with|from|into|same|other|whole|first|last|next|only|very|kind|sort|lot|way|time|day|end|one)\b/.test(ph)) things.push((m[1].toLowerCase() === 'one' ? 'the ' : m[1].toLowerCase() + ' ') + ph); }
  const nums = (text.match(/\b\d{1,4}\b/g) || []).map(Number).filter(n => n > 1 && n < 10000);
  return { names, things, nums };
}

const OPEN = [
  'Sat through {title} with my hat in my lap, and {who} was on screen before I had finished the popcorn.',
  'Watched {title} twice, because the first time {thing} came up I was looking for my ticket.',
  'Took the aisle seat for {title}, and {who} still found me by minute {n}.',
  'Counted {n} things in {title} that nobody on screen explains, and {thing} was the first.',
  '{title} opens on {thing}, and the man beside me left to make a phone call about it.',
  'Went into {title} knowing nothing about {thing}, and I came out knowing slightly less.',
  'By the second act of {title}, {who} had done more with {thing} than I have done with my whole garage.',
  'Brought my kid to {title}, and {who} is now the only adult my kid respects.',
  'Got to {title} {n} minutes late and {thing} was already the main character.',
  'Wore my good vest to {title}, which {thing} did not deserve, and {who} noticed.',
];
const MID = [
  '{Who} treats {thing} like it is normal, and after {n} minutes so did I.',
  'Nobody in it asks the obvious question, which I respected, because I did not either.',
  'The {kind} knows exactly how long {thing} should last and goes {n} minutes past it on purpose.',
  '{Thing} gets a bigger reaction from the room than my retirement did.',
  'There is a moment with {thing} that I have since told my therapist about, and she asked if she could use it.',
  '{Who} is wrong the entire time and never once loses the argument.',
  'The {kind} takes {thing} more seriously than my accountant takes me.',
  'Halfway through, {who} does the one thing I would have done, and it goes worse than it did for me.',
  '{Thing} comes back in the third act, and the row behind me applauded it like a person.',
  'I understood {who} completely by minute {n}, which is not a compliment to either of us.',
];
const CLOSE = [
  'I would watch it again, and I will deny ever saying so.',
  'It is the kind of thing that writes itself, and for once the writing paid.',
  'Worth the ticket, and I still have the stub, which is more than {thing} left anyone with.',
  'I left before the lights came up, and I have been checking my {prop} ever since.',
  'It will not fix anything, and I have stopped expecting things to.',
  'Not the worst evening I have spent in a {kind}, and I have spent a few.',
  'I am still waiting for the check.',
  'Some numbers should stay in the drawer, and this is one of them.',
  'I tipped the usher on the way out, which I plan to discuss with a professional.',
  'My kid has asked to see it again, and I have asked my kid to lower its voice.',
];
const PF_CLOSE = [
  'I want my {n} minutes back, and {who} can keep the rest.',
  'I have been called worse than this {kind}, and never by a scientist.',
  'The lights came up and nobody in my row had moved, because nobody could tell it had ended.',
  'I would say it builds character, but mostly it built a line at the exit.',
];
const PROPS = ['hat', 'vest', 'wallet', 'coat', 'cuffs', 'pockets'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* the one review for this idea. Same title and story, same review. */
export function review(d) {
  const title = String(d.title || 'your idea').trim();
  const story = String(d.story || '');
  const h = hash(title + '|' + story), h2 = hash(story + '|' + title);
  const kind = d.kind === 'Series' ? 'show' : 'movie';
  const { names, things, nums } = notice(title, story);
  const who = names.length ? pick(names, h, 3) : (kind === 'show' ? 'the host' : 'the lead');
  const thing = things.length ? pick(things, h, 7) : 'the whole premise';
  const n = nums.length ? pick(nums, h, 11) : 9 + (h2 % 39);
  const r = h % 100;
  const pffffts = r < 14 ? 1 + (h2 % 3) : 0;
  const teehees = pffffts ? 0 : r < 19 ? 1 : r < 44 ? 2 : r < 74 ? 3 : r < 90 ? 4 : 5;
  const fill = s => s.replace(/\{title\}/g, title).replace(/\{Who\}/g, cap(who)).replace(/\{who\}/g, who).replace(/\{Thing\}/g, cap(thing)).replace(/\{thing\}/g, thing)
    .replace(/\{n\}/g, String(n)).replace(/\{kind\}/g, kind).replace(/\{prop\}/g, pick(PROPS, h2, 5));
  const text = [pick(OPEN, h, 0), pick(MID, h2, 0), pick(pffffts ? PF_CLOSE : CLOSE, h, 13)].map(fill).join(' ');
  return { text, teehees, pffffts, title, at: Date.now() };
}
