/* ============================================================
   soundesizer — groovebox à boucles
   - 7 panneaux de 8 pads, rangés par type de son
   - tap = lance la boucle, re-tap = stop (toggle)
   - transport global : BPM + 4/8 temps + séquenceur visuel
   - navigation par swipe + dots
   ============================================================ */

/* ---------------- Bibliothèque de formes (SVG, viewBox 0 0 100 100) ---------------- */
const SHAPES = {
  circle:    (c) => `<circle cx="50" cy="50" r="42" fill="${c}"/>`,
  square:    (c) => `<rect x="12" y="12" width="76" height="76" rx="10" fill="${c}"/>`,
  triangle:  (c) => `<polygon points="50,10 90,86 10,86" fill="${c}"/>`,
  triDown:   (c) => `<polygon points="10,16 90,16 50,90" fill="${c}"/>`,
  diamond:   (c) => `<polygon points="50,6 92,50 50,94 8,50" fill="${c}"/>`,
  star5:     (c) => `<polygon points="50,5 61,38 96,38 68,59 79,92 50,71 21,92 32,59 4,38 39,38" fill="${c}"/>`,
  star6:     (c) => `<polygon points="50,4 62,29 90,29 68,48 78,76 50,60 22,76 32,48 10,29 38,29" fill="${c}"/>`,
  star8:     (c) => `<polygon points="50,4 58,30 80,20 70,42 96,50 70,58 80,80 58,70 50,96 42,70 20,80 30,58 4,50 30,42 20,20 42,30" fill="${c}"/>`,
  hexagon:   (c) => `<polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="${c}"/>`,
  hexFlat:   (c) => `<polygon points="28,14 72,14 94,50 72,86 28,86 6,50" fill="${c}"/>`,
  pentagon:  (c) => `<polygon points="50,6 92,38 76,90 24,90 8,38" fill="${c}"/>`,
  pentaDown: (c) => `<polygon points="50,94 8,62 24,10 76,10 92,62" fill="${c}"/>`,
  octagon:   (c) => `<polygon points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32" fill="${c}"/>`,
  heart:     (c) => `<path d="M50 86C20 64 10 46 10 32a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 14-10 32-40 54Z" fill="${c}"/>`,
  cross:     (c) => `<path d="M38 8h24v30h30v24H62v30H38V62H8V38h30Z" fill="${c}"/>`,
  plusRound: (c) => `<path d="M40 10h20a6 6 0 0 1 6 6v18h18a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H66v18a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6V66H16a6 6 0 0 1-6-6V40a6 6 0 0 1 6-6h18V16a6 6 0 0 1 6-6Z" fill="${c}"/>`,
  moon:      (c) => `<path d="M64 8a44 44 0 1 0 0 84A36 36 0 0 1 64 8Z" fill="${c}"/>`,
  drop:      (c) => `<path d="M50 6C50 6 84 46 84 64a34 34 0 0 1-68 0C16 46 50 6 50 6Z" fill="${c}"/>`,
  bolt:      (c) => `<polygon points="56,4 22,54 46,54 40,96 80,40 54,40" fill="${c}"/>`,
  ring:      (c) => `<path d="M50 8a42 42 0 1 0 0 84 42 42 0 0 0 0-84Zm0 24a18 18 0 1 1 0 36 18 18 0 0 1 0-36Z" fill="${c}" fill-rule="evenodd"/>`,
  flower:    (c) => `<g fill="${c}"><circle cx="50" cy="22" r="16"/><circle cx="50" cy="78" r="16"/><circle cx="22" cy="50" r="16"/><circle cx="78" cy="50" r="16"/><circle cx="50" cy="50" r="14"/></g>`,
  cloud:     (c) => `<path d="M28 74a18 18 0 0 1-2-36 24 24 0 0 1 46-6 16 16 0 0 1 4 42Z" fill="${c}"/>`,
  leaf:      (c) => `<path d="M14 86C14 40 50 10 86 14 90 50 60 86 14 86Z" fill="${c}"/>`,
  blob:      (c) => `<path d="M70 16c14 8 22 26 16 42s-26 30-44 24S12 56 18 38 56 8 70 16Z" fill="${c}"/>`,
  semicircle:(c) => `<path d="M8 60a42 42 0 0 1 84 0Z" fill="${c}"/>`,
  trapezoid: (c) => `<polygon points="24,22 76,22 92,82 8,82" fill="${c}"/>`,
  parallelo: (c) => `<polygon points="30,22 92,22 70,82 8,82" fill="${c}"/>`,
  chevron:   (c) => `<polygon points="20,12 50,40 80,12 92,24 50,66 8,24" fill="${c}"/>`,
  chevronDown:(c)=> `<polygon points="8,76 50,34 92,76 80,88 50,58 20,88" fill="${c}"/>`,
  hourglass: (c) => `<polygon points="16,12 84,12 50,50 84,88 16,88 50,50" fill="${c}"/>`,
  kite:      (c) => `<polygon points="50,6 84,40 50,94 16,40" fill="${c}"/>`,
  pill:      (c) => `<rect x="10" y="30" width="80" height="40" rx="20" fill="${c}"/>`,
  capsuleV:  (c) => `<rect x="32" y="10" width="36" height="80" rx="18" fill="${c}"/>`,
  shield:    (c) => `<path d="M50 6 86 18v30c0 26-18 38-36 46C32 86 14 74 14 48V18Z" fill="${c}"/>`,
  burst:     (c) => `<polygon points="50,2 58,30 80,12 70,38 98,42 72,52 88,76 60,66 56,96 44,68 18,84 30,56 4,52 30,40 18,16 44,30" fill="${c}"/>`,
  arrow:     (c) => `<polygon points="50,6 90,46 66,46 66,94 34,94 34,46 10,46" fill="${c}"/>`,
  arrowRight:(c) => `<polygon points="10,36 56,36 56,18 92,50 56,82 56,64 10,64" fill="${c}"/>`,
  gem:       (c) => `<polygon points="30,10 70,10 92,38 50,92 8,38" fill="${c}"/>`,
  crystal:   (c) => `<polygon points="50,6 78,34 62,94 38,94 22,34" fill="${c}"/>`,
  spiralDot: (c) => `<g fill="${c}"><circle cx="50" cy="50" r="40" opacity="0.35"/><circle cx="50" cy="50" r="26" opacity="0.6"/><circle cx="50" cy="50" r="12"/></g>`,
  sun:       (c) => `<g fill="${c}"><circle cx="50" cy="50" r="24"/><g stroke="${c}" stroke-width="7" stroke-linecap="round"><line x1="50" y1="6" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="94"/><line x1="6" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="94" y2="50"/><line x1="19" y1="19" x2="29" y2="29"/><line x1="71" y1="71" x2="81" y2="81"/><line x1="81" y1="19" x2="71" y2="29"/><line x1="29" y1="71" x2="19" y2="81"/></g></g>`,
  pinwheel:  (c) => `<g fill="${c}"><path d="M50 50 50 8a42 42 0 0 1 36 21Z"/><path d="M50 50 86 71a42 42 0 0 1-36 21Z"/><path d="M50 50 14 71a42 42 0 0 1 0-42Z"/></g>`,
  lens:      (c) => `<path d="M8 50C30 16 70 16 92 50 70 84 30 84 8 50Z" fill="${c}"/>`,
  zigzag:    (c) => `<polygon points="14,72 32,28 50,72 68,28 86,72 78,86 68,52 50,90 32,52 22,86" fill="${c}"/>`,
  doubleTri: (c) => `<g fill="${c}"><polygon points="50,8 86,50 14,50"/><polygon points="50,92 86,50 14,50" opacity="0.55"/></g>`,
  triPair:   (c) => `<g fill="${c}"><polygon points="28,14 50,52 6,52"/><polygon points="72,48 94,86 50,86"/></g>`,
  bowtie:    (c) => `<polygon points="14,18 50,46 86,18 86,82 50,54 14,82" fill="${c}"/>`,
  waveform:  (c) => `<g fill="${c}"><rect x="10" y="40" width="9" height="20" rx="3"/><rect x="25" y="26" width="9" height="48" rx="3"/><rect x="40" y="12" width="9" height="76" rx="3"/><rect x="55" y="30" width="9" height="40" rx="3"/><rect x="70" y="20" width="9" height="60" rx="3"/><rect x="85" y="44" width="5" height="12" rx="2.5"/></g>`,
  spark4:    (c) => `<polygon points="50,6 60,40 94,50 60,60 50,94 40,60 6,50 40,40" fill="${c}"/>`,
  eye:       (c) => `<g><path d="M8 50C28 22 72 22 92 50 72 78 28 78 8 50Z" fill="${c}"/><circle cx="50" cy="50" r="12" fill="#13142b"/></g>`,
  squircle:  (c) => `<rect x="12" y="12" width="76" height="76" rx="30" fill="${c}"/>`,
  target:    (c) => `<g fill="none" stroke="${c}" stroke-width="9"><circle cx="50" cy="50" r="38"/><circle cx="50" cy="50" r="20"/></g><circle cx="50" cy="50" r="6" fill="${c}"/>`,
  atom:      (c) => `<g fill="none" stroke="${c}" stroke-width="7"><ellipse cx="50" cy="50" rx="42" ry="16"/><ellipse cx="50" cy="50" rx="42" ry="16" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="42" ry="16" transform="rotate(120 50 50)"/></g><circle cx="50" cy="50" r="7" fill="${c}"/>`,
  ribbon:    (c) => `<path d="M20 20h60l-15 30 15 30H20l15-30Z" fill="${c}"/>`,
  waterdrops:(c) => `<g fill="${c}"><circle cx="34" cy="40" r="18"/><circle cx="66" cy="62" r="14"/></g>`,
  quaver:    (c) => `<g fill="${c}"><circle cx="34" cy="74" r="14"/><rect x="44" y="16" width="8" height="58"/><path d="M52 16c18 4 24 16 20 32-2-12-10-16-20-18Z"/></g>`,
};

