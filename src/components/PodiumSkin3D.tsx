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

/* ── Inject CSS once ── */
const STYLE_ID = 'podium-skin-3d-css';
function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
/* ════════════════════════════════════════════════
   MINECRAFT FIREWORK ROCKET  (#1)
   ════════════════════════════════════════════════ */
.mc-rockets-overlay {
  position: absolute;
  inset: 0;
  overflow: visible;
  pointer-events: none;
  z-index: 3;
}
/* slot = static anchor at bottom, does NOT animate */
.mc-rocket-slot {
  position: absolute;
  bottom: 14px;
  width: 10px;
}
.mc-rocket-slot--l { left: 10%; animation-delay: 0s; }
.mc-rocket-slot--r { right: 10%; animation-delay: 1.3s; }

/* ── Visual (shaft + cone + fins + exhaust) flies upward ── */
.mc-rocket-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  animation: mc-rocket-fly 2.6s ease-in infinite;
  transform-origin: bottom center;
}
.mc-rocket-slot--r .mc-rocket-visual { animation-delay: 1.3s; }

@keyframes mc-rocket-fly {
  0%   { transform: translateY(0px);    opacity: 1; }
  68%  { transform: translateY(-105px); opacity: 1; }
  74%  { transform: translateY(-112px); opacity: 0; }
  75%  { transform: translateY(0px);    opacity: 0; }
  85%  { opacity: 0; }
  100% { transform: translateY(0px);    opacity: 0; }
}

