/* ============================================================
   soundesizer — groovebox 3D
   - 7 panneaux de 8 pads (objets 3D), tap = boucle en toggle
   - sons techno / electro / house, mélodiques
   - chaque boucle se cale au tempo sur son temps d'entrée (phase perso)
   - potards : filtre / delay / reverb
   - caméra orbitale (glisser), zoom (molette / pincer)
   ============================================================ */

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

/* ---------------- Panneaux ---------------- */
// geo : primitive 3D ; les sons sont en La mineur pour rester mélodiques.
const PANELS = [
  {
    name: "Keys", glow: "#ff8ad4",
    palette: ["#ff8ad4","#c58cff","#8c9cff","#6ce0e0","#7ce0a8","#ffd58a","#ff9fb0","#b0a0ff"],
    pads: [
      { kind:"keys", geo:"sphere",  chord:[57,60,64,69] },
      { kind:"keys", geo:"icosa",   chord:[53,57,60,65] },
      { kind:"keys", geo:"dodeca",  chord:[48,55,60,64] },
      { kind:"keys", geo:"torus",   chord:[55,59,62,67] },
      { kind:"keys", geo:"octa",    chord:[50,57,62,65] },
      { kind:"keys", geo:"cyl",     chord:[52,59,64,67] },
      { kind:"keys", geo:"box",     chord:[57,64,67,71] },
      { kind:"keys", geo:"knot",    chord:[53,60,64,69] },
    ],
  },
  {
    name: "Bass", glow: "#6c7bff",
    palette: ["#6c7bff","#5c8cff","#5ca8ff","#7c5cff","#8c6cff","#5c6bff","#6c9cff","#9c7cff"],
    pads: [
      { kind:"bass", geo:"box",    off:false, seq:[33,33,33,33,33,33,33,33] },
      { kind:"bass", geo:"cyl",    off:true,  seq:[45,45,45,45,45,45,45,45] },
      { kind:"bass", geo:"octa",   off:false, seq:[33,33,40,40,36,36,43,43] },
      { kind:"bass", geo:"dodeca", off:true,  seq:[45,43,40,43,45,48,45,43] },
      { kind:"bass", geo:"icosa",  off:false, seq:[33,null,33,36,38,null,40,null] },
      { kind:"bass", geo:"sphere", off:false, seq:[28,28,28,28,31,31,35,35] },
      { kind:"bass", geo:"cone",   off:false, seq:[36,43,48,43,36,40,45,40] },
      { kind:"bass", geo:"tetra",  off:true,  seq:[40,40,null,40,45,45,null,43] },
    ],
  },
  {
    name: "Beat", glow: "#ff7a3c",
    palette: ["#ff7a3c","#ff5c4c","#ff8f3c","#ff6c6c","#ffa23c","#ff5c7c","#ff9c5c","#ff6c3c"],
    pads: [
      { kind:"beat", geo:"box",    groove:[["kick","beat"],["hat","off"],["clap","back"]] },
      { kind:"beat", geo:"octa",   groove:[["kick","beat"],["hat","every"],["rim","off"]] },
      { kind:"beat", geo:"tetra",  groove:[["kick","beat"],["openhat","off"],["clap","back"]] },
      { kind:"beat", geo:"cone",   groove:[["kick","beat"],["hat","every"],["snare","back"]] },
      { kind:"beat", geo:"cyl",    groove:[["kick","half"],["clap","back"],["hat","off"]] },
      { kind:"beat", geo:"icosa",  groove:[["kick","beat"],["tom","off"],["hat","every"]] },
      { kind:"beat", geo:"dodeca", groove:[["kick","push"],["snare","back"],["hat","every"]] },
      { kind:"beat", geo:"knot",   groove:[["kick","beat"],["rim","every"],["clap","back"]] },
    ],
  },
  {
    name: "Drums", glow: "#ffcf4a",
    palette: ["#ffcf4a","#ffd96a","#ffbe4a","#ffe08a","#ffc24a","#ffd24a","#ffe86a","#ffb84a"],
    pads: [
      { kind:"drums", geo:"tetra",  drum:"kick",    pat:"beat"  },
      { kind:"drums", geo:"cone",   drum:"clap",    pat:"back"  },
      { kind:"drums", geo:"octa",   drum:"hat",     pat:"off"   },
      { kind:"drums", geo:"box",    drum:"openhat", pat:"off"   },
      { kind:"drums", geo:"cyl",    drum:"snare",   pat:"back"  },
      { kind:"drums", geo:"sphere", drum:"rim",     pat:"every" },
      { kind:"drums", geo:"icosa",  drum:"tom",     pat:"half"  },
      { kind:"drums", geo:"torus",  drum:"crash",   pat:"down"  },
    ],
  },
  {
    name: "Effects", glow: "#4ad7ff",
    palette: ["#4ad7ff","#4affd1","#6affa8","#4affe8","#8affd1","#4ad7ff","#6ac8ff","#4af0ff"],
    pads: [
      { kind:"fx", geo:"knot",   fx:"riser"  },
      { kind:"fx", geo:"icosa",  fx:"laser"  },
      { kind:"fx", geo:"octa",   fx:"zap"    },
      { kind:"fx", geo:"torus",  fx:"sweep"  },
      { kind:"fx", geo:"dodeca", fx:"wobble" },
      { kind:"fx", geo:"sphere", fx:"swell"  },
      { kind:"fx", geo:"tetra",  fx:"drop"   },
      { kind:"fx", geo:"cone",   fx:"noise"  },
    ],
  },
  {
    name: "Synth", glow: "#b85cff",
    palette: ["#b85cff","#d65cff","#9c5cff","#c45cff","#e05cff","#a85cff","#cf5cff","#8c5cff"],
    pads: [
      { kind:"synth", geo:"octa",   wave:"sawtooth", off:false, seq:[69,72,76,81,79,76,72,69] },
      { kind:"synth", geo:"knot",   wave:"square",   off:true,  seq:[76,76,79,76,72,72,74,72] },
      { kind:"synth", geo:"icosa",  wave:"sawtooth", off:false, seq:[81,79,76,72,69,72,76,79] },
      { kind:"synth", geo:"dodeca", wave:"square",   off:false, seq:[72,null,76,null,79,null,84,null] },
      { kind:"synth", geo:"cone",   wave:"sawtooth", off:true,  seq:[69,76,72,79,74,81,76,72] },
      { kind:"synth", geo:"torus",  wave:"square",   off:false, seq:[64,67,72,67,64,69,72,69] },
      { kind:"synth", geo:"box",    wave:"sawtooth", off:false, seq:[79,79,76,76,72,72,69,69] },
      { kind:"synth", geo:"sphere", wave:"square",   off:false, seq:[72,74,76,79,81,79,76,74] },
    ],
  },
  {
    name: "Vocal", glow: "#4ae0a0",
    palette: ["#4ae0a0","#4ad7d1","#6ae0b8","#4ae0c0","#8ae0a0","#4ad7a8","#6ad7d1","#4ae090"],
    pads: [
      { kind:"vocal", geo:"sphere", vowel:"aa", seq:[69,null,72,null,76,null,72,null] },
      { kind:"vocal", geo:"torus",  vowel:"oo", seq:[72,null,null,null,69,null,null,null] },
      { kind:"vocal", geo:"cyl",    vowel:"ee", seq:[76,null,74,null,72,null,69,null] },
      { kind:"vocal", geo:"dodeca", vowel:"oh", seq:[64,null,null,null,67,null,null,null] },
      { kind:"vocal", geo:"icosa",  vowel:"aa", seq:[81,null,79,null,76,null,79,null] },
      { kind:"vocal", geo:"knot",   vowel:"eh", seq:[69,null,72,null,74,null,76,null] },
      { kind:"vocal", geo:"octa",   vowel:"oo", seq:[60,null,null,null,64,null,null,null] },
      { kind:"vocal", geo:"cone",   vowel:"ah", seq:[72,null,76,null,79,null,76,null] },
    ],
  },
];

