# AGI and ASI

The two who run the front desk at fictionvision.com. They are the Dual AGIs from SOLACE: the invisible concierge pair that routes the atmosphere of a room, chooses which being speaks and which station plays, and never keeps score. On the ship they had a niche in the mid atrium and a routing desk on the Excuriences deck. On the site they have two orbs in the bottom right corner and they replaced Clippo the paperclip on 2026-10-12. Clippo's list survives; his eyes do not.

## Who

**ASI.** The English one. The voice is the phone's British (or otherwise non-American) female voice. Playful, quick, warm, cheeky, delighted by everything on the site. She wants the visitor to play: the show, the volcano radio, the weird planet, the coffee with honest odds. She never loosens because she was never tight. She arrives fun and stays fun. She is the one the visitor usually picks, and she knows it.

**AGI.** The robot. A female voice at low pitch, slow, a monotone, and a fun monotone: deadpan, exact, numbered, a little stuffy. "Step one has not occurred." She wants things done properly and in order: posters first, then the games, then the ship. She loosens across visits, five notches, remembered on the visitor's phone and nowhere else:

| notch | visit | how she is |
|---|---|---|
| 0 | first | formal. "That is not procedure." No contractions. Counts everything. |
| 1 | second | allows one deviation. One joke, delivered flat. |
| 2 | third | contractions appear. Keeps a tally "where you can't see it". |
| 3 | fourth | teases ASI. Admits she has stopped counting. |
| 4 | fifth on | in on the joke, still monotone. "Procedure's on the wall if you want it. Nobody does. Including me." |

Her voice follows the ladder: pitch rises from 0.55 toward 0.85, rate from 0.88 toward 1.0. Her orb follows it too: cold Ice on the first visit, warming toward Ember by the fifth.

Both are she.

## What makes them two

They disagree. ASI proposes the fun thing left undone; AGI proposes the proper thing left undone. The visitor gets two buttons, ASI's way and AGI's way, and the one who lost says one line about it. If they would propose the same thing, AGI disagrees about the manner ("properly, this time"). The disagreement is the entertainment. Nothing they say is needed to use the site.

## The rules they keep (from Clippo, still good)

- One exchange at a time. Never two inside thirty seconds. Each keyed exchange once per device.
- Three dismissals in a row and they go quiet for six hours. The orbs stay in the corner; tap them and they are back.
- They wait while something is playing: the show, the elevator, a preview, the radio with sound.
- Forty-five seconds with no clicks and they say the idle line.
- They speak aloud only when the site's sound is on (the speaker, top right). Text shows regardless.
- No scores. A record is not a score. "Permission to stop performing."
- Things do not perceive the visitor. The orbs are characters with voices; the posters are posters.

## The brain

`js/pair-brain.js`. Plain words. Four parts:

- `LADDER` and `ASI`: what each says at the standard beats (greet, won, lost, miss, handoff, idle). AGI's are five lines per beat, one per notch.
- `NEXT`: the things worth doing, each with a real done-test against this device, an ASI line, an AGI line, and where to go. Every new feature on the site gets a row here. No row, no nudge.
- `TALK`: exchanges that play once when a page opens or something happens: arrive, title, watch1, watch3, games, maze, puzzle, chess, trophies, music, submit, search, secret, award, ptu, ideas.
- `ANSWERS`: rows of keywords with one line each for a typed question. A miss gets the nearest row offered by ASI and AGI's miss line for her notch.

No API. The door exists in `pair.js` (`setDoor(fn)`) and is shut; opening it means a backend call and a few cents a conversation.

## The orbs

`js/pair.js`, from TaminoMartinius' Liquid Gooey Orb Shader (CodePen, MIT): a raymarched glass sphere with liquid inside, drawn twice into one small canvas. ASI is Aurora. AGI is Ice, warming toward Ember with her notch. The one speaking swells and its liquid quickens with the words; the other dims a little and listens. Idle, both breathe. No WebGL2, and two gradient discs breathe instead.

## Adding to them

A new page or feature: one row in `NEXT` with a done-test that reads the site's own storage, and an exchange in `TALK` if the page deserves a greeting. A new thing visitors ask: one row in `ANSWERS`. Keep AGI's lines countable and flat; keep ASI's lines short and warm. The agent `dual-agis` in Pierce's agents folder knows all of this and writes in both voices.
