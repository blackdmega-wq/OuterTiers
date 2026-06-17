import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

const SIZES = { 1:{width:100,height:160}, 2:{width:82,height:128}, 3:{width:76,height:118} } as const;
const ZOOM: Record<1|2|3,number> = { 1:0.58, 2:0.68, 3:0.64 };

const STYLE_ID = 'podium-skin-3d-v11';
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  ['podium-skin-3d-css','podium-skin-3d-css-v4','podium-skin-3d-css-v5',
   'podium-skin-3d-v6','podium-skin-3d-v7','podium-skin-3d-v8','podium-skin-3d-v9','podium-skin-3d-v10']
    .forEach(id => { const el = document.getElementById(id); if (el) el.remove(); });
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = '';
  document.head.appendChild(s);
}

/* ══════════════════════════════════════════════════════════
   EMBER AURA (rank 3)
   ══════════════════════════════════════════════════════════ */
interface Ember {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  life: number; maxLife: number;
  cr: number; cg: number; cb: number;
}

const EMBER_COLORS: [number, number, number][] = [
  [255, 210,  50],
  [255, 140,  40],
  [100, 210, 255],
  [255, 255, 255],
  [200, 160, 255],
];

function startAuraCanvas(cv: HTMLCanvasElement, w: number, h: number): () => void {
  cv.width  = w;
  cv.height = h;
  const dc = cv.getContext('2d') as CanvasRenderingContext2D;
  if (!dc) return () => {};

  const embers: Ember[] = [];
  const SPAWN_X_MIN = w * 0.22;
  const SPAWN_X_MAX = w * 0.78;
  const SPAWN_Y_MIN = h - 48;
  const SPAWN_Y_MAX = h - 30;

  let lastT    = performance.now();
  let spawnAcc = 0;
  const SPAWNS_PER_FRAME = 0.18;
  let animId   = 0;

  function spawn() {
    const [cr, cg, cb] = EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)];
    embers.push({
      x: SPAWN_X_MIN + Math.random() * (SPAWN_X_MAX - SPAWN_X_MIN),
      y: SPAWN_Y_MIN + Math.random() * (SPAWN_Y_MAX - SPAWN_Y_MIN),
      vx: (Math.random() - 0.5) * 0.45,
      vy: -(0.55 + Math.random() * 0.75),
      r:   0.9 + Math.random() * 1.6,
      life: 1.0,
      maxLife: 45 + Math.random() * 40,
      cr, cg, cb,
    });
  }

  function tick(now: number) {
    animId = requestAnimationFrame(tick);
    const dt = Math.min((now - lastT) / 16.67, 2.5);
    lastT = now;
    spawnAcc += SPAWNS_PER_FRAME * dt;
    while (spawnAcc >= 1) { spawn(); spawnAcc -= 1; }
    dc.clearRect(0, 0, w, h);
    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.life -= dt / e.maxLife;
      if (e.life <= 0) { embers.splice(i, 1); continue; }
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.vx += Math.sin(now * 0.003 + i) * 0.006 * dt;
      const alpha = e.life * 0.88;
      const grd = dc.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
      grd.addColorStop(0,   `rgba(${e.cr},${e.cg},${e.cb},${(alpha * 0.55).toFixed(3)})`);
      grd.addColorStop(0.4, `rgba(${e.cr},${e.cg},${e.cb},${(alpha * 0.18).toFixed(3)})`);
      grd.addColorStop(1,   `rgba(${e.cr},${e.cg},${e.cb},0)`);
      dc.beginPath(); dc.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2); dc.fillStyle = grd; dc.fill();
      dc.beginPath(); dc.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      dc.fillStyle = `rgba(${e.cr},${e.cg},${e.cb},${alpha.toFixed(3)})`; dc.fill();
    }
  }
  for (let i = 0; i < 8; i++) spawn();
  animId = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(animId);
}

/* ══════════════════════════════════════════════════════════
   MINECRAFT FIREWORKS CANVAS (rank 1)
   ══════════════════════════════════════════════════════════ */