/* Minecraft rocket: nose cone (white triangle) */
.mc-rocket-cone {
  width: 0; height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 6px solid #f5f5f5;
  image-rendering: pixelated;
}
/* Rocket body (white/light-gray MC paper scroll) */
.mc-rocket-body {
  width: 8px; height: 13px;
  background: #f0f0f0;
  border-left: 1px solid #bbb;
  border-right: 1px solid #bbb;
  position: relative;
}
/* Pixel detail line on body */
.mc-rocket-body::after {
  content: '';
  position: absolute;
  top: 4px; left: 1px; right: 1px; height: 1px;
  background: #ccc;
}
/* Fins / base */
.mc-rocket-fins {
  display: flex;
  width: 10px;
}
.mc-rocket-fin {
  flex: 1; height: 5px;
  background: #d8d8d8;
  border: 1px solid #aaa;
}
/* Exhaust flame */
.mc-rocket-exhaust {
  width: 4px; height: 9px;
  background: linear-gradient(to bottom, #ffcc22, #ff6600, transparent);
  border-radius: 0 0 3px 3px;
  animation: mc-exhaust-flicker 0.09s steps(2) infinite;
  margin-top: -1px;
}
@keyframes mc-exhaust-flicker {
  0%  { height: 9px;  opacity: 1.0; }
  100%{ height: 6px;  opacity: 0.75; }
}

/* ── Star burst (appears when rocket fades) ── */
.mc-rocket-burst {
  position: absolute;
  bottom: 14px;
  width: 40px; height: 40px;
  left: 50%;
  transform-origin: center center;
  animation: mc-burst 2.6s ease-out infinite;
  pointer-events: none;
}
.mc-rocket-slot--l .mc-rocket-burst { animation-delay: 0s; }
.mc-rocket-slot--r .mc-rocket-burst { animation-delay: 1.3s; }

@keyframes mc-burst {
  0%,70%  { transform: translate(-50%, calc(-105px - 50%)) scale(0); opacity: 0; }
  76%     { transform: translate(-50%, calc(-105px - 50%)) scale(0.5); opacity: 1; }
  88%     { transform: translate(-50%, calc(-105px - 50%)) scale(1.3); opacity: 0.85; }
  100%    { transform: translate(-50%, calc(-105px - 50%)) scale(1.8); opacity: 0; }
}

/* Star rays */
.mc-burst-ray {
  position: absolute;
  top: 50%; left: 50%;
  width: 3px; height: 16px;
  border-radius: 2px;
  transform-origin: top center;
  margin-left: -1.5px;
  margin-top: 0;
}
.mc-rocket-slot--l .mc-burst-ray { background: #ff4444; box-shadow: 0 0 5px #ff0000, 0 0 10px #ff4400; }
.mc-rocket-slot--r .mc-burst-ray { background: #44ff88; box-shadow: 0 0 5px #00ff44, 0 0 10px #00cc44; }

/* ════════════════════════════════════════════════
   CARTOON DUST CLOUD  (#3)
   ════════════════════════════════════════════════ */
.dust-cloud-overlay {
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 64px;
  height: 28px;
  pointer-events: none;
  z-index: 0;
}
.dust-puff {
  position: absolute;
  border-radius: 50%;
  background: rgba(215,208,195,0.88);
  border: 2px solid rgba(185,178,165,0.55);
  animation: dust-puff-pop 0.5s cubic-bezier(0.2,0.8,0.4,1) infinite;
}
.dp1 { width:22px; height:22px; left:20px; bottom:0px; animation-delay:0.00s; }
.dp2 { width:17px; height:17px; left: 5px; bottom:3px; animation-delay:0.13s; }
.dp3 { width:17px; height:17px; left:39px; bottom:3px; animation-delay:0.26s; }
.dp4 { width:13px; height:13px; left: 0px; bottom:0px; animation-delay:0.38s; }
.dp5 { width:13px; height:13px; left:50px; bottom:0px; animation-delay:0.06s; }

@keyframes dust-puff-pop {
  0%   { transform: scale(0.15) translate(0px,  0px); opacity: 0;   }
  18%  { transform: scale(0.75) translate(0px, -3px); opacity: 0.95; }
  55%  { transform: scale(1.15) translate(0px, -8px); opacity: 0.60; }
  100% { transform: scale(1.50) translate(0px,-14px); opacity: 0;   }
}
`;
  document.head.appendChild(s);
}

/* ── Minecraft rocket: burst star rays ── */
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
         #3  REVAMPED RUNNING + CARTOON DUST
         ══════════════════════════════════════════════════════════ */
      if (rank === 3) {
        /* Slower, more expressive custom sprint */
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s) return;

            const t = progress * 1.55; /* speed (was 2.2) */

            /* Body forward lean */
            s.body.rotation.x = 0.18;
            s.body.rotation.y = 0;
            s.body.rotation.z = Math.sin(t * 2) * 0.03;

            /* Arms swing — opposite legs */
            const armSwing = Math.sin(t) * 1.0;
            s.rightArm.rotation.x =  armSwing;
            s.leftArm.rotation.x  = -armSwing;
            s.rightArm.rotation.z = -0.08;
            s.leftArm.rotation.z  =  0.08;
            s.rightArm.rotation.y = 0;
            s.leftArm.rotation.y  = 0;

            /* Legs swing */
            const legSwing = Math.sin(t) * 0.92;
            s.rightLeg.rotation.x = -legSwing;
            s.leftLeg.rotation.x  =  legSwing;
            s.rightLeg.rotation.z = 0;
            s.leftLeg.rotation.z  = 0;

            /* Head: slight bob + forward tilt */
            if (s.head) {
              s.head.rotation.x = 0.12 + Math.sin(t * 2) * 0.04;
              s.head.rotation.y = 0;
              s.head.rotation.z = Math.sin(t * 2) * 0.03;
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

            s.leftArm.rotation.z = swing * 1.35;
            s.leftArm.rotation.x = -depth * 0.62;
            s.leftArm.rotation.y = 0;

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
         #1  VICTORY POSE + MINECRAFT CASTLE CROWN
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

                bx(facesWall, BW, BH, BT,    0,    BH/2, FZ );
                bx(facesWall, BW, BH, BT,    0,    BH/2, BKZ);
                bx(facesWall, BT, BH, inner, LX,   BH/2, 0  );
                bx(facesWall, BT, BH, inner, RX,   BH/2, 0  );

                const MW = 0.88, MD = BT, MH = 1.45, MHC = 2.20, yB = BH;
                [-3.4,-2.26,-1.13,0,1.13,2.26,3.4].forEach((x, i) => {
                  const h   = i === 3 ? MHC : MH;
                  const mat = i === 3 ? facesCenter : facesTop;
                  bx(mat, MW, h, MD, x, yB+h/2, FZ );
                  bx(mat, MW, h, MD, x, yB+h/2, BKZ);
                });
                [-2.0, 0, 2.0].forEach(z => {
                  bx(facesTop, MD, MH, MW, LX, yB+MH/2, z);
                  bx(facesTop, MD, MH, MW, RX, yB+MH/2, z);
                });
                ([[LX,FZ],[RX,FZ],[LX,BKZ],[RX,BKZ]] as [number,number][])
                  .forEach(([cx,cz]) => bx(facesTop, BT, MH, BT, cx, yB+MH/2, cz));

                const GS=1.30, GD=0.80, GY=BH/2, GZ=FZ+BT/2+GD/2;
                ([[-2.8,gemPurple],[-0.9,gemCyan],[0.9,gemBlue],[2.8,gemGreen]] as [number,any][])
                  .forEach(([x,mat]) => { const gem=new T.Mesh(new T.BoxGeometry(GS,GS,GD),mat); gem.position.set(x,GY,GZ); g.add(gem); });

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
      {/* ── #1: Minecraft Firework Rockets ── */}
      {rank === 1 && (
        <div className="mc-rockets-overlay">
          {(['l','r'] as const).map(side => (
            <div key={side} className={`mc-rocket-slot mc-rocket-slot--${side}`}>
              {/* Flying rocket visual */}
              <div className="mc-rocket-visual">
                <div className="mc-rocket-cone" />
                <div className="mc-rocket-body" />
                <div className="mc-rocket-fins">
                  <div className="mc-rocket-fin" />
                  <div className="mc-rocket-fin" />
                </div>
                <div className="mc-rocket-exhaust" />
              </div>
              {/* Star burst at explosion point */}
              <div className="mc-rocket-burst">
                {BURST_ANGLES.map(a => (
                  <div
                    key={a}
                    className="mc-burst-ray"
                    style={{ transform: `rotate(${a}deg)` }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── #3: Cartoon Dust Cloud ── */}
      {rank === 3 && (
        <div className="dust-cloud-overlay">
          <div className="dust-puff dp1" />
          <div className="dust-puff dp2" />
          <div className="dust-puff dp3" />
          <div className="dust-puff dp4" />
          <div className="dust-puff dp5" />
        </div>
      )}
    </div>
  );
}
