/* Pixel covers: draw a grayscale scene on a low-res canvas, then
   Floyd–Steinberg dither it to two inks — the 1-bit engraving look. */
(() => {
  "use strict";

  const INK = [11, 10, 9];
  const PAPER = [233, 229, 218];
  const NOISE = 10;
  /* Levels: crush shadows / blow highlights so dithering only happens on transitions. */
  const BLACK_POINT = 45;
  const WHITE_POINT = 195;
  const levels = (v) => Math.max(0, Math.min(255, (v - BLACK_POINT) * 255 / (WHITE_POINT - BLACK_POINT)));

  const g = (v, a = 1) => `rgba(${v},${v},${v},${a})`;
  const rng = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const lin = (ctx, x0, y0, x1, y1, a, b) => {
    const gr = ctx.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, g(a)); gr.addColorStop(1, g(b));
    return gr;
  };
  const rad = (ctx, x, y, r, a, b) => {
    const gr = ctx.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, g(a)); gr.addColorStop(1, g(b));
    return gr;
  };
  /* Dark silhouettes with a lit upper-left rim read best against the bright moon. */
  const lit = (ctx) => lin(ctx, 15, 5, 70, 80, 165, 8);
  const outline = (ctx, w = 2) => { ctx.lineWidth = w; ctx.strokeStyle = g(8); ctx.stroke(); };
  const fillLit = (ctx) => { ctx.fillStyle = lit(ctx); ctx.fill(); outline(ctx); };

  /* ---------- Emblems in a 100x100 box, lit from upper-left ---------- */
  const E = {
    helm(ctx) {
      ctx.beginPath();
      ctx.moveTo(26, 34); ctx.quadraticCurveTo(26, 8, 50, 8); ctx.quadraticCurveTo(74, 8, 74, 34);
      ctx.lineTo(74, 80); ctx.quadraticCurveTo(50, 95, 26, 80); ctx.closePath(); fillLit(ctx);
      ctx.fillStyle = g(4); ctx.fillRect(30, 40, 17, 5); ctx.fillRect(53, 40, 17, 5);
      ctx.fillStyle = g(250); ctx.fillRect(48.5, 12, 2, 74);
      ctx.fillStyle = g(4);
      for (const [x, y] of [[38, 60], [38, 67], [62, 60], [62, 67], [38, 74], [62, 74]]) {
        ctx.beginPath(); ctx.arc(x, y, 1.8, 0, 7); ctx.fill();
      }
    },
    sword(ctx) {
      ctx.beginPath();
      ctx.moveTo(50, 4); ctx.lineTo(56, 16); ctx.lineTo(56, 68); ctx.lineTo(44, 68); ctx.lineTo(44, 16); ctx.closePath(); fillLit(ctx);
      ctx.fillStyle = g(20); ctx.fillRect(49, 16, 2, 48);
      ctx.beginPath(); ctx.moveTo(28, 68); ctx.lineTo(72, 68); ctx.lineTo(68, 75); ctx.lineTo(32, 75); ctx.closePath(); fillLit(ctx);
      ctx.fillStyle = g(25); ctx.fillRect(46.5, 75, 7, 14); outline(ctx);
      ctx.beginPath(); ctx.arc(50, 93, 5, 0, 7); fillLit(ctx);
    },
    swords(ctx) {
      for (const a of [-0.62, 0.62]) {
        ctx.save(); ctx.translate(50, 50); ctx.rotate(a); ctx.translate(-50, -50); E.sword(ctx); ctx.restore();
      }
    },
    wreath(ctx, n = 26) {
      ctx.lineWidth = 9; ctx.strokeStyle = lit(ctx);
      ctx.beginPath(); ctx.arc(50, 50, 32, 0, 7); ctx.stroke();
      ctx.lineWidth = 1.5; ctx.strokeStyle = g(8);
      ctx.beginPath(); ctx.arc(50, 50, 36.5, 0, 7); ctx.stroke();
      ctx.beginPath(); ctx.arc(50, 50, 27.5, 0, 7); ctx.stroke();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, out = i % 2 ? 1 : -1;
        const r0 = out > 0 ? 36 : 28, r1 = r0 + out * 10;
        ctx.beginPath();
        ctx.moveTo(50 + Math.cos(a - 0.07) * r0, 50 + Math.sin(a - 0.07) * r0);
        ctx.lineTo(50 + Math.cos(a + 0.1) * r1, 50 + Math.sin(a + 0.1) * r1);
        ctx.lineTo(50 + Math.cos(a + 0.07) * r0, 50 + Math.sin(a + 0.07) * r0);
        ctx.closePath(); ctx.fillStyle = Math.sin(a + 2.4) > 0 ? g(230) : g(70); ctx.fill(); outline(ctx, 1);
      }
    },
    skull(ctx) {
      ctx.beginPath(); ctx.ellipse(50, 42, 28, 30, 0, 0, 7); fillLit(ctx);
      ctx.beginPath(); ctx.moveTo(34, 62); ctx.lineTo(66, 62); ctx.lineTo(62, 84); ctx.lineTo(38, 84); ctx.closePath(); fillLit(ctx);
      ctx.fillStyle = g(4);
      ctx.beginPath(); ctx.ellipse(39, 47, 8, 9, 0.2, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(61, 47, 8, 9, -0.2, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(50, 56); ctx.lineTo(45, 66); ctx.lineTo(55, 66); ctx.closePath(); ctx.fill();
      for (let x = 40; x <= 58; x += 6) ctx.fillRect(x, 72, 2, 10);
    },
    shield(ctx) {
      ctx.beginPath();
      ctx.moveTo(20, 14); ctx.lineTo(80, 14); ctx.lineTo(80, 48); ctx.quadraticCurveTo(80, 78, 50, 92);
      ctx.quadraticCurveTo(20, 78, 20, 48); ctx.closePath(); fillLit(ctx);
      ctx.fillStyle = g(12); ctx.fillRect(45, 22, 10, 60); ctx.fillRect(30, 38, 40, 10);
      ctx.fillStyle = g(245); ctx.fillRect(45, 22, 2, 60); ctx.fillRect(30, 38, 40, 2);
    },
    bell(ctx) {
      ctx.beginPath(); ctx.arc(50, 14, 6, 0, 7); outline(ctx, 3);
      ctx.beginPath(); ctx.moveTo(26, 76); ctx.quadraticCurveTo(28, 24, 50, 20); ctx.quadraticCurveTo(72, 24, 74, 76); ctx.closePath(); fillLit(ctx);
      ctx.beginPath(); ctx.moveTo(20, 76); ctx.lineTo(80, 76); ctx.lineTo(80, 82); ctx.lineTo(20, 82); ctx.closePath(); fillLit(ctx);
      ctx.fillStyle = g(15); ctx.beginPath(); ctx.arc(50, 89, 6, 0, 7); ctx.fill();
    },
    candle(ctx) {
      ctx.save(); ctx.shadowColor = g(255); ctx.shadowBlur = 22;
      ctx.beginPath(); ctx.moveTo(50, 6); ctx.quadraticCurveTo(62, 22, 50, 32); ctx.quadraticCurveTo(38, 22, 50, 6);
      ctx.fillStyle = g(255); ctx.fill(); ctx.restore();
      ctx.fillStyle = g(10); ctx.fillRect(49, 31, 2, 6);
      ctx.beginPath(); ctx.rect(40, 37, 20, 48); ctx.fillStyle = lin(ctx, 40, 0, 60, 0, 230, 70); ctx.fill(); outline(ctx);
      ctx.fillStyle = g(235); ctx.fillRect(42, 37, 4, 16); ctx.fillRect(53, 37, 3, 10);
      ctx.beginPath(); ctx.moveTo(24, 85); ctx.lineTo(76, 85); ctx.lineTo(68, 94); ctx.lineTo(32, 94); ctx.closePath(); fillLit(ctx);
    },
    tower(ctx) {
      ctx.beginPath();
      ctx.moveTo(28, 96); ctx.lineTo(28, 30); ctx.lineTo(35, 30); ctx.lineTo(35, 20); ctx.lineTo(44, 20); ctx.lineTo(44, 30);
      ctx.lineTo(56, 30); ctx.lineTo(56, 20); ctx.lineTo(65, 20); ctx.lineTo(65, 30); ctx.lineTo(72, 30); ctx.lineTo(72, 96);
      ctx.closePath(); ctx.fillStyle = lin(ctx, 28, 0, 72, 0, 150, 18); ctx.fill(); outline(ctx);
      ctx.save(); ctx.shadowColor = g(255); ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.moveTo(44, 62); ctx.lineTo(44, 50); ctx.quadraticCurveTo(50, 40, 56, 50); ctx.lineTo(56, 62); ctx.closePath();
      ctx.fillStyle = g(255); ctx.fill(); ctx.restore();
      ctx.fillStyle = g(10); ctx.fillRect(49, 44, 2, 18); ctx.fillRect(44, 54, 12, 2);
    },
    chalice(ctx) {
      ctx.beginPath(); ctx.moveTo(26, 16); ctx.lineTo(74, 16); ctx.quadraticCurveTo(74, 54, 50, 60); ctx.quadraticCurveTo(26, 54, 26, 16); ctx.closePath(); fillLit(ctx);
      ctx.beginPath(); ctx.ellipse(50, 16, 24, 4, 0, 0, 7); ctx.fillStyle = g(15); ctx.fill(); outline(ctx);
      ctx.fillStyle = lin(ctx, 46, 0, 54, 0, 200, 40); ctx.fillRect(46, 60, 8, 22);
      ctx.beginPath(); ctx.arc(50, 70, 5, 0, 7); fillLit(ctx);
      ctx.beginPath(); ctx.moveTo(30, 92); ctx.quadraticCurveTo(50, 76, 70, 92); ctx.closePath(); fillLit(ctx);
    },
    /* Feather fan with its shoulder at (4, 60), spreading right and up. */
    wing(ctx) {
      const rows = [
        { n: 10, from: -1.35, to: 0.45, len: (i) => 96 - Math.abs(i - 3) * 7, w: 5.5, a: 200, b: 25 },
        { n: 8, from: -1.2, to: 0.3, len: (i) => 58 - Math.abs(i - 3) * 4, w: 6.5, a: 235, b: 60 },
        { n: 6, from: -1.0, to: 0.15, len: () => 30, w: 7, a: 250, b: 110 },
      ];
      for (const r of rows) {
        for (let i = 0; i < r.n; i++) {
          const ang = r.from + (r.to - r.from) * (i / (r.n - 1)), L = r.len(i);
          ctx.save(); ctx.translate(4, 60); ctx.rotate(ang);
          ctx.beginPath(); ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(L * 0.5, -r.w, L, 0); ctx.quadraticCurveTo(L * 0.5, r.w, 0, 0);
          ctx.fillStyle = lin(ctx, 0, -r.w, L, r.w, r.a, r.b); ctx.fill(); outline(ctx, 1);
          ctx.restore();
        }
      }
    },
  };

  /* ---------- Scene backgrounds ---------- */
  const backdrop = (ctx, W, H, rand, { moon = true, light = false } = {}) => {
    ctx.fillStyle = light ? rad(ctx, W * 0.5, H * 0.3, H, 240, 150) : rad(ctx, W * 0.5, H * 0.25, H * 0.95, 70, 6);
    ctx.fillRect(0, 0, W, H);
    if (!light) {
      for (let i = 0; i < 40; i++) { ctx.fillStyle = g(150 + rand() * 105); ctx.fillRect(rand() * W, rand() * H * 0.6, 1, 1); }
    }
    if (moon) {
      ctx.save(); ctx.shadowColor = g(255, 0.8); ctx.shadowBlur = 30;
      ctx.beginPath(); ctx.arc(W * 0.5, H * 0.36, W * 0.34, 0, 7);
      ctx.fillStyle = rad(ctx, W * 0.42, H * 0.3, W * 0.4, 255, light ? 215 : 170); ctx.fill(); ctx.restore();
    }
    const fog = ctx.createLinearGradient(0, H * 0.6, 0, H);
    fog.addColorStop(0, g(light ? 255 : 120, 0)); fog.addColorStop(1, g(light ? 255 : 110, 0.75));
    ctx.fillStyle = fog; ctx.fillRect(0, H * 0.6, W, H * 0.4);
  };

  const place = (ctx, fn, x, y, size, rot = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(size / 100, size / 100); ctx.translate(-50, -50);
    fn(ctx); ctx.restore();
  };

  /* Graveyard silhouette: rolling ground with crosses and headstones. */
  const ground = (ctx, W, H, rand, light) => {
    const base = H * 0.84;
    ctx.fillStyle = g(light ? 20 : 4);
    ctx.beginPath(); ctx.moveTo(0, H);
    for (let x = 0; x <= W; x += 4) ctx.lineTo(x, base + Math.sin(x * 0.07 + rand() * 0.6) * 3);
    ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 5; i++) {
      const x = 8 + rand() * (W - 16), h = 8 + rand() * 9, y = base - h + 3;
      if (rand() > 0.5) { ctx.fillRect(x - 1, y, 2, h); ctx.fillRect(x - 4, y + 3, 8, 2); }
      else { ctx.beginPath(); ctx.moveTo(x - 4, base + 2); ctx.lineTo(x - 4, y + 3); ctx.quadraticCurveTo(x, y - 2, x + 4, y + 3); ctx.lineTo(x + 4, base + 2); ctx.fill(); }
    }
  };

  const cover = (emblem) => (ctx, W, H, rand, opts) => {
    backdrop(ctx, W, H, rand, opts);
    place(ctx, E[emblem], W * 0.5, H * 0.44, W * 0.86);
    ground(ctx, W, H, rand, opts.light);
  };

  const SCENES = {
    hero(ctx, W, H, rand) {
      backdrop(ctx, W, H, rand);
      const wingSize = W * 0.62;
      for (const side of [1, -1]) {
        ctx.save(); ctx.translate(W * 0.5, H * 0.5); ctx.scale(side, 1);
        place(ctx, E.wing, W * 0.06 + wingSize * 0.46, -wingSize * 0.1, wingSize, 0);
        ctx.restore();
      }
      place(ctx, E.sword, W * 0.5, H * 0.5, H * 0.96);
      place(ctx, E.helm, W * 0.5, H * 0.58, W * 0.5);
      /* thorn crown: the wreath squashed into a ring around the helm's dome */
      ctx.save(); ctx.translate(W * 0.5, H * 0.43); ctx.scale(1, 0.32);
      place(ctx, E.wreath, 0, 0, W * 0.48); ctx.restore();
      ctx.fillStyle = g(8); ctx.fillRect(0, H * 0.92, W, H * 0.08);
    },
  };
  for (const k of Object.keys(E)) if (k !== "wing") SCENES[k] = cover(k);

  /* ---------- Background engravings: drawn dark-on-white, then inverted ---------- */
  const thornBranch = (ctx, cx, cy, r, a0, span, rand) => {
    const steps = 8, pts = [];
    for (let s = 0; s <= steps; s++) {
      const a = a0 + span * (s / steps), rr = r + Math.sin(s * 1.7 + a0 * 3) * r * 0.08;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.92]);
    }
    ctx.beginPath(); ctx.moveTo(...pts[0]);
    for (let s = 1; s < pts.length; s++) ctx.lineTo(...pts[s]);
    ctx.lineWidth = 2.5 + rand() * 3.5; ctx.strokeStyle = g(10 + rand() * 40); ctx.lineCap = "round"; ctx.stroke();
    for (let s = 1; s < pts.length - 1; s++) {
      if (rand() < 0.35) continue;
      const [x, y] = pts[s], dir = Math.atan2(y - cy, x - cx) + (rand() - 0.5) * 2.4, len = 6 + rand() * 12;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(dir + 1.57) * 2, y + Math.sin(dir + 1.57) * 2);
      ctx.lineTo(x + Math.cos(dir) * len, y + Math.sin(dir) * len);
      ctx.lineTo(x + Math.cos(dir - 1.57) * 2, y + Math.sin(dir - 1.57) * 2);
      ctx.closePath(); ctx.fillStyle = g(8); ctx.fill();
    }
  };

  const spikedBall = (ctx, x, y, r, rand) => {
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + rand() * 0.2, len = r * (1.5 + rand() * 0.7);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(a - 0.22) * r, y + Math.sin(a - 0.22) * r);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.lineTo(x + Math.cos(a + 0.22) * r, y + Math.sin(a + 0.22) * r);
      ctx.closePath(); ctx.fillStyle = g(12); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(x, y, r, 0, 7);
    ctx.fillStyle = rad(ctx, x - r * 0.35, y - r * 0.35, r * 1.3, 250, 10); ctx.fill();
  };

  const BG = {
    thorns(ctx, W, H, rand) {
      for (let i = 0; i < 44; i++) thornBranch(ctx, W / 2, H / 2, W * 0.34 + (rand() - 0.5) * W * 0.08, rand() * Math.PI * 2, 0.7 + rand() * 0.6, rand);
    },
    knight(ctx, W, H, rand) {
      ctx.save(); ctx.scale(W / 100, H / 100);
      ctx.beginPath(); ctx.moveTo(40, 100); ctx.quadraticCurveTo(44, 70, 62, 66); ctx.quadraticCurveTo(92, 62, 100, 78); ctx.lineTo(100, 100); ctx.closePath();
      ctx.fillStyle = lin(ctx, 40, 60, 100, 100, 70, 8); ctx.fill();
      ctx.fillStyle = g(230);
      for (let y = 76; y < 100; y += 4) for (let x = 52 + (y % 8); x < 100; x += 6) ctx.fillRect(x, y, 1.6, 1.2);
      ctx.beginPath(); ctx.moveTo(58, 66); ctx.quadraticCurveTo(54, 30, 70, 14); ctx.quadraticCurveTo(84, 6, 94, 22);
      ctx.quadraticCurveTo(98, 44, 94, 66); ctx.closePath(); ctx.fillStyle = lin(ctx, 60, 10, 95, 66, 60, 6); ctx.fill();
      ctx.beginPath(); ctx.moveTo(58, 66); ctx.quadraticCurveTo(54, 30, 70, 14); ctx.lineTo(66, 40); ctx.lineTo(64, 66); ctx.closePath();
      ctx.fillStyle = g(150); ctx.fill();
      ctx.fillStyle = g(250); ctx.fillRect(56, 34, 18, 2.2); ctx.fillRect(57, 40, 14, 1.6);
      for (let y = 46; y < 62; y += 4) ctx.fillRect(59, y, 6, 1.4);
      ctx.beginPath(); ctx.arc(78, 30, 4.5, 0, 7); ctx.fillStyle = rad(ctx, 77, 29, 5, 255, 90); ctx.fill();
      ctx.strokeStyle = g(15); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(38, 100); ctx.lineTo(26, 46); ctx.stroke();
      ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(24, 34); ctx.lineTo(20, 2); ctx.stroke();
      spikedBall(ctx, 25, 40, 9, rand);
      ctx.restore();
    },
    wings(ctx, W, H, rand) {
      ctx.save(); ctx.scale(W / 100, H / 100);
      for (const side of [1, -1]) {
        ctx.save(); ctx.translate(50, 56); ctx.scale(side, 1);
        ctx.beginPath(); ctx.moveTo(2, 0);
        ctx.quadraticCurveTo(14, -48, 48, -54);
        for (let i = 0; i <= 12; i++) {
          const t = i / 12, x = 48 - t * 30 + (i % 2 ? 4 : 0), y = -54 + t * 98;
          ctx.lineTo(x + rand() * 3, y); ctx.lineTo(x - 6 - rand() * 4, y + 3);
        }
        ctx.quadraticCurveTo(8, 30, 2, 0); ctx.closePath();
        ctx.fillStyle = lin(ctx, 0, -50, 40, 40, 70, 6); ctx.fill();
        ctx.strokeStyle = g(250); ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(3, -2); ctx.quadraticCurveTo(15, -46, 47, -52); ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(50, 44, 9, 0, 7); ctx.fillStyle = rad(ctx, 47, 41, 11, 255, 120); ctx.fill();
      ctx.restore();
    },
    swords(ctx, W, H, rand) {
      place(ctx, E.swords, W / 2, H / 2, W * 0.9);
      for (let i = 0; i < 16; i++) thornBranch(ctx, W / 2, H / 2, W * 0.42, rand() * Math.PI * 2, 0.6 + rand() * 0.5, rand);
    },
    crown(ctx, W, H, rand) {
      ctx.save(); ctx.scale(W / 100, H / 100);
      ctx.beginPath(); ctx.moveTo(8, 74); ctx.lineTo(14, 24); ctx.lineTo(30, 52); ctx.lineTo(50, 8); ctx.lineTo(70, 52); ctx.lineTo(86, 24); ctx.lineTo(92, 74); ctx.closePath();
      ctx.fillStyle = lin(ctx, 10, 10, 90, 80, 90, 6); ctx.fill();
      ctx.fillStyle = g(15); ctx.fillRect(8, 72, 84, 14);
      for (const [x, y, r] of [[14, 22, 4], [50, 6, 5], [86, 22, 4], [30, 79, 3.5], [50, 79, 4], [70, 79, 3.5]]) {
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = rad(ctx, x - 1, y - 1, r + 1, 255, 100); ctx.fill();
      }
      ctx.restore();
      for (let i = 0; i < 10; i++) thornBranch(ctx, W / 2, H * 0.62, W * 0.46, Math.PI * (0.05 + rand() * 0.9), 0.5, rand);
    },
    skull(ctx, W, H) { place(ctx, E.skull, W / 2, H / 2, W * 0.9); },
  };

  /* Big transparent 1-bit engraving for card backgrounds (light pixels only). */
  const renderBg = (canvas, kind, seed = 5) => {
    const W = canvas.width, H = canvas.height;
    const off = document.createElement("canvas"); off.width = W; off.height = H;
    const octx = off.getContext("2d");
    octx.fillStyle = g(255); octx.fillRect(0, 0, W, H);
    (BG[kind] || BG.thorns)(octx, W, H, rng(seed));
    const px = octx.getImageData(0, 0, W, H).data;
    const gray = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) gray[i] = 255 - levels(px[i * 4]);
    canvas.getContext("2d").putImageData(dither(gray, W, H, seed, false, true), 0, 0);
  };

  /* ---------- Dithering ---------- */
  const dither = (gray, W, H, seed, invert, transparent = false) => {
    const rand = rng(seed);
    const buf = Float32Array.from(gray, (v) => v + (rand() - 0.5) * NOISE);
    const out = new Uint8ClampedArray(W * H * 4);
    for (let y = 0; y < H; y++) {
      const ltr = y % 2 === 0;
      for (let i = 0; i < W; i++) {
        const x = ltr ? i : W - 1 - i, p = y * W + x;
        const on = buf[p] >= 128, err = buf[p] - (on ? 255 : 0), d = ltr ? 1 : -1;
        if (x + d >= 0 && x + d < W) buf[p + d] += err * 7 / 16;
        if (y + 1 < H) {
          if (x - d >= 0 && x - d < W) buf[p + W - d] += err * 3 / 16;
          buf[p + W] += err * 5 / 16;
          if (x + d >= 0 && x + d < W) buf[p + W + d] += err * 1 / 16;
        }
        const lightPx = on !== invert, c = lightPx ? PAPER : INK;
        out.set([c[0], c[1], c[2], transparent && !lightPx ? 0 : 255], p * 4);
      }
    }
    return new ImageData(out, W, H);
  };

  /* Render a scene into a canvas; returns a function that re-dithers with a new seed. */
  const render = (canvas, scene, { seed = 7, invert = false, light = false, moon = true } = {}) => {
    const W = canvas.width, H = canvas.height;
    const off = document.createElement("canvas"); off.width = W; off.height = H;
    const octx = off.getContext("2d");
    (SCENES[scene] || SCENES.helm)(octx, W, H, rng(seed), { light, moon });
    const px = octx.getImageData(0, 0, W, H).data;
    const gray = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) gray[i] = levels(px[i * 4] * 0.299 + px[i * 4 + 1] * 0.587 + px[i * 4 + 2] * 0.114);
    const ctx = canvas.getContext("2d");
    const paint = (s) => ctx.putImageData(dither(gray, W, H, s, invert), 0, 0);
    paint(seed);
    return paint;
  };

  window.PixelArt = { render, renderBg };
})();