/* ============================================================
   AUDIO — graphe + bus d'effets
   ============================================================ */
let ctx = null, master = null, fxBus = null;
let filterNode, delayNode, delaySend, revSend;
const knobVals = { filter: 0.82, delay: 0.2, reverb: 0.25 };

function makeIR(dur) {
  const rate = ctx.sampleRate, len = Math.floor(rate * dur);
  const buf = ctx.createBuffer(2, len, rate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
  }
  return buf;
}

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);

    filterNode = ctx.createBiquadFilter();
    filterNode.type = "lowpass"; filterNode.frequency.value = 12000; filterNode.Q.value = 0.8;
    filterNode.connect(master);                      // chemin direct (dry)
    fxBus = filterNode;

    // delay synchronisé
    delayNode = ctx.createDelay(1.0);
    const fb = ctx.createGain(); fb.gain.value = 0.34;
    delaySend = ctx.createGain(); delaySend.gain.value = 0;
    filterNode.connect(delaySend); delaySend.connect(delayNode);
    delayNode.connect(fb); fb.connect(delayNode);
    const delayOut = ctx.createGain(); delayOut.gain.value = 0.9;
    delayNode.connect(delayOut); delayOut.connect(master);

    // reverb
    const conv = ctx.createConvolver(); conv.buffer = makeIR(2.2);
    revSend = ctx.createGain(); revSend.gain.value = 0;
    filterNode.connect(revSend); revSend.connect(conv);
    const revOut = ctx.createGain(); revOut.gain.value = 0.9;
    conv.connect(revOut); revOut.connect(master);

    applyKnob("filter"); applyKnob("delay"); applyKnob("reverb");
    updateDelayTime();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function applyKnob(name) {
  if (!ctx) return;
  const v = knobVals[name];
  if (name === "filter") filterNode.frequency.setTargetAtTime(200 * Math.pow(90, v), ctx.currentTime, 0.02);
  if (name === "delay")  delaySend.gain.setTargetAtTime(v * 0.6, ctx.currentTime, 0.02);
  if (name === "reverb") revSend.gain.setTargetAtTime(v * 0.75, ctx.currentTime, 0.02);
}
function updateDelayTime() {
  if (ctx) delayNode.delayTime.setTargetAtTime((60 / transport.bpm) / 2, ctx.currentTime, 0.05);
}

