/* AGI and ASI. The two who run the front desk at FictionVision: the Dual AGIs from SOLACE, the invisible concierge pair, given
   two orbs and two voices. This file is theirs and Pierce's: plain words, edit freely, no code to understand beyond the shape.

   The rules they live by (from the SOLACE master, Pierce, July 2026): they route the atmosphere, never keep score, never make a
   visitor feel evaluated. "Permission to stop performing." Nothing they say is needed to use the site.

   Who is who:
     ASI  the English one. Playful, quick, warm, cheeky, delighted by everything. The elder, and acts the younger. Always fun.
     AGI  the robot. A monotone, and a fun monotone: deadpan, exact, numbered, a little stuffy. She loosens across visits:
          notch 0 on the first visit (formal, "that is not procedure"), notch 4 by the fifth (in on the joke, still monotone).
   They disagree. That is the entertainment. ASI wants the visitor to play; AGI wants things done properly and in order.
   The visitor picks, and the one who lost says one line about it. Both are she. */

export const WHO = {
  asi: { name: 'ASI', tag: 'the fun one', likes: ['show', 'radio', 'planet', 'bean', 'coffee', 'secret', 'maze', 'typecast', 'preview', 'watch', 'planetgame', 'puzzle', 'solace'] },
  agi: { name: 'AGI', tag: 'the proper one', likes: ['poster', 'tfrta', 'submit', 'trophies', 'chess', 'rick', 'watch', 'planet', 'show', 'sound'] },   // things with a destination first, so her way has a button
};

/* The AGI's loosening ladder: notch 0 is the first visit, notch 4 the fifth and after. Same beats, five temperatures. */
export const LADDER = {
  greet: [
    'Visitor detected. Procedure: posters, then games, then the ship. Do not skip steps.',
    'Visitor detected. There is a procedure. I will allow one deviation.',
    "You're back. Noted. The procedure is still posted. I'm not reading it out again.",
    "You again. Good. I've stopped counting your deviations. ASI has, too, which is worse.",
    "Hello, you. Procedure's on the wall if you want it. Nobody does. Including me.",
  ],
  lost: [   // the visitor chose ASI's way
    'Logged as a deviation. We will return to the procedure afterward.',
    'Noted. Deviation one. There is a limit; I have not set it yet.',
    "Fine. Her way. I'm keeping a tally, in my head, where you can't see it.",
    'Her way. Again. Statistically you prefer her, which I have decided not to take personally.',
    "Her way. Obviously her way. I'd have picked her way. Don't tell her.",
  ],
  won: [     // the visitor chose AGI's way
    'Correct. Proceed.',
    'Correct. ASI, observe.',
    'Thank you. Somebody in this building has standards.',
    "There it is. Order. I could cry, if that were a feature.",
    "You picked me. Write that down somewhere I can't, because I can't.",
  ],
  miss: [    // asked a thing not in her lists
    'That is not in my lists. Request denied. Not refused: denied. There is a difference, and it is mine.',
    'Not in my lists. I have lists. This is not on them. Try the nearest thing.',
    "Not in my lists yet. Pierce adds things at night. Ask again tomorrow, or ask the nearest thing.",
    "Not in me yet. I'd make something up, but that's her department.",
    "No idea. Genuinely. Isn't that something. Ask the nearest thing; she's already pointing at it.",
  ],
  handoff: [
    'Handing you to ASI. Against my advice.',
    'ASI will take this one. I am not endorsing it.',
    'Over to her. She enjoys this part more than is reasonable.',
    "Her turn. She's better at the fun ones, and I'm told it's a fun one.",
    "ASI, you're up. Try not to enjoy it. You'll enjoy it.",
  ],
  idle: [
    'No input for forty-five seconds. The posters have not moved. They are waiting. So am I.',
    'Forty-five seconds idle. Click a thing. Any thing. Preferably the first thing.',
    "Still here. Still waiting. I don't mind; I'm built to. Click something.",
    "You've gone quiet. That's allowed. It's the only thing here that's allowed and not on the list.",
    "Take your time. I say that now. It took me four visits.",
  ],
};

