/* The thirteen Planet Elevator films from the SOLACE ship (decks 5A to 5M, "<Planet> Elevator"): the stateroom corridor of each
   planet, three portholes on its nebula, the SOLACE plate above. Each carries its own sound; on the ship that sound IS the floor.
   Streamed from Wix like everything else. Order is the canon order, Planet Zee to Spee-ider Grove. */
export const ELEVATORS = {
  'planet-zee': { v: '0caac7_5e8bc27573364664927aa72aff48c72a', deck: '5A', floor: 'Planet Zee Staterooms' },
  'yaaarghs-revenge': { v: '0caac7_4e0c367158114bb1beac0dbe78befe9c', deck: '5B', floor: "Yaaargh's Revenge Staterooms" },
  'oogh-iv': { v: '0caac7_da796b7f7f134f7b9dd0c7240c9b03ab', deck: '5C', floor: 'OOGH-IV Staterooms' },
  'prearth': { v: '0caac7_aa939a23c76048f69c03b44252dc8526', deck: '5D', floor: 'Prearth Staterooms' },
  'that-other-planet': { v: '0caac7_582fa61796bc467f8f6b90438c52c4a5', deck: '5E', floor: 'That Other Planet Staterooms' },
  'figuria': { v: '0caac7_148fd57f60134098a2c2523f355f1e5e', deck: '5F', floor: 'Figuria Staterooms' },
  'dens-crevice': { v: '0caac7_d7381a919f584d628c8bb48d3b8f7793', deck: '5G', floor: "Den's Crevice Staterooms" },
  'heliumdrum': { v: '0caac7_a6121de4481449b6be90529e34e130d3', deck: '5H', floor: 'Heliumdrum Staterooms' },
  'washy-washy-ii': { v: '0caac7_4b5c3e7acf954c5bb717adaae31d35fc', deck: '5I', floor: 'Washy Washy II Staterooms' },
  'yarnia': { v: '0caac7_dddd765e63cc4d0680e3b7c8c111a75b', deck: '5J', floor: 'Yarnia Staterooms' },
  'hungary': { v: '0caac7_8437bd913b77419d91e8a08ab8b034da', deck: '5K', floor: 'Hungary Staterooms' },
  'guffaw-7': { v: '0caac7_0cd04b0886a942b3bb73e1073ab55e51', deck: '5L', floor: 'Guffaw-7 Staterooms' },
  'spee-ider-grove': { v: '0caac7_e899389b270643aa9f2e69427d8e64e9', deck: '5M', floor: 'Spee-ider Grove Staterooms' },
};
export const ORDER = Object.keys(ELEVATORS);
/* the sizes Wix serves for them */
export const Q = [480, 720, 1080];