/* ---------------- Notes ---------------- */
const N = { // fréquences (Hz)
  A1: 55, B1: 61.74, C2: 65.41, D2: 73.42, E2: 82.41, G2: 98, A2: 110, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196, A3: 220, C4: 261.63, E4: 329.63, G4: 392,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, B5: 987.77, C6: 1046.5,
};

/* ---------------- Les 7 panneaux ---------------- */
const PANELS = [
  {
    name: "Pop", glow: "#ff8ad4",
    palette: ["#ff8ad4","#c58cff","#8c9cff","#6ce0e0","#7ce0a8","#ffd58a","#ff9fb0","#b0a0ff"],
    pads: [
      { kind:"drone", shape:"circle",     freqs:[N.C3,N.E3,N.G3] },
      { kind:"drone", shape:"blob",       freqs:[N.A2,N.C4,N.E4] },
      { kind:"drone", shape:"cloud",      freqs:[N.D3,N.G3,N.A3] },
      { kind:"drone", shape:"flower",     freqs:[N.E3,N.G3,N.B5/4] },
      { kind:"drone", shape:"squircle",   freqs:[N.G2,N.D3,N.G3] },
      { kind:"drone", shape:"semicircle", freqs:[N.C4,N.E4,N.G4] },
      { kind:"drone", shape:"waterdrops", freqs:[N.A3,N.C4,N.E4] },
      { kind:"drone", shape:"lens",       freqs:[N.C3,N.G3,N.C4] },
    ],
  },
  {
    name: "Bass", glow: "#6c7bff",
    palette: ["#6c7bff","#5c8cff","#5ca8ff","#7c5cff","#8c6cff","#5c6bff","#6c9cff","#9c7cff"],
    pads: [
      { kind:"bass", shape:"square",   freq:N.A1, pat:"beat" },
      { kind:"bass", shape:"hexagon",  freq:N.C2, pat:"off"  },
      { kind:"bass", shape:"octagon",  freq:N.D2, pat:"beat" },
      { kind:"bass", shape:"trapezoid",freq:N.E2, pat:"half" },
      { kind:"bass", shape:"shield",   freq:N.G2, pat:"beat" },
      { kind:"bass", shape:"hexFlat",  freq:N.A2, pat:"off"  },
      { kind:"bass", shape:"pill",     freq:N.B1, pat:"beat" },
      { kind:"bass", shape:"capsuleV", freq:N.C3, pat:"down" },
    ],
  },
  {
    name: "Beat", glow: "#ff7a3c",
    palette: ["#ff7a3c","#ff5c4c","#ff8f3c","#ff6c6c","#ffa23c","#ff5c7c","#ff9c5c","#ff6c3c"],
    pads: [
      { kind:"beat", shape:"cross",      groove:[["kick","beat"],["hat","off"]] },
      { kind:"beat", shape:"plusRound",  groove:[["kick","half"],["snare","back"],["hat","every"]] },
      { kind:"beat", shape:"diamond",    groove:[["kick","beat"],["clap","back"],["hat","off"]] },
      { kind:"beat", shape:"bowtie",     groove:[["kick","push"],["hat","every"],["snare","back"]] },
      { kind:"beat", shape:"hourglass",  groove:[["kick","half"],["snare","back"],["hat","every"]] },
      { kind:"beat", shape:"zigzag",     groove:[["tom","beat"],["kick","down"]] },
      { kind:"beat", shape:"chevron",    groove:[["rim","off"],["cowbell","beat"]] },
      { kind:"beat", shape:"chevronDown",groove:[["kick","half"],["snare","push"],["hat","every"]] },
    ],
  },
  {
    name: "Drums", glow: "#ffcf4a",
    palette: ["#ffcf4a","#ffd96a","#ffbe4a","#ffe08a","#ffc24a","#ffd24a","#ffe86a","#ffb84a"],
    pads: [
      { kind:"drums", shape:"triangle", drum:"kick",    pat:"beat" },
      { kind:"drums", shape:"triDown",  drum:"snare",   pat:"back" },
      { kind:"drums", shape:"kite",     drum:"hat",     pat:"every" },
      { kind:"drums", shape:"crystal",  drum:"clap",    pat:"back" },
      { kind:"drums", shape:"pentaDown",drum:"tom",     pat:"half" },
      { kind:"drums", shape:"gem",      drum:"rim",     pat:"off"  },
      { kind:"drums", shape:"pentagon", drum:"cowbell", pat:"beat" },
      { kind:"drums", shape:"doubleTri",drum:"crash",   pat:"down" },
    ],
  },
  {
    name: "Effects", glow: "#4ad7ff",
    palette: ["#4ad7ff","#4affd1","#6affa8","#4affe8","#8affd1","#4ad7ff","#6ac8ff","#4af0ff"],
    pads: [
      { kind:"fx", shape:"bolt",      fx:"zap"   },
      { kind:"fx", shape:"spark4",    fx:"laser" },
      { kind:"fx", shape:"burst",     fx:"riser" },
      { kind:"fx", shape:"star8",     fx:"swell" },
      { kind:"fx", shape:"atom",      fx:"wobble"},
      { kind:"fx", shape:"target",    fx:"drop"  },
      { kind:"fx", shape:"ring",      fx:"sweep" },
      { kind:"fx", shape:"spiralDot", fx:"noise" },
    ],
  },
  {
    name: "Synth", glow: "#b85cff",
    palette: ["#b85cff","#d65cff","#9c5cff","#c45cff","#e05cff","#a85cff","#cf5cff","#8c5cff"],
    pads: [
      { kind:"synth", shape:"star5",    freq:N.C5, wave:"square",   pat:"off"   },
      { kind:"synth", shape:"star6",    freq:N.D5, wave:"square",   pat:"every" },
      { kind:"synth", shape:"sun",      freq:N.E5, wave:"sawtooth", pat:"off"   },
      { kind:"synth", shape:"pinwheel", freq:N.G5, wave:"square",   pat:"off"   },
      { kind:"synth", shape:"quaver",   freq:N.A5, wave:"sawtooth", pat:"off"   },
      { kind:"synth", shape:"waveform", freq:N.B5, wave:"square",   pat:"every" },
      { kind:"synth", shape:"ribbon",   freq:N.C6, wave:"sawtooth", pat:"off"   },
      { kind:"synth", shape:"moon",     freq:N.G4, wave:"square",   pat:"beat"  },
    ],
  },
  {
    name: "Voice", glow: "#4ae0a0",
    palette: ["#4ae0a0","#4ad7d1","#6ae0b8","#4ae0c0","#8ae0a0","#4ad7a8","#6ad7d1","#4ae090"],
    pads: [
      { kind:"voice", shape:"heart",     word:"dance"      },
      { kind:"voice", shape:"drop",      word:"love"       },
      { kind:"voice", shape:"leaf",      word:"jump"       },
      { kind:"voice", shape:"eye",       word:"oh my god"  },
      { kind:"voice", shape:"arrow",     word:"yeah baby"  },
      { kind:"voice", shape:"arrowRight",word:"boom"       },
      { kind:"voice", shape:"triPair",   word:"hello"      },
      { kind:"voice", shape:"parallelo", word:"let's go"   },
    ],
  },
];

