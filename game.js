/* ============================================================
   PIXEL ESPRESSO
   Un mini-jeu en pixel art : prépare un espresso, étape par étape.
     1. Moudre les grains (régler la finesse + doser)
     2. Tasser la mouture (bien droite, bonne pression)
     3. Placer le porte-filtre + la tasse
     4. Régler température / pression et extraire
     5. Note d'équilibre de l'espresso
   Tout est dessiné au pixel sur un <canvas> 192x256.
   ============================================================ */

(() => {
  "use strict";

  /* ---------------- Canvas ---------------- */
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const W = canvas.width;   // 192
  const H = canvas.height;  // 256

  // Raccourci pour un "pixel-bloc"
  const R = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); };

  /* ---------------- Palette ---------------- */
  const C = {
    wallTop:  "#2a1d30",
    wallBot:  "#3a2740",
    counter:  "#5a3a2a",
    counterHi:"#6f4a36",
    counterLo:"#3f281d",
    steel:    "#c9cdd6",
    steelHi:  "#eef1f6",
    steelLo:  "#8d93a0",
    steelDk:  "#5f6470",
    red:      "#e0584e",
    redLo:    "#a83a32",
    black:    "#241a22",
    glass:    "#b9d9e8",
    bean:     "#5a3a22",
    grounds:  "#6f4a2f",
    groundsHi:"#86593a",
    coffee:   "#33200f",
    crema:    "#c98f53",
    cremaHi:  "#e2b074",
    cup:      "#f1eee6",
    cupSh:    "#cdc8bd",
    wood:     "#5a3a22",
    woodHi:   "#754d2e",
    screen:   "#0e2a1b",
    led:      "#6fe08a",
    white:    "#f4ecdf",
    shadow:   "rgba(0,0,0,0.25)",
  };

  /* ---------------- État du jeu ---------------- */
  const g = {
    phase: "title",
    grind: 7,          // 1..10 (10 = le plus fin)
    dose: 0,           // grammes dans le panier
    grinding: false,
    tampPhase: "level",// level -> power -> done
    tampLevel: null,   // écart 0(parfait)..1
    tampPower: null,   // valeur captée 0..1 (idéal ~0.5)
    placeProg: 0,      // 0..1 verrouillage porte-filtre
    cupPlaced: false,
    temp: 93,          // °C
    pressure: 9,       // bar
    brewT: 0,          // chrono d'extraction (animation)
    shot: null,        // résultats calculés
  };

  const IDEAL = { grind: 7, dose: 18, temp: 93, pressure: 9, tampPower: 0.5 };

  /* ---------------- Entrées (canvas) ---------------- */
  let drag = null;
  function canvasPos(e) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
    };
  }
  canvas.addEventListener("pointerdown", (e) => {
    const p = canvasPos(e);
    if (g.phase === "place" && !g.cupPlaced) {
      drag = { startX: p.x, base: g.placeProg };
      canvas.setPointerCapture(e.pointerId);
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = canvasPos(e);
    const dx = p.x - drag.startX;
    g.placeProg = Math.max(0, Math.min(1, drag.base + dx / 70));
  });
  canvas.addEventListener("pointerup", (e) => {
    if (!drag) return;
    drag = null;
    if (g.placeProg > 0.82) {
      g.placeProg = 1;
      g.cupPlaced = true;
      refreshPanel();
    } else {
      g.placeProg = 0;
    }
  });

  /* ============================================================
     RENDU — fond commun
     ============================================================ */
  function drawBackground() {
    R(0, 0, W, H, C.wallTop);
    R(0, 70, W, 110, C.wallBot);
    // carrelage discret
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    for (let y = 12; y < 180; y += 24)
      for (let x = (y % 48 ? 12 : 0); x < W; x += 24)
        ctx.fillRect(x, y, 22, 22);
    // plan de travail
    R(0, 180, W, H - 180, C.counter);
    R(0, 180, W, 4, C.counterHi);
    R(0, 184, W, 3, C.counterLo);
    for (let x = 0; x < W; x += 16) R(x, 188, 8, 1, C.counterLo);
  }

  /* ---------------- Porte-filtre (vue 3/4) ---------------- */
  // cx,cy = centre du panier ; fill 0..1 niveau de mouture ; handleDir 1=droite
  function drawPortafilter(cx, cy, fill, opts = {}) {
    const r = 16;
    // poignée en bois
    const hd = opts.handleDir || 1;
    R(cx + hd * r, cy - 4, hd * 26, 8, C.wood);
    R(cx + hd * r, cy - 4, hd * 26, 2, C.woodHi);
    R(cx + hd * (r + 22), cy - 6, hd * 8, 12, C.black);
    // bague chrome
    R(cx - r - 2, cy - r, (r + 2) * 2, r * 2 + 6, C.steelLo);
    R(cx - r, cy - r + 2, r * 2, r * 2, C.steelDk);
    // panier intérieur
    R(cx - r + 3, cy - r + 5, r * 2 - 6, r * 2 - 6, C.black);
    // mouture
    if (fill > 0) {
      const fh = Math.round((r * 2 - 8) * Math.min(1, fill));
      const y0 = cy + r - 4 - fh;
      R(cx - r + 4, y0, r * 2 - 8, fh, C.grounds);
      R(cx - r + 4, y0, r * 2 - 8, 2, C.groundsHi);
      // petites granules
      ctx.fillStyle = C.groundsHi;
      for (let i = 0; i < fill * 14; i++) {
        const gx = cx - r + 6 + ((i * 7) % (r * 2 - 12));
        const gy = y0 + 3 + ((i * 5) % Math.max(1, fh - 3));
        ctx.fillRect(gx, gy, 1, 1);
      }
    }
    // reflet chrome
    R(cx - r, cy - r + 2, 3, r * 2, C.steel);
  }

  /* ============================================================
     SCÈNE 1 — MOUDRE
     ============================================================ */
  function drawGrind(t) {
    drawBackground();

    // ---- Moulin ----
    const mx = 78, mw = 66;
    // corps
    R(mx, 96, mw, 86, C.steelLo);
    R(mx + 3, 96, mw - 6, 86, C.steel);
    R(mx + 3, 96, 4, 86, C.steelHi);
    R(mx + mw - 6, 96, 3, 86, C.steelDk);
    // trémie (hopper) avec grains
    R(mx + 10, 60, mw - 20, 40, "rgba(180,210,225,0.35)");
    R(mx + 10, 60, mw - 20, 3, C.glass);
    ctx.fillStyle = C.bean;
    for (let i = 0; i < 22; i++) {
      const bx = mx + 14 + ((i * 11) % (mw - 28));
      const by = 70 + ((i * 7) % 26) + Math.sin(t * 2 + i) * 0.6;
      ctx.fillRect(bx, by, 3, 2);
      ctx.fillStyle = "#3e2415"; ctx.fillRect(bx + 1, by, 1, 2); ctx.fillStyle = C.bean;
    }
    R(mx + 10, 58, mw - 20, 2, C.steelHi);

    // écran de finesse (LED)
    R(mx + 12, 108, 22, 16, C.black);
    R(mx + 13, 109, 20, 14, C.screen);
    ctx.fillStyle = C.led;
    ctx.font = "10px monospace";
    ctx.textBaseline = "top";
    ctx.fillText(String(g.grind).padStart(2, " "), mx + 16, 111);

    // molette de réglage
    const dcx = mx + 48, dcy = 116, dr = 10;
    R(dcx - dr, dcy - dr, dr * 2, dr * 2, C.steelDk);
    R(dcx - dr + 1, dcy - dr + 1, dr * 2 - 2, dr * 2 - 2, C.steelLo);
    const ang = -Math.PI * 0.75 + (g.grind - 1) / 9 * Math.PI * 1.5;
    R(dcx + Math.cos(ang) * 6 - 1, dcy + Math.sin(ang) * 6 - 1, 3, 3, C.red);

    // chute
    R(mx + mw / 2 - 6, 182, 12, 6, C.steelDk);

    // ---- Porte-filtre qui récupère ----
    const pfFill = g.dose / 22;
    drawPortafilter(96, 206, pfFill, { handleDir: 1 });

    // ---- Grains qui tombent pendant la mouture ----
    if (g.grinding) {
      ctx.fillStyle = C.grounds;
      for (let i = 0; i < 8; i++) {
        const fy = 188 + ((t * 90 + i * 14) % 16);
        const fx = mx + mw / 2 - 4 + ((i * 3) % 8);
        ctx.fillRect(fx, fy, 2, 2);
      }
      // vibration légère
    }

    // ---- Jauge de dose ----
    const gx = 14, gy = 96, gh = 90;
    R(gx, gy, 14, gh, C.black);
    R(gx + 1, gy + 1, 12, gh - 2, "#241a22");
    // zone idéale 16-20 g
    const lvl = (val) => gy + gh - 2 - (val / 22) * (gh - 4);
    R(gx + 1, lvl(20), 12, lvl(16) - lvl(20), "rgba(111,224,138,0.25)");
    R(gx + 1, lvl(20), 12, 1, C.green);
    R(gx + 1, lvl(16), 12, 1, C.green);
    // remplissage
    const fillH = (g.dose / 22) * (gh - 4);
    R(gx + 2, gy + gh - 2 - fillH, 10, fillH, g.dose > 21 ? C.red : C.crema);
    ctx.fillStyle = C.white;
    ctx.font = "8px monospace";
    ctx.fillText(g.dose.toFixed(0) + "g", gx, gy - 10);
  }

  /* ============================================================
     SCÈNE 2 — TASSER
     ============================================================ */
  function drawTamp(t) {
    drawBackground();

    // porte-filtre vu de dessus (grand)
    const cx = 96, cy = 150, r = 44;
    R(cx - r - 4, cy - r - 4, (r + 4) * 2, (r + 4) * 2, C.steelLo);
    R(cx - r, cy - r, r * 2, r * 2, C.steelDk);
    R(cx - r + 4, cy - r + 4, r * 2 - 8, r * 2 - 8, C.grounds);
    // surface de mouture texturée
    ctx.fillStyle = C.groundsHi;
    for (let i = 0; i < 60; i++) {
      const a = i * 2.4, rr = (i % 18) * 2.2;
      ctx.fillRect(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 1, 1);
    }

    if (g.tampPhase === "level") {
      // ----- Niveau à bulle horizontal -----
      const bx = 28, bw = W - 56, by = 70;
      R(bx, by, bw, 14, C.black);
      R(bx + 1, by + 1, bw - 2, 12, "#1a2e22");
      // zone centrale verte
      R(bx + bw / 2 - 10, by + 1, 20, 12, "rgba(111,224,138,0.25)");
      R(bx + bw / 2, by, 1, 14, C.green);
      // bulle oscillante
      const osc = Math.sin(t * 3.2);
      const px = bx + bw / 2 + osc * (bw / 2 - 12) - 5;
      R(px, by + 2, 10, 10, C.led);
      R(px + 1, by + 3, 3, 3, C.white);
      ctx.fillStyle = C.muted || "#9a8aa0";
      ctx.font = "8px monospace";
      ctx.fillText("ALIGNE LE TASSEUR BIEN DROIT", bx, by - 10);
      g._lvlPos = osc; // capté par le bouton
    } else if (g.tampPhase === "power") {
      // ----- Jauge de pression verticale -----
      const px = 150, py = 80, ph = 110;
      R(px, py, 18, ph, C.black);
      R(px + 1, py + 1, 16, ph - 2, "#2a1f2e");
      // zone idéale au milieu
      R(px + 1, py + ph * 0.40, 16, ph * 0.22, "rgba(111,224,138,0.25)");
      const osc = (Math.sin(t * 3.0) + 1) / 2; // 0..1
      const fh = osc * (ph - 4);
      R(px + 2, py + ph - 2 - fh, 14, fh, osc > 0.32 && osc < 0.68 ? C.green : C.crema);
      ctx.fillStyle = "#9a8aa0";
      ctx.font = "8px monospace";
      ctx.fillText("PRESSE", px - 4, py - 10);
      g._pwrPos = osc;
    } else {
      // ----- Tassée : galette lisse + tasseur -----
      R(cx - r + 4, cy - r + 4, r * 2 - 8, r * 2 - 8, C.coffee);
      R(cx - r + 6, cy - r + 6, r * 2 - 12, 3, C.groundsHi);
      ctx.fillStyle = C.led;
      ctx.font = "9px monospace";
      ctx.fillText("GALETTE PRETE", cx - 34, cy - 60);
    }

    // tasseur (tamper)
    if (g.tampPhase !== "done") {
      const ty = 96 + (g.tampPhase === "power" ? Math.sin(t * 3) * 3 : 0);
      R(cx - 26, ty - 30, 52, 12, C.steel);     // manche
      R(cx - 26, ty - 30, 52, 3, C.steelHi);
      R(cx - 14, ty - 18, 28, 8, C.steelDk);    // col
      R(cx - 30, ty - 10, 60, 8, C.steelLo);    // base
      R(cx - 30, ty - 10, 60, 2, C.steelHi);
    }
  }

  /* ============================================================
     SCÈNE 3 & 4 — MACHINE (placer + extraire)
     ============================================================ */
  function drawMachine(t, brewing) {
    drawBackground();

    // ---- Corps de la machine ----
    R(40, 40, 112, 150, C.redLo);
    R(43, 40, 106, 150, C.red);
    R(43, 40, 106, 4, "#f2796f");
    R(43, 186, 106, 4, C.redLo);
    // panneau chrome haut
    R(52, 50, 88, 30, C.steelLo);
    R(54, 52, 84, 26, C.steel);
    R(54, 52, 84, 3, C.steelHi);
    // manomètre
    const px = 76, py = 65;
    R(px - 11, py - 11, 22, 22, C.steelDk);
    R(px - 9, py - 9, 18, 18, C.white);
    const pAng = -Math.PI * 0.8 + (g.pressure - 6) / 6 * Math.PI * 1.6;
    R(px + Math.cos(pAng) * 6 - 1, py + Math.sin(pAng) * 6 - 1, 2, 2, C.red);
    R(px - 1, py - 1, 2, 2, C.black);
    // écran température
    R(100, 56, 30, 18, C.black);
    R(101, 57, 28, 16, C.screen);
    ctx.fillStyle = C.led;
    ctx.font = "9px monospace";
    ctx.fillText(g.temp + "C", 104, 60);

    // ---- Groupe / verseur ----
    R(78, 90, 36, 22, C.steelLo);
    R(80, 90, 32, 22, C.steel);
    R(80, 90, 32, 3, C.steelHi);
    R(92, 112, 8, 8, C.steelDk); // bec

    // ---- Porte-filtre (glisse en place) ----
    const lockX = 96, startX = 28;
    const pfx = startX + (lockX - startX) * g.placeProg;
    const pfy = 122;
    if (g.placeProg > 0) {
      drawPortafilter(pfx, pfy, 1, { handleDir: 1 });
    }
    // surbrillance de la cible
    if (g.phase === "place" && !g.cupPlaced && g.placeProg < 1) {
      ctx.strokeStyle = "rgba(111,224,138,0.7)";
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.strokeRect(lockX - 18, pfy - 18, 36, 36);
      ctx.setLineDash([]);
    }

    // ---- Tasse ----
    if (g.cupPlaced || g.phase === "brew" || g.phase === "score") {
      drawCup(96, 168, g.shot ? g.shot.fill : (brewing ? Math.min(1, g.brewT / g.shotDur) : 0), t);
    } else {
      // tasse en attente sur le côté
      drawCup(150, 200, 0, t, true);
    }

    // ---- Extraction : filet de café ----
    if (brewing) {
      const flowY = 130;
      ctx.fillStyle = C.coffee;
      for (let i = 0; i < 6; i++) {
        const fy = flowY + ((t * 120 + i * 6) % 34);
        ctx.fillRect(95 + Math.sin(fy * 0.4) * 1, fy, 2, 3);
      }
      R(94, 118, 4, 4, C.coffee);
      // chrono
      ctx.fillStyle = C.white;
      ctx.font = "9px monospace";
      ctx.fillText(g.brewT.toFixed(1) + "s", 150, 60);
    }

    // pieds / bac
    R(40, 188, 112, 6, C.steelDk);
    R(44, 194, 6, 6, C.black);
    R(142, 194, 6, 6, C.black);
  }

  function drawCup(cx, cy, fill, t, idle) {
    const w = 30, h = 22;
    // soucoupe
    R(cx - w / 2 - 6, cy + h - 2, w + 12, 4, C.cupSh);
    R(cx - w / 2 - 6, cy + h - 3, w + 12, 1, C.cup);
    // corps tasse
    R(cx - w / 2, cy, w, h, C.cup);
    R(cx - w / 2, cy, 3, h, C.cupSh);
    R(cx + w / 2 - 3, cy, 3, h, C.cupSh);
    R(cx - w / 2, cy, w, 2, "#ffffff");
    // anse
    R(cx + w / 2, cy + 4, 6, 3, C.cup);
    R(cx + w / 2 + 4, cy + 4, 3, 10, C.cup);
    R(cx + w / 2, cy + 12, 6, 3, C.cup);
    // café
    if (fill > 0) {
      const ch = Math.round((h - 6) * Math.min(1, fill));
      R(cx - w / 2 + 3, cy + 3 + (h - 6 - ch), w - 6, ch, C.coffee);
      // crema en surface
      if (fill > 0.15) {
        R(cx - w / 2 + 3, cy + 3 + (h - 6 - ch), w - 6, 2, C.crema);
        R(cx - w / 2 + 4, cy + 3 + (h - 6 - ch), 3, 1, C.cremaHi);
      }
    }
  }

  /* ============================================================
     SCÈNE 5 — NOTE (gros plan tasse)
     ============================================================ */
  function drawScore(t) {
    drawBackground();
    const cx = 96, cy = 120;
    // grande tasse vue de dessus
    const r = 52;
    R(cx - r - 6, cy - r - 6, (r + 6) * 2, (r + 6) * 2 + 6, C.cupSh);
    R(cx - r - 6, cy - r - 6, (r + 6) * 2, 4, C.cup);
    // anse
    R(cx + r + 2, cy - 14, 16, 8, C.cup);
    R(cx + r + 12, cy - 14, 8, 36, C.cup);
    R(cx + r + 2, cy + 14, 16, 8, C.cup);
    R(cx + r + 6, cy - 8, 8, 28, C.cupSh);
    // intérieur
    R(cx - r, cy - r, r * 2, r * 2, C.cup);
    const sc = g.shot ? g.shot.score : 0;
    // crema dont la couleur dépend du score
    const cremaCol = sc >= 75 ? C.cremaHi : sc >= 50 ? C.crema : "#8a6a44";
    R(cx - r + 4, cy - r + 4, r * 2 - 8, r * 2 - 8, cremaCol);
    // mousse / motifs
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let i = 0; i < 80; i++) {
      const a = i * 2.39, rr = (i % 22) * 2.0;
      ctx.fillRect(cx + Math.cos(a + t * 0.3) * rr, cy + Math.sin(a) * rr, 1, 1);
    }
    // reflet
    R(cx - r + 10, cy - r + 10, 14, 4, "rgba(255,255,255,0.35)");
    // tigelle de crema plus claire au centre
    R(cx - 8, cy - 8, 16, 16, cremaCol === "#8a6a44" ? "#9a7a52" : C.cremaHi);
  }

  /* ============================================================
     CALCUL DE L'EXTRACTION + NOTE
     ============================================================ */
  function computeShot() {
    // Résistance d'écoulement -> temps d'extraction
    let r = 1;
    r *= g.grind / IDEAL.grind;          // plus fin = plus lent
    r *= g.dose / IDEAL.dose;            // plus de café = plus lent
    r *= IDEAL.pressure / g.pressure;    // plus de pression = plus rapide
    // tassage : trop faible => canaux (rapide) ; idéal = stable
    const tampDevP = g.tampPower == null ? 0.4 : Math.abs(g.tampPower - IDEAL.tampPower) * 1.4;
    r *= 1 + (g.tampPower != null && g.tampPower < IDEAL.tampPower ? -tampDevP * 0.4 : tampDevP * 0.4);

    const shotTime = Math.max(8, 27 * r);

    // Déviations normalisées (0 = parfait, 1 = mauvais)
    const nGrind = clamp(Math.abs(g.grind - IDEAL.grind) / 4);
    const nDose  = clamp(Math.abs(g.dose - IDEAL.dose) / 6);
    const nTemp  = clamp(Math.abs(g.temp - IDEAL.temp) / 5);
    const nPress = clamp(Math.abs(g.pressure - IDEAL.pressure) / 3);
    const nTime  = clamp(Math.abs(shotTime - 27) / 12);
    const nLevel = g.tampLevel == null ? 0.4 : clamp(g.tampLevel);
    const nPower = g.tampPower == null ? 0.4 : clamp(Math.abs(g.tampPower - IDEAL.tampPower) / 0.45);

    const penalty =
      nGrind * 14 + nDose * 12 + nTemp * 16 +
      nPress * 12 + nTime * 18 + nLevel * 14 + nPower * 14;
    const score = Math.round(clampN(100 - penalty, 0, 100));

    // Verdict de goût
    const notes = [];
    if (shotTime < 20 || g.grind < 6) notes.push("Sous-extrait : trop acide, mouture trop grossière ou coulée trop rapide.");
    else if (shotTime > 35 || g.grind > 8) notes.push("Sur-extrait : amer, mouture trop fine ou coulée trop lente.");
    else notes.push("Coulée bien maîtrisée (" + shotTime.toFixed(0) + "s).");

    if (g.temp < 90) notes.push("Eau trop froide : arômes en retrait.");
    else if (g.temp > 95) notes.push("Eau trop chaude : notes brûlées.");

    if (g.pressure < 8) notes.push("Pression faible : corps léger.");
    else if (g.pressure > 10) notes.push("Pression trop forte : extraction agressive.");

    if (nLevel > 0.5) notes.push("Tassage de travers : risque de canaux.");
    if (nDose > 0.5) notes.push(g.dose < IDEAL.dose ? "Dose un peu faible." : "Dose un peu forte.");

    let verdict;
    if (score >= 90) verdict = "Espresso parfaitement équilibré ! 🤌";
    else if (score >= 75) verdict = "Très bon espresso, bien équilibré.";
    else if (score >= 55) verdict = "Espresso correct, à peaufiner.";
    else if (score >= 35) verdict = "Déséquilibré — revois les réglages.";
    else verdict = "Imbuvable… on recommence !";

    const grade = score >= 90 ? "A" : score >= 75 ? "B" : score >= 55 ? "C" : score >= 35 ? "D" : "E";

    return { shotTime, score, grade, verdict, notes, fill: 1 };
  }
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ============================================================
     PANNEAU DE CONTRÔLE (HTML) — change selon la phase
     ============================================================ */
  const elInstr = document.getElementById("instruction");
  const elCtrl = document.getElementById("controls");
  const stepEls = Array.from(document.querySelectorAll("#steps li"));
  const ORDER = ["grind", "tamp", "place", "brew", "score"];

  function setSteps() {
    const idx = ORDER.indexOf(g.phase);
    stepEls.forEach((li, i) => {
      li.classList.toggle("active", i === idx);
      li.classList.toggle("done", idx >= 0 && i < idx);
    });
  }

  function refreshPanel() {
    setSteps();
    elCtrl.innerHTML = "";
    switch (g.phase) {
      case "title":   panelTitle(); break;
      case "grind":   panelGrind(); break;
      case "tamp":    panelTamp(); break;
      case "place":   panelPlace(); break;
      case "brew":    panelBrew(); break;
      case "score":   panelScore(); break;
    }
  }

  function button(label, cls, onClick) {
    const b = document.createElement("button");
    b.className = "btn" + (cls ? " " + cls : "");
    b.textContent = label;
    b.addEventListener("click", onClick);
    return b;
  }
  function slider(min, max, step, value, fmt, onInput) {
    const field = document.createElement("div");
    field.className = "field";
    const lab = document.createElement("label");
    const span = document.createElement("span");
    const b = document.createElement("b");
    lab.appendChild(span); lab.appendChild(b);
    const inp = document.createElement("input");
    inp.type = "range"; inp.min = min; inp.max = max; inp.step = step; inp.value = value;
    const upd = () => { const v = parseFloat(inp.value); const o = fmt(v); span.textContent = o.label; b.textContent = o.val; };
    inp.addEventListener("input", () => { upd(); onInput(parseFloat(inp.value)); });
    upd();
    field.appendChild(lab); field.appendChild(inp);
    return field;
  }

  /* ---- Title ---- */
  function panelTitle() {
    elInstr.textContent = "Prépare le meilleur espresso, étape par étape.";
    elCtrl.appendChild(button("☕ Commencer", "", () => {
      g.phase = "grind"; resetForGrind(); refreshPanel();
    }));
  }

  /* ---- Grind ---- */
  function resetForGrind() { g.dose = 0; g.grinding = false; }
  function panelGrind() {
    elInstr.innerHTML = "1. Règle la <b>finesse</b> puis <b>maintiens</b> pour moudre. Vise la zone verte (≈18 g).";
    elCtrl.appendChild(slider(1, 10, 1, g.grind, (v) => ({
      label: "Finesse", val: v + (v >= 6 && v <= 8 ? " ✓" : ""),
    }), (v) => { g.grind = v; }));

    const grindBtn = button("⏻ Maintenir pour moudre", "secondary", () => {});
    const startGrind = (e) => { e.preventDefault(); g.grinding = true; };
    const stopGrind = () => { g.grinding = false; updateNext(); };
    grindBtn.addEventListener("pointerdown", startGrind);
    grindBtn.addEventListener("pointerup", stopGrind);
    grindBtn.addEventListener("pointerleave", stopGrind);
    grindBtn.addEventListener("pointercancel", stopGrind);
    elCtrl.appendChild(grindBtn);

    const next = button("Suivant ➜", "", () => {
      g.phase = "tamp"; g.tampPhase = "level"; refreshPanel();
    });
    next.disabled = g.dose < 8;
    next.id = "nextBtn";
    elCtrl.appendChild(next);
  }
  function updateNext() {
    const n = document.getElementById("nextBtn");
    if (n) n.disabled = g.dose < 8;
  }

  /* ---- Tamp ---- */
  function panelTamp() {
    if (g.tampPhase === "level") {
      elInstr.innerHTML = "2. Tasse <b>bien droit</b> : appuie quand la bulle est au <b>centre</b>.";
      elCtrl.appendChild(button("Aligner", "", () => {
        g.tampLevel = Math.abs(g._lvlPos || 0);
        g.tampPhase = "power"; refreshPanel();
      }));
    } else if (g.tampPhase === "power") {
      elInstr.innerHTML = "2. Donne la <b>bonne pression</b> : appuie dans la zone verte.";
      elCtrl.appendChild(button("Presser", "", () => {
        g.tampPower = g._pwrPos == null ? 0.5 : g._pwrPos;
        g.tampPhase = "done"; refreshPanel();
      }));
    } else {
      const lvlOk = g.tampLevel < 0.25, pwrOk = Math.abs(g.tampPower - 0.5) < 0.18;
      elInstr.innerHTML = "Galette tassée. " +
        (lvlOk ? "Bien droite ✓ " : "Un peu de travers. ") +
        (pwrOk ? "Pression idéale ✓" : "Pression à ajuster.");
      elCtrl.appendChild(button("Recommencer le tassage", "secondary", () => {
        g.tampPhase = "level"; g.tampLevel = null; g.tampPower = null; refreshPanel();
      }));
      elCtrl.appendChild(button("Suivant ➜", "", () => {
        g.phase = "place"; g.placeProg = 0; g.cupPlaced = false; refreshPanel();
      }));
    }
  }

  /* ---- Place ---- */
  function panelPlace() {
    if (!g.cupPlaced) {
      elInstr.innerHTML = "3. <b>Glisse</b> le porte-filtre vers la droite pour le <b>verrouiller</b> sous le groupe.";
    } else {
      elInstr.innerHTML = "Porte-filtre verrouillé et tasse en place ✓";
      const n = button("Suivant ➜", "", () => {
        g.phase = "brew"; g.brewT = 0; refreshPanel();
      });
      elCtrl.appendChild(n);
    }
  }

  /* ---- Brew ---- */
  let brewing = false;
  function panelBrew() {
    elInstr.innerHTML = "4. Règle <b>température</b> et <b>pression</b>, puis lance l'extraction.";
    elCtrl.appendChild(slider(85, 96, 1, g.temp, (v) => ({
      label: "Température", val: v + "°C" + (v >= 91 && v <= 95 ? " ✓" : ""),
    }), (v) => { g.temp = v; }));
    elCtrl.appendChild(slider(6, 12, 0.5, g.pressure, (v) => ({
      label: "Pression", val: v + " bar" + (v >= 8.5 && v <= 9.5 ? " ✓" : ""),
    }), (v) => { g.pressure = v; }));
    elCtrl.appendChild(button("☕ Lancer l'extraction", "", () => {
      startBrew();
    }));
  }
  function startBrew() {
    g.shot = computeShot();
    g.shotDur = Math.min(6, Math.max(2.2, g.shot.shotTime / 6)); // durée d'animation
    g.brewT = 0;
    brewing = true;
    elInstr.textContent = "Extraction en cours…";
    elCtrl.innerHTML = "";
  }

  /* ---- Score ---- */
  function panelScore() {
    const s = g.shot;
    elInstr.textContent = "Résultat de ton espresso :";
    const box = document.createElement("div");
    box.className = "scorebox";
    box.innerHTML =
      `<div class="grade">${s.grade} · ${s.score}/100</div>` +
      `<div class="verdict">${s.verdict}</div>` +
      `<ul class="notes">${s.notes.map((n) => `<li>• ${n}</li>`).join("")}</ul>`;
    elCtrl.appendChild(box);
    elCtrl.appendChild(button("↻ Refaire un espresso", "", () => {
      Object.assign(g, {
        phase: "grind", grind: 7, dose: 0, grinding: false,
        tampPhase: "level", tampLevel: null, tampPower: null,
        placeProg: 0, cupPlaced: false, temp: 93, pressure: 9,
        brewT: 0, shot: null,
      });
      brewing = false;
      refreshPanel();
    }));
  }

  /* ============================================================
     BOUCLE PRINCIPALE
     ============================================================ */
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;

    // logique mouture
    if (g.phase === "grind" && g.grinding) {
      g.dose = Math.min(24, g.dose + dt * 9);
      if (g.dose >= 24) g.grinding = false;
      updateNext();
    }
    // animation extraction
    if (brewing) {
      g.brewT += dt * (g.shot.shotTime / g.shotDur); // chrono "réel" simulé
      if (g.brewT >= g.shot.shotTime) {
        brewing = false;
        g.phase = "score";
        refreshPanel();
      }
    }

    // rendu
    switch (g.phase) {
      case "title": drawTitle(t); break;
      case "grind": drawGrind(t); break;
      case "tamp":  drawTamp(t); break;
      case "place": drawMachine(t, false); break;
      case "brew":  drawMachine(t, brewing); break;
      case "score": drawScore(t); break;
    }
    requestAnimationFrame(loop);
  }

  function drawTitle(t) {
    drawBackground();
    // petite machine décorative + tasse fumante
    drawMachineMini(60, 70);
    drawCup(120, 150, 1, t);
    // vapeur
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    for (let i = 0; i < 3; i++) {
      const sy = 150 - ((t * 16 + i * 14) % 42);
      const sx = 120 + Math.sin(sy * 0.2 + i) * 4;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.fillStyle = C.white;
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Appuie sur Commencer", W / 2, 230);
    ctx.textAlign = "left";
  }
  function drawMachineMini(x, y) {
    R(x, y, 72, 96, C.redLo);
    R(x + 3, y, 66, 96, C.red);
    R(x + 8, y + 8, 56, 22, C.steel);
    R(x + 8, y + 8, 56, 3, C.steelHi);
    R(x + 26, y + 44, 20, 14, C.steelLo);
    R(x + 33, y + 58, 6, 6, C.steelDk);
  }

  /* ---------------- Démarrage ---------------- */
  refreshPanel();
  requestAnimationFrame(loop);
})();