function noiseBuffer(dur) {
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

/* ---- Instruments ---- */
function bassNote(time, freq, dur) {
  const o = ctx.createOscillator(), sub = ctx.createOscillator();
  const g = ctx.createGain(), f = ctx.createBiquadFilter();
  o.type = "sawtooth"; o.frequency.value = freq;
  sub.type = "sine"; sub.frequency.value = freq / 2;
  f.type = "lowpass"; f.Q.value = 7;
  f.frequency.setValueAtTime(220, time);
  f.frequency.linearRampToValueAtTime(1500, time + 0.03);
  f.frequency.exponentialRampToValueAtTime(260, time + dur);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(0.55, time + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  o.connect(f); sub.connect(f); f.connect(g).connect(fxBus);
  o.start(time); sub.start(time); o.stop(time + dur + 0.02); sub.stop(time + dur + 0.02);
}

function synthNote(time, freq, wave, dur) {
  // deux oscillateurs légèrement désaccordés (supersaw léger) + filtre pluck
  const g = ctx.createGain(), f = ctx.createBiquadFilter();
  f.type = "lowpass"; f.Q.value = 3;
  f.frequency.setValueAtTime(5200, time);
  f.frequency.exponentialRampToValueAtTime(900, time + dur);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(0.24, time + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
  [-6, 6].forEach((det) => {
    const o = ctx.createOscillator();
    o.type = wave; o.frequency.value = freq; o.detune.value = det;
    o.connect(f); o.start(time); o.stop(time + dur + 0.02);
  });
  f.connect(g).connect(fxBus);
}

const VOWELS = {
  aa: [800, 1150, 2900], oo: [325, 700, 2530], ee: [350, 2000, 2800],
  oh: [500, 1000, 2500], eh: [600, 1700, 2400], ah: [700, 1220, 2600],
};
function vocalNote(time, freq, dur, vowel) {
  // synthèse de formants : source saw + vibrato -> 3 bandpass -> chœur chanté
  const src = ctx.createOscillator();
  src.type = "sawtooth"; src.frequency.setValueAtTime(freq, time);
  const vib = ctx.createOscillator(), vibG = ctx.createGain();
  vib.frequency.value = 5.5; vibG.gain.value = freq * 0.012;
  vib.connect(vibG).connect(src.frequency);

  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0.0001, time);
  amp.gain.linearRampToValueAtTime(0.3, time + 0.09);      // attaque douce = legato
  amp.gain.setValueAtTime(0.3, time + dur * 0.6);
  amp.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  const F = VOWELS[vowel] || VOWELS.aa;
  const gains = [1.0, 0.7, 0.35];
  F.forEach((ff, i) => {
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = ff; bp.Q.value = 9;
    const bg = ctx.createGain(); bg.gain.value = gains[i];
    src.connect(bp).connect(bg).connect(amp);
  });
  amp.connect(fxBus);
  src.start(time); vib.start(time);
  src.stop(time + dur + 0.05); vib.stop(time + dur + 0.05);
}

function playDrum(kind, time) {
  const out = ctx.createGain(); out.gain.value = 0.95; out.connect(fxBus);
  const tone = (f0, f1, dur, type = "sine", vol = 0.9) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, time);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), time + dur);
    g.gain.setValueAtTime(vol, time); g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g).connect(out); o.start(time); o.stop(time + dur);
  };
  const noise = (dur, hp, vol = 0.7, type = "highpass", q = 0.7) => {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(dur);
    const g = ctx.createGain(), fl = ctx.createBiquadFilter();
    fl.type = type; fl.frequency.value = hp; fl.Q.value = q;
    g.gain.setValueAtTime(vol, time); g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.connect(fl).connect(g).connect(out); src.start(time); src.stop(time + dur);
  };
  switch (kind) {
    case "kick":    tone(160, 45, 0.45, "sine", 1.0); noise(0.02, 1200, 0.5); break;
    case "snare":   tone(190, 100, 0.16, "triangle", 0.4); noise(0.18, 1600, 0.7); break;
    case "hat":     noise(0.045, 9000, 0.4); break;
    case "openhat": noise(0.28, 8500, 0.35); break;
    case "clap":    noise(0.015, 1500, 0.6); setTimeout(() => { if (ctx) noise(0.02, 1500, 0.6); }, 12);
                    setTimeout(() => { if (ctx) noise(0.14, 1400, 0.6); }, 26); break;
    case "rim":     tone(440, 300, 0.05, "square", 0.45); break;
    case "tom":     tone(240, 100, 0.3, "sine", 0.85); break;
    case "cowbell": tone(560, 560, 0.15, "square", 0.4); tone(845, 845, 0.15, "square", 0.3); break;
    case "crash":   noise(0.7, 6000, 0.45); break;
    default:        noise(0.25, 400, 0.6); break;
  }
}