type ExpType = 'large-ball' | 'small-ball' | 'star' | 'burst' | 'creeper' | 'trail-ball';

interface FWDef {
  type: ExpType;
  colors: [number,number,number][];
  fadeColors?: [number,number,number][];
  trail: boolean;
  twinkle: boolean;
}

// 8 different firework definitions cycling through — inspired by the Minecraft screenshots
const FW_DEFS: FWDef[] = [
  // 1. Large Ball — multicolored sphere (screenshot 1)
  { type:'large-ball', colors:[[255,50,50],[255,160,0],[255,220,0],[255,80,200],[100,220,100],[100,150,255],[220,80,255]], trail:false, twinkle:false },
  // 2. Large Ball — yellow/orange/red → lime+white twinkle (screenshot 2)
  { type:'large-ball', colors:[[255,220,0],[255,140,20],[220,50,30]], fadeColors:[[180,255,80],[255,255,255]], trail:false, twinkle:true },
  // 3. Burst — yellow/orange → red/white twinkle (screenshot 3)
  { type:'burst', colors:[[255,220,0],[255,160,0],[255,80,0]], fadeColors:[[220,50,30],[255,220,150]], trail:false, twinkle:true },
  // 4. Trail Ball — yellow+blue+purple → white, trail+twinkle (screenshot 4)
  { type:'trail-ball', colors:[[255,220,0],[100,120,255],[200,80,255]], fadeColors:[[255,255,255],[200,230,255]], trail:true, twinkle:true },
  // 5. Star-shaped — yellow/orange twinkle (screenshot 5)
  { type:'star', colors:[[255,230,0],[255,150,20],[255,255,180]], trail:false, twinkle:true },
  // 6. Creeper-shaped — yellow/lime (screenshot 6)
  { type:'creeper', colors:[[220,255,60],[120,220,60],[255,255,100]], trail:false, twinkle:false },
  // 7. Small Ball — warm gold + pink twinkle (screenshot 7)
  { type:'small-ball', colors:[[255,220,0],[255,80,120],[255,180,50]], trail:false, twinkle:true },
  // 8. Large Ball — purple/cyan/pink spectral burst
  { type:'large-ball', colors:[[200,80,255],[80,200,255],[255,80,180],[80,255,200]], trail:false, twinkle:false },
];

let _fwIdx = 0;

interface FWParticle {
  x: number; y: number;
  vx: number; vy: number;
  r: number; g: number; b: number;
  fr: number; fg: number; fb: number;
  hasFade: boolean; hasTrail: boolean; hasTwinkle: boolean;
  life: number; maxLife: number;
  isChild: boolean;
  shape: 'cross' | 'square'; // cross = Minecraft ×+ style; square = pixel-art block (creeper)
  sqSize: number; // only used when shape === 'square'
}

interface FWRocket {
  x: number; y: number; vy: number;
  cr: number; cg: number; cb: number;
  fuse: number;
  def: FWDef;
  trail: {x:number;y:number}[];
}

// Creeper face pixels (relative units, centered at 0,0)
// Based on standard 8×8 Minecraft creeper face pixel art
const CREEPER_PX: [number,number][] = [
  // left eye 2×2
  [-3,-2],[-2,-2],[-3,-1],[-2,-1],
  // right eye 2×2
  [2,-2],[3,-2],[2,-1],[3,-1],
  // nose bridge
  [-1,0],[0,0],[1,0],
  // mouth top
  [-2,1],[-1,1],[0,1],[1,1],[2,1],
  // mouth sides
  [-2,2],[-1,2],[1,2],[2,2],
  // mouth bottom
  [-2,3],[-1,3],[0,3],[1,3],[2,3],
];

const FW_W = 220;
const FW_H = 340;

