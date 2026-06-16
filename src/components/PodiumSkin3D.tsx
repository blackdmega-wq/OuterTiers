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

export default function PodiumSkin3D({ username, rank }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { width, height } = SIZES[rank];

  useEffect(() => {
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

      /* ── #3 SPRINT ── */
      if (rank === 3) {
        const anim = new sv3d.RunningAnimation();
        (anim as any).speed = 2.2;
        viewer.animation = anim;

      /* ═══════════════════════════════════════════════════════
         #2  FORTNITE FLOSS DANCE — 4 exact poses

         Viewed from the FRONT of the dancer:

         POSE 1 — frame 1:
           Left arm  → OUT-LEFT (extended fully to the left)
           Right arm → BEHIND BACK

         POSE 2 — frame 2:
           Right arm → OUT-RIGHT (extended fully to the right)
           Left arm  → FORWARD in front of belly, crossing toward RIGHT

         POSE 3 — frame 3:
           BOTH arms → extended to the LEFT
           (left arm out-left, right arm crosses body to left)

         POSE 4 — frame 4:
           Right arm → OUT-RIGHT
           Left arm  → BEHIND BACK

         skinview3d arm rotation axes (char faces +Z = toward camera):
           rotation.x  negative = arm swings FORWARD (toward camera)
                       positive = arm swings BACKWARD (behind back)
           leftArm.rotation.z   positive = arm crosses body toward RIGHT
                                negative = arm swings outward LEFT
           rightArm.rotation.z  positive = arm swings outward LEFT / crosses LEFT
                                negative = arm swings outward RIGHT
         ═══════════════════════════════════════════════════════ */
      } else if (rank === 2) {
        viewer.animation = new sv3d.FunctionAnimation((player: any, progress: number) => {
          try {
            const s = player?.skin;
            if (!s?.leftArm) return;

            const SPEED = 0.90;
            const raw = ((progress * SPEED * 4) % 4 + 4) % 4;
            const ki  = Math.floor(raw);
            const frac = raw - ki;

            const ease = (t: number) =>
              t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            const ef   = ease(frac);
            const lerp = (a: number, b: number) => a + (b - a) * ef;

            /*
              ── FLOSS 4-BEAT KEYFRAME TABLE ──────────────────────────
              Pose 1: L arm out-LEFT,       R arm BEHIND BACK
              Pose 2: R arm out-RIGHT,      L arm FORWARD + crosses RIGHT
              Pose 3: BOTH arms to the LEFT
              Pose 4: R arm out-RIGHT,      L arm BEHIND BACK
              ─────────────────────────────────────────────────────────
            */
            const KEYS = [
              /* Pose 1 — L out-LEFT, R behind back */
              { lAx:  0.0,  lAz: -1.45, rAx:  1.25, rAz: -0.08, hz: -0.14 },
              /* Pose 2 — R out-RIGHT, L forward + crossing right (vor dem Bauch) */
              { lAx: -0.90, lAz:  0.85, rAx:  0.0,  rAz: -1.45, hz:  0.14 },
              /* Pose 3 — BOTH arms LEFT */
              { lAx:  0.0,  lAz: -1.45, rAx:  0.0,  rAz:  1.38, hz: -0.14 },
              /* Pose 4 — R out-RIGHT, L behind back */
              { lAx:  1.25, lAz: -0.08, rAx:  0.0,  rAz: -1.45, hz:  0.14 },
            ];

            const kA = KEYS[ki % 4];
            const kB = KEYS[(ki + 1) % 4];

            s.leftArm.rotation.x  = lerp(kA.lAx, kB.lAx);
            s.leftArm.rotation.z  = lerp(kA.lAz, kB.lAz);
            s.leftArm.rotation.y  = 0;
            s.rightArm.rotation.x = lerp(kA.rAx, kB.rAx);
            s.rightArm.rotation.z = lerp(kA.rAz, kB.rAz);
            s.rightArm.rotation.y = 0;

            s.body.rotation.y = 0;
            s.body.rotation.x = 0;
            s.body.rotation.z = lerp(kA.hz, kB.hz);

            /* Legs: no movement */
            s.leftLeg.rotation.x  = 0; s.leftLeg.rotation.z  = 0; s.leftLeg.rotation.y  = 0;
            s.rightLeg.rotation.x = 0; s.rightLeg.rotation.z = 0; s.rightLeg.rotation.y = 0;
          } catch (_) {}
        });

      /* ═══════════════════════════════════════════════════════
         #1  VICTORY POSE + MINECRAFT CROWN — REVAMPED

         Crown redesign:
         • Metallic MeshStandardMaterial (metalness 0.92, roughness 0.08)
           → real shading, specular highlights, no flat look
         • Darker inner-shadow material for depth
         • Slimmer proportions — less chunky walls
         • 9 front merlons (more castle-like detail)
         • Center merlon distinctly taller
         • 4 glowing gems on FRONT face: purple | lightblue | darkblue | green
           each with emissive colour for a bright inner glow
         • Crown sits flush on head top (group.y = 7.8)
         ═══════════════════════════════════════════════════════ */
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

                /* ── Metallic gold materials — 3 shades for depth ── */
                const goldBase = new T.MeshStandardMaterial({
                  color: 0xFFCC00,
                  metalness: 0.92,
                  roughness: 0.08,
                  emissive: 0x3A2000,
                  emissiveIntensity: 0.14,
                });
                const goldDark = new T.MeshStandardMaterial({
                  color: 0xC89800,
                  metalness: 0.88,
                  roughness: 0.14,
                  emissive: 0x1E1000,
                  emissiveIntensity: 0.10,
                });
                const goldTop = new T.MeshStandardMaterial({
                  color: 0xFFE040,
                  metalness: 0.95,
                  roughness: 0.06,
                  emissive: 0x604400,
                  emissiveIntensity: 0.22,
                });

                /* ── Gem materials — emissive glow ── */
                const gemPurple = new T.MeshStandardMaterial({
                  color: 0xDD44FF, metalness: 0.15, roughness: 0.05,
                  emissive: 0x8800CC, emissiveIntensity: 0.80,
                });
                const gemCyan = new T.MeshStandardMaterial({
                  color: 0x44CCFF, metalness: 0.15, roughness: 0.05,
                  emissive: 0x006699, emissiveIntensity: 0.75,
                });
                const gemBlue = new T.MeshStandardMaterial({
                  color: 0x2266EE, metalness: 0.15, roughness: 0.05,
                  emissive: 0x001166, emissiveIntensity: 0.75,
                });
                const gemGreen = new T.MeshStandardMaterial({
                  color: 0x22EE55, metalness: 0.15, roughness: 0.05,
                  emissive: 0x005522, emissiveIntensity: 0.80,
                });

                const g = new T.Group();

                /* Helper: add a box mesh */
                const bx = (
                  mat: any, w: number, h: number, d: number,
                  x: number, y: number, z: number,
                ) => {
                  const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat);
                  m.position.set(x, y, z);
                  g.add(m);
                };

                /*
                  Slimmer crown — proportions tuned for less "chunky" look.
                  Head = 8×8×8 units.
                  Crown sits at y = 7.8 (group offset).
                */
                const BW  = 9.2;     // total crown width (just wider than head)
                const BH  = 1.1;     // base band height — slimmer
                const BT  = 0.85;    // wall thickness — thinner walls
                const inner = BW - BT * 2;

                /* Front/back wall Z centers */
                const FZ  =  (BW / 2 - BT / 2);
                const BKZ = -(BW / 2 - BT / 2);
                const LX  = -(BW / 2 - BT / 2);
                const RX  =  (BW / 2 - BT / 2);

                /* ── BASE BAND — 4 walls with dark material (shadow) ── */
                bx(goldDark, BW,    BH, BT,    0,     BH / 2, FZ);   // front
                bx(goldDark, BW,    BH, BT,    0,     BH / 2, BKZ);  // back
                bx(goldDark, BT,    BH, inner, LX,    BH / 2, 0);    // left
                bx(goldDark, BT,    BH, inner, RX,    BH / 2, 0);    // right

                /* ── MERLONS (castle battlements) ──
                   Front & back: 7 merlons, slim & tall.
                   Center merlon is distinctly taller.
                   goldTop material for the bright top faces. */
                const MW  = 0.95;   // merlon width — slimmer
                const MD  = BT;     // merlon depth
                const MH  = 1.55;   // standard merlon height
                const MHC = 2.30;   // center merlon — clearly taller
                const yB  = BH;     // merlons start at base top

                /* 7 merlons across front and back */
                const frontXs = [-3.6, -2.4, -1.2, 0, 1.2, 2.4, 3.6];
                frontXs.forEach((x, i) => {
                  const h = i === 3 ? MHC : MH;
                  const mat = i === 3 ? goldTop : goldBase;
                  bx(mat, MW, h, MD, x, yB + h / 2, FZ);
                  bx(mat, MW, h, MD, x, yB + h / 2, BKZ);
                });

                /* Side merlons — 3 per side */
                [-2.2, 0, 2.2].forEach((z) => {
                  bx(goldBase, MD, MH, MW, LX, yB + MH / 2, z);
                  bx(goldBase, MD, MH, MW, RX, yB + MH / 2, z);
                });

                /* Corner junction caps */
                ([[LX, FZ], [RX, FZ], [LX, BKZ], [RX, BKZ]] as [number,number][])
                  .forEach(([cx, cz]) => bx(goldTop, BT, MH, BT, cx, yB + MH / 2, cz));

                /* ── GEMS on FRONT face (+Z = toward camera) ──
                   Protrude outward so they are clearly visible.
                   Front wall outer face = FZ + BT/2
                   Gem center           = FZ + BT/2 + GD/2                 */
                const GS = 1.40;                       // gem side (slightly smaller for elegance)
                const GD = 0.75;                       // gem protrusion depth
                const GY = BH / 2;                     // centered in base band height
                const GZ = FZ + BT / 2 + GD / 2;      // protrudes outward

                ([
                  [-3.0, gemPurple],
                  [-1.0, gemCyan  ],
                  [ 1.0, gemBlue  ],
                  [ 3.0, gemGreen ],
                ] as [number, any][]).forEach(([x, mat]) => {
                  const gem = new T.Mesh(new T.BoxGeometry(GS, GS, GD), mat);
                  gem.position.set(x, GY, GZ);
                  g.add(gem);
                });

                /* Seat the crown on top of the head */
                g.position.set(0, 7.8, 0);
                s.head.add(g);
              }).catch(() => {});
            }

            /* Victory pose — arms wide, gentle wave */
            const t = progress * 2.5;
            s.leftArm.rotation.z  = -(1.45 + Math.sin(t * 1.5) * 0.32);
            s.rightArm.rotation.z =   1.45 + Math.sin(t * 1.5 + Math.PI) * 0.32;
            s.leftArm.rotation.x  = -0.20 + Math.sin(t) * 0.20;
            s.rightArm.rotation.x = -0.20 - Math.sin(t) * 0.20;
            s.head.rotation.y     =  Math.sin(t * 0.8) * 0.24;
            s.head.rotation.x     = -0.08 + Math.sin(t * 1.1) * 0.08;
            s.body.rotation.y     =  Math.sin(t * 0.5) * 0.08;
            s.leftLeg.rotation.x  =  Math.sin(t * 1.8) * 0.06;
            s.rightLeg.rotation.x = -Math.sin(t * 1.8) * 0.06;
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
      style={{ width, height, position: 'relative', zIndex: 1, flexShrink: 0, margin: '0 auto' }}
    />
  );
}
