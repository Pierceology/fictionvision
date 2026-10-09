/* Credits and licences for OVER THE BOARD. The three libraries are loaded from the jsDelivr CDN with their own licence
   notices intact; these are their licence texts, as published in each project, kept here as the licences ask. */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const MIT_BODY = `Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

const PARTS = [
  {
    name: 'chess.js', ver: '1.4.0', use: 'the rules: legal moves, check, mate and draws', lic: 'BSD 2-Clause', url: 'https://github.com/jhlywa/chess.js',
    text: `Copyright (c) 2025, Jeff Hlywa (jhlywa@gmail.com)
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.`,
  },
  {
    name: 'cm-chessboard', ver: '8.15.3', use: 'the board and the way you move pieces on it', lic: 'MIT', url: 'https://github.com/shaack/cm-chessboard',
    text: `MIT License

Copyright (c) 2017 Stefan Haack <shaack@gmail.com> (http://shaack.com)

${MIT_BODY}`,
  },
  {
    name: 'Lozza', ver: 'revision 35b11d6, July 2026', use: 'the engine that plays the beings, by Colin Jenkins', lic: 'MIT', url: 'https://github.com/op12no2/lozza',
    text: `MIT License

${MIT_BODY}`,
  },
];

export function creditsHTML() {
  return `<details class="otb-credits"><summary>Credits and licences</summary>
    <div class="cr-in">
      <p>The pieces, the capture animations and the beings' lines are made for this game. The faces are the Winthrop Review Crew. The three libraries below do the chess, and each one is loaded from the jsDelivr CDN with its own licence notice intact. Their licences, as published:</p>
      ${PARTS.map(p => `<section class="cr-part"><h3>${esc(p.name)} <small>${esc(p.ver)} · ${esc(p.lic)}</small></h3>
        <p>${esc(p.use)}. <a href="${p.url}" rel="noopener" target="_blank">${esc(p.url.replace('https://', ''))}</a></p>
        <pre>${esc(p.text)}</pre></section>`).join('')}
    </div></details>`;
}