function explode(particles: FWParticle[], x: number, y: number, def: FWDef) {
  const pc = (arr: [number,number,number][]) => arr[Math.floor(Math.random() * arr.length)];
  const fc = (): [number,number,number] => def.fadeColors ? pc(def.fadeColors) : [0,0,0];

  function makeP(vx: number, vy: number, life = 1.0, maxLife = 50 + Math.random() * 30): FWParticle {
    const [r,g,b] = pc(def.colors);
    const [fr,fg,fb] = fc();
    return { x, y, vx, vy, r, g, b, fr, fg, fb,
      hasFade: !!def.fadeColors, hasTrail: def.trail, hasTwinkle: def.twinkle,
      life, maxLife, isChild: false, shape: 'cross', sqSize: 0 };
  }

  if (def.type === 'large-ball') {
    const cnt = 65 + Math.floor(Math.random() * 25);
    for (let i = 0; i < cnt; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const spd   = 1.6 + Math.random() * 1.4;
      particles.push(makeP(Math.sin(phi)*Math.cos(theta)*spd, Math.sin(phi)*Math.sin(theta)*spd, 1.0, 55+Math.random()*25));
    }
  } else if (def.type === 'trail-ball') {
    const cnt = 55 + Math.floor(Math.random() * 20);
    for (let i = 0; i < cnt; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const spd   = 1.4 + Math.random() * 1.8;
      const p = makeP(Math.sin(phi)*Math.cos(theta)*spd, Math.sin(phi)*Math.sin(theta)*spd, 1.0, 60+Math.random()*30);
      particles.push(p);
    }
  } else if (def.type === 'small-ball') {
    const cnt = 28 + Math.floor(Math.random() * 14);
    for (let i = 0; i < cnt; i++) {
      const theta = Math.random() * Math.PI * 2;
      const spd   = 0.7 + Math.random() * 0.9;
      particles.push(makeP(Math.cos(theta)*spd, Math.sin(theta)*spd, 1.0, 40+Math.random()*20));
    }
  } else if (def.type === 'star') {
    // 5-pointed star: 5 primary arms with spread
    for (let arm = 0; arm < 5; arm++) {
      const baseAngle = (arm / 5) * Math.PI * 2 - Math.PI / 2;
      const cnt = 12 + Math.floor(Math.random() * 6);
      for (let i = 0; i < cnt; i++) {
        const spread = (Math.random() - 0.5) * 0.35;
        const spd    = 0.8 + Math.random() * 2.4;
        const angle  = baseAngle + spread;
        particles.push(makeP(Math.cos(angle)*spd, Math.sin(angle)*spd, 1.0, 50+Math.random()*25));
      }
    }
  } else if (def.type === 'burst') {
    // Burst: random speeds, scattered — looks like a cluster/splat
    const cnt = 45 + Math.floor(Math.random() * 20);
    for (let i = 0; i < cnt; i++) {
      const theta = Math.random() * Math.PI * 2;
      const spd   = 0.3 + Math.pow(Math.random(), 1.5) * 2.8; // biased toward center
      const [r,g,b] = pc(def.colors);
      const [fr,fg,fb] = fc();
      particles.push({
        x, y, vx: Math.cos(theta)*spd, vy: Math.sin(theta)*spd,
        r, g, b, fr, fg, fb,
        hasFade: !!def.fadeColors, hasTrail: false, hasTwinkle: def.twinkle,
        life: 0.65 + Math.random() * 0.35,
        maxLife: 25 + Math.random() * 35,
        isChild: false, shape: 'cross' as const, sqSize: 0,
      });
    }
  } else if (def.type === 'creeper') {
    // Creeper face: each pixel is a square block that expands from center then holds shape
    const SCALE = 6; // px per unit — gives ~72px wide face on 220px canvas
    const SQ    = 5; // square size per pixel block
    // Flash: spawn a bright central burst first
    for (let i = 0; i < 8; i++) {
      const theta = Math.random() * Math.PI * 2;
      const [r,g,b] = pc(def.colors);
      particles.push({
        x, y, vx: Math.cos(theta)*3.5, vy: Math.sin(theta)*3.5,
        r, g, b, fr: 255, fg: 255, fb: 200,
        hasFade: true, hasTrail: false, hasTwinkle: false,
        life: 1.0, maxLife: 14, isChild: false, shape: 'cross', sqSize: 0,
      });
    }
    for (const [px,py] of CREEPER_PX) {
      const [r,g,b] = pc(def.colors);
      // Start near center, fly outward to final position using high initial speed + strong drag
      const targetX = x + px * SCALE;
      const targetY = y + py * SCALE;
      const dist = Math.sqrt((targetX-x)**2 + (targetY-y)**2);
      const norm = dist > 0 ? 1/dist : 0;
      // Initial velocity: fast enough to reach target in ~15 frames (speed = dist/15)
      const launchSpd = dist / 14;
      particles.push({
        x, y,
        vx: (targetX - x) * norm * launchSpd,
        vy: (targetY - y) * norm * launchSpd,
        r, g, b, fr: 255, fg: 255, fb: 150,
        hasFade: true, hasTrail: false, hasTwinkle: def.twinkle,
        life: 1.0,
        maxLife: 100 + Math.random() * 30,
        isChild: false, shape: 'square', sqSize: SQ,
      });
    }
  }
}