function playFx(kind, time) {
  const out = ctx.createGain(); out.gain.value = 0.8; out.connect(fxBus);
  const sweepTone = (f0, f1, dur, type, vol) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, time);
    o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), time + dur);
    g.gain.setValueAtTime(vol, time); g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g).connect(out); o.start(time); o.stop(time + dur + 0.02);
  };
  const noiseSweep = (f0, f1, dur, vol, up) => {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer(dur);
    const f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "bandpass"; f.Q.value = 6;
    f.frequency.setValueAtTime(f0, time);
    f.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), time + dur);
    g.gain.setValueAtTime(up ? 0.0001 : vol, time);
    g.gain.exponentialRampToValueAtTime(up ? vol : 0.0001, time + dur);
    src.connect(f).connect(g).connect(out); src.start(time); src.stop(time + dur);
  };
  switch (kind) {
    case "zap":    sweepTone(900, 120, 0.18, "sawtooth", 0.6); break;
    case "laser":  sweepTone(1800, 200, 0.3, "square", 0.4); break;
    case "riser":  noiseSweep(300, 7000, 1.2, 0.5, true); break;
    case "swell":  noiseSweep(7000, 500, 1.0, 0.5, false); break;
    case "wobble": {
      const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter(),
            lfo = ctx.createOscillator(), lg = ctx.createGain();
      o.type = "sawtooth"; o.frequency.value = 110;
      f.type = "lowpass"; f.frequency.value = 700; f.Q.value = 6;
      lfo.frequency.value = 7; lg.gain.value = 600; lfo.connect(lg).connect(f.frequency);
      g.gain.setValueAtTime(0.5, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 1.0);
      o.connect(f).connect(g).connect(out);
      o.start(time); lfo.start(time); o.stop(time + 1.0); lfo.stop(time + 1.0); break;
    }
    case "drop":   sweepTone(400, 40, 0.5, "sine", 0.7); break;
    case "sweep":  noiseSweep(400, 4000, 0.7, 0.45, true); break;
    default: {
      const src = ctx.createBufferSource(); src.buffer = noiseBuffer(0.4);
      const g = ctx.createGain(); g.gain.setValueAtTime(0.4, time);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.4);
      src.connect(g).connect(out); src.start(time); src.stop(time + 0.4);
    }
  }
}

function startKeys(chordMidi) {
  const t = ctx.currentTime;
  const g = ctx.createGain(), f = ctx.createBiquadFilter();
  f.type = "lowpass"; f.frequency.value = 2600; f.Q.value = 0.6;
  g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.1, t + 0.8);
  f.connect(g).connect(fxBus);
  const oscs = [];
  chordMidi.forEach((m) => {
    [-7, 7].forEach((det) => {
      const o = ctx.createOscillator();
      o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = det;
      o.connect(f); o.start(t); oscs.push(o);
    });
  });
  return {
    stop() {
      const now = ctx.currentTime;
      g.gain.cancelScheduledValues(now); g.gain.setValueAtTime(g.gain.value, now);
      g.gain.linearRampToValueAtTime(0.0001, now + 0.5);
      oscs.forEach((o) => { try { o.stop(now + 0.55); } catch (e) {} });
    },
  };
}

