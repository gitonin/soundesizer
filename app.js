/* ============================================================
   soundesizer — 5 écrans × 8 formes, sons synthétisés + swipe
   ============================================================ */

/* ---------------- Bibliothèque de formes (SVG) ----------------
   Chaque fonction renvoie le contenu interne d'un <svg viewBox="0 0 100 100">.
   La couleur est passée en paramètre.                            */
const SHAPES = {
  circle:    (c) => `<circle cx="50" cy="50" r="42" fill="${c}"/>`,
  square:    (c) => `<rect x="12" y="12" width="76" height="76" rx="10" fill="${c}"/>`,
  triangle:  (c) => `<polygon points="50,10 90,86 10,86" fill="${c}"/>`,
  triDown:   (c) => `<polygon points="10,16 90,16 50,90" fill="${c}"/>`,
  diamond:   (c) => `<polygon points="50,6 92,50 50,94 8,50" fill="${c}"/>`,
  star5:     (c) => `<polygon points="50,5 61,38 96,38 68,59 79,92 50,71 21,92 32,59 4,38 39,38" fill="${c}"/>`,
  star6:     (c) => `<polygon points="50,4 62,29 90,29 68,48 78,76 50,60 22,76 32,48 10,29 38,29" fill="${c}"/>`,
  hexagon:   (c) => `<polygon points="50,6 88,28 88,72 50,94 12,72 12,28" fill="${c}"/>`,
  pentagon:  (c) => `<polygon points="50,6 92,38 76,90 24,90 8,38" fill="${c}"/>`,
  octagon:   (c) => `<polygon points="32,8 68,8 92,32 92,68 68,92 32,92 8,68 8,32" fill="${c}"/>`,
  heart:     (c) => `<path d="M50 86C20 64 10 46 10 32a20 20 0 0 1 40-6 20 20 0 0 1 40 6c0 14-10 32-40 54Z" fill="${c}"/>`,
  cross:     (c) => `<path d="M38 8h24v30h30v24H62v30H38V62H8V38h30Z" fill="${c}"/>`,
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
  hourglass: (c) => `<polygon points="16,12 84,12 50,50 84,88 16,88 50,50" fill="${c}"/>`,
  kite:      (c) => `<polygon points="50,6 84,40 50,94 16,40" fill="${c}"/>`,
  pill:      (c) => `<rect x="10" y="30" width="80" height="40" rx="20" fill="${c}"/>`,
  shield:    (c) => `<path d="M50 6 86 18v30c0 26-18 38-36 46C32 86 14 74 14 48V18Z" fill="${c}"/>`,
  burst:     (c) => `<polygon points="50,2 58,30 80,12 70,38 98,42 72,52 88,76 60,66 56,96 44,68 18,84 30,56 4,52 30,40 18,16 44,30" fill="${c}"/>`,
  arrow:     (c) => `<polygon points="50,6 90,46 66,46 66,94 34,94 34,46 10,46" fill="${c}"/>`,
  gem:       (c) => `<polygon points="30,10 70,10 92,38 50,92 8,38" fill="${c}"/>`,
  spiralDot: (c) => `<g fill="${c}"><circle cx="50" cy="50" r="40" opacity="0.35"/><circle cx="50" cy="50" r="26" opacity="0.6"/><circle cx="50" cy="50" r="12"/></g>`,
  sun:       (c) => `<g fill="${c}"><circle cx="50" cy="50" r="24"/><g stroke="${c}" stroke-width="7" stroke-linecap="round"><line x1="50" y1="6" x2="50" y2="20"/><line x1="50" y1="80" x2="50" y2="94"/><line x1="6" y1="50" x2="20" y2="50"/><line x1="80" y1="50" x2="94" y2="50"/><line x1="19" y1="19" x2="29" y2="29"/><line x1="71" y1="71" x2="81" y2="81"/><line x1="81" y1="19" x2="71" y2="29"/><line x1="29" y1="71" x2="19" y2="81"/></g></g>`,
  pinwheel:  (c) => `<g fill="${c}"><path d="M50 50 50 8a42 42 0 0 1 36 21Z"/><path d="M50 50 86 71a42 42 0 0 1-36 21Z"/><path d="M50 50 14 71a42 42 0 0 1 0-42Z"/></g>`,
  lens:      (c) => `<path d="M8 50C30 16 70 16 92 50 70 84 30 84 8 50Z" fill="${c}"/>`,
  zigzag:    (c) => `<polygon points="14,72 32,28 50,72 68,28 86,72 78,86 68,52 50,90 32,52 22,86" fill="${c}"/>`,
  doubleTri: (c) => `<g fill="${c}"><polygon points="50,8 86,50 14,50"/><polygon points="50,92 86,50 14,50" opacity="0.55"/></g>`,
  plusRound: (c) => `<path d="M40 10h20a6 6 0 0 1 6 6v18h18a6 6 0 0 1 6 6v20a6 6 0 0 1-6 6H66v18a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6V66H16a6 6 0 0 1-6-6V40a6 6 0 0 1 6-6h18V16a6 6 0 0 1 6-6Z" fill="${c}"/>`,
  bowtie:    (c) => `<polygon points="14,18 50,46 86,18 86,82 50,54 14,82" fill="${c}"/>`,
  capsuleV:  (c) => `<rect x="32" y="10" width="36" height="80" rx="18" fill="${c}"/>`,
};