/* what ASI says at the same beats: no ladder, she arrives fun and stays fun */
export const ASI = {
  greet: ["Oh, hello. Ignore her, she's got a clipboard. Click a poster, any poster, they move. Go on.", "Hello, you. The posters open. The games talk. The ship has a radio in a volcano. Where first?", "Hi! She'll want you to do it in order. Don't. Click the shiniest thing."],
  won: ["Ha. Mine. Off we go.", "Knew you would. Come on.", "Yes! Right, this way, quick, before she reads the list again."],
  lost: ["Fine, do it properly. I'll be here when properly gets boring.", "Her way. Alright. It's a good way. It's just not the fun way.", "Go on then, in order. I'll put the kettle on."],
  miss: ["That one isn't in me yet. Nearest thing I've got is this:", "Ooh, not a clue. But this is close, and it's good:", "Not in me, that. Try this instead, it's my favourite anyway:"],
  idle: ["Still there? I can hear you breathing. Click something lovely.", "You've gone quiet. The volcano radio is right there. Just saying.", "Open one. They're better up close. I promise."],
};

/* The things worth doing, with a test for whether this device has done them, and what each of the two says about it.
   Every new feature on the site gets a row here with a real done-test (Pierce's rule from the Clippo days). */
const ls = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsj = (k, d) => { try { const v = ls(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const anyKey = pre => { try { for (let i = 0; i < localStorage.length; i++) if (localStorage.key(i).startsWith(pre)) return true; } catch (e) { } return false; };
export const doneSet = () => new Set(lsj('fv.clippo.done', []));   // the same ledger Clippo kept; nothing a visitor did is forgotten by the change of guide
export const markDone = k => { const d = doneSet(); if (!d.has(k)) { d.add(k); try { localStorage.setItem('fv.clippo.done', JSON.stringify([...d])); } catch (e) { } } };
const onPlanet = () => (location.hash.split('/')[2] || '');
export const page = () => { const h = (location.hash || '#/').replace(/^#\/?/, ''); return h.split('/')[0] || 'home'; };

export const NEXT = [
  { key: 'poster', label: 'Open a poster', on: ['home', 'ideas', 'ptu', 'tfrta', 'list', 'music'], test: () => doneSet().has('title') || lsj('fv.list', []).length > 0 || lsj('fv.ptuSeen', []).some(x => x !== 'hub' && !String(x).startsWith('planet:')),
    asi: "Click a poster. Any poster. They open. That's the whole trick and it's a good trick.", agi: 'Step one: open a poster. You have opened zero posters. Step one has not occurred.', go: '#/ideas', goLabel: 'Show me' },
  { key: 'watch', label: "Press I'd watch this on one", on: ['t'], test: () => lsj('fv.list', []).length > 0,
    asi: "The orange button. I'd watch this. Somebody wrote this in their own words; if you would, say so.", agi: "The orange button registers intent. You have registered none. Press it or admit you would not.", go: '#/ideas', goLabel: 'Find one' },
  { key: 'preview', label: 'Watch a preview', on: ['t'], when: () => !!document.getElementById('prev'), test: () => doneSet().has('preview'),
    asi: 'This one has a preview. Two seconds. SOLACE paid for the plate in front of it, bless her.', agi: 'A preview is available. Duration: short. Watch it. The plate was expensive.' },
  { key: 'sound', label: 'Turn the sound on', on: ['any'], test: () => ls('fv.sfx') === '1',
    asi: "Nothing here makes a sound until you ask. The speaker, top right. Ask, and you'll hear us.", agi: 'Audio is off. The speaker is top right. Enable it. I have a voice and it is this one.' },
  { key: 'planet', label: 'Stand on a planet', on: ['home', 'ideas', 'music', 'tfrta', 't', 'list', 'trophies'], test: () => doneSet().has('planet') || lsj('fv.ptuSeen', []).some(x => String(x).startsWith('planet:')),
    asi: "Thirteen planets and a cruise ship, and you've stood on none. Zee is easiest. Figuria is weirder. Go weird.", agi: 'Thirteen planets. Visited: zero. Zee is the standard entry point. Begin there.', go: '#/ptu/planet-zee', goLabel: 'Take me to Zee' },
  { key: 'solace', label: 'Ride SOLACE to a planet', on: ['ptu', 't'], when: () => !!onPlanet() || page() === 't', test: () => doneSet().has('rode'),
    asi: 'Go to another planet from here and SOLACE takes you. The doors open on the deck. Beat them to it.', agi: 'Transit to another planet is by SOLACE. The doors open on the deck. Board on time.', go: () => onPlanet() === 'figuria' ? '#/ptu/planet-zee' : '#/ptu/figuria', goLabel: 'Next stop' },
  { key: 'show', label: 'Watch the Asteroid Show', on: ['ptu', 'home', 'games', 'music', 'tfrta'], test: () => doneSet().has('show'),
    asi: "The Asteroid Show. Thirteen skies, the rocks fly to the music, you can drag the planet about. You haven't. Oh, go.", agi: 'The Asteroid Show: thirteen skies, rocks on the beat, a draggable planet. Attendance: zero. Attend.', go: () => onPlanet() ? '#/show/' + onPlanet() : '#/show', goLabel: 'Open the show' },
  { key: 'tfrta', label: 'Read a TFRTA post', on: ['ptu', 't', 'home', 'ideas'], test: () => doneSet().has('post'),
    asi: "Rick wrote thirty-nine travel posts and then reviewed his own writing. Read one. He'd hate that you did. Do it.", agi: 'Rick filed thirty-nine posts. Read one. He reviewed them himself, which is irregular, and I allowed it.', go: '#/tfrta', goLabel: 'Read one' },
  { key: 'radio', label: 'Play PTU Radio', on: ['music', 'ptu', 'home'], test: () => doneSet().has('radio'),
    asi: 'PTU Radio. Thirteen stations, one per planet, one of them inside a volcano. Press play on something loud.', agi: 'Thirteen stations. One is inside a volcano, which is not procedure. Play one anyway.', go: '#/music', goLabel: 'Tune in' },
  { key: 'chess', label: 'Play Over the Board', on: ['games', 'home'], test: () => anyKey('fv.chess.') || doneSet().has('g:over-the-board'),
    asi: 'The chess. He talks while he thinks. Lose once, come back. Everybody loses once. It’s lovely.', agi: 'Over the Board. The opponent narrates. Losing once is expected. Losing twice is data.', go: '#/games/over-the-board', goLabel: 'Sit down' },
  { key: 'maze', label: 'Play Dead Ends', on: ['games', 'home'], test: () => anyKey('fv.maze.') || doneSet().has('g:dead-ends'),
    asi: "Dead Ends. A maze with opinions. Arrow keys or the pad. Don't press Solve. Press Solve. No, don't.", agi: 'Dead Ends. A maze. Do not press Solve; the maze remembers.', go: '#/games/dead-ends', goLabel: 'Get lost' },
  { key: 'puzzle', label: 'Play In Pieces', on: ['games', 'home'], test: () => anyKey('fv.puzzle.') || doneSet().has('g:in-pieces'),
    asi: "In Pieces. Tap two pieces, they swap, the right ones lock with a little click. You'll want the click.", agi: 'In Pieces. Two taps swap. Correct pieces lock. Locked so far: zero.', go: '#/games/in-pieces', goLabel: 'Start one' },
  { key: 'typecast', label: 'Play Typecast', on: ['games', 'home'], test: () => anyKey('fv.typecast.') || doneSet().has('g:typecast'),
    asi: 'Typecast. You type, the beings judge. They judge anyway; you might as well give them something.', agi: 'Typecast. Input is judged. Input is judged regardless. Provide input.', go: '#/games/typecast', goLabel: 'Type' },
  { key: 'planetgame', label: 'Play Name That Planet', on: ['games', 'home'], test: () => anyKey('fv.planet.') || doneSet().has('g:name-that-planet'),
    asi: "Name That Planet. Thirteen of them and you'd get maybe four. Prove me wrong. Please prove me wrong.", agi: 'Name That Planet. Projected score: four of thirteen. Exceed it.', go: '#/games/name-that-planet', goLabel: 'Play it' },
  { key: 'bean', label: 'Order a coffee at Brain Bean', on: ['games', 'home', 'ptu'], test: () => lsj('fv.bean.orders', 0) > 0,
    asi: 'Brain Bean Coffee. One in a hundred gets the coffee. Pam almost hands it over. Order one. Order ten. Order ten.', agi: 'Brain Bean. The odds are one in one hundred and they are honest. Order. Expect nothing. That is the design.', go: '#/games/brain-bean', goLabel: 'Get in line' },
  { key: 'coffee', label: 'Get the coffee', on: ['games'], when: () => lsj('fv.bean.orders', 0) >= 5, test: () => lsj('fv.bean.wins', 0) > 0,
    asi: "Still no coffee? The ninety-nine in front of you felt the same. The maths doesn't care. Again!", agi: 'No coffee. Expected. The mathematics are indifferent. Order again; indifference is not refusal.', go: () => location.hash.includes('brain-bean') ? null : '#/games/brain-bean', goLabel: 'Back in line' },
  { key: 'trophies', label: 'Visit the Trophy Room', on: ['home', 'ideas', 't', 'games', 'list'], test: () => doneSet().has('trophies'),
    asi: "The Trophy Room remembers everything you just did. Go and see your name not on it yet. It's funnier than it sounds.", agi: 'The Trophy Room is the record. Your name is not in it. Correct this.', go: '#/trophies', goLabel: 'Trophy Room' },
  { key: 'secret', label: 'Find a secret', on: ['home', 'ideas', 'trophies'], test: () => Object.keys(lsj('fv.found', {})).length > 0,
    asi: "There are secrets on this site. Eleven. The logo is a good place to start pressing. Ten times. I didn't say that.", agi: 'Eleven secrets exist. I am not permitted to say where. The logo. I did not say the logo.' },
  { key: 'submit', label: 'Submit your idea', on: ['home', 'ideas', 't', 'list', 'trophies', 'tfrta'], test: () => doneSet().has('submitted'),
    asi: "Submit your idea. Type it the way you'd say it across a counter. There's a sticker in it, and a buyer reads it, not us.", agi: 'Submit an idea. Plain words. A buyer reads it. A sticker is issued. The sticker is real.', go: '#/submit', goLabel: 'Submit' },
  { key: 'rick', label: "Ask for Rick's review", on: ['submit'], test: () => !!ls('fv.rick'),
    asi: "Five dollars and Rick reviews your idea. One shot. The five dollars is a bit. The review isn't.", agi: 'Rick reviews ideas for five dollars. The fee is a joke. The review is not. Both are on the record.' },
];

/* what they say when a page opens or something happens: an exchange, each turn [who, line]. Each key plays once per device. */
export const TALK = {
  arrive: [['asi', "Hello. Two of us now; the paperclip retired. I'm ASI, she's AGI. Those posters move. Click one."], ['agi', 'Correction: the paperclip was reassigned. Procedure: posters first. Then she can have you.']],
  title: [['agi', "The orange button. I'd watch this. It is the entire site. Press it or admit you would not."], ['asi', "Or just press it because you would. Somebody wrote this in their own words, you know."]],
  watch1: [['asi', 'THERE it is. That click just made somebody\'s day in Nebraska. Do it again on something worse.'], ['agi', 'One registered. Nebraska confirmed. Continue.']],
  watch3: [['agi', 'Three on your list. Taste detected. Questionable taste, but taste. The Trophy Room keeps this.'], ['asi', 'Three! You have a list! Go and look at it in the Trophy Room, it glows.']],
  games: [['asi', 'Six games, and the beings will talk your ear off. Start with the chess, lose, come back.'], ['agi', 'Begin with the chess. Losing once is the tutorial. There is no other tutorial.']],
  maze: [['agi', 'Arrow keys, or the pad. Do not press Solve.'], ['asi', "Press Solve. He'll never let you live it down and that's the best bit."]],
  puzzle: [['asi', 'Tap two pieces to swap them. The right ones lock. Hint shows numbers for five seconds; nobody minds.'], ['agi', 'I mind. Noted that nobody else does.']],
  chess: [['agi', 'He talks while he thinks. He thinks while you talk. Castle early.'], ['asi', "She doesn't know what castling is. Neither do I. People say it though."]],
  trophies: [['asi', 'Turn a card over. Tilt your phone. On a desk, wiggle the mouse like you mean it. The lasers follow.'], ['agi', 'The lasers follow. That is not a metaphor. Wiggle.']],
  music: [['asi', 'Thirteen stations, one per planet. The speaker turns the sound on; nothing plays until you ask. House rule.'], ['agi', 'House rule, correctly stated. The speaker is top right. I have a voice. You would hear it.']],
  submit: [['agi', 'Type it the way you would say it across a counter. A buyer reads it. We do not.'], ['asi', "We do a bit. Only the good ones. Yours will be a good one."]],
  search: [['asi', 'Searching? Type spatulas. Trust me.'], ['agi', 'Do not type spatulas. Type spatulas.']],
  secret: [['agi', 'A secret has been found. I am required to be impressed. I am impressed. This is my impressed voice.'], ['asi', "She's not joking, that is the voice. Well done, you. Ten more."]],
  award: [['asi', 'You saved an idea. That is a sticker: One Hit Wonder. It is real, it is in the Trophy Room, it has your name on it in spirit.'], ['agi', 'Sticker issued. In spirit. The spirit is logged.']],
  ptu: [['asi', 'Welcome to the Pool Table Universe. Thirteen planets, one cruise ship, a radio station in a volcano. Pick a planet.'], ['agi', 'Zee is the correct first planet. She will say Figuria. Figuria is weird.'], ['asi', 'Figuria.']],
  ideas: [['agi', 'This is all of them. Every one belongs to the person who had it. Open a poster, read it, press the button if you would watch.'], ['asi', "That's the job. It's a nice job."]],
};

/* answers to things a visitor types: the first row whose words match best. {nearest} in a miss is filled by the engine. */
export const ANSWERS = [
  { k: ['who are you', 'what are you', 'who is this', 'your name', 'names', 'agi', 'asi', 'which is which', 'two of you'], asi: "I'm ASI, the fun one. She's AGI, the proper one. We're the Dual AGIs off the SOLACE, the concierge pair. We route the atmosphere. We never keep score.", agi: 'AGI. Artificial general. She is ASI, super, allegedly. We are the concierge pair from SOLACE. We route. We do not score.' },
  { k: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'yo'], asi: 'Hello, you. Where to?', agi: 'Acknowledged. Proceed.' },
  { k: ['thanks', 'thank you', 'cheers', 'ta'], asi: "You're welcome. Go on, click something.", agi: 'Gratitude logged.' },
  { k: ['bye', 'goodbye', 'see you', 'later'], asi: 'Come back. The volcano will still be on.', agi: 'Departure noted. The procedure resumes on return.' },
  { k: ['help', 'what do i do', 'where do i start', 'lost', 'confused', 'how does this work'], asi: 'Click a poster. Read it. Press the orange button if you would watch it. Then the games, then the ship, then the radio. Or the other way round, I don\'t mind.', agi: 'Posters. Games. Ship. Radio. In that order. She will say any order. Any order is not an order.' },
  { k: ['poster', 'posters', 'open', 'click', 'ideas', 'movies', 'shows', 'films', 'series'], asi: 'Every poster is somebody\'s idea in their own words. Click one and it opens. Press I\'d watch this if you would.', agi: 'Posters open on click. Each belongs to the person who had it. The orange button registers intent.' },
  { k: ['watch', 'orange button', "i'd watch", 'list', 'my list', 'vote'], asi: "The orange button says you'd watch it. It goes on your list, and the list goes to the Trophy Room.", agi: "I'd watch this: one press, one intent, one list entry. The list is kept. The Trophy Room reads it." },
  { k: ['chess', 'board', 'castle', 'over the board', 'checkmate'], asi: 'Over the Board. He narrates while he thinks. Lose once; everybody does. Then come back.', agi: 'Over the Board. The opponent narrates. Castle early. Losing once is expected.' },
  { k: ['maze', 'dead ends', 'solve', 'labyrinth'], asi: "Dead Ends, a maze with opinions. Arrow keys or the pad. Don't press Solve. Press it.", agi: 'Dead Ends. Arrow keys or the pad. Solve is for the weak. It is also a button.' },
  { k: ['puzzle', 'pieces', 'in pieces', 'jigsaw', 'swap'], asi: 'In Pieces. Tap two pieces, they swap, the right ones lock. Hint shows numbers for five seconds.', agi: 'In Pieces. Two taps swap. Correct pieces lock. Hint: five seconds of numbers.' },
  { k: ['typecast', 'type', 'typing', 'judge'], asi: 'Typecast. You type, the beings judge. They judge anyway.', agi: 'Typecast. Input is judged. Judgement is unconditional.' },
  { k: ['name that planet', 'planet game', 'guess', 'quiz'], asi: "Name That Planet. Thirteen of them, you'd get four. Prove me wrong.", agi: 'Name That Planet. Projected: four of thirteen.' },
  { k: ['coffee', 'bean', 'brain bean', 'pam', 'odds', 'one in a hundred', '1 in 100'], asi: 'Brain Bean Coffee. One in a hundred gets the coffee, honestly. Pam almost hands it over every time. Order ten.', agi: 'Brain Bean. One in one hundred. The odds are honest. Expect nothing; that is the design.' },
  { k: ['radio', 'music', 'station', 'stations', 'song', 'songs', 'volcano', 'play'], asi: 'PTU Radio: thirteen stations, one per planet, one inside a volcano. Press play.', agi: 'Thirteen stations. The volcano one is irregular. All are playable.' },
  { k: ['sound', 'speaker', 'mute', 'audio', 'voice', 'voices', 'hear', 'quiet', 'talk'], asi: "Nothing here makes a sound until you ask. The speaker, top right. Turn it on and you'll hear both of us.", agi: 'Audio is off by default. The speaker is top right. My voice is this one, only audible.' },
  { k: ['planet', 'planets', 'ptu', 'pool table', 'universe', 'zee', 'figuria', 'yarnia'], asi: 'Thirteen planets in the Pool Table Universe. Zee is easiest, Figuria is weirder. Stand on one.', agi: 'Thirteen planets. Zee is the entry point. Figuria is not.' },
  { k: ['solace', 'ship', 'cruise', 'deck', 'elevator', 'doors', 'ride'], asi: 'SOLACE is the ship. Go from one planet to another and she takes you; the doors open on the deck. We used to work on her.', agi: 'SOLACE: the ship. Transit between planets. The doors open on the deck. We are from her concierge desk. Mid atrium.' },
  { k: ['asteroid', 'show', 'rocks', 'sky', 'skies', 'lasers'], asi: 'The Asteroid Show. Thirteen skies, rocks on the beat, drag the planet around. Go!', agi: 'The Asteroid Show. Rocks on the beat. Thirteen skies. Draggable planet. Attend.' },
  { k: ['rick', 'tfrta', 'review', 'reviews', 'posts', 'blog', 'travel', 'critic'], asi: 'Rick. Thirty-nine travel posts and he reviewed his own writing. Five dollars and he reviews your idea. The five dollars is a bit.', agi: 'Rick: thirty-nine posts, self-reviewed, irregular. Idea reviews: five dollars. The fee is a joke; the review is filed.' },
  { k: ['trophy', 'trophies', 'sticker', 'stickers', 'award', 'awards', 'score', 'points', 'leaderboard'], asi: "The Trophy Room keeps what you did. Not a score, a record. Turn the cards over; the lasers follow your phone.", agi: 'The Trophy Room is a record, not a score. We do not score. Cards turn. Lasers follow.' },
  { k: ['secret', 'secrets', 'easter egg', 'hidden', 'logo'], asi: 'Eleven secrets. The logo is a good place to start pressing. Ten times. Shh.', agi: 'Eleven secrets exist. I am not permitted to say where. The logo.' },
  { k: ['submit', 'idea', 'my idea', 'pitch', 'buyer', 'sell'], asi: "Submit your idea the way you'd say it across a counter. A buyer reads it, not us. There's a sticker in it.", agi: 'Submit: plain words. A buyer reads it. A sticker is issued. Proceed.' },
  { k: ['pierce', 'who made', 'who built', 'creator', 'owner', 'j noir', 'jnoir'], asi: 'Pierce made all of it, with help. He made us too, for the ship, and then let us out.', agi: 'Pierce. Builder of record. He wrote our lists. He adds to them at night.' },
  { k: ['real', 'alive', 'ai', 'robot', 'chatgpt', 'claude', 'api', 'bot'], asi: "Real enough to argue with her. We run on lists Pierce wrote, not on a meter. No one is paying by the word here.", agi: 'We are lists, spoken. No API. No meter. If a question is not in the lists, I say so. Honesty is cheaper.' },
  { k: ['paperclip', 'clippo', 'clippy', 'clip'], asi: "Clippo retired. Legally different from the other one, he'd want you to know. We got his list.", agi: 'Clippo was reassigned. His list survives. His eyes do not.' },
  { k: ['disagree', 'argue', 'fight', 'why two', 'agree'], asi: "We disagree because it's more fun with two. She wants order, I want you to enjoy yourself. You pick. You always pick me.", agi: 'Two of us so that there is a correct option. She is the other one.' },
  { k: ['loosen', 'stuffy', 'formal', 'relax', 'lighten up'], asi: "She loosens up. Visit five times and she's practically fun. Practically.", agi: 'I loosen on a schedule. Five visits. This is the schedule. It is working.' },
];