/* ============================================================
   TRANSPORT / SÉQUENCEUR
   ============================================================ */
const SPB = 2;
const transport = { bpm: 120, beats: 8 };
let playing = false, userPaused = false, timerId = null, currentSub = 0, nextTime = 0;
const LOOKAHEAD = 0.1, TICK_MS = 25;

const active = new Map();        // "p:i" -> {pad..., phaseSub}
const keysHandles = new Map();   // "p:i" -> handle
const visualQueue = [];

function totalSubs() { return transport.beats * SPB; }
function subDur() { return (60 / transport.bpm) / SPB; }

function hits(name, sub) {
  const beat = Math.floor(sub / SPB), onBeat = sub % SPB === 0;
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

function triggerPad(pad, time, sub) {
  const total = totalSubs();
  const rel = (((sub - (pad.phaseSub || 0)) % total) + total) % total;
  const beat = Math.floor(rel / SPB), onBeat = rel % SPB === 0;
  const beatDur = 60 / transport.bpm;
  switch (pad.kind) {
    case "keys": return false;
    case "bass": {
      const trig = pad.off ? (rel % SPB === 1) : onBeat;
      if (!trig) return false;
      const n = pad.seq[beat % pad.seq.length]; if (n == null) return false;
      bassNote(time, mtof(n), beatDur * 0.92); return true;
    }
    case "synth": {
      const trig = pad.off ? (rel % SPB === 1) : onBeat;
      if (!trig) return false;
      const n = pad.seq[beat % pad.seq.length]; if (n == null) return false;
      synthNote(time, mtof(n), pad.wave, beatDur * 0.55); return true;
    }
    case "vocal": {
      if (!onBeat) return false;
      const n = pad.seq[beat % pad.seq.length]; if (n == null) return false;
      vocalNote(time, mtof(n), beatDur * 1.9, pad.vowel); return true;
    }
    case "drums": if (hits(pad.pat, rel)) { playDrum(pad.drum, time); return true; } return false;
    case "beat": {
      let any = false;
      pad.groove.forEach(([d, p]) => { if (hits(p, rel)) { playDrum(d, time); any = true; } });
      return any;
    }
    case "fx": if (rel === 0) { playFx(pad.fx, time); return true; } return false;
  }
  return false;
}

function scheduleSub(sub, time) {
  const fired = [];
  active.forEach((pad, key) => {
    if (pad.kind === "keys") return;
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
  getCtx(); playing = true; userPaused = false;
  currentSub = 0; nextTime = ctx.currentTime + 0.08;
  active.forEach((pad, key) => {
    if (pad.kind === "keys" && !keysHandles.has(key)) keysHandles.set(key, startKeys(pad.chord));
  });
  schedulerTick();
  playBtn.classList.add("playing"); playBtn.textContent = "❚❚";
}
function stopPlaying() {
  playing = false; clearTimeout(timerId);
  keysHandles.forEach((h) => h.stop()); keysHandles.clear();
  visualQueue.length = 0;
  playBtn.classList.remove("playing"); playBtn.textContent = "▶";
  clearPlayhead();
}
function clearAll() {
  active.clear(); stopPlaying();
  padMeshes.forEach((m) => { m.userData.active = false; });
  updateDotActivity();
}

/* ============================================================
   SCÈNE 3D (Three.js r128)
   ============================================================ */
const canvas = document.getElementById("scene");
let renderer, scene, camera, padGroup;
let camR = 9, camTheta = 0, camPhi = 1.15;
const padMeshes = [];
// disposition 2 colonnes × 4 rangées (adaptée au portrait mobile)
const COLX = [-1.35, 1.35], ROWY = [2.7, 0.9, -0.9, -2.7];
function padPos(i) { return { x: COLX[i % 2], y: ROWY[Math.floor(i / 2)] }; }
const VTAN = Math.tan((50 * Math.PI / 180) / 2);   // demi-FOV vertical
function fitRequired() {
  const aspect = (canvas.clientWidth || 1) / (canvas.clientHeight || 1);
  const needV = 3.7 / VTAN;                          // y max (2.7) + rayon objet
  const needH = 2.4 / (VTAN * Math.max(aspect, 0.3));
  return Math.max(needV, needH) + 0.4;
}

function makeGeo(type) {
  switch (type) {
    case "sphere": return new THREE.SphereGeometry(0.72, 32, 24);
    case "cone":   return new THREE.ConeGeometry(0.72, 1.3, 40);
    case "torus":  return new THREE.TorusGeometry(0.6, 0.24, 20, 48);
    case "octa":   return new THREE.OctahedronGeometry(0.9);
    case "dodeca": return new THREE.DodecahedronGeometry(0.85);
    case "icosa":  return new THREE.IcosahedronGeometry(0.9);
    case "knot":   return new THREE.TorusKnotGeometry(0.52, 0.18, 110, 16);
    case "cyl":    return new THREE.CylinderGeometry(0.62, 0.62, 1.1, 40);
    case "tetra":  return new THREE.TetrahedronGeometry(1.0);
    default:       return new THREE.BoxGeometry(1.15, 1.15, 1.15);
  }
}

function initThree() {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  padGroup = new THREE.Group(); scene.add(padGroup);

  scene.add(new THREE.AmbientLight(0x50507a, 1.3));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.1); d1.position.set(5, 8, 6); scene.add(d1);
  const d2 = new THREE.DirectionalLight(0x6688ff, 0.6); d2.position.set(-6, -3, 2); scene.add(d2);
  const p1 = new THREE.PointLight(0xff5c8a, 0.6, 30); p1.position.set(0, 0, 5); scene.add(p1);

  resizeThree();
  camR = fitRequired();
  window.addEventListener("resize", resizeThree);
  requestAnimationFrame(animate);
}

function resizeThree() {
  const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const need = fitRequired();
  if (camR < need) camR = need;                      // garde les 8 objets visibles
}

function buildPanelMeshes(pi) {
  while (padGroup.children.length) {
    const m = padGroup.children.pop();
    m.geometry.dispose(); m.material.dispose();
  }
  padMeshes.length = 0;
  const panel = PANELS[pi];
  panel.pads.forEach((pad, i) => {
    const color = new THREE.Color(panel.palette[i % panel.palette.length]);
    const mat = new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: 0.12, roughness: 0.3, metalness: 0.45,
    });
    const mesh = new THREE.Mesh(makeGeo(pad.geo), mat);
    const pos = padPos(i);
    mesh.position.set(pos.x, pos.y, 0);
    mesh.userData = {
      idx: i, key: `${pi}:${i}`, base: 0.82, y0: pos.y,
      active: active.has(`${pi}:${i}`), hitT: -1,
      spin: 0.2 + Math.random() * 0.3, phase: Math.random() * Math.PI * 2,
      color,
    };
    mesh.scale.setScalar(0.82);
    padGroup.add(mesh); padMeshes.push(mesh);
  });
}

