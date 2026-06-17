import { useEffect, useRef } from 'react';

interface Props {
  username: string;
  rank: 1 | 2 | 3;
}

const SIZES = {
  1: { width: 100, height: 160 },
  2: { width: 82,  height: 128 },
  3: { width: 76,  height: 118 },
} as const;

const ZOOM: Record<1|2|3, number> = { 1: 0.58, 2: 0.68, 3: 0.64 };

/* ─────────────────────────────────────────────────────────────
   CSS — injected once into <head>
   ───────────────────────────────────────────────────────────── */
const STYLE_ID = 'podium-skin-3d-css-v4';
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `

/* ══════════════════════════════════════════════════════════════
   MINECRAFT FIREWORK ROCKET  (#1)
   Pixel-accurate: red/white diagonal stripes + brown T-cap + black fuse
   ══════════════════════════════════════════════════════════════ */

.mc-rockets-overlay {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  z-index: 3;
}

/* Static anchor at the bottom — one per rocket */
.mc-fw-slot {
  position: absolute;
  bottom: 12px;
}
.mc-fw-slot--l { left: 6px; }
.mc-fw-slot--r { right: 6px; }

/* ── The whole rocket visual wobbles and flies up ── */
.mc-fw-rocket {
  display: flex;
  flex-direction: column;
  align-items: center;
  image-rendering: pixelated;
  transform-origin: bottom center;
}
.mc-fw-slot--l .mc-fw-rocket {
  animation: mc-fw-fly-l 2.5s ease-in-out infinite;
}
.mc-fw-slot--r .mc-fw-rocket {
  animation: mc-fw-fly-r 2.5s ease-in-out infinite;
  animation-delay: 1.25s;
}

@keyframes mc-fw-fly-l {
  0%   { transform: translateY(0px)   rotate( 0deg); opacity: 1; }
  12%  { transform: translateY(-14px) rotate(-7deg); opacity: 1; }
  28%  { transform: translateY(-36px) rotate( 5deg); opacity: 1; }
  45%  { transform: translateY(-62px) rotate(-6deg); opacity: 1; }
  60%  { transform: translateY(-86px) rotate( 4deg); opacity: 1; }
  70%  { transform: translateY(-104px) rotate( 0deg); opacity: 1; }
  74%  { transform: translateY(-110px) rotate( 0deg); opacity: 0; }
  75%  { transform: translateY(0px)   rotate( 0deg); opacity: 0; }
  88%  { opacity: 0; }
  100% { transform: translateY(0px)   rotate( 0deg); opacity: 0; }
}
@keyframes mc-fw-fly-r {
  0%   { transform: translateY(0px)   rotate( 0deg); opacity: 1; }
  12%  { transform: translateY(-14px) rotate( 7deg); opacity: 1; }
  28%  { transform: translateY(-36px) rotate(-5deg); opacity: 1; }
  45%  { transform: translateY(-62px) rotate( 6deg); opacity: 1; }
  60%  { transform: translateY(-86px) rotate(-4deg); opacity: 1; }
  70%  { transform: translateY(-104px) rotate( 0deg); opacity: 1; }
  74%  { transform: translateY(-110px) rotate( 0deg); opacity: 0; }
  75%  { transform: translateY(0px)   rotate( 0deg); opacity: 0; }
  88%  { opacity: 0; }
  100% { transform: translateY(0px)   rotate( 0deg); opacity: 0; }
}

/* ── Brown T-shaped cap (top of rocket) ── */
.mc-fw-cap {
  position: relative;
  width: 14px;
  height: 10px;
  margin-bottom: -1px;
}
/* Wide crossbar */
.mc-fw-cap-bar {
  position: absolute;
  top: 5px; left: 0;
  width: 14px; height: 4px;
  background: #5c2e0e;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 0 rgba(0,0,0,0.3);
}
/* Narrow top knob */
.mc-fw-cap-knob {
  position: absolute;
  top: 0; left: 4px;
  width: 6px; height: 7px;
  background: #6b3417;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.10);
}

/* ── Red + White diagonal-stripe body ── */
.mc-fw-body {
  width: 10px;
  height: 22px;
  background: repeating-linear-gradient(
    -45deg,
    #cc1111 0px,  #cc1111 3px,
    #f2f2f2 3px,  #f2f2f2 6px
  );
  border-left:  1px solid rgba(0,0,0,0.20);
  border-right: 1px solid rgba(0,0,0,0.20);
  image-rendering: pixelated;
}

/* ── Black pixel fuse / burn trail at base ── */
.mc-fw-fuse {
  width: 6px;
  height: 7px;
  background:
    /* pixel art checkered fuse */
    repeating-conic-gradient(#111 0% 25%, #333 0% 50%) 0 0 / 3px 3px;
  opacity: 0.9;
}

/* ── Exhaust flame glow under rocket ── */
.mc-fw-exhaust {
  width: 5px;
  height: 10px;
  margin-top: -2px;
  background: linear-gradient(to bottom, #ffcc22 0%, #ff5500 50%, transparent 100%);
  border-radius: 0 0 4px 4px;
  animation: mc-exhaust-flicker 0.08s steps(2) infinite;
}
@keyframes mc-exhaust-flicker {
  0%   { height: 10px; opacity: 1.0; transform: scaleX(1.0); }
  100% { height:  7px; opacity: 0.7; transform: scaleX(0.8); }
}

/* ── Explosion burst (positioned at the peak, independent animation) ── */
.mc-fw-burst {
  position: absolute;
  left: 50%;
  bottom: 12px;
  width: 44px;
  height: 44px;
  pointer-events: none;
}
.mc-fw-slot--l .mc-fw-burst {
  animation: mc-burst-appear 2.5s ease-out infinite;
  animation-delay: 0s;
}
.mc-fw-slot--r .mc-fw-burst {
  animation: mc-burst-appear 2.5s ease-out infinite;
  animation-delay: 1.25s;
}
@keyframes mc-burst-appear {
  0%,70%  { transform: translate(-50%, calc(-110px - 50%)) scale(0);   opacity: 0; }
  76%     { transform: translate(-50%, calc(-110px - 50%)) scale(0.45); opacity: 1; }
  88%     { transform: translate(-50%, calc(-110px - 50%)) scale(1.30); opacity: 0.85; }
  100%    { transform: translate(-50%, calc(-110px - 50%)) scale(1.80); opacity: 0; }
}
.mc-burst-ray {
  position: absolute;
  top: 50%; left: 50%;
  width: 3px; height: 18px;
  border-radius: 2px;
  transform-origin: 50% 0%;
  margin-left: -1.5px;
}
.mc-fw-slot--l .mc-burst-ray { background: #ff3333; box-shadow: 0 0 6px #ff0000, 0 0 12px #ff4400; }
.mc-fw-slot--r .mc-burst-ray { background: #33ff88; box-shadow: 0 0 6px #00ff44, 0 0 12px #00cc44; }

/* ══════════════════════════════════════════════════════════════
   CARTOON DUST CLOUD  (#3) — behind the feet, expands sideways
   ══════════════════════════════════════════════════════════════ */
.dust-cloud-overlay {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 72px;
  height: 22px;
  pointer-events: none;
  z-index: 0;
}
.dust-puff {
  position: absolute;
  border-radius: 50%;
  background: rgba(222,216,204,0.92);
  border: 2px solid rgba(190,183,170,0.5);
}
/* Left-side puffs — fly to the left */
.dp-l1 { width: 20px; height: 20px; left: 28px; bottom: 0; animation: dp-left  0.48s ease-out infinite; animation-delay: 0.00s; }
.dp-l2 { width: 15px; height: 15px; left: 26px; bottom: 2px; animation: dp-left 0.48s ease-out infinite; animation-delay: 0.24s; }
/* Right-side puffs — fly to the right */
.dp-r1 { width: 20px; height: 20px; left: 24px; bottom: 0; animation: dp-right 0.48s ease-out infinite; animation-delay: 0.12s; }
.dp-r2 { width: 15px; height: 15px; left: 26px; bottom: 2px; animation: dp-right 0.48s ease-out infinite; animation-delay: 0.36s; }
/* Center puff — rises straight up & fades */
.dp-c  { width: 18px; height: 18px; left: 27px; bottom: 0; animation: dp-up    0.48s ease-out infinite; animation-delay: 0.06s; }

@keyframes dp-left {
  0%   { transform: scale(0.2) translate(  0px,  0px); opacity: 0;    }
  18%  { transform: scale(0.8) translate( -6px, -3px); opacity: 0.95; }
  60%  { transform: scale(1.2) translate(-16px, -7px); opacity: 0.65; }
  100% { transform: scale(1.5) translate(-26px,-12px); opacity: 0;    }
}
@keyframes dp-right {
  0%   { transform: scale(0.2) translate( 0px,  0px); opacity: 0;    }
  18%  { transform: scale(0.8) translate( 6px, -3px); opacity: 0.95; }
  60%  { transform: scale(1.2) translate(16px, -7px); opacity: 0.65; }
  100% { transform: scale(1.5) translate(26px,-12px); opacity: 0;    }
}
@keyframes dp-up {
  0%   { transform: scale(0.2) translate(0px,  0px); opacity: 0;    }
  18%  { transform: scale(0.7) translate(0px, -5px); opacity: 0.80; }
  60%  { transform: scale(1.1) translate(0px,-10px); opacity: 0.50; }
  100% { transform: scale(1.4) translate(0px,-18px); opacity: 0;    }
}
`;
  document.head.appendChild(s);
}