/* ---------------- Définition des 5 écrans ----------------
   Chaque écran = un thème sonore (timbre) + 8 formes/notes différentes.
   freq = fréquence de la note ; wave = forme d'onde de l'oscillateur.   */

// Gammes pentatoniques pour des combinaisons agréables
const SCALE_A = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // Do majeur
const SCALE_B = [220.00, 246.94, 293.66, 329.63, 392.00, 440.00, 493.88, 587.33];
const SCALE_C = [196.00, 233.08, 261.63, 311.13, 349.23, 415.30, 466.16, 523.25];
const SCALE_D = [130.81, 146.83, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23]; // graves
const DRUMS   = ["kick", "snare", "hat", "tom", "clap", "rim", "cowbell", "noise"];

const SLIDES = [
  {
    // Écran 1 — Tons purs (sinusoïde)
    palette: ["#7c5cff", "#5c8cff", "#4ad7d1", "#48d18a", "#d6d14a", "#ff9f43", "#ff5c8a", "#c45cff"],
    shapes:  ["circle", "square", "triangle", "diamond", "star5", "hexagon", "pentagon", "octagon"],
    sound:   { type: "tone", wave: "sine" },
    scale:   SCALE_A,
  },
  {
    // Écran 2 — Rétro 8-bit (carré)
    palette: ["#ff5c8a", "#ff7a5c", "#ffb05c", "#ffe15c", "#9be15c", "#5ce1c1", "#5cb0ff", "#a45cff"],
    shapes:  ["heart", "cross", "moon", "drop", "bolt", "ring", "arrow", "gem"],
    sound:   { type: "tone", wave: "square" },
    scale:   SCALE_B,
  },
  {
    // Écran 3 — Doux / pads (triangle)
    palette: ["#4ad7d1", "#48d18a", "#7ce05c", "#b9e05c", "#5cc6e0", "#5c8cff", "#8e7cff", "#c45cff"],
    shapes:  ["flower", "cloud", "leaf", "blob", "semicircle", "trapezoid", "spiralDot", "pill"],
    sound:   { type: "tone", wave: "triangle" },
    scale:   SCALE_C,
  },
  {
    // Écran 4 — Basses (dent de scie)
    palette: ["#ff5c5c", "#ff7a5c", "#ff5c8a", "#c45cff", "#7c5cff", "#5c6bff", "#5c8cff", "#5cb8ff"],
    shapes:  ["star6", "burst", "shield", "parallelo", "chevron", "hourglass", "kite", "triDown"],
    sound:   { type: "tone", wave: "sawtooth" },
    scale:   SCALE_D,
  },
  {
    // Écran 5 — Percussions (bruit / synthèse)
    palette: ["#f4f4ff", "#ffd05c", "#ff8f5c", "#ff5c8a", "#c45cff", "#5cc6e0", "#5ce19b", "#9be15c"],
    shapes:  ["sun", "pinwheel", "lens", "zigzag", "doubleTri", "plusRound", "bowtie", "capsuleV"],
    sound:   { type: "drum" },
    scale:   DRUMS,
  },
];

/* ---------------- Audio (Web Audio API) ---------------- */
let audioCtx = null;
function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function playTone(freq, wave) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = wave;
  osc.frequency.setValueAtTime(freq, now);

  // Enveloppe douce (attaque rapide, release naturel)
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.32, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.95);
}

function noiseBuffer(ctx, duration) {
  const len = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function playDrum(kind) {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const out = ctx.createGain();
  out.gain.value = 0.6;
  out.connect(ctx.destination);

  const tone = (f0, f1, dur, type = "sine", vol = 0.9) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f0, now);
    o.frequency.exponentialRampToValueAtTime(f1, now + dur);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.connect(g).connect(out);
    o.start(now);
    o.stop(now + dur);
  };

  const noise = (dur, hp, vol = 0.7) => {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, dur);
    const g = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    filt.type = "highpass";
    filt.frequency.value = hp;
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(filt).connect(g).connect(out);
    src.start(now);
    src.stop(now + dur);
  };

  switch (kind) {
    case "kick":    tone(150, 45, 0.4, "sine", 1.0); break;
    case "snare":   tone(180, 90, 0.18, "triangle", 0.5); noise(0.2, 1200, 0.7); break;
    case "hat":     noise(0.06, 7000, 0.5); break;
    case "tom":     tone(220, 90, 0.35, "sine", 0.9); break;
    case "clap":    noise(0.02, 1500, 0.6); setTimeout(() => noise(0.12, 1500, 0.6), 18); break;
    case "rim":     tone(440, 300, 0.07, "square", 0.5); break;
    case "cowbell": tone(560, 560, 0.18, "square", 0.4); tone(845, 845, 0.18, "square", 0.3); break;
    default:        noise(0.25, 400, 0.6); break; // bruit
  }
}