function updateCamera() {
  const sp = Math.sin(camPhi);
  camera.position.set(camR * sp * Math.sin(camTheta), camR * Math.cos(camPhi), camR * sp * Math.cos(camTheta));
  camera.lookAt(0, 0, 0);
}

let lastT = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;

  // audio -> visuel (playhead + flashs)
  if (playing && ctx) {
    const at = ctx.currentTime;
    while (visualQueue.length && visualQueue[0].time <= at) {
      const e = visualQueue.shift();
      const beat = Math.floor(e.sub / SPB);
      if (beat !== lastBeatShown) { setPlayhead(beat); lastBeatShown = beat; }
      e.fired.forEach((key) => {
        const m = padMeshes.find((x) => x.userData.key === key);
        if (m) m.userData.hitT = now;
      });
    }
  }

  padMeshes.forEach((m) => {
    const u = m.userData;
    const act = u.active;
    // rotation
    const rot = (act ? u.spin * 1.8 : u.spin * 0.25) * dt;
    m.rotation.y += rot; m.rotation.x += rot * 0.4;
    // flash au déclenchement
    let hit = 0;
    if (u.hitT >= 0) { hit = Math.max(0, 1 - (now - u.hitT) / 260); if (hit <= 0) u.hitT = -1; }
    // échelle + flottement + lueur
    const bob = Math.sin(now / 600 + u.phase) * (act ? 0.08 : 0.03);
    const target = (act ? 1.04 : 0.82) + hit * 0.28;
    m.scale.setScalar(m.scale.x + (target - m.scale.x) * Math.min(1, dt * 14));
    m.position.y = u.y0 + bob;
    m.material.emissiveIntensity = (act ? 0.6 : 0.12) + hit * 1.3;
  });

  updateCamera();
  renderer.render(scene, camera);
}