/* ============================================================
   AUDIO
   ============================================================ */
let ctx = null, master = null;
function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.85;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function noiseBuffer(dur) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

// Note enveloppée générique
function envTone(time, freq, wave, dur, peak, cutoff) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = wave;
  o.frequency.setValueAtTime(freq, time);
  let node = o;
  if (cutoff) {
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(cutoff, time);
    o.connect(f);
    node = f;
  }
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(peak, time + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  node.connect(g).connect(master);
  o.start(time);
  o.stop(time + dur + 0.03);
}

function playDrum(kind, time) {
  const out = ctx.createGain();
  out.gain.value = 0.9;
  out.connect(master);

  const tone = (f0, f1, dur, type = "sine", vol = 0.9) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, time);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), time + dur);
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g).connect(out);
    o.start(time); o.stop(time + dur);
  };
  const noise = (dur, hp, vol = 0.7) => {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(dur);
    const g = ctx.createGain(), filt = ctx.createBiquadFilter();
    filt.type = "highpass"; filt.frequency.value = hp;
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(filt).connect(g).connect(out);
    src.start(time); src.stop(time + dur);
  };

  switch (kind) {
    case "kick":    tone(150, 45, 0.4, "sine", 1.0); break;
    case "snare":   tone(180, 90, 0.18, "triangle", 0.5); noise(0.2, 1200, 0.7); break;
    case "hat":     noise(0.05, 8000, 0.4); break;
    case "tom":     tone(220, 90, 0.35, "sine", 0.9); break;
    case "clap":    noise(0.02, 1500, 0.6); setTimeout(() => { if (ctx) noise(0.12, 1500, 0.6); }, 16); break;
    case "rim":     tone(440, 300, 0.06, "square", 0.5); break;
    case "cowbell": tone(560, 560, 0.16, "square", 0.4); tone(845, 845, 0.16, "square", 0.3); break;
    case "crash":   noise(0.6, 6000, 0.5); break;
    default:        noise(0.25, 400, 0.6); break;
  }
}