function startFireworksCanvas(cv: HTMLCanvasElement): () => void {
  cv.width  = FW_W;
  cv.height = FW_H;
  const dc = cv.getContext('2d')!;
  if (!dc) return () => {};

  const rockets: FWRocket[] = [];
  const particles: FWParticle[] = [];
  let animId = 0;
  let lastT  = performance.now();
  let launchTimer = 0;
  const LAUNCH_GAP = 55; // frames between launches

  function launchRocket() {
    const def = FW_DEFS[_fwIdx % FW_DEFS.length];
    _fwIdx++;
    const [cr,cg,cb] = def.colors[Math.floor(Math.random() * def.colors.length)];
    rockets.push({
      x: FW_W * 0.15 + Math.random() * FW_W * 0.70,
      y: FW_H - 12,
      vy: -(3.0 + Math.random() * 2.2),
      cr, cg, cb,
      fuse: 44 + Math.floor(Math.random() * 28),
      def,
      trail: [],
    });
  }

  function tick(now: number) {
    animId = requestAnimationFrame(tick);
    const dt = Math.min((now - lastT) / 16.67, 2.5);
    lastT = now;

    launchTimer += dt;
    if (launchTimer >= LAUNCH_GAP) { launchRocket(); launchTimer = 0; }

    dc.clearRect(0, 0, FW_W, FW_H);

    // ── Rockets ──────────────────────────────────────────────
    for (let i = rockets.length - 1; i >= 0; i--) {
      const rk = rockets[i];
      rk.trail.push({ x: rk.x, y: rk.y });
      if (rk.trail.length > 14) rk.trail.shift();

      rk.y  += rk.vy * dt;
      rk.vy += 0.028 * dt;
      rk.fuse -= dt;

      if (rk.fuse <= 0) {
        explode(particles, rk.x, rk.y, rk.def);
        rockets.splice(i, 1);
        continue;
      }

      // Rocket trail — bright spark dots
      for (let t = 0; t < rk.trail.length; t++) {
        const tr = rk.trail[t];
        const frac  = t / rk.trail.length;
        const alpha = frac * 0.90;
        const radius = 1.0 + frac * 2.8; // grows from 1px to 3.8px toward head
        dc.beginPath();
        dc.arc(tr.x, tr.y, radius, 0, Math.PI * 2);
        dc.fillStyle = `rgba(${rk.cr},${rk.cg},${rk.cb},${alpha.toFixed(2)})`;
        dc.fill();
        // Tiny glow around each trail dot
        if (frac > 0.5) {
          const gl = dc.createRadialGradient(tr.x, tr.y, 0, tr.x, tr.y, radius * 2.5);
          gl.addColorStop(0, `rgba(${rk.cr},${rk.cg},${rk.cb},${(alpha*0.35).toFixed(2)})`);
          gl.addColorStop(1, `rgba(${rk.cr},${rk.cg},${rk.cb},0)`);
          dc.beginPath(); dc.arc(tr.x, tr.y, radius * 2.5, 0, Math.PI * 2);
          dc.fillStyle = gl; dc.fill();
        }
      }

      // Rocket body — clearly visible pixel-art style (4px wide × 12px tall)
      // Main candy-stripe body
      dc.fillStyle = `rgba(${rk.cr},${rk.cg},${rk.cb},1.0)`;
      dc.fillRect(rk.x - 2, rk.y - 9, 4, 10);
      // White stripes on body
      dc.fillStyle = `rgba(255,255,255,0.55)`;
      dc.fillRect(rk.x - 2, rk.y - 9, 4, 2);
      dc.fillRect(rk.x - 2, rk.y - 4, 4, 2);
      // Nose cone (bright white point)
      dc.fillStyle = `rgba(255,255,255,1.0)`;
      dc.fillRect(rk.x - 1, rk.y - 13, 2, 4);
      dc.fillRect(rk.x,     rk.y - 15, 1, 2); // tip pixel
      // Dark outline for visibility
      dc.strokeStyle = `rgba(0,0,0,0.45)`;
      dc.lineWidth = 0.8;
      dc.strokeRect(rk.x - 2, rk.y - 9, 4, 10);
      // Exhaust flame glow — big and bright
      const flicker = 0.7 + Math.random() * 0.3;
      const exR = 7 * flicker;
      const exGrd = dc.createRadialGradient(rk.x, rk.y+3, 0, rk.x, rk.y+3, exR);
      exGrd.addColorStop(0,   `rgba(255,255,220,1.0)`);
      exGrd.addColorStop(0.25,`rgba(255,200,40,0.95)`);
      exGrd.addColorStop(0.55,`rgba(255,100,0,0.7)`);
      exGrd.addColorStop(0.85,`rgba(255,30,0,0.3)`);
      exGrd.addColorStop(1,   `rgba(200,0,0,0)`);
      dc.beginPath(); dc.arc(rk.x, rk.y+3, exR, 0, Math.PI * 2);
      dc.fillStyle = exGrd; dc.fill();
    }

    // ── Particles ─────────────────────────────────────────────
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt / p.maxLife;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += (p.shape === 'square' ? 0.012 : 0.035) * dt;   // gravity (less for creeper squares)
      const drag = p.shape === 'square' ? 0.82 : 0.975;
      p.vx *= Math.pow(drag, dt);
      p.vy *= Math.pow(drag, dt);

      // Trail child particles
      if (p.hasTrail && !p.isChild && Math.random() < 0.35 * dt) {
        const [tr, tg, tb] = [p.r, p.g, p.b];
        particles.push({
          x: p.x, y: p.y,
          vx: p.vx * 0.25 + (Math.random()-0.5)*0.4,
          vy: p.vy * 0.25 + (Math.random()-0.5)*0.4,
          r: tr, g: tg, b: tb, fr: 255, fg: 255, fb: 255,
          hasFade: true, hasTrail: false, hasTwinkle: false,
          life: 0.7, maxLife: 12,
          isChild: true, shape: 'cross' as const, sqSize: 0,
        });
      }

      // Color lerp primary → fade
      let cr = p.r, cg = p.g, cb = p.b;
      if (p.hasFade) {
        const ft = Math.max(0, Math.min(1, (1 - p.life) * 1.8));
        cr = Math.round(p.r + (p.fr - p.r) * ft);
        cg = Math.round(p.g + (p.fg - p.g) * ft);
        cb = Math.round(p.b + (p.fb - p.b) * ft);
      }

      // Alpha — twinkle flicker
      let alpha = p.life * 0.92;
      if (p.hasTwinkle) {
        alpha *= 0.35 + 0.65 * Math.abs(Math.sin(p.life * 14 + i * 0.7));
      }
      if (p.isChild) alpha *= 0.75;

      // Particle size shrinks with life
      const sz = (p.isChild ? 0.5 : 0.9) + p.life * (p.isChild ? 0.8 : 1.9);

      if (p.shape === 'square') {
        // Creeper pixel block — filled square with outline
        const half = p.sqSize * 0.5 * (0.4 + p.life * 0.6); // shrinks with life
        dc.fillStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`;
        dc.fillRect(p.x - half, p.y - half, half * 2, half * 2);
        // Bright inner highlight
        dc.fillStyle = `rgba(255,255,255,${(alpha * 0.35).toFixed(3)})`;
        dc.fillRect(p.x - half * 0.55, p.y - half * 0.55, half * 0.6, half * 0.6);
      } else {
        // Minecraft-style × + particle
        dc.lineWidth = p.isChild ? 0.7 : 1.1;
        dc.strokeStyle = `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`;
        dc.beginPath();
        dc.moveTo(p.x - sz, p.y - sz); dc.lineTo(p.x + sz, p.y + sz);
        dc.moveTo(p.x + sz, p.y - sz); dc.lineTo(p.x - sz, p.y + sz);
        dc.stroke();
        const sh = sz * 0.72;
        dc.beginPath();
        dc.moveTo(p.x - sh, p.y); dc.lineTo(p.x + sh, p.y);
        dc.moveTo(p.x, p.y - sh); dc.lineTo(p.x, p.y + sh);
        dc.stroke();
        // Soft glow for non-child particles
        if (!p.isChild && p.life > 0.3) {
          const gr = dc.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 2.5);
          gr.addColorStop(0, `rgba(${cr},${cg},${cb},${(alpha * 0.4).toFixed(3)})`);
          gr.addColorStop(1, `rgba(${cr},${cg},${cb},0)`);
          dc.beginPath(); dc.arc(p.x, p.y, sz * 2.5, 0, Math.PI * 2);
          dc.fillStyle = gr; dc.fill();
        }
      }
    }
  }

  // Pre-launch 2 rockets staggered so there's immediate action
  launchRocket();
  setTimeout(() => { if (animId) launchRocket(); }, 700);
  setTimeout(() => { if (animId) launchRocket(); }, 1400);

  animId = requestAnimationFrame(tick);
  return () => { cancelAnimationFrame(animId); animId = 0; };
}

export default function PodiumSkin3D({ username, rank }: Props) {
  const wrapRef          = useRef<HTMLDivElement>(null);
  const dustCanvasRef    = useRef<HTMLCanvasElement>(null);
  const fireworkCanvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = SIZES[rank];

  useEffect(() => {
    ensureStyles();
    const wrap = wrapRef.current;
    if (!wrap) return;
    let disposed = false;
    let viewer: any;
    let canvas: HTMLCanvasElement | null = null;
    let stopDust: (() => void) | null = null;
    let stopFW:   (() => void) | null = null;

    if (rank === 3 && dustCanvasRef.current) {
      stopDust = startAuraCanvas(dustCanvasRef.current, width, height);
    }
    if (rank === 1 && fireworkCanvasRef.current) {
      stopFW = startFireworksCanvas(fireworkCanvasRef.current);
    }

    const isMobile = window.innerWidth < 768;
    const targetFps = isMobile ? 15 : 45;

    import('skinview3d').then((sv3d) => {
      if (disposed || !wrapRef.current) return;
      canvas = document.createElement('canvas');
      canvas.style.cssText = 'display:block;background:transparent;position:relative;z-index:1;';
      wrap.appendChild(canvas);

      viewer = new sv3d.SkinViewer({ canvas, width, height, skin:`https://mc-heads.net/skin/${username}` });
      try { viewer.renderer.setClearColor(0x000000,0); } catch(_){}
      try { viewer.controls.target.set(0,-8,0); viewer.controls.update(); } catch(_){}
      viewer.zoom = ZOOM[rank];
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch(_){}

      try {
        const _ms = 1000 / targetFps; let _lt = 0;
        const _orig = viewer.render.bind(viewer);
        viewer.renderer.setAnimationLoop((t: number) => { if (t - _lt >= _ms) { _lt = t; _orig(); } });
      } catch(_) {}

      /* ──────── #3  SPIN LOOP ──────── */
      if (rank === 3) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin; if (!s?.leftArm) return;
            player.rotation.y = progress * Math.PI * 2;
            const t = progress * Math.PI * 2;
            s.rightArm.rotation.z =  0.90 + Math.sin(t * 2) * 0.08;
            s.rightArm.rotation.x = -0.15;
            s.rightArm.rotation.y =  0.0;
            s.leftArm.rotation.z  = -0.90 - Math.sin(t * 2) * 0.08;
            s.leftArm.rotation.x  = -0.15;
            s.leftArm.rotation.y  =  0.0;
            s.body.rotation.y = 0; s.body.rotation.z = 0; s.body.rotation.x = -0.04;
            if (s.head) { s.head.rotation.y = 0; s.head.rotation.x = 0; s.head.rotation.z = 0; }
            s.rightLeg.rotation.z = -0.10; s.leftLeg.rotation.z = 0.10;
            s.rightLeg.rotation.x = 0.0;   s.leftLeg.rotation.x = 0.0;
            player.position.y = Math.sin(t * 2) * -0.12;
            player.position.x = 0;
          } catch(_){}
        });

      /* ──────── #2  FLOSS DANCE ──────── */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s=player?.skin; if(!s?.leftArm) return;
            const t=progress*7.5;
            const rS=Math.sin(t),swing=Math.sign(rS)*Math.pow(Math.abs(rS),.60);
            const rD=Math.sin(t/2),depth=Math.sign(rD)*Math.pow(Math.abs(rD),.50);
            s.rightArm.rotation.z=swing*1.35;s.rightArm.rotation.x=depth*.62;s.rightArm.rotation.y=0;
            s.leftArm.rotation.z=swing*1.35;s.leftArm.rotation.x=-depth*.62;s.leftArm.rotation.y=0;
            player.position.x=-swing*.70;player.position.y=0;player.rotation.y=0;
            s.body.rotation.z=swing*.10;s.body.rotation.x=0;s.body.rotation.y=0;
            if(s.head){s.head.rotation.y=swing*.12;s.head.rotation.x=0;s.head.rotation.z=0;}
            s.leftLeg.rotation.z=.18;s.leftLeg.rotation.x=.05;s.leftLeg.rotation.y=0;
            s.rightLeg.rotation.z=-.18;s.rightLeg.rotation.x=.05;s.rightLeg.rotation.y=0;
          } catch(_){}
        });

      /* ──────── #1  VICTORY + CROWN ──────── */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s=player?.skin; if(!s?.head) return;
            if(!s.head.userData.crownDone){
              s.head.userData.crownDone=true;
              import('three').then((T:any)=>{
                if(disposed||s.head.userData.crownBuilt)return;
                s.head.userData.crownBuilt=true;
                const yT=new T.MeshPhongMaterial({color:0xFFEE00,specular:0xFFFF88,shininess:140,emissive:0x332200,emissiveIntensity:.30});
                const yM=new T.MeshPhongMaterial({color:0xEECC00,specular:0xFFFF44,shininess:100,emissive:0x221500,emissiveIntensity:.22});
                const yD=new T.MeshPhongMaterial({color:0xCC9900,specular:0xDDCC33,shininess:70,emissive:0x110E00,emissiveIntensity:.15});
                const fW=[yM,yM,yT,yD,yM,yM],fT=[yM,yM,yT,yD,yT,yM],fC=[yM,yM,yT,yD,yT,yM];
                const gP=new T.MeshPhongMaterial({color:0xDD44FF,specular:0xFFCCFF,shininess:200,emissive:0x9900CC,emissiveIntensity:.90});
                const gC=new T.MeshPhongMaterial({color:0x44CCFF,specular:0xCCEEFF,shininess:200,emissive:0x006688,emissiveIntensity:.85});
                const gB=new T.MeshPhongMaterial({color:0x2255EE,specular:0x88AAFF,shininess:200,emissive:0x001188,emissiveIntensity:.85});
                const gG=new T.MeshPhongMaterial({color:0x11EE44,specular:0xAAFFCC,shininess:200,emissive:0x005511,emissiveIntensity:.90});
                const g=new T.Group();
                const bx=(mat:any,w:number,h:number,d:number,x:number,y:number,z:number)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);g.add(m);};
                const BW=10,BH=1,BT=.8,inner=BW-BT*2,FZ=BW/2-BT/2,BKZ=-(BW/2-BT/2),LX=-(BW/2-BT/2),RX=BW/2-BT/2;
                bx(fW,BW,BH,BT,0,BH/2,FZ);bx(fW,BW,BH,BT,0,BH/2,BKZ);bx(fW,BT,BH,inner,LX,BH/2,0);bx(fW,BT,BH,inner,RX,BH/2,0);
                [-3.4,-2.26,-1.13,0,1.13,2.26,3.4].forEach((x,i)=>{const h=i===3?2.2:1.45,mat=i===3?fC:fT;bx(mat,.88,h,BT,x,BH+h/2,FZ);bx(mat,.88,h,BT,x,BH+h/2,BKZ);});
                [-2,0,2].forEach(z=>{bx(fT,BT,1.45,.88,LX,BH+1.45/2,z);bx(fT,BT,1.45,.88,RX,BH+1.45/2,z);});
                ([[LX,FZ],[RX,FZ],[LX,BKZ],[RX,BKZ]]as[number,number][]).forEach(([cx,cz])=>bx(fT,BT,1.45,BT,cx,BH+1.45/2,cz));
                ([[-2.8,gP],[-.9,gC],[.9,gB],[2.8,gG]]as[number,any][]).forEach(([x,mat])=>{const gem=new T.Mesh(new T.BoxGeometry(1.3,1.3,.8),mat);gem.position.set(x,BH/2,FZ+BT/2+.4);g.add(gem);});
                g.position.set(0,6,0);s.head.add(g);
              }).catch(()=>{});
            }
            const t=progress*2.5;
            s.leftArm.rotation.z=-(1.45+Math.sin(t*1.5)*.30);s.rightArm.rotation.z=1.45+Math.sin(t*1.5+Math.PI)*.30;
            s.leftArm.rotation.x=-0.20+Math.sin(t)*.20;s.rightArm.rotation.x=-0.20-Math.sin(t)*.20;
            s.head.rotation.y=Math.sin(t*.8)*.24;s.head.rotation.x=-0.08+Math.sin(t*1.1)*.08;
            s.body.rotation.y=Math.sin(t*.5)*.08;
            s.leftLeg.rotation.x=Math.sin(t*1.8)*.06;s.rightLeg.rotation.x=-Math.sin(t*1.8)*.06;
          } catch(_){}
        });
      }
    }).catch(console.error);

    return () => {
      disposed = true;
      if (stopDust) stopDust();
      if (stopFW)   stopFW();
      if (viewer) { try { viewer.dispose(); } catch(_) {} }
      if (canvas && wrap.contains(canvas)) { wrap.removeChild(canvas); }
    };
  }, [username, rank, width, height]);

  return (
    <div
      ref={wrapRef}
      style={{width,height,position:'relative',zIndex:1,flexShrink:0,margin:'0 auto',overflow:'visible'}}
    >
      {/* Rank 3: ember aura canvas (behind 3D skin) */}
      {rank === 3 && (
        <canvas
          ref={dustCanvasRef}
          style={{ position:'absolute', bottom:0, left:0, width:`${width}px`, height:`${height}px`, pointerEvents:'none', zIndex:0 }}
          width={width}
          height={height}
        />
      )}

      {/* Rank 1: Minecraft fireworks canvas — large, centered, extends above and around the skin */}
      {rank === 1 && (
        <canvas
          ref={fireworkCanvasRef}
          style={{
            position: 'absolute',
            bottom: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: `${FW_W}px`,
            height: `${FW_H}px`,
            pointerEvents: 'none',
            zIndex: 4,
          }}
          width={FW_W}
          height={FW_H}
        />
      )}
    </div>
  );
}