function playSound(slide, index) {
  const s = SLIDES[slide];
  if (s.sound.type === "drum") {
    playDrum(s.scale[index]);
  } else {
    playTone(s.scale[index], s.sound.wave);
  }
}

/* ---------------- Construction du DOM ---------------- */
const track = document.getElementById("track");
const dotsWrap = document.getElementById("dots");

SLIDES.forEach((slide, si) => {
  const slideEl = document.createElement("section");
  slideEl.className = "slide";

  const grid = document.createElement("div");
  grid.className = "grid";

  slide.shapes.forEach((shapeKey, i) => {
    const cell = document.createElement("button");
    cell.className = "cell";
    cell.type = "button";
    cell.setAttribute("aria-label", `forme ${i + 1} écran ${si + 1}`);
    cell.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${SHAPES[shapeKey](slide.palette[i])}</svg>`;

    const trigger = (e) => {
      e.preventDefault();
      if (suppressTap) return;            // ignore le tap qui suit un swipe
      playSound(si, i);
      cell.classList.remove("pulse");
      void cell.offsetWidth;               // reflow pour relancer l'animation
      cell.classList.add("pulse");
    };
    cell.addEventListener("click", trigger);

    grid.appendChild(cell);
  });

  slideEl.appendChild(grid);
  track.appendChild(slideEl);

  // Dot correspondant
  const dot = document.createElement("button");
  dot.className = "dot" + (si === 0 ? " active" : "");
  dot.type = "button";
  dot.setAttribute("aria-label", `aller à l'écran ${si + 1}`);
  dot.addEventListener("click", () => goTo(si));
  dotsWrap.appendChild(dot);
});

/* ---------------- Logique de swipe ---------------- */
const viewport = document.querySelector(".viewport");
const dots = Array.from(dotsWrap.children);
let current = 0;
let suppressTap = false;

function setTransform(x, animate) {
  track.style.transition = animate ? "transform 0.32s cubic-bezier(.22,.61,.36,1)" : "none";
  track.style.transform = `translateX(${x}px)`;
}

function goTo(index) {
  current = Math.max(0, Math.min(SLIDES.length - 1, index));
  setTransform(-current * viewport.clientWidth, true);
  dots.forEach((d, i) => d.classList.toggle("active", i === current));
}

window.addEventListener("resize", () => setTransform(-current * viewport.clientWidth, false));

// Pointer events (souris + tactile unifiés)
let startX = 0, startY = 0, dragging = false, locked = null;

viewport.addEventListener("pointerdown", (e) => {
  dragging = true;
  locked = null;
  suppressTap = false;
  startX = e.clientX;
  startY = e.clientY;
  setTransform(-current * viewport.clientWidth, false);
});

viewport.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  // Détermine si le geste est horizontal (swipe) ou vertical (scroll/tap)
  if (locked === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
    locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
  }
  if (locked !== "x") return;

  suppressTap = true;
  let offset = -current * viewport.clientWidth + dx;
  // Résistance aux extrémités
  const max = 0;
  const min = -(SLIDES.length - 1) * viewport.clientWidth;
  if (offset > max) offset = max + (offset - max) * 0.35;
  if (offset < min) offset = min + (offset - min) * 0.35;
  setTransform(offset, false);
});

function endDrag(e) {
  if (!dragging) return;
  dragging = false;
  const dx = e.clientX - startX;
  const threshold = Math.min(80, viewport.clientWidth * 0.2);

  if (locked === "x" && Math.abs(dx) > threshold) {
    goTo(current + (dx < 0 ? 1 : -1));
  } else {
    goTo(current);
  }
  // Laisse le temps au click de se déclencher avant de réautoriser le tap
  setTimeout(() => { suppressTap = false; }, 0);
}

viewport.addEventListener("pointerup", endDrag);
viewport.addEventListener("pointercancel", endDrag);
viewport.addEventListener("pointerleave", (e) => { if (dragging) endDrag(e); });

// Navigation clavier (bonus)
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") goTo(current - 1);
  if (e.key === "ArrowRight") goTo(current + 1);
});

// Position initiale
goTo(0);