function playFx(kind, time) {
  const out = ctx.createGain();
  out.gain.value = 0.8;
  out.connect(master);

  const sweepTone = (f0, f1, dur, type, vol) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, time);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), time + dur);
    g.gain.setValueAtTime(vol, time);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g).connect(out);
    o.start(time); o.stop(time + dur + 0.02);
  };
  const noiseSweep = (f0, f1, dur, vol, up) => {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(dur);
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "bandpass"; f.Q.value = 6;
    f.frequency.setValueAtTime(f0, time);
    f.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), time + dur);
    g.gain.setValueAtTime(up ? 0.0001 : vol, time);
    g.gain.exponentialRampToValueAtTime(up ? vol : 0.0001, time + dur);
    src.connect(f).connect(g).connect(out);
    src.start(time); src.stop(time + dur);
  };

  switch (kind) {
    case "zap":    sweepTone(900, 120, 0.18, "sawtooth", 0.6); break;
    case "laser":  sweepTone(1800, 200, 0.3, "square", 0.4); break;
    case "riser":  noiseSweep(300, 6000, 1.1, 0.5, true); break;
    case "swell":  noiseSweep(6000, 500, 1.0, 0.5, false); break;
    case "wobble": {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(),
            lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = "sawtooth"; o.frequency.value = 110;
      f.type = "lowpass"; f.frequency.value = 700;
      lfo.frequency.value = 6; lg.gain.value = 500;
      lfo.connect(lg).connect(f.frequency);
      g.gain.setValueAtTime(0.5, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 1.0);
      o.connect(f).connect(g).connect(out);
      o.start(time); lfo.start(time); o.stop(time + 1.0); lfo.stop(time + 1.0);
      break;
    }
    case "drop":   sweepTone(400, 40, 0.5, "sine", 0.7); break;
    case "sweep":  noiseSweep(400, 4000, 0.7, 0.45, true); break;
    default:       { // noise burst
      const src = ctx.createBufferSource(); src.buffer = noiseBuffer(0.4);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.4, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
      src.connect(g).connect(out); src.start(time); src.stop(time + 0.4);
    }
  }
}