/* ---- picking (tap sur un objet) ---- */
const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pickAt(clientX, clientY) {
  const r = canvas.getBoundingClientRect();
  ndc.x = ((clientX - r.left) / r.width) * 2 - 1;
  ndc.y = -((clientY - r.top) / r.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  const hit = raycaster.intersectObjects(padMeshes, false)[0];
  return hit ? hit.object.userData.idx : -1;
}

/* ============================================================
   INTERACTION (orbite / zoom / tap)
   ============================================================ */
const pointers = new Map();
let orbiting = false, downX = 0, downY = 0, downT = 0, pinchDist = 0, movedMax = 0;

canvas.addEventListener("pointerdown", (e) => {
  canvas.setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  getCtx(); primeAudio();
  if (pointers.size === 1) {
    orbiting = false; movedMax = 0; downX = e.clientX; downY = e.clientY; downT = performance.now();
  } else if (pointers.size === 2) {
    const p = [...pointers.values()];
    pinchDist = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
  }
  hideHint();
});

canvas.addEventListener("pointermove", (e) => {
  if (!pointers.has(e.pointerId)) return;
  const prev = pointers.get(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (pointers.size === 2) {
    const p = [...pointers.values()];
    const d = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    if (pinchDist) camR = Math.max(4.5, Math.min(14, camR * (pinchDist / d)));
    pinchDist = d; return;
  }
  const dx = e.clientX - downX, dy = e.clientY - downY;
  movedMax = Math.max(movedMax, Math.abs(dx), Math.abs(dy));
  if (movedMax > 6) orbiting = true;
  if (orbiting) {
    camTheta -= (e.clientX - prev.x) * 0.006;
    camPhi = Math.max(0.3, Math.min(Math.PI - 0.3, camPhi - (e.clientY - prev.y) * 0.006));
  }
});

function endPointer(e) {
  if (!pointers.has(e.pointerId)) return;
  pointers.delete(e.pointerId);
  if (pointers.size === 0 && !orbiting && performance.now() - downT < 500 && movedMax < 8) {
    const idx = pickAt(e.clientX, e.clientY);
    if (idx >= 0) togglePad(current, idx);
  }
  if (pointers.size < 2) pinchDist = 0;
}
canvas.addEventListener("pointerup", endPointer);
canvas.addEventListener("pointercancel", endPointer);
canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  camR = Math.max(4.5, Math.min(14, camR * (1 + e.deltaY * 0.0012)));
}, { passive: false });

/* ============================================================
   TOGGLE PAD
   ============================================================ */
function togglePad(pi, i) {
  const key = `${pi}:${i}`;
  const pad = PANELS[pi].pads[i];
  getCtx(); primeAudio();
  const mesh = padMeshes.find((m) => m.userData.idx === i);

  if (active.has(key)) {
    active.delete(key);
    if (keysHandles.has(key)) { keysHandles.get(key).stop(); keysHandles.delete(key); }
    if (mesh) mesh.userData.active = false;
  } else {
    let phaseSub;
    if (!playing) phaseSub = 0;
    else phaseSub = (Math.ceil(currentSub / SPB) * SPB) % totalSubs();
    active.set(key, { ...pad, panel: pi, phaseSub });
    if (!playing) startPlaying();
    else if (pad.kind === "keys" && !keysHandles.has(key)) keysHandles.set(key, startKeys(pad.chord));
    if (mesh) { mesh.userData.active = true; mesh.userData.hitT = performance.now(); }
  }
  updateDotActivity();
}

// Déblocage audio mobile (geste direct)
let audioPrimed = false;
function primeAudio() {
  if (audioPrimed || !ctx) return;
  try {
    const b = ctx.createBufferSource(); b.buffer = noiseBuffer(0.01);
    const g = ctx.createGain(); g.gain.value = 0.0001;
    b.connect(g).connect(ctx.destination); b.start(); audioPrimed = true;
  } catch (e) {}
}

/* ============================================================
   DOM : dots, label, séquenceur, potards
   ============================================================ */
const dotsWrap = document.getElementById("dots");
const panelLabel = document.getElementById("panelLabel");
const seqBar = document.getElementById("seqBar");
const playBtn = document.getElementById("playBtn");
const clearBtn = document.getElementById("clearBtn");
const bpmVal = document.getElementById("bpmVal");
const fxrow = document.getElementById("fxrow");
const hint3d = document.getElementById("hint3d");