const BURST_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export default function PodiumSkin3D({ username, rank }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { width, height } = SIZES[rank];

  useEffect(() => {
    ensureStyles();

    const wrap = wrapRef.current;
    if (!wrap) return;

    let disposed = false;
    let viewer: any;
    let canvas: HTMLCanvasElement | null = null;

    import('skinview3d').then((sv3d) => {
      if (disposed || !wrapRef.current) return;

      canvas = document.createElement('canvas');
      canvas.style.cssText = 'display:block;background:transparent;';
      wrap.appendChild(canvas);

      viewer = new sv3d.SkinViewer({
        canvas,
        width,
        height,
        skin: `https://mc-heads.net/skin/${username}`,
      });

      try { viewer.renderer.setClearColor(0x000000, 0); } catch (_) {}
      try {
        viewer.controls.target.set(0, -8, 0);
        viewer.controls.update();
      } catch (_) {}
      viewer.zoom = ZOOM[rank];
      viewer.autoRotate = false;
      try { viewer.controls.enabled = false; } catch (_) {}

      /* ══════════════════════════════════════════════════════════
         #3  REVAMPED RUNNING — faster + expressive + dust
         ══════════════════════════════════════════════════════════ */
      if (rank === 3) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s) return;

            const t = progress * 1.95; /* faster sprint pace */

            /* Body forward lean */
            s.body.rotation.x = 0.20;
            s.body.rotation.y = 0;
            s.body.rotation.z = Math.sin(t * 2) * 0.04;

            /* Arms — strong opposite swing */
            const arm = Math.sin(t) * 1.05;
            s.rightArm.rotation.x =  arm;
            s.leftArm.rotation.x  = -arm;
            s.rightArm.rotation.z = -0.06;
            s.leftArm.rotation.z  =  0.06;
            s.rightArm.rotation.y = 0;
            s.leftArm.rotation.y  = 0;

            /* Legs — powerful stride */
            const leg = Math.sin(t) * 0.95;
            s.rightLeg.rotation.x = -leg;
            s.leftLeg.rotation.x  =  leg;
            s.rightLeg.rotation.z = 0;
            s.leftLeg.rotation.z  = 0;

            /* Head: forward tilt + slight bob */
            if (s.head) {
              s.head.rotation.x = 0.14 + Math.sin(t * 2) * 0.04;
              s.head.rotation.y = 0;
              s.head.rotation.z = Math.sin(t * 2) * 0.025;
            }

            /* Body vertical bounce */
            player.position.y = -Math.abs(Math.sin(t)) * 0.55;
            player.position.x = 0;
            player.rotation.y = 0;

          } catch (_) {}
        });

      /* ══════════════════════════════════════════════════════════
         #2  FLOSS DANCE — 4-Beat-Zyklus
         ══════════════════════════════════════════════════════════ */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            const t = progress * 7.5;
            const rawSwing = Math.sin(t);
            const swing = Math.sign(rawSwing) * Math.pow(Math.abs(rawSwing), 0.60);
            const rawDepth = Math.sin(t / 2);
            const depth = Math.sign(rawDepth) * Math.pow(Math.abs(rawDepth), 0.50);

            s.rightArm.rotation.z = swing * 1.35;
            s.rightArm.rotation.x = depth * 0.62;
            s.rightArm.rotation.y = 0;
            s.leftArm.rotation.z  = swing * 1.35;
            s.leftArm.rotation.x  = -depth * 0.62;
            s.leftArm.rotation.y  = 0;

            player.position.x = -swing * 0.70;
            player.position.y = 0;
            player.rotation.y = 0;

            s.body.rotation.z = swing * 0.10;
            s.body.rotation.x = 0;
            s.body.rotation.y = 0;

            if (s.head) {
              s.head.rotation.y = swing * 0.12;
              s.head.rotation.x = 0;
              s.head.rotation.z = 0;
            }

            s.leftLeg.rotation.z  =  0.18;
            s.leftLeg.rotation.x  =  0.05;
            s.leftLeg.rotation.y  =  0;
            s.rightLeg.rotation.z = -0.18;
            s.rightLeg.rotation.x =  0.05;
            s.rightLeg.rotation.y =  0;

          } catch (_) {}
        });

      /* ══════════════════════════════════════════════════════════
         #1  VICTORY POSE + CROWN
         ══════════════════════════════════════════════════════════ */
      } else {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.head) return;

            if (!s.head.userData.crownDone) {
              s.head.userData.crownDone = true;
              import('three').then((T: any) => {
                if (disposed || s.head.userData.crownBuilt) return;
                s.head.userData.crownBuilt = true;

                const yTop  = new T.MeshPhongMaterial({ color: 0xFFEE00, specular: 0xFFFF88, shininess: 140, emissive: 0x332200, emissiveIntensity: 0.30 });
                const yMid  = new T.MeshPhongMaterial({ color: 0xEECC00, specular: 0xFFFF44, shininess: 100, emissive: 0x221500, emissiveIntensity: 0.22 });
                const yDark = new T.MeshPhongMaterial({ color: 0xCC9900, specular: 0xDDCC33, shininess: 70,  emissive: 0x110E00, emissiveIntensity: 0.15 });
                const facesWall   = [yMid, yMid, yTop, yDark, yMid, yMid];
                const facesTop    = [yMid, yMid, yTop, yDark, yTop, yMid];
                const facesCenter = [yMid, yMid, yTop, yDark, yTop, yMid];
                const gemPurple = new T.MeshPhongMaterial({ color: 0xDD44FF, specular: 0xFFCCFF, shininess: 200, emissive: 0x9900CC, emissiveIntensity: 0.90 });
                const gemCyan   = new T.MeshPhongMaterial({ color: 0x44CCFF, specular: 0xCCEEFF, shininess: 200, emissive: 0x006688, emissiveIntensity: 0.85 });
                const gemBlue   = new T.MeshPhongMaterial({ color: 0x2255EE, specular: 0x88AAFF, shininess: 200, emissive: 0x001188, emissiveIntensity: 0.85 });
                const gemGreen  = new T.MeshPhongMaterial({ color: 0x11EE44, specular: 0xAAFFCC, shininess: 200, emissive: 0x005511, emissiveIntensity: 0.90 });
                const g  = new T.Group();
                const bx = (mat: any, w: number, h: number, d: number, x: number, y: number, z: number) => {
                  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  m.position.set(x, y, z);
                  g.add(m);
                };
                const BW = 10.0, BH = 1.0, BT = 0.80, inner = BW - BT * 2;
                const FZ = BW/2-BT/2, BKZ = -(BW/2-BT/2), LX = -(BW/2-BT/2), RX = BW/2-BT/2;
                bx(facesWall, BW, BH, BT, 0, BH/2, FZ);
                bx(facesWall, BW, BH, BT, 0, BH/2, BKZ);
                bx(facesWall, BT, BH, inner, LX, BH/2, 0);
                bx(facesWall, BT, BH, inner, RX, BH/2, 0);
                const MW = 0.88, MD = BT, MH = 1.45, MHC = 2.20, yB = BH;
                [-3.4,-2.26,-1.13,0,1.13,2.26,3.4].forEach((x, i) => {
                  const h = i === 3 ? MHC : MH;
                  const mat = i === 3 ? facesCenter : facesTop;
                  bx(mat, MW, h, MD, x, yB+h/2, FZ);
                  bx(mat, MW, h, MD, x, yB+h/2, BKZ);
                });
                [-2.0, 0, 2.0].forEach(z => {
                  bx(facesTop, MD, MH, MW, LX, yB+MH/2, z);
                  bx(facesTop, MD, MH, MW, RX, yB+MH/2, z);
                });
                ([[LX,FZ],[RX,FZ],[LX,BKZ],[RX,BKZ]] as [number,number][]).forEach(([cx,cz]) =>
                  bx(facesTop, BT, MH, BT, cx, yB+MH/2, cz));
                const GS=1.30, GD=0.80, GY=BH/2, GZ=FZ+BT/2+GD/2;
                ([[-2.8,gemPurple],[-0.9,gemCyan],[0.9,gemBlue],[2.8,gemGreen]] as [number,any][]).forEach(([x,mat]) => {
                  const gem = new T.Mesh(new T.BoxGeometry(GS,GS,GD), mat);
                  gem.position.set(x, GY, GZ);
                  g.add(gem);
                });
                g.position.set(0, 6.0, 0);
                s.head.add(g);
              }).catch(() => {});
            }

            const t = progress * 2.5;
            s.leftArm.rotation.z  = -(1.45 + Math.sin(t*1.5)*0.30);
            s.rightArm.rotation.z =   1.45 + Math.sin(t*1.5+Math.PI)*0.30;
            s.leftArm.rotation.x  = -0.20 + Math.sin(t)*0.20;
            s.rightArm.rotation.x = -0.20 - Math.sin(t)*0.20;
            s.head.rotation.y     =  Math.sin(t*0.8)*0.24;
            s.head.rotation.x     = -0.08 + Math.sin(t*1.1)*0.08;
            s.body.rotation.y     =  Math.sin(t*0.5)*0.08;
            s.leftLeg.rotation.x  =  Math.sin(t*1.8)*0.06;
            s.rightLeg.rotation.x = -Math.sin(t*1.8)*0.06;
          } catch (_) {}
        });
      }
    }).catch(console.error);

    return () => {
      disposed = true;
      if (viewer) { try { viewer.dispose(); } catch (_) {} }
      if (canvas && wrap.contains(canvas)) { wrap.removeChild(canvas); }
    };
  }, [username, rank]);

  return (
    <div
      ref={wrapRef}
      style={{ width, height, position: 'relative', zIndex: 1, flexShrink: 0, margin: '0 auto', overflow: 'visible' }}
    >
      {/* ── #1: Two Minecraft Firework Rockets ── */}
      {rank === 1 && (
        <div className="mc-rockets-overlay">
          {(['l', 'r'] as const).map(side => (
            <div key={side} className={`mc-fw-slot mc-fw-slot--${side}`}>
              {/* Flying rocket */}
              <div className="mc-fw-rocket">
                {/* Brown T-shaped cap */}
                <div className="mc-fw-cap">
                  <div className="mc-fw-cap-knob" />
                  <div className="mc-fw-cap-bar" />
                </div>
                {/* Red/white striped body */}
                <div className="mc-fw-body" />
                {/* Black pixel fuse */}
                <div className="mc-fw-fuse" />
                {/* Exhaust flame */}
                <div className="mc-fw-exhaust" />
              </div>
              {/* Star burst explosion */}
              <div className="mc-fw-burst">
                {BURST_ANGLES.map(a => (
                  <div
                    key={a}
                    className="mc-burst-ray"
                    style={{ transform: `rotate(${a}deg) translateY(-9px)` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── #3: Cartoon Dust Cloud behind feet ── */}
      {rank === 3 && (
        <div className="dust-cloud-overlay">
          <div className="dust-puff dp-l1" />
          <div className="dust-puff dp-l2" />
          <div className="dust-puff dp-r1" />
          <div className="dust-puff dp-r2" />
          <div className="dust-puff dp-c"  />
        </div>
      )}
    </div>
  );
}