// Nappe continue (drone) — renvoie un handle avec stop()
function startDrone(freqs) {
  const t = ctx.currentTime;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(0.14, t + 0.7);
  g.connect(master);
  const oscs = [];
  freqs.forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = i === 0 ? "sine" : "triangle";
    o.frequency.value = f;
    o.detune.value = (i - 1) * 4; // léger désaccord pour la chaleur
    o.connect(g);
    o.start(t);
    oscs.push(o);
  });
  return {
    stop() {
      const now = ctx.currentTime;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0.0001, now + 0.45);
      oscs.forEach((o) => { try { o.stop(now + 0.5); } catch (e) {} });
    },
  };
}

function speakWord(word) {
  if (!("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(word);
    u.rate = 1.05; u.pitch = 1; u.volume = 1;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}

/* ============================================================
   TRANSPORT / SÉQUENCEUR
   ============================================================ */
const SPB = 2;                         // sous-pas par temps (croches)
const transport = { bpm: 110, beats: 8 };
let playing = false;
let userPaused = false;
let timerId = null;
let currentSub = 0;
let nextTime = 0;
const LOOKAHEAD = 0.1, TICK_MS = 25;

const active = new Map();              // "p:i" -> pad (méta)
const drones = new Map();              // "p:i" -> handle
const visualQueue = [];                // {sub, time, fired:[keys]}

function totalSubs() { return transport.beats * SPB; }
function subDur() { return (60 / transport.bpm) / SPB; }

// Un pad rythmique doit-il déclencher sur ce sous-pas ?
function hits(name, sub) {
  const beat = Math.floor(sub / SPB);
  const onBeat = sub % SPB === 0;
  switch (name) {
    case "every": return true;
    case "beat":  return onBeat;
    case "half":  return onBeat && beat % 2 === 0;
    case "back":  return onBeat && beat % 2 === 1;
    case "off":   return sub % SPB === 1;
    case "push":  return onBeat && (beat % 4 === 0 || beat % 4 === 3);
    case "down":  return sub === 0;
    default:      return onBeat;
  }
}

// Déclenche l'audio d'un pad ; renvoie true s'il a sonné (pour le visuel)
function triggerPad(pad, time, sub) {
  switch (pad.kind) {
    case "bass":
      if (hits(pad.pat, sub)) { envTone(time, pad.freq, "sawtooth", 0.3, 0.45, 700); return true; }
      return false;
    case "synth":
      if (hits(pad.pat, sub)) { envTone(time, pad.freq, pad.wave, 0.18, 0.22, 3500); return true; }
      return false;
    case "drums":
      if (hits(pad.pat, sub)) { playDrum(pad.drum, time); return true; }
      return false;
    case "beat": {
      let any = false;
      pad.groove.forEach(([drum, pat]) => { if (hits(pat, sub)) { playDrum(drum, time); any = true; } });
      return any;
    }
    case "fx":
      if (sub === 0) { playFx(pad.fx, time); return true; }
      return false;
    case "voice":
      // la parole est déclenchée dans la boucle visuelle (pas d'ordonnancement audio précis)
      return sub === 0;
    default:
      return false;
  }
}

function scheduleSub(sub, time) {
  const fired = [];
  active.forEach((pad, key) => {
    if (pad.kind === "drone") return;
    if (triggerPad(pad, time, sub)) fired.push(key);
  });
  visualQueue.push({ sub, time, fired });
}

function schedulerTick() {
  while (nextTime < ctx.currentTime + LOOKAHEAD) {
    scheduleSub(currentSub, nextTime);
    nextTime += subDur();
    currentSub = (currentSub + 1) % totalSubs();
  }
  timerId = setTimeout(schedulerTick, TICK_MS);
}

function startPlaying() {
  if (playing) return;
  getCtx();
  playing = true;
  userPaused = false;
  currentSub = 0;
  nextTime = ctx.currentTime + 0.08;
  // (re)démarre les nappes actives
  active.forEach((pad, key) => {
    if (pad.kind === "drone" && !drones.has(key)) drones.set(key, startDrone(pad.freqs));
  });
  schedulerTick();
  requestAnimationFrame(visualLoop);
  playBtn.classList.add("playing");
  playBtn.textContent = "❚❚";
}

function stopPlaying() {
  playing = false;
  clearTimeout(timerId);
  drones.forEach((h) => h.stop());
  drones.clear();
  visualQueue.length = 0;
  playBtn.classList.remove("playing");
  playBtn.textContent = "▶";
  clearPlayhead();
}

function clearAll() {
  active.forEach((pad, key) => {
    const el = padEls.get(key);
    if (el) el.classList.remove("active");
  });
  active.clear();
  stopPlaying();
  updateDotActivity();
}

/* ---------------- Boucle visuelle ---------------- */
let lastBeatShown = -1;
function visualLoop() {
  if (!playing) return;
  const now = ctx.currentTime;
  while (visualQueue.length && visualQueue[0].time <= now) {
    const e = visualQueue.shift();
    const beat = Math.floor(e.sub / SPB);
    if (beat !== lastBeatShown) { setPlayhead(beat); lastBeatShown = beat; }
    e.fired.forEach((key) => {
      const pad = active.get(key);
      if (!pad) return;
      flashPad(key);
      if (pad.kind === "voice") speakWord(pad.word);
    });
  }
  requestAnimationFrame(visualLoop);
}

/* ============================================================
   DOM
   ============================================================ */
const track = document.getElementById("track");
const dotsWrap = document.getElementById("dots");
const panelLabel = document.getElementById("panelLabel");
const seqBar = document.getElementById("seqBar");
const playBtn = document.getElementById("playBtn");
const clearBtn = document.getElementById("clearBtn");
const bpmVal = document.getElementById("bpmVal");
const padEls = new Map();

PANELS.forEach((panel, pi) => {
  const slide = document.createElement("section");
  slide.className = "slide";
  const grid = document.createElement("div");
  grid.className = "grid";

  panel.pads.forEach((pad, i) => {
    const key = `${pi}:${i}`;
    const color = panel.palette[i % panel.palette.length];
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.type = "button";
    cell.style.setProperty("--glow", panel.glow);
    cell.setAttribute("aria-label", `${panel.name} ${i + 1}`);
    cell.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${SHAPES[pad.shape](color)}</svg>`;

    cell.addEventListener("click", (e) => {
      e.preventDefault();
      if (suppressTap) return;
      togglePad(pi, i, cell, e);
    });

    padEls.set(key, cell);
    grid.appendChild(cell);
  });

  slide.appendChild(grid);
  track.appendChild(slide);

  const dot = document.createElement("button");
  dot.className = "dot" + (pi === 0 ? " active" : "");
  dot.type = "button";
  dot.style.setProperty("--dot-glow", panel.glow);
  dot.setAttribute("aria-label", `écran ${pi + 1} : ${panel.name}`);
  dot.addEventListener("click", () => goTo(pi));
  dotsWrap.appendChild(dot);
});

/* ---------------- Toggle d'un pad ---------------- */
function togglePad(pi, i, cell, e) {
  const key = `${pi}:${i}`;
  const pad = PANELS[pi].pads[i];
  getCtx();

  if (active.has(key)) {
    active.delete(key);
    cell.classList.remove("active");
    if (drones.has(key)) { drones.get(key).stop(); drones.delete(key); }
  } else {
    active.set(key, { ...pad, panel: pi });
    cell.classList.add("active");
    rippleAt(cell, e);
    if (!playing) startPlaying();                    // (re)démarre le transport, remet les nappes
    else if (pad.kind === "drone" && !drones.has(key)) drones.set(key, startDrone(pad.freqs));
    flashPad(key);
  }
  updateDotActivity();
}

/* ---------------- Effets visuels ---------------- */
function flashPad(key) {
  const el = padEls.get(key);
  if (!el || typeof el.animate !== "function") return;
  const svg = el.querySelector("svg");
  (svg || el).animate(
    [{ transform: "scale(1.22)", filter: "brightness(1.8)" }, { transform: "scale(1)", filter: "brightness(1)" }],
    { duration: 240, easing: "ease-out" }
  );
}

function rippleAt(cell, e) {
  const r = document.createElement("span");
  r.className = "ripple";
  const rect = cell.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.6;
  const x = (e && e.clientX ? e.clientX - rect.left : rect.width / 2) - size / 2;
  const y = (e && e.clientY ? e.clientY - rect.top : rect.height / 2) - size / 2;
  r.style.width = r.style.height = size + "px";
  r.style.left = x + "px";
  r.style.top = y + "px";
  cell.appendChild(r);
  if (typeof r.animate === "function") {
    const a = r.animate(
      [{ transform: "scale(0)", opacity: 0.5 }, { transform: "scale(1)", opacity: 0 }],
      { duration: 550, easing: "ease-out" }
    );
    a.onfinish = () => r.remove();
  } else {
    setTimeout(() => r.remove(), 550);
  }
}

function updateDotActivity() {
  const dots = dotsWrap.children;
  for (let p = 0; p < PANELS.length; p++) {
    let has = false;
    for (let i = 0; i < PANELS[p].pads.length; i++) {
      if (active.has(`${p}:${i}`)) { has = true; break; }
    }
    dots[p].classList.toggle("has-active", has);
  }
}

/* ---------------- Séquenceur visuel ---------------- */
let stepEls = [];
function buildSeqBar() {
  seqBar.innerHTML = "";
  stepEls = [];
  for (let b = 0; b < transport.beats; b++) {
    const s = document.createElement("div");
    s.className = "step";
    seqBar.appendChild(s);
    stepEls.push(s);
  }
  lastBeatShown = -1;
}
function setPlayhead(beat) {
  stepEls.forEach((s, i) => s.classList.toggle("play", i === beat));
}
function clearPlayhead() {
  stepEls.forEach((s) => s.classList.remove("play"));
  lastBeatShown = -1;
}

/* ============================================================
   NAVIGATION (swipe + dots)
   ============================================================ */
const viewport = document.querySelector(".viewport");
const dots = Array.from(dotsWrap.children);
let current = 0;
let suppressTap = false;

function setTransform(x, animate) {
  track.style.transition = animate ? "transform 0.32s cubic-bezier(.22,.61,.36,1)" : "none";
  track.style.transform = `translateX(${x}px)`;
}
function goTo(index) {
  current = Math.max(0, Math.min(PANELS.length - 1, index));
  setTransform(-current * viewport.clientWidth, true);
  dots.forEach((d, i) => d.classList.toggle("active", i === current));
  panelLabel.textContent = PANELS[current].name;
}
window.addEventListener("resize", () => setTransform(-current * viewport.clientWidth, false));

let startX = 0, startY = 0, dragging = false, locked = null;
viewport.addEventListener("pointerdown", (e) => {
  dragging = true; locked = null; suppressTap = false;
  startX = e.clientX; startY = e.clientY;
  setTransform(-current * viewport.clientWidth, false);
});
viewport.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - startX, dy = e.clientY - startY;
  if (locked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
    locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  }
  if (locked !== "x") return;
  suppressTap = true;
  let offset = -current * viewport.clientWidth + dx;
  const max = 0, min = -(PANELS.length - 1) * viewport.clientWidth;
  if (offset > max) offset = max + (offset - max) * 0.35;
  if (offset < min) offset = min + (offset - min) * 0.35;
  setTransform(offset, false);
});
function endDrag(e) {
  if (!dragging) return;
  dragging = false;
  const dx = e.clientX - startX;
  const threshold = Math.min(80, viewport.clientWidth * 0.2);
  if (locked === "x" && Math.abs(dx) > threshold) goTo(current + (dx < 0 ? 1 : -1));
  else goTo(current);
  setTimeout(() => { suppressTap = false; }, 0);
}
viewport.addEventListener("pointerup", endDrag);
viewport.addEventListener("pointercancel", endDrag);
viewport.addEventListener("pointerleave", (e) => { if (dragging) endDrag(e); });

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") goTo(current - 1);
  if (e.key === "ArrowRight") goTo(current + 1);
});

/* ============================================================
   CONTRÔLES DE TRANSPORT
   ============================================================ */
playBtn.addEventListener("click", () => {
  getCtx();
  if (playing) { userPaused = true; stopPlaying(); }
  else { userPaused = false; startPlaying(); }
});

clearBtn.addEventListener("click", clearAll);

document.querySelectorAll("[data-bpm]").forEach((btn) => {
  btn.addEventListener("click", () => {
    transport.bpm = Math.max(60, Math.min(180, transport.bpm + parseInt(btn.dataset.bpm, 10)));
    bpmVal.textContent = transport.bpm;
  });
});

document.querySelectorAll("[data-beats]").forEach((btn) => {
  btn.addEventListener("click", () => {
    transport.beats = parseInt(btn.dataset.beats, 10);
    document.querySelectorAll("[data-beats]").forEach((b) => b.classList.toggle("sel", b === btn));
    currentSub = currentSub % totalSubs();
    buildSeqBar();
  });
});

/* ---------------- Init ---------------- */
bpmVal.textContent = transport.bpm;
buildSeqBar();
goTo(0);