PANELS.forEach((panel, pi) => {
  const dot = document.createElement("button");
  dot.className = "dot" + (pi === 0 ? " active" : "");
  dot.type = "button"; dot.style.setProperty("--dot-glow", panel.glow);
  dot.setAttribute("aria-label", `${panel.name}`);
  dot.addEventListener("click", () => goTo(pi));
  dotsWrap.appendChild(dot);
});
const dots = Array.from(dotsWrap.children);

function updateDotActivity() {
  for (let p = 0; p < PANELS.length; p++) {
    let has = false;
    for (let i = 0; i < PANELS[p].pads.length; i++) if (active.has(`${p}:${i}`)) { has = true; break; }
    dots[p].classList.toggle("has-active", has);
  }
}

let current = 0;
function goTo(index) {
  current = (index + PANELS.length) % PANELS.length;
  dots.forEach((d, i) => d.classList.toggle("active", i === current));
  panelLabel.textContent = PANELS[current].name;
  buildPanelMeshes(current);
}
document.getElementById("prev").addEventListener("click", () => goTo(current - 1));
document.getElementById("next").addEventListener("click", () => goTo(current + 1));
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") goTo(current - 1);
  if (e.key === "ArrowRight") goTo(current + 1);
});

/* séquenceur */
let stepEls = [], lastBeatShown = -1;
function buildSeqBar() {
  seqBar.innerHTML = ""; stepEls = [];
  for (let b = 0; b < transport.beats; b++) {
    const s = document.createElement("div"); s.className = "step";
    seqBar.appendChild(s); stepEls.push(s);
  }
  lastBeatShown = -1;
}
function setPlayhead(beat) { stepEls.forEach((s, i) => s.classList.toggle("play", i === beat)); }
function clearPlayhead() { stepEls.forEach((s) => s.classList.remove("play")); lastBeatShown = -1; }

/* potards */
const KNOBS = [
  { id: "filter", label: "Filtre", glow: "#4ad7d1" },
  { id: "delay",  label: "Delay",  glow: "#7c5cff" },
  { id: "reverb", label: "Reverb", glow: "#ff5c8a" },
];
KNOBS.forEach((k) => {
  const wrap = document.createElement("div"); wrap.className = "knob";
  wrap.innerHTML = `<div class="dial" style="--glow:${k.glow}"><span class="tick"></span></div><label>${k.label}</label>`;
  const dial = wrap.querySelector(".dial"), tick = wrap.querySelector(".tick");
  const render = () => { tick.style.transform = `rotate(${-135 + knobVals[k.id] * 270}deg)`; };
  render();
  let dragging = false, lastY = 0;
  dial.addEventListener("pointerdown", (e) => {
    dragging = true; lastY = e.clientY; dial.setPointerCapture(e.pointerId); getCtx();
  });
  dial.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    knobVals[k.id] = Math.max(0, Math.min(1, knobVals[k.id] - (e.clientY - lastY) * 0.006));
    lastY = e.clientY; render(); applyKnob(k.id);
  });
  const up = (e) => { dragging = false; };
  dial.addEventListener("pointerup", up); dial.addEventListener("pointercancel", up);
  fxrow.appendChild(wrap);
});

/* transport controls */
playBtn.addEventListener("click", () => {
  getCtx(); primeAudio();
  if (playing) { userPaused = true; stopPlaying(); }
  else { userPaused = false; startPlaying(); }
});
clearBtn.addEventListener("click", clearAll);
document.querySelectorAll("[data-bpm]").forEach((btn) => {
  btn.addEventListener("click", () => {
    transport.bpm = Math.max(60, Math.min(180, transport.bpm + parseInt(btn.dataset.bpm, 10)));
    bpmVal.textContent = transport.bpm; updateDelayTime();
  });
});
document.querySelectorAll("[data-beats]").forEach((btn) => {
  btn.addEventListener("click", () => {
    transport.beats = parseInt(btn.dataset.beats, 10);
    document.querySelectorAll("[data-beats]").forEach((b) => b.classList.toggle("sel", b === btn));
    currentSub = currentSub % totalSubs(); buildSeqBar();
  });
});

let hintHidden = false;
function hideHint() { if (!hintHidden) { hintHidden = true; hint3d.classList.add("hide"); } }

/* ---- init ---- */
bpmVal.textContent = transport.bpm;
buildSeqBar();
initThree();
goTo(0);

/* hook de test */
window.__sz = {
  toggle: (i) => togglePad(current, i),
  goTo, active: () => active.size, panel: () => current,
  setKnob: (id, v) => { knobVals[id] = v; applyKnob(id); },
};
